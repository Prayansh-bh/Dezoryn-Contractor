import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://dezoryn-backend.onrender.com"
    : "http://localhost:5000");
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: ADMIN_BASE_URL,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
