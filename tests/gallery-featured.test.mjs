import assert from "node:assert/strict";
import test, { describe, before, after } from "node:test";
import { PrismaClient } from "../backend/src/generated/prisma/index.js";

const prisma = new PrismaClient();
const BACKEND_URL = process.env.TEST_BACKEND_URL || "http://localhost:5000";

const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || "havenblue83@gmail.com";
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || "Admin@Dezoryn2026!Secure";

describe("Featured Gallery Public-Display Integration Test Suite", () => {
  let adminToken = "";
  const createdItemIds = [];

  before(async () => {
    // Authenticate admin for /api/admin operations
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
    // Clean up test items
    for (const id of createdItemIds) {
      await prisma.galleryItem.deleteMany({ where: { id } });
    }
    await prisma.galleryItem.deleteMany({
      where: { objectKey: { startsWith: "gallery/test-featured-" } },
    });

    // Ensure database has default gallery items populated if empty
    const count = await prisma.galleryItem.count();
    if (count === 0) {
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

  test("GALLERY-FEATURED-01: featured=true item is returned by public gallery API", async () => {
    const item = await prisma.galleryItem.create({
      data: {
        title: "Expressway Screed Test Item",
        caption: "Test caption for featured item",
        fileName: "featured-test.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        objectKey: `gallery/test-featured-${Date.now()}-1.jpg`,
        featured: true,
        active: true,
      },
    });
    createdItemIds.push(item.id);

    const res = await fetch(`${BACKEND_URL}/api/gallery`);
    assert.equal(res.status, 200);
    const items = await res.json();
    assert.ok(Array.isArray(items), "Public gallery should return array");

    const found = items.find((i) => i.id === item.id);
    assert.ok(found, "Featured item must be returned in public gallery list");
    assert.equal(found.featured, true, "Featured field should be true");
  });

  test("GALLERY-FEATURED-02: featured items are ordered before non-featured items", async () => {
    // 1. Create a non-featured item created recently
    const normalItem = await prisma.galleryItem.create({
      data: {
        title: "Normal Recent Item",
        caption: "Non-featured item created with recent timestamp",
        fileName: "normal.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        objectKey: `gallery/test-featured-${Date.now()}-normal.jpg`,
        featured: false,
        active: true,
      },
    });
    createdItemIds.push(normalItem.id);

    // 2. Create a featured item
    const featuredItem = await prisma.galleryItem.create({
      data: {
        title: "Featured Priority Item",
        caption: "Featured item should bubble to top",
        fileName: "featured.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        objectKey: `gallery/test-featured-${Date.now()}-featured.jpg`,
        featured: true,
        active: true,
      },
    });
    createdItemIds.push(featuredItem.id);

    const res = await fetch(`${BACKEND_URL}/api/gallery`);
    assert.equal(res.status, 200);
    const items = await res.json();

    const featuredIdx = items.findIndex((i) => i.id === featuredItem.id);
    const normalIdx = items.findIndex((i) => i.id === normalItem.id);

    assert.ok(featuredIdx !== -1, "Featured item must exist in results");
    assert.ok(normalIdx !== -1, "Normal item must exist in results");
    assert.ok(
      featuredIdx < normalIdx,
      `Featured item (index ${featuredIdx}) must appear before normal item (index ${normalIdx})`
    );
  });

  test("GALLERY-FEATURED-03: featured=false items remain visible in the normal gallery", async () => {
    const res = await fetch(`${BACKEND_URL}/api/gallery`);
    assert.equal(res.status, 200);
    const items = await res.json();

    const nonFeaturedItems = items.filter((i) => !i.featured);
    assert.ok(
      nonFeaturedItems.length > 0,
      "Non-featured items must remain visible in the gallery feed"
    );
  });

  test("GALLERY-FEATURED-04: zero featured items does not break public gallery or API", async () => {
    // Set all temporary test items to featured=false temporarily
    await prisma.galleryItem.updateMany({
      where: { id: { in: createdItemIds } },
      data: { featured: false },
    });

    const res = await fetch(`${BACKEND_URL}/api/gallery`);
    assert.equal(res.status, 200);
    const items = await res.json();
    assert.ok(Array.isArray(items));
    // Verify none has broken
    for (const item of items) {
      assert.ok(item.title);
      assert.ok(item.mediaType);
    }
  });

  test("GALLERY-FEATURED-05: inactive featured item is NOT exposed publicly", async () => {
    const hiddenFeatured = await prisma.galleryItem.create({
      data: {
        title: "Hidden Featured Item",
        caption: "Should not be returned publicly because active=false",
        fileName: "hidden-featured.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        objectKey: `gallery/test-featured-${Date.now()}-hidden.jpg`,
        featured: true,
        active: false,
      },
    });
    createdItemIds.push(hiddenFeatured.id);

    const res = await fetch(`${BACKEND_URL}/api/gallery`);
    assert.equal(res.status, 200);
    const items = await res.json();

    const found = items.find((i) => i.id === hiddenFeatured.id);
    assert.equal(found, undefined, "Inactive featured item must NOT be returned in public API");
  });

  test("GALLERY-FEATURED-06: toggling the existing ★ control changes the public featured state", async () => {
    assert.ok(adminToken, "Admin token is required");
    const targetId = createdItemIds[0];
    assert.ok(targetId, "Target gallery item ID required");

    // 1. Toggle featured to true via admin action
    const toggleOnRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "gallery_toggle",
        id: targetId,
        active: true,
        featured: true,
      }),
    });
    assert.equal(toggleOnRes.status, 200);

    let pubRes = await fetch(`${BACKEND_URL}/api/gallery`);
    let items = await pubRes.json();
    let target = items.find((i) => i.id === targetId);
    assert.ok(target, "Item should exist");
    assert.equal(target.featured, true, "Item should now be featured=true in public API");

    // 2. Toggle featured to false via admin action
    const toggleOffRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "gallery_toggle",
        id: targetId,
        active: true,
        featured: false,
      }),
    });
    assert.equal(toggleOffRes.status, 200);

    pubRes = await fetch(`${BACKEND_URL}/api/gallery`);
    items = await pubRes.json();
    target = items.find((i) => i.id === targetId);
    assert.ok(target, "Item should exist");
    assert.equal(target.featured, false, "Item should now be featured=false in public API");
  });

  test("GALLERY-FEATURED-07: Inactive gallery media returns 404 Not Found on GET /api/media/:id", async () => {
    const inactiveMedia = await prisma.galleryItem.create({
      data: {
        title: "Inactive Media Item",
        caption: "Should return 404 when streamed directly",
        fileName: "inactive-stream.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        objectKey: `gallery/test-inactive-${Date.now()}.jpg`,
        featured: false,
        active: false,
      },
    });
    createdItemIds.push(inactiveMedia.id);

    const res = await fetch(`${BACKEND_URL}/api/media/${inactiveMedia.id}`);
    assert.equal(res.status, 404, "Inactive media should return 404");
  });
});
