import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminSession } from "@shared/types";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "havenblue83@gmail.com";
export const ADMIN_SECRET = process.env.ADMIN_SECRET || "dezoryn_admin_secret_2026";

export async function getAdminSession(): Promise<AdminSession | null> {
  const reqHeaders = await headers();
  const authHeader = reqHeaders.get("authorization");
  const adminSecretHeader = reqHeaders.get("x-admin-secret");
  const oaiEmail = reqHeaders.get("oai-authenticated-user-email");
  const oaiName = reqHeaders.get("oai-authenticated-user-full-name");

  // 1. Direct admin secret / Bearer token check
  if (
    adminSecretHeader === ADMIN_SECRET ||
    (authHeader && authHeader.replace(/^Bearer\s+/i, "") === ADMIN_SECRET)
  ) {
    return {
      email: ADMIN_EMAIL,
      displayName: "Dezoryn Administrator",
      isAdmin: true,
    };
  }

  // 2. ChatGPT Workspace / SIWC headers if present
  if (oaiEmail) {
    const isMatched = oaiEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    return {
      email: oaiEmail,
      displayName: oaiName ? decodeURIComponent(oaiName) : oaiEmail,
      isAdmin: isMatched,
    };
  }

  // 3. Local development fallback
  if (process.env.NODE_ENV === "development") {
    return {
      email: ADMIN_EMAIL,
      displayName: "Local Admin",
      isAdmin: true,
    };
  }

  return null;
}

export async function requireAdmin(returnTo = "/admin"): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    if (process.env.NODE_ENV === "development") {
      return {
        email: ADMIN_EMAIL,
        displayName: "Local Administrator",
        isAdmin: true,
      };
    }
    redirect("/");
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return Boolean(session?.isAdmin);
}
