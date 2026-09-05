import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./auth.service";
import { prisma } from "../db/prisma";

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: number;
    email: string;
    role: string;
  };
}

export async function requireJwtAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid Authorization header" });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Unauthorized: Access token expired", code: "TOKEN_EXPIRED" });
      }
      return res.status(401).json({ error: "Unauthorized: Invalid token signature" });
    }

    if (!payload || !payload.sub || payload.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Administrative role required" });
    }

    // Verify token version in database
    const user = await prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, tokenVersion: true },
    });

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ error: "Unauthorized: Token has been revoked" });
    }

    (req as AuthenticatedRequest).adminUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("❌ [requireJwtAuth] Authentication middleware error:", error);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
}
