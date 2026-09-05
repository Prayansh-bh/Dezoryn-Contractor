import { Router, type Request, type Response, type NextFunction } from "express";
import rateLimit from "express-rate-limit";
import {
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  changePasswordHandler,
  changeEmailHandler,
} from "./auth.controller";
import { requireJwtAuth } from "./jwt-auth.middleware";

export const authRouter = Router();

// Rate limiter for admin login: max 5 requests per 15 minutes in production (500 in local dev/test)
const isProduction = process.env.NODE_ENV === "production";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? Number(process.env.RATE_LIMIT_LOGIN_MAX || 5) : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please wait 15 minutes before trying again.",
  },
});

// Enforce CSRF Origin validation on cookie-based refresh and logout endpoints
function enforceOriginValidation(req: Request, res: Response, next: NextFunction) {
  const originHeader = req.headers.origin || req.headers.referer;

  const defaultAllowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ];

  const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));

  // In production, reject if origin/referer is missing
  if (process.env.NODE_ENV === "production" && !originHeader) {
    return res.status(403).json({ error: "Forbidden: Origin verification required" });
  }

  if (originHeader) {
    try {
      const parsedUrl = new URL(originHeader);
      const originOnly = parsedUrl.origin;

      const isExactAllowed = allowedOrigins.includes(originOnly) || allowedOrigins.includes(originHeader);

      if (isExactAllowed) {
        return next();
      }

      // In non-production only, allow localhost and 127.0.0.1 hostnames
      if (process.env.NODE_ENV !== "production") {
        if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
          return next();
        }
      }

      return res.status(403).json({ error: "Forbidden: Cross-site request rejected" });
    } catch {
      return res.status(403).json({ error: "Forbidden: Invalid origin format" });
    }
  }

  next();
}

authRouter.post("/login", loginLimiter, loginHandler);
authRouter.post("/refresh", enforceOriginValidation, refreshHandler);
authRouter.post("/logout", enforceOriginValidation, logoutHandler);
authRouter.get("/me", requireJwtAuth, meHandler);
authRouter.post("/change-password", requireJwtAuth, changePasswordHandler);
authRouter.post("/change-email", requireJwtAuth, changeEmailHandler);

