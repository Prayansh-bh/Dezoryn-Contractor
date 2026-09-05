import type { Request, Response } from "express";
import { loginSchema, changePasswordSchema, changeEmailSchema } from "@shared/schemas";
import {
  authenticateAdmin,
  rotateRefreshToken,
  revokeRefreshTokenSession,
  changeAdminPassword,
  changeAdminEmail,
  createRefreshTokenSession,
  generateAccessToken,
} from "./auth.service";
import type { AuthenticatedRequest } from "./jwt-auth.middleware";
import { prisma } from "../db/prisma";

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: ((process.env.COOKIE_SAME_SITE as any) || (process.env.NODE_ENV === "production" ? "strict" : "lax")) as "lax" | "strict" | "none",
  domain: process.env.COOKIE_DOMAIN || undefined,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export async function loginHandler(req: Request, res: Response) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0]?.message || "Invalid credentials format" });
    }

    const { email, password } = parseResult.data;
    const ip = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = (req.headers["user-agent"] as string) || undefined;

    const { user, accessToken, refreshToken } = await authenticateAdmin(email, password, ip, userAgent);

    res.cookie("refreshToken", refreshToken, getCookieOptions());

    return res.status(200).json({
      accessToken,
      user,
    });
  } catch (error: any) {
    const message = error.message || "Invalid email or password";
    const statusCode = message.includes("locked") ? 423 : 401;
    return res.status(statusCode).json({ error: message });
  }
}

export async function refreshHandler(req: Request, res: Response) {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) {
      return res.status(401).json({ error: "Missing refresh token cookie" });
    }

    const ip = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = (req.headers["user-agent"] as string) || undefined;

    const { accessToken, newRefreshToken, user } = await rotateRefreshToken(oldRefreshToken, ip, userAgent);

    res.cookie("refreshToken", newRefreshToken, getCookieOptions());

    return res.status(200).json({
      accessToken,
      user,
    });
  } catch (error: any) {
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return res.status(401).json({ error: error.message || "Invalid refresh token" });
  }
}

export async function logoutHandler(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await revokeRefreshTokenSession(token);
    }
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return res.status(200).json({ ok: true, message: "Logged out successfully" });
  } catch (error: any) {
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return res.status(200).json({ ok: true });
  }
}

export async function meHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.adminUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: authReq.adminUser.id },
    select: { id: true, email: true, name: true, role: true, lastLoginAt: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json({ user });
}

export async function changePasswordHandler(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.adminUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0]?.message || "Invalid password format" });
    }

    const { currentPassword, newPassword } = parseResult.data;
    await changeAdminPassword(authReq.adminUser.id, currentPassword, newPassword);

    // Issue a fresh session for the current client
    const user = await prisma.adminUser.findUnique({
      where: { id: authReq.adminUser.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await createRefreshTokenSession(
      user.id,
      undefined,
      req.ip,
      req.headers["user-agent"] as string
    );

    res.cookie("refreshToken", newRefreshToken, getCookieOptions());

    return res.status(200).json({
      ok: true,
      message: "Password changed successfully",
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Failed to change password" });
  }
}

export async function changeEmailHandler(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.adminUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parseResult = changeEmailSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0]?.message || "Invalid email format" });
    }

    const { newEmail, currentPassword } = parseResult.data;
    const { user, accessToken } = await changeAdminEmail(authReq.adminUser.id, newEmail, currentPassword);

    return res.status(200).json({
      ok: true,
      message: "Administrator login email updated successfully",
      user,
      accessToken,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Failed to update email" });
  }
}

