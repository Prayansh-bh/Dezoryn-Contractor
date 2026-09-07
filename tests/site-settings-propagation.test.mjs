import assert from "node:assert/strict";
import test, { describe, before, after } from "node:test";
import http from "node:http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BACKEND_URL = process.env.TEST_BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.TEST_FRONTEND_URL || "http://localhost:3000";

const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || "havenblue83@gmail.com";
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || "Admin@Dezoryn2026!Secure";

function fetchHtml(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${FRONTEND_URL}${urlPath}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on("error", reject);
  });
}

describe("Site Settings Propagation & Multi-Channel Dynamic Reflection", () => {
  let adminToken = "";
  let originalSettings = {};

  before(async () => {
    // 1. Authenticate to get valid access token
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    assert.equal(loginRes.status, 200, "Admin login should succeed");
    const loginData = await loginRes.json();
    adminToken = loginData.accessToken;

    // 2. Fetch and snapshot current settings to restore later
    const adminRes = await fetch(`${BACKEND_URL}/api/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminRes.status, 200);
    const adminData = await adminRes.json();
    originalSettings = adminData.settings || {};
  });

  after(async () => {
    // Restore original settings
    if (adminToken && Object.keys(originalSettings).length > 0) {
      await fetch(`${BACKEND_URL}/api/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: "save_settings",
          settings: originalSettings,
        }),
      });
    }
    await prisma.$disconnect();
  });

  test("SETTINGS-01: Updating admin settings propagates custom Company Name, Email, Phone, WhatsApp & Address", async () => {
    const customTestSettings = {
      ...originalSettings,
      company_name: "Apex Road Infrastructure",
      email: "procure@apexroadinfra.com",
      phone: "+91 91111 22222",
      whatsapp: "+91 93333 44444",
      address: "Survey No 404, Industrial Highway Zone, Vadodara, Gujarat",
      hero_title: "Precision Highway Marking Systems & EPC Solutions",
      hero_text: "High-performance thermoplastic road formulations and road safety infrastructure manufactured to MORTH & IRC compliance standards.",
      meta_title: "Apex Road Infrastructure | Highway Safety & Contractor Exchange",
      meta_description: "Leading manufacturer and contractor for highway road marking, crash barriers, and certified workforce mobilization.",
    };

    // Save settings via admin API
    const saveRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "save_settings",
        settings: customTestSettings,
      }),
    });
    assert.equal(saveRes.status, 200, "Settings update should return 200 OK");

    // Verify public settings API returns updated values
    const publicSettingsRes = await fetch(`${BACKEND_URL}/api/settings`);
    assert.equal(publicSettingsRes.status, 200);
    const publicSettings = await publicSettingsRes.json();
    assert.equal(publicSettings.company_name, "Apex Road Infrastructure");
    assert.equal(publicSettings.email, "procure@apexroadinfra.com");
    assert.equal(publicSettings.phone, "+91 91111 22222");
    assert.equal(publicSettings.whatsapp, "+91 93333 44444");
    assert.equal(publicSettings.address, "Survey No 404, Industrial Highway Zone, Vadodara, Gujarat");
  });

  test("SETTINGS-02: Home Page dynamically reflects custom company name, brand logo, header topbar & footer", async () => {
    const res = await fetchHtml("/");
    assert.equal(res.status, 200);
    
    // Header brand split: APEX / ROAD INFRASTRUCTURE
    assert.ok(res.body.includes("APEX"), "Header brand must include APEX");
    assert.ok(res.body.includes("ROAD INFRASTRUCTURE"), "Header brand must include ROAD INFRASTRUCTURE descriptor");

    // Header contact info
    assert.ok(res.body.includes("procure@apexroadinfra.com"), "Header must show updated email");
    assert.ok(res.body.includes("+91 91111 22222"), "Header must show updated phone");

    // Footer contact info & WhatsApp link
    assert.ok(res.body.includes("Survey No 404, Industrial Highway Zone, Vadodara, Gujarat"), "Footer must show updated address");
    assert.ok(res.body.includes("wa.me/919333344444"), "Footer must link to updated WhatsApp number");

    // Schema.org Corporation JSON-LD
    assert.ok(res.body.includes('"name":"Apex Road Infrastructure"'), "Schema.org Corporation must have custom company name");
    assert.ok(res.body.includes('"email":"procure@apexroadinfra.com"'), "Schema.org Corporation must have custom email");
    assert.ok(res.body.includes('"telephone":"+91 91111 22222"'), "Schema.org Corporation must have custom telephone");
  });

  test("SETTINGS-03: About Page dynamically renders custom company name across hero and narrative", async () => {
    const res = await fetchHtml("/about");
    assert.equal(res.status, 200);
    assert.ok(res.body.includes("ABOUT APEX ROAD INFRASTRUCTURE"), "Hero eyebrow must use dynamic company name");
    assert.ok(res.body.includes("Apex Road Infrastructure is a specialized manufacturing company"), "Hero copy must use dynamic company name");
    assert.ok(res.body.includes("What Defines Apex Road Infrastructure"), "Section heading must use dynamic company name");
  });

  test("SETTINGS-04: Applications & Gallery Pages render custom company name in headings and copy", async () => {
    const appRes = await fetchHtml("/applications");
    assert.equal(appRes.status, 200);
    assert.ok(appRes.body.includes("Apex Road Infrastructure highway products deliver"), "Applications page must use dynamic company name");

    const galRes = await fetchHtml("/gallery");
    assert.equal(galRes.status, 200);
    assert.ok(galRes.body.includes("Apex Road Infrastructure"), "Gallery page must use dynamic company name");
  });

  test("SETTINGS-05: Product Detail Page dynamically binds Brand, Seller and Mailto with custom settings", async () => {
    const res = await fetchHtml("/products/thermoplastic-road-marking-paint");
    assert.equal(res.status, 200);
    
    // mailto TDS link
    assert.ok(res.body.includes("mailto:procure@apexroadinfra.com"), "TDS link must use custom email");
    
    // Product Schema JSON-LD brand & seller
    assert.ok(res.body.includes('"brand":{"@type":"Brand","name":"Apex Road Infrastructure"}'), "Product schema brand must be custom company name");
  });

  test("SETTINGS-06: Workforce Hub and Registration Pages dynamically reflect custom company name", async () => {
    const wfRes = await fetchHtml("/workforce");
    assert.equal(wfRes.status, 200);
    assert.ok(wfRes.body.includes("Apex Road Infrastructure Core Competency"), "Workforce trade card must use custom company name");
    assert.ok(wfRes.body.includes("Verified Apex Road Infrastructure Partner status"), "Agency benefit must use custom company name");
    assert.ok(wfRes.body.includes("Dedicated Apex Road Infrastructure workforce coordinator"), "Operations support must use custom company name");
    assert.ok(wfRes.body.includes('"name":"Apex Road Infrastructure Workforce &amp; Certified Road Marking Labour Exchange"') || wfRes.body.includes('"name":"Apex Road Infrastructure Workforce & Certified Road Marking Labour Exchange"'), "Workforce Service schema must use custom company name");

    const hireRes = await fetchHtml("/workforce/hire");
    assert.equal(hireRes.status, 200);
    assert.ok(hireRes.body.includes("Apex Road Infrastructure pairs you with pre-vetted agencies"), "Hire page hero must use custom company name");

    const agcRes = await fetchHtml("/workforce/agency");
    assert.equal(agcRes.status, 200);
    assert.ok(agcRes.body.includes("Join the Apex Road Infrastructure network"), "Agency page hero must use custom company name");

    const wrkRes = await fetchHtml("/workforce/worker");
    assert.equal(wrkRes.status, 200);
    assert.ok(wrkRes.body.includes("Register in the Apex Road Infrastructure Construction Skill Registry"), "Worker page hero must use custom company name");
  });

  test("SETTINGS-07: Contact Page dynamically renders custom email, phone, whatsapp and address cards", async () => {
    const res = await fetchHtml("/contact");
    assert.equal(res.status, 200);
    assert.ok(res.body.includes("procure@apexroadinfra.com"), "Contact page must show custom email");
    assert.ok(res.body.includes("+91 91111 22222"), "Contact page must show custom phone");
    assert.ok(res.body.includes("+91 93333 44444"), "Contact page must show custom WhatsApp");
    assert.ok(res.body.includes("Survey No 404, Industrial Highway Zone, Vadodara, Gujarat"), "Contact page must show custom address");
  });
});
