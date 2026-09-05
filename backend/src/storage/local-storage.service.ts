import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function getUploadDirectories(subfolder: string = "gallery"): string[] {
  const cwd = process.cwd();
  const dirs = [
    path.join(cwd, "uploads", subfolder),
    path.join(cwd, "backend", "uploads", subfolder),
    path.resolve(cwd, "..", "uploads", subfolder),
    path.resolve(cwd, "..", "backend", "uploads", subfolder),
  ];
  return Array.from(new Set(dirs));
}

export async function ensureUploadDirectory(subfolder: string = "gallery"): Promise<string> {
  const primaryDir = process.cwd().endsWith("backend")
    ? path.join(process.cwd(), "uploads", subfolder)
    : path.join(process.cwd(), "backend", "uploads", subfolder);

  try {
    await fs.mkdir(primaryDir, { recursive: true });
  } catch (err) {
    console.warn(`⚠️ Could not create uploads/${subfolder} directory:`, err);
  }
  return primaryDir;
}

export async function saveMediaFile(
  fileName: string,
  buffer: Buffer | ArrayBuffer
): Promise<{ objectKey: string; localPath: string }> {
  const primaryDir = await ensureUploadDirectory("gallery");
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueKey = `gallery/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const diskFileName = uniqueKey.replace("gallery/", "");
  const filePath = path.join(primaryDir, diskFileName);

  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  await fs.writeFile(filePath, nodeBuffer);

  return {
    objectKey: uniqueKey,
    localPath: `/uploads/gallery/${diskFileName}`,
  };
}

export async function saveProductImageFile(
  fileName: string,
  buffer: Buffer | ArrayBuffer
): Promise<{ objectKey: string; localPath: string }> {
  const primaryDir = await ensureUploadDirectory("products");
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueKey = `products/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const diskFileName = uniqueKey.replace("products/", "");
  const filePath = path.join(primaryDir, diskFileName);

  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  await fs.writeFile(filePath, nodeBuffer);

  return {
    objectKey: uniqueKey,
    localPath: `/uploads/products/${diskFileName}`,
  };
}

export async function getMediaFile(
  objectKey: string
): Promise<Buffer | null> {
  const cleanKey = objectKey.replace(/^\/?uploads\//, "");
  const subfolder = cleanKey.startsWith("products/") ? "products" : "gallery";
  const diskFileName = cleanKey.replace(/^(gallery|products)\//, "");
  const searchDirs = getUploadDirectories(subfolder);

  for (const dir of searchDirs) {
    try {
      const filePath = path.join(dir, diskFileName);
      return await fs.readFile(filePath);
    } catch {
      // Try next directory
    }
  }

  return null;
}

export async function deleteMediaFile(objectKey: string): Promise<boolean> {
  const cleanKey = objectKey.replace(/^\/?uploads\//, "");
  const subfolder = cleanKey.startsWith("products/") ? "products" : "gallery";
  const diskFileName = cleanKey.replace(/^(gallery|products)\//, "");
  const searchDirs = getUploadDirectories(subfolder);
  let deleted = false;

  for (const dir of searchDirs) {
    try {
      const filePath = path.join(dir, diskFileName);
      await fs.unlink(filePath);
      deleted = true;
    } catch {
      // Ignore if not present in this path
    }
  }

  return deleted;
}

