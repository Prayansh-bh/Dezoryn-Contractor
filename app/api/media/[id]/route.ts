import { getGalleryItemById } from "@backend/services/gallery.service";
import { getMediaFile } from "@backend/storage/local-storage.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = Number(id);
    if (!mediaId) {
      return new Response("Invalid ID", { status: 400 });
    }

    const item = await getGalleryItemById(mediaId);
    if (!item || !item.active) {
      return new Response("Not found", { status: 404 });
    }

    // Try local storage first, then fallback to database bytes
    let fileBuffer: Buffer | null = null;
    if (item.objectKey) {
      fileBuffer = await getMediaFile(item.objectKey);
    }
    if (!fileBuffer && item.fileData) {
      fileBuffer = Buffer.from(item.fileData);
    }

    if (!fileBuffer) {
      return new Response("Media file not found", { status: 404 });
    }

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": item.contentType,
        "Cache-Control": "public, max-age=86400",
        "Content-Disposition": `inline; filename="${item.fileName.replace(/"/g, "")}"`,
      },
    });
  } catch (error) {
    console.error("❌ [API/Media GET] Error:", error);
    return new Response("Server error", { status: 500 });
  }
}
