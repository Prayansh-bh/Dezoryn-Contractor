import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";
import type { AdminUserProfile } from "@shared/types";

// Enforce fail-closed secret in production
const getJwtSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_ACCESS_SECRET environment variable must be set in production");
    }
    return "dezoryn_dev_jwt_access_secret_only_for_local_development_must_change";
  }
  return secret;
};

export const JWT_SECRET = getJwtSecret();
export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(user: {
  id: number;
  email: string;
  role: string;
  tokenVersion: number;
}): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
}

export function generateOpaqueToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashOpaqueToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createRefreshTokenSession(
  userId: number,
  familyId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const rawToken = generateOpaqueToken();
  const tokenHash = hashOpaqueToken(rawToken);
  const activeFamilyId = familyId || crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.adminRefreshToken.create({
    data: {
      userId,
      tokenHash,
      familyId: activeFamilyId,
      expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  return rawToken;
}

export async function authenticateAdmin(
  email: string,
  rawPassword: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: AdminUserProfile; accessToken: string; refreshToken: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  // Timing attack mitigation: if user doesn't exist, perform dummy bcrypt compare
  if (!user || !user.passwordHash) {
    const dummyHash = "$2a$12$e8YQ6m0pY8qY5Xq3nZkX.eO9HlE2rN1lG8dJ9kK0L1mN2oP3qR4sT";
    await bcrypt.compare(rawPassword, dummyHash);
    throw new Error("Invalid email or password");
  }

  // Check account lockout
  if (user.lockUntil && user.lockUntil > new Date()) {
    const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
    throw new Error(`Account temporarily locked. Please try again in ${remainingMinutes} minute(s).`);
  }

  const isPasswordValid = await verifyPassword(rawPassword, user.passwordHash);

  if (!isPasswordValid) {
    const failedAttempts = user.failedLoginAttempts + 1;
    const shouldLock = failedAttempts >= MAX_LOGIN_ATTEMPTS;
    const lockUntil = shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failedAttempts,
        lockUntil,
      },
    });

    if (shouldLock) {
      throw new Error("Too many failed login attempts. Account locked for 15 minutes.");
    }
    throw new Error("Invalid email or password");
  }

  // Successful login -> Reset lockout counters & update lastLoginAt
  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLoginAt: new Date(),
    },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = await createRefreshTokenSession(user.id, undefined, ipAddress, userAgent);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function rotateRefreshToken(
  rawOldToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; newRefreshToken: string; user: AdminUserProfile }> {
  if (!rawOldToken) {
    throw new Error("Missing refresh token");
  }

  const oldTokenHash = hashOpaqueToken(rawOldToken);

  const existingToken = await prisma.adminRefreshToken.findUnique({
    where: { tokenHash: oldTokenHash },
    include: { user: true },
  });

  // 1. If token is completely unknown -> invalid
  if (!existingToken) {
    throw new Error("Invalid refresh session");
  }

  const user = existingToken.user;

  // 2. REPLAY DETECTION: Token already rotated or revoked!
  if (existingToken.isRevoked || existingToken.replacedBy !== null) {
    console.warn(`🚨 [Security Alert] Refresh token reuse detected for user ${user.email}! Revoking token family.`);
    // Invalidate entire family and bump token version
    await prisma.adminRefreshToken.updateMany({
      where: { familyId: existingToken.familyId },
      data: { isRevoked: true },
    });
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 } },
    });
    throw new Error("Session compromise detected. All active sessions invalidated.");
  }

  // 3. Expiration check
  if (existingToken.expiresAt < new Date()) {
    await prisma.adminRefreshToken.update({
      where: { id: existingToken.id },
      data: { isRevoked: true },
    });
    throw new Error("Refresh token expired");
  }

  // 4. Issue new rotated refresh token in the same family
  const newRawToken = generateOpaqueToken();
  const newTokenHash = hashOpaqueToken(newRawToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // Mark old token as revoked and replaced, then create new token
  await prisma.$transaction([
    prisma.adminRefreshToken.update({
      where: { id: existingToken.id },
      data: {
        isRevoked: true,
        replacedBy: newTokenHash,
      },
    }),
    prisma.adminRefreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        familyId: existingToken.familyId,
        expiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    }),
  ]);

  const accessToken = generateAccessToken(user);

  return {
    accessToken,
    newRefreshToken: newRawToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function revokeRefreshTokenSession(rawToken: string): Promise<void> {
  if (!rawToken) return;
  const tokenHash = hashOpaqueToken(rawToken);
  try {
    await prisma.adminRefreshToken.update({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  } catch {
    // Token might not exist or already removed; silently proceed
  }
}

export async function changeAdminPassword(
  userId: number,
  currentPass: string,
  newPass: string
): Promise<void> {
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isCurrentValid = await verifyPassword(currentPass, user.passwordHash);
  if (!isCurrentValid) {
    throw new Error("Current password is incorrect");
  }

  const newHash = await hashPassword(newPass);

  // Update password, increment tokenVersion, and revoke all existing refresh tokens
  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        tokenVersion: { increment: 1 },
      },
    }),
    prisma.adminRefreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    }),
  ]);
}

export async function changeAdminEmail(
  userId: number,
  newEmailRaw: string,
  currentPass: string
): Promise<{ user: AdminUserProfile; accessToken: string }> {
  const newEmail = newEmailRaw.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    throw new Error("Invalid email format");
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isCurrentValid = await verifyPassword(currentPass, user.passwordHash);
  if (!isCurrentValid) {
    throw new Error("Current password is incorrect");
  }

  if (user.email.toLowerCase() === newEmail) {
    throw new Error("New email is identical to current email");
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email: newEmail },
  });

  if (existing && existing.id !== userId) {
    throw new Error("This email is already in use");
  }

  const updatedUser = await prisma.adminUser.update({
    where: { id: userId },
    data: {
      email: newEmail,
      updatedAt: new Date(),
    },
  });

  const accessToken = generateAccessToken(updatedUser);

  return {
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    },
    accessToken,
  };
}

