import assert from "node:assert/strict";
import test, { describe } from "node:test";

const FRONTEND_URL = "http://localhost:3000";
const ADMIN_URL = "http://localhost:3001";

const PAGES = [
  "/",
  "/about",
  "/products",
  "/products/thermoplastic-road-marking-paint",
  "/products/reflective-glass-beads",
  "/products/kerb-barrier-coatings",
  "/products/road-studs-delineators",
  "/products/traffic-safety-products",
  "/products/custom-manufacturing",
  "/quality",
  "/applications",
  "/gallery",
  "/contact",
];

describe("Production Mobile Responsiveness & Layout Audit", () => {
  for (const path of PAGES) {
    test(`AUDIT-PAGE: ${path} returns 200 and has valid viewport configuration`, async () => {
      const res = await fetch(`${FRONTEND_URL}${path}`);
      assert.equal(res.status, 200, `Page ${path} should respond with 200 OK`);
      const html = await res.text();

      // Check standard mobile viewport meta tag
      assert.equal(
        html.includes('name="viewport"') || html.includes('content="width=device-width'),
        true,
        `Page ${path} must have a mobile-ready viewport meta tag`
      );

      // Check container and navigation elements
      assert.equal(html.includes("menu-btn"), true, `Page ${path} must render the mobile menu button`);
      assert.equal(html.includes("nav-links"), true, `Page ${path} must render responsive nav-links`);
      assert.equal(html.includes("footer-bottom"), true, `Page ${path} must render responsive footer`);
    });
  }

  test("AUDIT-ADMIN: Admin Control Centre serves index.html with viewport meta tag", async () => {
    const res = await fetch(ADMIN_URL);
    assert.equal(res.status, 200, "Admin dashboard must respond with 200 OK");
    const html = await res.text();
    assert.equal(html.includes("viewport"), true, "Admin dashboard must have viewport meta tag");
  });
});
