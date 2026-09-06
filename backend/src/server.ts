import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { authRouter } from "./auth/auth.routes";
import { adminRouter } from "./routes/admin.routes";
import { publicRouter } from "./routes/public.routes";
import { ensureUploadDirectory } from "./storage/local-storage.service";

// Production fail-closed environment validation
if (process.env.NODE_ENV === "production") {
  const missingEnvVars: string[] = [];
  if (!process.env.DATABASE_URL) missingEnvVars.push("DATABASE_URL");
  if (!process.env.JWT_ACCESS_SECRET) missingEnvVars.push("JWT_ACCESS_SECRET");
  if (!process.env.CORS_ORIGINS) missingEnvVars.push("CORS_ORIGINS");

  if (missingEnvVars.length > 0) {
    console.error(`❌ FATAL: Missing required production environment variables: ${missingEnvVars.join(", ")}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

// CORS setup
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests without origin (e.g. curl, server-to-server, health checks)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      // Check exact match in configured allowed origins
      if (allowedOrigins.some((o) => o.toLowerCase() === normalizedOrigin.toLowerCase())) {
        return callback(null, true);
      }

      // Automatically allow all Vercel deployments, Render services, and local development
      try {
        const { hostname } = new URL(origin);
        if (
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname.endsWith(".vercel.app") ||
          hostname.endsWith(".onrender.com")
        ) {
          return callback(null, true);
        }
      } catch {
        // invalid url
      }

      return callback(new Error("CORS origin denied by security policy"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Static uploads serving
const uploadsPath = process.cwd().endsWith("backend")
  ? path.join(process.cwd(), "uploads")
  : path.join(process.cwd(), "backend", "uploads");
app.use("/uploads", express.static(uploadsPath));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Root API Welcome & Directory
app.get("/", (_req, res) => {
  res.json({
    message: "Dezoryn Contractor Standalone Express REST API Server",
    status: "running",
    port: PORT,
    endpoints: {
      health: "/health",
      auth_login: "POST /api/auth/login",
      auth_refresh: "POST /api/auth/refresh",
      auth_logout: "POST /api/auth/logout",
      auth_me: "GET /api/auth/me",
      auth_change_password: "POST /api/auth/change-password",
      public_settings: "/api/settings",
      public_products: "/api/products",
      public_gallery: "/api/gallery",
      submit_enquiry: "POST /api/enquiries",
      admin_panel_api: "/api/admin",
    },
    client_apps: {
      frontend: "http://localhost:3000",
      admin_dashboard: "http://localhost:3001",
    },
  });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "dezoryn-backend", timestamp: new Date().toISOString() });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "dezoryn-backend", timestamp: new Date().toISOString() });
});

// Mount routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api", publicRouter);

// Global 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Centralized error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (res.headersSent) {
    return;
  }
  if (err && (err.message === "CORS origin denied by security policy" || err.message?.includes("CORS"))) {
    return res.status(403).json({ error: "Forbidden: Cross-site request rejected by CORS policy" });
  }
  console.error("❌ [Unhandled Server Error]:", err);
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production"
    ? "An internal server error occurred"
    : err.message || "An internal server error occurred";
  res.status(statusCode).json({ error: message });
});

// Initialize directories & start server
ensureUploadDirectory()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 [Dezoryn Backend] Running on http://localhost:${PORT}`);
      console.log(`📡 CORS allowed origins: ${allowedOrigins.join(", ")}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
  });

