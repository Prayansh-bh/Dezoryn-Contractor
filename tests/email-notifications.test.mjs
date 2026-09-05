import test from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "../backend/src/services/email.service.ts";

const BASE_URL = "http://localhost:5000";
const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || "havenblue83@gmail.com";
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || "Admin@Dezoryn2026!Secure";

async function getAdminToken() {
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!loginRes.ok) {
    throw new Error(`Failed to login for test setup: ${loginRes.status}`);
  }

  const data = await loginRes.json();
  return data.accessToken;
}

test("Brevo + Nodemailer Email Notification System Test Suite", async (t) => {
  let token;

  await t.test("EMAIL-01: Public GET /api/settings does not expose Brevo SMTP secrets", async () => {
    const res = await fetch(`${BASE_URL}/api/settings`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    // Must NOT contain sensitive internal keys
    assert.strictEqual(data.brevo_smtp_key, undefined);
    assert.strictEqual(data.brevo_smtp_user, undefined);
    assert.strictEqual(data.brevo_smtp_host, undefined);
    assert.strictEqual(data.brevo_smtp_port, undefined);

    // Must contain public metadata
    assert.ok(data.company_name);
    assert.ok(data.email);
  });

  await t.test("EMAIL-02: Unauthenticated POST /api/admin action test_email returns 401", async () => {
    const res = await fetch(`${BASE_URL}/api/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "test_email",
        targetEmail: "test@example.com",
      }),
    });

    assert.strictEqual(res.status, 401);
  });

  await t.test("EMAIL-03: Authenticated admin can save Brevo email settings", async () => {
    token = await getAdminToken();

    const saveRes = await fetch(`${BASE_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "save_settings",
        settings: {
          email_notifications_enabled: "true",
          brevo_smtp_host: "smtp-relay.brevo.com",
          brevo_smtp_port: "587",
          brevo_smtp_user: "7b34a1001@smtp-brevo.com",
          brevo_smtp_key: "xsmtpsib-mock-test-key-12345",
          email_from_address: "sales@dezoryn.com",
          email_from_name: "Dezoryn Contractor Commercial Desk",
          email_admin_recipient: "leads@dezoryn.com",
          email_customer_autoresponder: "true",
        },
      }),
    });

    assert.strictEqual(saveRes.status, 200);
    const saveData = await saveRes.json();
    assert.strictEqual(saveData.ok, true);

    // Verify admin can fetch settings
    const adminRes = await fetch(`${BASE_URL}/api/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const adminData = await adminRes.json();
    assert.strictEqual(adminData.settings.email_notifications_enabled, "true");
    assert.strictEqual(adminData.settings.brevo_smtp_user, "7b34a1001@smtp-brevo.com");
    assert.strictEqual(adminData.settings.has_brevo_smtp_key, true);
    // CRITICAL: Raw brevo_smtp_key must NEVER be returned to the browser/admin client
    assert.strictEqual(adminData.settings.brevo_smtp_key, undefined);
  });

  await t.test("EMAIL-04: Updating settings with masked placeholder preserves existing secret key", async () => {
    token = await getAdminToken();

    // Submit with masked placeholder
    const saveRes = await fetch(`${BASE_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "save_settings",
        settings: {
          company_name: "Dezoryn Contractor",
          brevo_smtp_key: "••••••••",
        },
      }),
    });

    assert.strictEqual(saveRes.status, 200);

    const adminRes = await fetch(`${BASE_URL}/api/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const adminData = await adminRes.json();
    // Key should still be recognized as configured
    assert.strictEqual(adminData.settings.has_brevo_smtp_key, true);
  });

  await t.test("EMAIL-05: Enquiry submission persists in database regardless of SMTP state", async () => {
    const testPayload = {
      name: "Highway Contractor Pvt Ltd",
      company: "NHAI EPC Division 4",
      phone: "+91 99887 76655",
      email: "procurement@nhaiepc.gov.in",
      product: "Thermoplastic Road Marking Paint",
      quantity: "50 MT",
      location: "Delhi-Mumbai Expressway PKG-12",
      message: "Urgent MORTH 803 compliance delivery required for March batch.",
    };

    const res = await fetch(`${BASE_URL}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.enquiryId);

    // Verify it exists in admin enquiries list
    token = await getAdminToken();
    const adminRes = await fetch(`${BASE_URL}/api/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const adminData = await adminRes.json();
    const found = (adminData.enquiries || []).find((e) => e.id === data.enquiryId);
    assert.ok(found, "Enquiry must be saved in database and visible in admin list");
    assert.strictEqual(found.company, "NHAI EPC Division 4");
  });

  await t.test("EMAIL-06: Email template input escaping prevents HTML injection", () => {
    const maliciousInput = '<script>alert("XSS")</script><b onmouseover="evil()">Click & Win</b>';
    const escaped = escapeHtml(maliciousInput);

    assert.strictEqual(escaped.includes("<script>"), false);
    assert.strictEqual(escaped.includes("</script>"), false);
    assert.strictEqual(escaped.includes("&lt;script&gt;"), true);
    assert.strictEqual(escaped.includes("&amp;"), true);
  });

  await t.test("EMAIL-07: Admin test_email with empty email returns 400 Bad Request", async () => {
    token = await getAdminToken();

    const res = await fetch(`${BASE_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "test_email",
        targetEmail: "",
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });
});
