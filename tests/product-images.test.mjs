import assert from "node:assert/strict";
import test, { describe, before, after } from "node:test";
import { PrismaClient } from "../backend/src/generated/prisma/index.js";

const prisma = new PrismaClient();
const BACKEND_URL = process.env.TEST_BACKEND_URL || "http://localhost:5000";

const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || "havenblue83@gmail.com";
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || "Admin@Dezoryn2026!Secure";

describe("Product Custom Image Upload & Persistence Test Suite", () => {
  let adminToken = "";
  const createdProductIds = [];

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
    // Clean up test products
    for (const id of createdProductIds) {
      await prisma.product.deleteMany({ where: { id } });
    }
    await prisma.product.deleteMany({
      where: { slug: { in: ["test-custom-barricade", "test-reflective-marker"] } },
    });
    await prisma.$disconnect();
  });

  test("IMG-01: Unauthorized request to /api/admin/products/upload-image returns 401", async () => {
    const formData = new FormData();
    const fakeFile = new Blob(["fake-image-content"], { type: "image/png" });
    formData.append("file", fakeFile, "test.png");

    const res = await fetch(`${BACKEND_URL}/api/admin/products/upload-image`, {
      method: "POST",
      body: formData,
    });

    assert.equal(res.status, 401, "Should reject unauthenticated upload with 401");
  });

  test("IMG-02: Upload with invalid MIME format returns 400 Bad Request", async () => {
    assert.ok(adminToken, "Admin token is required");
    const formData = new FormData();
    const fakeTextFile = new Blob(["this is a plain text file"], { type: "text/plain" });
    formData.append("file", fakeTextFile, "document.txt");

    const res = await fetch(`${BACKEND_URL}/api/admin/products/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });

    assert.equal(res.status, 400, "Should reject invalid MIME type with 400");
    const data = await res.json();
    assert.ok(data.error, "Error message should be present");
  });

  test("IMG-03: Authenticated admin can successfully upload a valid image", async () => {
    assert.ok(adminToken, "Admin token is required");
    const formData = new FormData();
    // Create a 1x1 transparent PNG binary
    const pngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
      0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84, 120,
      156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68,
      174, 66, 96, 130,
    ]);
    const imageBlob = new Blob([pngBytes], { type: "image/png" });
    formData.append("file", imageBlob, "sample-product.png");

    const res = await fetch(`${BACKEND_URL}/api/admin/products/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });

    assert.equal(res.status, 200, "Should succeed with status 200");
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.ok(
      typeof data.imageUrl === "string" && data.imageUrl.startsWith("/uploads/products/"),
      `Expected imageUrl starting with /uploads/products/, got ${data.imageUrl}`
    );

    // Verify image file is reachable via static GET /uploads/products/...
    const fetchImgRes = await fetch(`${BACKEND_URL}${data.imageUrl}`);
    assert.equal(fetchImgRes.status, 200, "Image URL should return 200 OK");
    const arrayBuf = await fetchImgRes.arrayBuffer();
    assert.ok(arrayBuf.byteLength > 0, "Image response should return binary content");
  });

  test("IMG-04: Creating a product with custom imageUrl persists in database", async () => {
    assert.ok(adminToken, "Admin token is required");

    const newProductPayload = {
      action: "save_product",
      name: "Test Custom Barricade",
      slug: "test-custom-barricade",
      kicker: "Heavy Duty Road Block",
      description: "Interlocking modular water-filled highway barricade system.",
      features: ["Impact resistant HDPE", "Reflective prism striping"],
      uses: ["Toll plaza diversion", "Expressway lane restriction"],
      specs: ["Height: 1000mm", "Weight (filled): 80kg"],
      active: true,
      sortOrder: 99,
      imageUrl: "/uploads/products/sample-test-barricade.png",
    };

    const res = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newProductPayload),
    });

    assert.equal(res.status, 200, "Should succeed with 200");
    const resData = await res.json();
    assert.equal(resData.ok, true);
    assert.ok(resData.product.id, "Product ID should be returned");
    createdProductIds.push(resData.product.id);

    // Verify in database via Prisma
    const dbRecord = await prisma.product.findUnique({
      where: { id: resData.product.id },
    });
    assert.ok(dbRecord, "Product should exist in DB");
    assert.equal(
      dbRecord.imageUrl,
      "/uploads/products/sample-test-barricade.png",
      "imageUrl should match saved value"
    );
  });

  test("IMG-05: Updating existing product's imageUrl and removing it persists properly", async () => {
    assert.ok(adminToken, "Admin token is required");
    const productId = createdProductIds[0];
    assert.ok(productId, "Existing product ID is required");

    // 1. Update imageUrl
    const updatePayload = {
      action: "save_product",
      id: productId,
      name: "Test Custom Barricade (Updated)",
      slug: "test-custom-barricade",
      kicker: "Heavy Duty Road Block v2",
      description: "Updated description.",
      features: ["Impact resistant HDPE"],
      uses: ["Toll plaza diversion"],
      specs: ["Height: 1200mm"],
      active: true,
      sortOrder: 99,
      imageUrl: "/uploads/products/sample-test-barricade-updated.png",
    };

    const updateRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(updatePayload),
    });
    assert.equal(updateRes.status, 200);

    const dbUpdated = await prisma.product.findUnique({ where: { id: productId } });
    assert.equal(
      dbUpdated.imageUrl,
      "/uploads/products/sample-test-barricade-updated.png"
    );

    // 2. Remove imageUrl (set to null)
    const removePayload = {
      action: "save_product",
      id: productId,
      name: "Test Custom Barricade (No Image)",
      slug: "test-custom-barricade",
      kicker: "Heavy Duty Road Block",
      description: "Description without custom image.",
      features: [],
      uses: [],
      specs: [],
      active: true,
      sortOrder: 99,
      imageUrl: null,
    };

    const removeRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(removePayload),
    });
    assert.equal(removeRes.status, 200);

    const dbRemoved = await prisma.product.findUnique({ where: { id: productId } });
    assert.equal(dbRemoved.imageUrl, null, "Database imageUrl should be null after removal");
  });

  test("IMG-06: Public GET /api/products returns imageUrl for custom products", async () => {
    const res = await fetch(`${BACKEND_URL}/api/products`);
    assert.equal(res.status, 200);
    const products = await res.json();
    assert.ok(Array.isArray(products), "Products should be an array");

    const customProduct = products.find((p) => p.slug === "test-custom-barricade");
    assert.ok(customProduct, "Custom product should appear in public list");
    // Since we cleared imageUrl in IMG-05, it should be null
    assert.equal(customProduct.imageUrl, null);
  });

  test("IMG-07: Deleting a product removes its unreferenced image file from disk", async () => {
    assert.ok(adminToken, "Admin token is required");

    // 1. Upload an image
    const formData = new FormData();
    const pngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
      0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84, 120,
      156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68,
      174, 66, 96, 130,
    ]);
    const imageBlob = new Blob([pngBytes], { type: "image/png" });
    formData.append("file", imageBlob, "cleanup-test-prod.png");

    const uploadRes = await fetch(`${BACKEND_URL}/api/admin/products/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    const uploadData = await uploadRes.json();
    assert.equal(uploadRes.status, 200);
    assert.ok(uploadData.imageUrl);

    // Verify image file exists
    let imgFetch = await fetch(`${BACKEND_URL}${uploadData.imageUrl}`);
    assert.equal(imgFetch.status, 200);

    // 2. Create product with this image
    const createRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "save_product",
        name: "Temporary Cleanup Product",
        slug: "temp-cleanup-prod-" + Date.now(),
        kicker: "Temp",
        description: "Testing disk cleanup on delete.",
        features: [],
        uses: [],
        specs: [],
        active: true,
        sortOrder: 100,
        imageUrl: uploadData.imageUrl,
      }),
    });
    const createData = await createRes.json();
    assert.equal(createRes.status, 200);
    const prodId = createData.product.id;

    // 3. Delete the product
    const deleteRes = await fetch(`${BACKEND_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: "delete_product",
        id: prodId,
      }),
    });
    assert.equal(deleteRes.status, 200);

    // 4. Verify disk file was deleted (404)
    imgFetch = await fetch(`${BACKEND_URL}${uploadData.imageUrl}`);
    assert.equal(imgFetch.status, 404, "Orphaned image should be cleaned up from disk");
  });

  test("IMG-08: Concurrent product creation produces strictly distinct and sequential sortOrder without duplicates", async () => {
    assert.ok(adminToken, "Admin token is required");
    const testBatchSize = 6;
    const batchSlugPrefix = `concurrent-test-${Date.now()}`;

    // Issue concurrent creation requests simultaneously
    const creationPromises = Array.from({ length: testBatchSize }).map((_, idx) => {
      return fetch(`${BACKEND_URL}/api/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: "save_product",
          name: `Concurrent Product ${idx + 1}`,
          slug: `${batchSlugPrefix}-${idx + 1}`,
          kicker: "Concurrency Test",
          description: "Testing concurrent sortOrder allocation.",
          features: [],
          uses: [],
          specs: [],
          active: true,
          sortOrder: 0,
        }),
      }).then((res) => res.json());
    });

    const results = await Promise.all(creationPromises);

    // Collect IDs for cleanup
    for (const r of results) {
      assert.equal(r.ok, true, `Product creation should succeed: ${JSON.stringify(r)}`);
      assert.ok(r.product?.id);
      createdProductIds.push(r.product.id);
    }

    // Verify all sortOrders are distinct
    const sortOrders = results.map((r) => r.product.sortOrder);
    const uniqueSortOrders = new Set(sortOrders);

    assert.equal(
      uniqueSortOrders.size,
      testBatchSize,
      `All allocated sortOrders must be unique! Received sortOrders: [${sortOrders.join(", ")}]`
    );
  });
});
