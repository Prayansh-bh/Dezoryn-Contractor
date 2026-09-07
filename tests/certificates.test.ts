import assert from "node:assert/strict";
import test, { describe, before, after } from "node:test";
import { prisma } from "../backend/src/db/prisma";

const BACKEND_URL = process.env.TEST_BACKEND_URL || "http://localhost:5000";
const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || "havenblue83@gmail.com";
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || "Admin@Dezoryn2026!Secure";

describe("Certificates & Compliance Management Test Suite", () => {
  let adminToken = "";
  let createdCertId = 0;

  before(async () => {
    // Authenticate admin for /api/admin checks
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (loginRes.ok) {
      const data = await loginRes.json();
      adminToken = data.accessToken;
    }
  });

  after(async () => {
    // Clean up created test certificate
    if (createdCertId) {
      await prisma.certificate.deleteMany({ where: { id: createdCertId } });
    }
    await prisma.$disconnect();
  });

  test("CERT-01: Public GET /api/certificates returns active certificates list", async () => {
    const res = await fetch(`${BACKEND_URL}/api/certificates`);
    assert.strictEqual(res.status, 200, "Public certificates endpoint must return 200 OK");
    const data = await res.json();
    assert.ok(Array.isArray(data), "Response must be an array of certificates");
    assert.ok(data.length >= 1, "Should return at least initial seeded certificates");
    
    const sample = data[0];
    assert.ok(sample.id, "Certificate must have an id");
    assert.ok(sample.title, "Certificate must have a title");
    assert.ok(sample.issuer, "Certificate must have an issuer");
    assert.strictEqual(sample.active, true, "Public endpoint must only return active certificates");
  });

  test("CERT-02: Public GET /api/certificates/:id/image streams image or fallback", async () => {
    // First get active certificate list
    const resList = await fetch(`${BACKEND_URL}/api/certificates`);
    const list = await resList.json();
    assert.ok(list.length > 0, "Expected at least one certificate");

    const cert = list[0];
    const imgRes = await fetch(`${BACKEND_URL}/api/certificates/${cert.id}/image`);
    assert.strictEqual(imgRes.status, 200, "Certificate image route must return 200");
    const contentType = imgRes.headers.get("content-type");
    assert.ok(
      contentType?.includes("image") || contentType?.includes("application/octet-stream"),
      `Expected image content-type, received ${contentType}`
    );
  });

  test("CERT-03: Admin endpoints reject unauthenticated access", async () => {
    const unauthUpload = await fetch(`${BACKEND_URL}/api/admin/certificates/upload`, {
      method: "POST",
    });
    assert.strictEqual(
      unauthUpload.status,
      401,
      "POST /api/admin/certificates/upload without token must return 401"
    );

    const unauthAction = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_certificate",
        data: {
          title: "Unauthorized Test Certificate",
          issuer: "Test Issuer",
          certificateNo: "UNAUTH-001",
          imageUrl: "/test.jpg",
        },
      }),
    });
    assert.strictEqual(
      unauthAction.status,
      401,
      "POST /api/admin action without token must return 401"
    );
  });

  test("CERT-04: Admin can create a new Certificate via save_certificate action", async () => {
    if (!adminToken) {
      assert.fail("Admin token not acquired; cannot execute test");
    }

    const res = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "save_certificate",
        data: {
          title: "AASHTO M249 Highway Thermoplastic Standard",
          subtitle: "Standard Specification for White and Yellow Reflective Striping",
          issuer: "American Association of State Highway and Transportation Officials",
          certificateNo: "AASHTO-M249-2026",
          validUntil: "Valid Thru 2028",
          imageUrl: "/images/products/thermoplastic-paint.jpg",
          active: true,
          sortOrder: 10,
        },
      }),
    });

    assert.strictEqual(res.status, 200, "Admin save_certificate must return 200");
    const cert = await res.json();
    assert.ok(cert.id, "Saved certificate must return generated ID");
    assert.strictEqual(cert.title, "AASHTO M249 Highway Thermoplastic Standard");
    assert.strictEqual(cert.certificateNo, "AASHTO-M249-2026");
    createdCertId = cert.id;
  });

  test("CERT-05: GET /api/admin includes certificates in dashboard payload", async () => {
    if (!adminToken) {
      assert.fail("Admin token not acquired; cannot execute test");
    }

    const res = await fetch(`${BACKEND_URL}/api/admin`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 200, "GET /api/admin must return 200");
    const dashboard = await res.json();
    assert.ok(dashboard.certificates, "Dashboard data must contain certificates property");
    assert.ok(Array.isArray(dashboard.certificates), "certificates must be an array");

    const found = dashboard.certificates.find((c: any) => c.id === createdCertId);
    assert.ok(found, "Newly created certificate must appear in admin dashboard data");
  });

  test("CERT-06: Admin can toggle active status and update certificate", async () => {
    if (!adminToken || !createdCertId) {
      assert.fail("Pre-requisite createdCertId or adminToken missing");
    }

    // Toggle active status to false
    const toggleRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "toggle_certificate_active",
        id: createdCertId,
      }),
    });
    assert.strictEqual(toggleRes.status, 200, "Toggle certificate active must return 200");
    const toggled = await toggleRes.json();
    assert.strictEqual(toggled.active, false, "Certificate active state should now be false");

    // Check that public endpoint excludes inactive certificate
    const publicRes = await fetch(`${BACKEND_URL}/api/certificates`);
    const publicList = await publicRes.json();
    const isPubliclyVisible = publicList.some((c: any) => c.id === createdCertId);
    assert.strictEqual(isPubliclyVisible, false, "Inactive certificate must not appear in public listing");
  });

  test("CERT-07: Admin can delete a certificate", async () => {
    if (!adminToken || !createdCertId) {
      assert.fail("Pre-requisite createdCertId or adminToken missing");
    }

    const deleteRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "delete_certificate",
        id: createdCertId,
      }),
    });

    assert.strictEqual(deleteRes.status, 200, "Delete certificate must return 200");
    const delResult = await deleteRes.json();
    assert.strictEqual(delResult.success, true, "Delete response should return success: true");

    // Verify it is gone from database
    const checkDb = await prisma.certificate.findUnique({
      where: { id: createdCertId },
    });
    assert.strictEqual(checkDb, null, "Certificate must be deleted from database");
    createdCertId = 0; // Mark cleaned up
  });
});
