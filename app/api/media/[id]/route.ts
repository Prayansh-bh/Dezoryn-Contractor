import { NextRequest, NextResponse } from "next/server";
import { getGalleryItemById } from "@backend/services/gallery.service";
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

    // 1. Fetch from live backend API first
    try {
      const backendRes = await fetch(
        `https://dezoryn-backend.onrender.com/api/media/${mediaId}`,
        { next: { revalidate: 86400 } }
      );
      if (backendRes.ok) {
        const arrayBuffer = await backendRes.arrayBuffer();
        const contentType = backendRes.headers.get("content-type") || "image/jpeg";
        return new NextResponse(new Uint8Array(arrayBuffer), {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    } catch (e) {
      // Continue to local database/filesystem fallback
    }

    // 2. Query database item
    const item = await getGalleryItemById(mediaId);
    if (!item || !item.active) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (item.fileData) {
      return new NextResponse(new Uint8Array(Buffer.from(item.fileData)), {
        headers: {
          "Content-Type": item.contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (item.fileName) {
      const candidatePaths = [
        path.join(process.cwd(), "public", "images", "products", item.fileName),
        path.join(process.cwd(), "backend", "uploads", "gallery", item.fileName),
        path.resolve(process.cwd(), "public", "images", "products", item.fileName),
      ];
      for (const p of candidatePaths) {
        try {
          const fileBuffer = await fs.readFile(p);
          if (fileBuffer) {
            return new NextResponse(new Uint8Array(fileBuffer), {
              headers: {
                "Content-Type": item.contentType,
                "Cache-Control": "public, max-age=86400",
              },
            });
          }
        } catch {
          // continue
        }
      }
    }

    return new NextResponse("Media not found", { status: 404 });
  } catch (error) {
    console.error("Error serving media route:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
