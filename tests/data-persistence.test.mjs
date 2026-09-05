import assert from "node:assert/strict";
import test, { describe, before, after } from "node:test";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_PRODUCTS, DEFAULT_SITE_SETTINGS } from "../shared/constants/index.js";

const prisma = new PrismaClient();
const BACKEND_URL = process.env.TEST_BACKEND_URL || "http://localhost:5000";

const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || "havenblue83@gmail.com";
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || "Admin@Dezoryn2026!Secure";

describe("Data Persistence & Anti-Resurrection Test Suite", () => {
  let adminToken = "";

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
    // Restore default products & gallery items to keep database populated for local dev server
    for (let i = 0; i < DEFAULT_PRODUCTS.length; i++) {
      const p = DEFAULT_PRODUCTS[i];
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: { ...p, sortOrder: i + 1, active: true },
        create: { ...p, sortOrder: i + 1, active: true },
      });
    }

    const galleryCount = await prisma.galleryItem.count();
    if (galleryCount === 0) {
      await prisma.galleryItem.create({
        data: {
          title: "Thermoplastic Expressway Paving & Marking",
          caption: "High-speed automated application on 8-lane highway corridor under MORTH 803.",
          fileName: "thermoplastic-paint.jpg",
          mediaType: "image",
          contentType: "image/jpeg",
          objectKey: "gallery/default-thermoplastic-paint.jpg",
          featured: true,
          active: true,
        },
      });
    }

    await prisma.$disconnect();
  });

  test("DATA-01: Deleted gallery items remain deleted after subsequent GET requests", async () => {
    // 1. Ensure at least one gallery item exists
    await prisma.galleryItem.deleteMany();
    await prisma.galleryItem.create({
      data: {
        title: "Test Paving Item",
        caption: "Test caption",
        fileName: "test.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        objectKey: "gallery/test.jpg",
        featured: true,
        active: true,
      },
    });

    const initRes = await fetch(`${BACKEND_URL}/api/gallery`);
    assert.equal(initRes.status, 200);
    const initData = await initRes.json();
    assert.equal(initData.length, 1);

    // 2. Delete all gallery items
    await prisma.galleryItem.deleteMany();
    const dbCountAfterDelete = await prisma.galleryItem.count();
    assert.equal(dbCountAfterDelete, 0, "Database count should be 0");

    // 3. First GET request -> should return empty array []
    const firstGetRes = await fetch(`${BACKEND_URL}/api/gallery`);
    assert.equal(firstGetRes.status, 200);
    const firstGetData = await firstGetRes.json();
    assert.deepEqual(firstGetData, [], "First GET must return empty array []");

    // 4. Second repeat GET request -> should STILL return empty array [] (no auto-resurrection)
    const secondGetRes = await fetch(`${BACKEND_URL}/api/gallery`);
    assert.equal(secondGetRes.status, 200);
    const secondGetData = await secondGetRes.json();
    assert.deepEqual(secondGetData, [], "Second GET must still return empty array []");

    // 5. Admin API check -> data.gallery must be empty array []
    if (adminToken) {
      const adminRes = await fetch(`${BACKEND_URL}/api/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(adminRes.status, 200);
      const adminData = await adminRes.json();
      assert.deepEqual(adminData.gallery, [], "Admin dashboard gallery array must be []");
    }

    // 6. Confirm database count remains 0
    const finalCount = await prisma.galleryItem.count();
    assert.equal(finalCount, 0, "Database count must remain 0 without auto-resurrecting");
  });

  test("DATA-02: Deleted products remain deleted after subsequent GET requests", async () => {
    // 1. Ensure at least one product exists
    await prisma.product.deleteMany();
    await prisma.product.create({
      data: {
        slug: "test-product-1",
        name: "Test Product 1",
        kicker: "Test kicker",
        description: "Test description",
        features: [],
        uses: [],
        specs: [],
        sortOrder: 1,
        active: true,
      },
    });

    const initRes = await fetch(`${BACKEND_URL}/api/products`);
    assert.equal(initRes.status, 200);
    const initData = await initRes.json();
    assert.equal(initData.length, 1);

    // 2. Delete all products
    await prisma.product.deleteMany();
    const dbCountAfterDelete = await prisma.product.count();
    assert.equal(dbCountAfterDelete, 0, "Database product count should be 0");

    // 3. First GET request -> should return empty array []
    const firstGetRes = await fetch(`${BACKEND_URL}/api/products`);
    assert.equal(firstGetRes.status, 200);
    const firstGetData = await firstGetRes.json();
    assert.deepEqual(firstGetData, [], "First GET must return empty array []");

    // 4. Second repeat GET request -> should STILL return empty array [] (no auto-resurrection)
    const secondGetRes = await fetch(`${BACKEND_URL}/api/products`);
    assert.equal(secondGetRes.status, 200);
    const secondGetData = await secondGetRes.json();
    assert.deepEqual(secondGetData, [], "Second GET must still return empty array []");

    // 5. Product by slug request -> should return 404 (not fallback to static default)
    const slugRes = await fetch(`${BACKEND_URL}/api/products/thermoplastic-road-marking-paint`);
    assert.equal(slugRes.status, 404, "Deleted product slug must return 404");

    // 6. Admin API check -> data.products must be empty array []
    if (adminToken) {
      const adminRes = await fetch(`${BACKEND_URL}/api/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(adminRes.status, 200);
      const adminData = await adminRes.json();
      assert.deepEqual(adminData.products, [], "Admin dashboard products array must be []");
    }

    // 7. Confirm database count remains 0
    const finalCount = await prisma.product.count();
    assert.equal(finalCount, 0, "Database product count must remain 0 without auto-resurrecting");
  });
});
