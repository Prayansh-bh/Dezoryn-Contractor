import assert from "node:assert/strict";
import test, { describe, before, after } from "node:test";
import { prisma } from "../backend/src/db/prisma";

const BACKEND_URL = process.env.TEST_BACKEND_URL || "http://localhost:5000";


const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || "havenblue83@gmail.com";
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || "Admin@Dezoryn2026!Secure";

describe("Industrial Workforce & Labour Exchange Test Suite", () => {
  let adminToken = "";
  const testPhoneSuffix = Math.floor(100000 + Math.random() * 900000);
  const agencyPhone = `+9198${testPhoneSuffix}`;
  const workerPhone = `+9197${testPhoneSuffix}`;
  let createdReqId = 0;
  let createdAgencyId = 0;
  let createdWorkerId = 0;

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
    // Clean up test data
    if (createdReqId) {
      await prisma.labourRequisition.deleteMany({ where: { id: createdReqId } });
    }
    await prisma.labourAgency.deleteMany({ where: { phone: agencyPhone } });
    await prisma.individualWorker.deleteMany({ where: { phone: workerPhone } });
    await prisma.$disconnect();
  });

  test("WORKFORCE-01: Contractor requisition creation persists with generated code and trade matrix", async () => {
    const res = await fetch(`${BACKEND_URL}/api/workforce/requisitions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "L&T Infrastructure ECC",
        contactPerson: "Vikram Mehta",
        phone: "+91 98765 12345",
        email: "vikram.mehta@infra-test.com",
        projectTitle: "Surat-Vadodara Expressway Package-6",
        projectType: "NHAI Highway / Expressway",
        locationState: "Gujarat",
        locationCity: "Bharuch Site Camp",
        totalWorkers: 50,
        skillsRequired: [
          { trade: "Bar Benders & Rebar Fitters", count: 30 },
          { trade: "Highway Paver / Roller Operators", count: 20 },
        ],
        startDate: "Within 10 Days",
        durationMonths: "6 Months",
        amenities: ["Labour Accommodation Provided", "Safety PPE & Helmets Provided"],
        dailyWageBudget: "₹850 / day",
        message: "Require skilled crew with safety orientation.",
      }),
    });

    assert.strictEqual(res.status, 201, `Expected 201 Created, got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.match(body.requisitionCode, /^REQ-/);
    assert.strictEqual(body.requisition.companyName, "L&T Infrastructure ECC");
    assert.strictEqual(body.requisition.totalWorkers, 50);

    createdReqId = body.requisition.id;

    // Verify DB direct persistence
    const dbRecord = await prisma.labourRequisition.findUnique({
      where: { id: createdReqId },
    });
    assert.ok(dbRecord, "Record must exist in PostgreSQL database");
    assert.strictEqual(dbRecord.locationCity, "Bharuch Site Camp");
    assert.strictEqual(dbRecord.status, "open");
  });

  test("WORKFORCE-02: Contractor requisition rejects malformed payload with 400 Bad Request", async () => {
    const res = await fetch(`${BACKEND_URL}/api/workforce/requisitions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "",
        phone: "123", // too short
      }),
    });

    assert.strictEqual(res.status, 400, "Should reject empty company name and short phone");
    const body = await res.json();
    assert.ok(body.error || body.issues, "Should return error information");
  });

  test("WORKFORCE-03: Labour agency registration persists with crew size, trade capabilities and AGC code", async () => {
    const res = await fetch(`${BACKEND_URL}/api/workforce/agencies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agencyName: "Gujarat Highway Labour Contractors Ltd",
        proprietorName: "Dinesh Bhai Patel",
        phone: agencyPhone,
        email: "dinesh.patel@ghlc-test.com",
        gstin: "24AAAAA0000A1Z5",
        labourLicenseNo: "CLA/GUJ/2024/9912",
        state: "Gujarat",
        city: "Vadodara",
        totalCrewSize: 85,
        primaryTrades: [
          "Bar Bending & Rebar Fitters",
          "W-Beam Crash Barrier Erection Crew",
          "Kerb Casting & Masonry Specialists",
        ],
        preferredStates: ["Gujarat", "Rajasthan", "Maharashtra"],
        availability: "immediate",
      }),
    });

    assert.strictEqual(res.status, 201, `Expected 201 Created, got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.match(body.agencyCode, /^AGC-/);
    assert.strictEqual(body.agency.totalCrewSize, 85);
    assert.strictEqual(body.agency.verified, false);

    createdAgencyId = body.agency.id;

    // Verify DB direct persistence
    const dbAgency = await prisma.labourAgency.findUnique({
      where: { id: createdAgencyId },
    });
    assert.ok(dbAgency, "Agency must exist in PostgreSQL database");
    assert.strictEqual(dbAgency.proprietorName, "Dinesh Bhai Patel");
  });

  test("WORKFORCE-04: Duplicate agency phone number registration returns 409 Conflict", async () => {
    const res = await fetch(`${BACKEND_URL}/api/workforce/agencies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agencyName: "Another Agency With Same Phone",
        proprietorName: "Duplicate Partner",
        phone: agencyPhone,
        state: "Gujarat",
        city: "Surat",
        totalCrewSize: 20,
      }),
    });

    assert.strictEqual(res.status, 409, "Should reject duplicate phone with 409 Conflict");
    const body = await res.json();
    assert.match(body.error, /already registered/i);
  });

  test("WORKFORCE-05: Individual worker registration persists with WRK code and trade categorization", async () => {
    const res = await fetch(`${BACKEND_URL}/api/workforce/workers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Sanjay Ram Kumar",
        phone: workerPhone,
        trade: "Highway Paver / Roller Operator",
        experienceYears: 4,
        currentCity: "Surat",
        currentState: "Gujarat",
        dailyWageExpect: "₹800 / day",
        canRelocate: true,
        availability: "immediate",
      }),
    });

    assert.strictEqual(res.status, 201, `Expected 201 Created, got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.match(body.workerCode, /^WRK-/);
    assert.strictEqual(body.worker.fullName, "Sanjay Ram Kumar");
    assert.strictEqual(body.worker.status, "available");

    createdWorkerId = body.worker.id;

    // Verify DB direct persistence
    const dbWorker = await prisma.individualWorker.findUnique({
      where: { id: createdWorkerId },
    });
    assert.ok(dbWorker, "Worker must exist in database");
    assert.strictEqual(dbWorker.trade, "Highway Paver / Roller Operator");
  });

  test("WORKFORCE-06: Duplicate worker phone number returns 409 Conflict", async () => {
    const res = await fetch(`${BACKEND_URL}/api/workforce/workers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Sanjay Copy",
        phone: workerPhone,
        trade: "Bar Bender",
        currentCity: "Surat",
        currentState: "Gujarat",
      }),
    });

    assert.strictEqual(res.status, 409, "Should reject duplicate worker phone with 409");
  });

  test("WORKFORCE-07: Public GET /api/workforce/summary returns telemetry metrics and active trade list", async () => {
    const res = await fetch(`${BACKEND_URL}/api/workforce/summary`);
    assert.strictEqual(res.status, 200);
    const summary = await res.json();
    assert.ok(typeof summary.totalRequisitions === "number");
    assert.ok(typeof summary.totalAgencies === "number");
    assert.ok(typeof summary.totalWorkforcePool === "number");
    assert.ok(Array.isArray(summary.topTrades));
    assert.ok(summary.topTrades.length > 0);
  });

  test("WORKFORCE-08: Authenticated admin GET /api/admin returns workforce collections", async () => {
    if (!adminToken) return;

    const res = await fetch(`${BACKEND_URL}/api/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.workforce, "Response must include workforce object");
    assert.ok(Array.isArray(data.workforce.requisitions));
    assert.ok(Array.isArray(data.workforce.agencies));
    assert.ok(Array.isArray(data.workforce.workers));

    const foundReq = data.workforce.requisitions.find((r: any) => r.id === createdReqId);
    assert.ok(foundReq, "Created requisition must be present in admin dataset");
  });

  test("WORKFORCE-09: Admin can change requisition status from open to matched", async () => {
    if (!adminToken || !createdReqId) return;

    const res = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "requisition_status",
        id: createdReqId,
        status: "matched",
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);

    const updated = await prisma.labourRequisition.findUnique({
      where: { id: createdReqId },
    });
    assert.strictEqual(updated?.status, "matched");
  });

  test("WORKFORCE-10: Admin can verify a labour agency partner", async () => {
    if (!adminToken || !createdAgencyId) return;

    const res = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "agency_verify",
        id: createdAgencyId,
        verified: true,
        notes: "Verified GST and Labour License CLA/GUJ/2024/9912",
      }),
    });

    assert.strictEqual(res.status, 200);
    const updated = await prisma.labourAgency.findUnique({
      where: { id: createdAgencyId },
    });
    assert.strictEqual(updated?.verified, true);
    assert.strictEqual(updated?.notes, "Verified GST and Labour License CLA/GUJ/2024/9912");
  });

  test("WORKFORCE-11: Admin can update worker status and delete test records cleanly", async () => {
    if (!adminToken || !createdWorkerId) return;

    // Update worker status
    const statusRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "worker_status",
        id: createdWorkerId,
        status: "deployed",
      }),
    });
    assert.strictEqual(statusRes.status, 200);

    const updatedWorker = await prisma.individualWorker.findUnique({
      where: { id: createdWorkerId },
    });
    assert.strictEqual(updatedWorker?.status, "deployed");

    // Delete worker
    const delWorkerRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "delete_worker",
        id: createdWorkerId,
      }),
    });
    assert.strictEqual(delWorkerRes.status, 200);

    const deletedWorker = await prisma.individualWorker.findUnique({
      where: { id: createdWorkerId },
    });
    assert.strictEqual(deletedWorker, null, "Worker must be deleted");
    createdWorkerId = 0;
  });
});
