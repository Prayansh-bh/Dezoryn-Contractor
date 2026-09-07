import { describe, it } from "node:test";
import assert from "node:assert";
import http from "node:http";

function fetchHtml(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on("error", reject);
  });
}

describe("Enterprise SEO & Discoverability Verification", () => {
  it("SEO-01: /robots.txt exists and contains valid crawler directives & sitemap", async () => {
    const res = await fetchHtml("/robots.txt");
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.includes("User-Agent: *"));
    assert.ok(res.body.includes("Disallow: /api/"));
    assert.ok(res.body.includes("Sitemap: https://www.dezoryn.com/sitemap.xml"));
  });

  it("SEO-02: /sitemap.xml dynamically serves valid XML containing static & product routes", async () => {
    const res = await fetchHtml("/sitemap.xml");
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.includes("<urlset"));
    assert.ok(res.body.includes("https://www.dezoryn.com</loc>"));
    assert.ok(res.body.includes("https://www.dezoryn.com/products</loc>"));
    assert.ok(res.body.includes("https://www.dezoryn.com/workforce</loc>"));
    assert.ok(res.body.includes("/products/thermoplastic-road-marking-paint"));
  });

  it("SEO-03: Root Layout injects Organization and WebSite Schema.org JSON-LD", async () => {
    const res = await fetchHtml("/");
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.includes('"@type":"Corporation"'));
    assert.ok(res.body.includes('"@type":"WebSite"'));
    assert.ok(res.body.includes("Dezoryn Contractor"));
  });

  it("SEO-04: Product detail page has dynamic metadata and Product + Breadcrumb JSON-LD", async () => {
    const res = await fetchHtml("/products/thermoplastic-road-marking-paint");
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.includes("<title>Thermoplastic Road Marking Paint Manufacturer"));
    assert.ok(res.body.includes('"@type":"Product"'));
    assert.ok(res.body.includes('"@type":"BreadcrumbList"'));
    assert.ok(res.body.includes("MORTH Clause 803"));
  });

  it("SEO-05: Workforce page injects Service and Breadcrumb Schema", async () => {
    const res = await fetchHtml("/workforce");
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.includes("<title>Highway Workforce"));
    assert.ok(res.body.includes('"@type":"Service"'));
    assert.ok(res.body.includes('"@type":"BreadcrumbList"'));
  });

  it("SEO-06: Quality page contains MORTH/IRC standards metadata", async () => {
    const res = await fetchHtml("/quality");
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.includes("<title>Quality Assurance"));
    assert.ok(res.body.includes('"@type":"BreadcrumbList"'));
  });
});
