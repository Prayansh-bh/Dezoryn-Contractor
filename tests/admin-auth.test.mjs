import assert from "node:assert/strict";
import test, { describe, before, after } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const BACKEND_URL = process.env.TEST_BACKEND_URL || "http://localhost:5000";

const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || "havenblue83@gmail.com";
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || "Admin@Dezoryn2026!Secure";

describe("Admin Authentication Security Test Suite", () => {
  let validAccessToken = "";
  let validRefreshCookie = "";

  before(async () => {
    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.adminUser.updateMany({
      data: {
        email: ADMIN_EMAIL,
        passwordHash,
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    });
  });

  after(async () => {
    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.adminUser.updateMany({
      data: {
        email: ADMIN_EMAIL,
        passwordHash,
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    });
    await prisma.$disconnect();
  });

  test("AUTH-01: Rejects unauthenticated GET /api/admin with 401 Unauthorized", async () => {
    const res = await fetch(`${BACKEND_URL}/api/admin`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.match(data.error, /Unauthorized/i);
  });

  test("AUTH-02: Rejects invalid Authorization header format with 401", async () => {
    const res = await fetch(`${BACKEND_URL}/api/admin`, {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });
    assert.equal(res.status, 401);
  });

  test("AUTH-03: Rejects tampered / malformed JWT with 401", async () => {
    const res = await fetch(`${BACKEND_URL}/api/admin`, {
      headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tamperedSignature" },
    });
    assert.equal(res.status, 401);
  });

  test("AUTH-04: Login with incorrect password returns 401 generic error", async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: "WrongPassword123!" }),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, "Invalid email or password");
  });

  test("AUTH-05: Login with non-existent email returns identical 401 (anti-enumeration)", async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent_user@example.com", password: "SomeRandomPassword123!" }),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, "Invalid email or password");
  });

  test("AUTH-06: Login with valid credentials returns 200, JWT access token, and sets httpOnly refresh cookie", async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.accessToken, "Should return an accessToken");
    assert.equal(data.user.email, ADMIN_EMAIL);
    assert.equal(data.user.role, "admin");

    validAccessToken = data.accessToken;

    const cookieHeader = res.headers.get("set-cookie");
    assert.ok(cookieHeader, "Should set cookie header");
    assert.match(cookieHeader, /refreshToken=/i);
    assert.match(cookieHeader, /HttpOnly/i);

    // Extract cookie value for subsequent tests
    const match = cookieHeader.match(/refreshToken=([^;]+)/);
    if (match) {
      validRefreshCookie = `refreshToken=${match[1]}`;
    }
  });

  test("AUTH-07: GET /api/auth/me with valid Bearer token returns admin profile", async () => {
    assert.ok(validAccessToken, "Must have validAccessToken from AUTH-06");
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${validAccessToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.email, ADMIN_EMAIL);
    assert.equal(data.user.role, "admin");
  });

  test("AUTH-08: GET /api/admin with valid Bearer token returns dashboard data", async () => {
    assert.ok(validAccessToken, "Must have validAccessToken from AUTH-06");
    const res = await fetch(`${BACKEND_URL}/api/admin`, {
      headers: { Authorization: `Bearer ${validAccessToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.products), "Should return products array");
    assert.ok(Array.isArray(data.enquiries), "Should return enquiries array");
    assert.ok(data.settings, "Should return settings object");
  });

  test("AUTH-09: POST /api/auth/refresh rotates refresh token and returns new access token", async () => {
    assert.ok(validRefreshCookie, "Must have validRefreshCookie from AUTH-06");
    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: validRefreshCookie,
        Origin: "http://localhost:3001",
      },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.accessToken, "Should return a fresh access token");

    const newCookieHeader = res.headers.get("set-cookie");
    assert.ok(newCookieHeader, "Should return rotated set-cookie header");
    assert.match(newCookieHeader, /refreshToken=/i);
  });

  test("AUTH-10: POST /api/auth/refresh with replayed old token triggers replay detection", async () => {
    assert.ok(validRefreshCookie, "Must have validRefreshCookie from AUTH-06");
    // Replay the old already-rotated cookie from step 06!
    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: validRefreshCookie,
        Origin: "http://localhost:3001",
      },
    });

    // Should fail with 401 session compromise / invalid
    assert.equal(res.status, 401);
  });

  test("AUTH-11: POST /api/auth/logout clears refresh cookie", async () => {
    // Perform fresh login to get active session
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const cookieHeader = loginRes.headers.get("set-cookie");
    const match = cookieHeader.match(/refreshToken=([^;]+)/);
    const cookieToLogout = `refreshToken=${match[1]}`;

    const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieToLogout,
        Origin: "http://localhost:3001",
      },
    });

    assert.equal(res.status, 200);
    const clearCookieHeader = res.headers.get("set-cookie");
    assert.ok(clearCookieHeader);
    // Should set max-age=0 or expires in past
    assert.match(clearCookieHeader, /refreshToken=;?|Max-Age=0|expires=/i);
  });

  test("AUTH-12: Frontend dist bundle scan verifies zero occurrences of static secrets", async () => {
    const distAssetsDir = path.join(ROOT_DIR, "admin", "dist", "assets");
    const files = await readdir(distAssetsDir);
    const jsFiles = files.filter((f) => f.endsWith(".js"));

    assert.ok(jsFiles.length > 0, "Should have compiled JS bundles in admin/dist/assets");

    for (const file of jsFiles) {
      const content = await readFile(path.join(distAssetsDir, file), "utf-8");
      assert.doesNotMatch(content, /dezoryn_admin_secret_2026/i, `Secret found in bundle: ${file}`);
      assert.doesNotMatch(content, /x-admin-secret/i, `x-admin-secret header found in bundle: ${file}`);
    }
  });

  test("AUTH-13: POST /api/auth/change-password validates current password and rotates credentials", async () => {
    // 1. Perform login
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const { accessToken: oldAccessToken } = await loginRes.json();

    // 2. Change password to new temporary password
    const tempPassword = "NewSecretPassword2026#Updated";
    const changeRes = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${oldAccessToken}`,
      },
      body: JSON.stringify({
        currentPassword: ADMIN_PASSWORD,
        newPassword: tempPassword,
      }),
    });

    assert.equal(changeRes.status, 200);
    const changeData = await changeRes.json();
    assert.ok(changeData.ok);
    assert.ok(changeData.accessToken, "Should return new access token");

    // 3. Old access token with previous tokenVersion should now be rejected
    const testOldTokenRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${oldAccessToken}` },
    });
    assert.equal(testOldTokenRes.status, 401, "Old access token should be revoked");

    // 4. Change password back to original to preserve test environment
    const revertRes = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${changeData.accessToken}`,
      },
      body: JSON.stringify({
        currentPassword: tempPassword,
        newPassword: ADMIN_PASSWORD,
      }),
    });
    assert.equal(revertRes.status, 200);
  });

  test("AUTH-14: POST /api/auth/change-email rejects incorrect current password with 400", async () => {
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const { accessToken } = await loginRes.json();

    const res = await fetch(`${BACKEND_URL}/api/auth/change-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        newEmail: "different_admin@example.com",
        currentPassword: "IncorrectPassword123!",
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /Current password is incorrect/i);
  });

  test("AUTH-15: POST /api/auth/change-email rejects malformed email format with 400", async () => {
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const { accessToken } = await loginRes.json();

    const res = await fetch(`${BACKEND_URL}/api/auth/change-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        newEmail: "not-an-email-address",
        currentPassword: ADMIN_PASSWORD,
      }),
    });

    assert.equal(res.status, 400);
  });

  test("AUTH-16: POST /api/auth/change-email successfully updates admin email and allows login with new email", async () => {
    // 1. Log in with initial email
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const { accessToken } = await loginRes.json();

    const tempEmail = "newadmin.test@dezoryn.com";

    // 2. Change email to tempEmail
    const changeRes = await fetch(`${BACKEND_URL}/api/auth/change-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        newEmail: tempEmail,
        currentPassword: ADMIN_PASSWORD,
      }),
    });

    assert.equal(changeRes.status, 200);
    const changeData = await changeRes.json();
    assert.ok(changeData.ok);
    assert.equal(changeData.user.email, tempEmail);
    assert.ok(changeData.accessToken, "Should return updated accessToken");

    // 3. Login with newly changed email should succeed
    const newLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: tempEmail, password: ADMIN_PASSWORD }),
    });
    assert.equal(newLoginRes.status, 200);
    const newLoginData = await newLoginRes.json();
    assert.equal(newLoginData.user.email, tempEmail);

    // 4. Login with old email should fail
    const oldLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    assert.equal(oldLoginRes.status, 401);

    // 5. Revert email back to ADMIN_EMAIL to keep test suite idempotent
    const revertRes = await fetch(`${BACKEND_URL}/api/auth/change-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${changeData.accessToken}`,
      },
      body: JSON.stringify({
        newEmail: ADMIN_EMAIL,
        currentPassword: ADMIN_PASSWORD,
      }),
    });
    assert.equal(revertRes.status, 200);
    const revertData = await revertRes.json();
    assert.equal(revertData.user.email, ADMIN_EMAIL);
  });

  test("AUTH-17: Malicious origins (attacker-localhost.com, 127.0.0.1.evil.com) are rejected with 403", async () => {
    // 1. Test refresh with attacker-localhost.com
    const res1 = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://attacker-localhost.com",
      },
    });
    assert.equal(res1.status, 403, "attacker-localhost.com should be rejected with 403");

    // 2. Test refresh with 127.0.0.1.evil.com
    const res2 = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://127.0.0.1.evil.com",
      },
    });
    assert.equal(res2.status, 403, "127.0.0.1.evil.com should be rejected with 403");

    // 3. Test logout with attacker-localhost.com
    const res3 = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://attacker-localhost.com",
      },
    });
    assert.equal(res3.status, 403, "attacker-localhost.com on logout should be rejected with 403");

    // 4. Test logout with 127.0.0.1.evil.com
    const res4 = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://127.0.0.1.evil.com",
      },
    });
    assert.equal(res4.status, 403, "127.0.0.1.evil.com on logout should be rejected with 403");
  });
});

