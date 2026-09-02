import { NextResponse } from "next/server";
import { isAdmin } from "@backend/auth/admin-auth.service";
import {
  createGalleryItem,
  getGalleryItemById,
  deleteGalleryItem,
} from "@backend/services/gallery.service";
import {
  saveMediaFile,
  deleteMediaFile,
} from "@backend/storage/local-storage.service";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    const isMedia = file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isMedia) {
      return NextResponse.json({ error: "Only image or video files are allowed" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Maximum file size is 50MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const { objectKey } = await saveMediaFile(file.name, arrayBuffer);

    const title = String(form.get("title") || file.name);
    const caption = String(form.get("caption") || "");
    const mediaType = file.type.startsWith("video/") ? "video" : "image";
    const featured = form.get("featured") === "true";

    const item = await createGalleryItem({
      title,
      caption,
      mediaType,
      objectKey,
      fileName: file.name,
      contentType: file.type,
      fileData: Buffer.from(arrayBuffer),
      featured,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("❌ [API/Admin Media POST] Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload media file" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const item = await getGalleryItemById(id);
    if (item && item.objectKey) {
      await deleteMediaFile(item.objectKey);
      await deleteGalleryItem(id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ [API/Admin Media DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete media file" }, { status: 500 });
  }
}
