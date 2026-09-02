import fs from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");

export async function ensureUploadDirectory(): Promise<void> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.warn("⚠️ Could not create uploads directory:", err);
  }
}

export async function saveMediaFile(
  fileName: string,
  buffer: ArrayBuffer | Buffer
): Promise<{ objectKey: string; localPath: string }> {
  await ensureUploadDirectory();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueKey = `gallery/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const diskFileName = uniqueKey.replace("gallery/", "");
  const filePath = path.join(UPLOAD_DIR, diskFileName);

  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  await fs.writeFile(filePath, nodeBuffer);

  return {
    objectKey: uniqueKey,
    localPath: `/uploads/gallery/${diskFileName}`,
  };
}

export async function getMediaFile(
  objectKey: string
): Promise<Buffer | null> {
  try {
    const diskFileName = objectKey.replace("gallery/", "");
    const filePath = path.join(UPLOAD_DIR, diskFileName);
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

export async function deleteMediaFile(objectKey: string): Promise<boolean> {
  try {
    const diskFileName = objectKey.replace("gallery/", "");
    const filePath = path.join(UPLOAD_DIR, diskFileName);
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
