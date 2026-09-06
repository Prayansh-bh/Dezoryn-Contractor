import { NextRequest, NextResponse } from "next/server";
import { getGalleryItemById } from "@backend/services/gallery.service";
import { getMediaFile } from "@backend/storage/local-storage.service";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = Number(id);
    if (!mediaId) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const item = await getGalleryItemById(mediaId);
    if (!item || !item.active) {
      return new NextResponse("Not found", { status: 404 });
    }

    let fileBuffer: Buffer | null = null;
    if (item.objectKey) {
      try {
        fileBuffer = await getMediaFile(item.objectKey);
      } catch {
        // Continue fallback
      }
    }
    if (!fileBuffer && item.fileData) {
      fileBuffer = Buffer.from(item.fileData);
    }
    if (!fileBuffer && item.fileName) {
      const candidatePaths = [
        path.join(process.cwd(), "public", "images", "products", item.fileName),
        path.join(process.cwd(), "backend", "uploads", "gallery", item.fileName),
        path.resolve(process.cwd(), "public", "images", "products", item.fileName),
      ];
      for (const p of candidatePaths) {
        try {
          fileBuffer = await fs.readFile(p);
          if (fileBuffer) break;
        } catch {
          // Continue searching
        }
      }
    }

    // Direct proxy fallback to deployed backend if not found on local disk
    if (!fileBuffer) {
      try {
        const backendRes = await fetch(`https://dezoryn-backend.onrender.com/api/media/${mediaId}`);
        if (backendRes.ok) {
          const arrayBuffer = await backendRes.arrayBuffer();
          return new NextResponse(arrayBuffer, {
            headers: {
              "Content-Type": backendRes.headers.get("content-type") || item.contentType,
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
      } catch (proxyErr) {
        console.error("Proxy fetch error:", proxyErr);
      }
      return new NextResponse("Media file not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": item.contentType,
        "Cache-Control": "public, max-age=86400",
        "Content-Disposition": `inline; filename="${item.fileName.replace(/"/g, "")}"`,
      },
    });
  } catch (error) {
    console.error("Error serving media route:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
