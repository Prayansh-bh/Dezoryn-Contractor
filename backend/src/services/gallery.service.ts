import { prisma } from "../db/prisma";
import type { GalleryItem } from "@shared/types";

export interface CreateGalleryItemInput {
  title: string;
  caption?: string;
  mediaType: string;
  objectKey: string;
  fileName: string;
  contentType: string;
  fileData?: Buffer | Uint8Array;
  featured?: boolean;
}

export async function getActiveGalleryItems(): Promise<GalleryItem[]> {
  try {
    return await prisma.galleryItem.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        caption: true,
        mediaType: true,
        objectKey: true,
        fileName: true,
        contentType: true,
        featured: true,
        active: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.warn("⚠️ [GalleryService] Error fetching active gallery items:", error);
    return [];
  }
}

export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  return prisma.galleryItem.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      caption: true,
      mediaType: true,
      objectKey: true,
      fileName: true,
      contentType: true,
      featured: true,
      active: true,
      createdAt: true,
    },
  });
}

export async function getGalleryItemById(id: number): Promise<GalleryItem | null> {
  return prisma.galleryItem.findUnique({
    where: { id },
  });
}

export async function createGalleryItem(data: CreateGalleryItemInput): Promise<GalleryItem> {
  return prisma.galleryItem.create({
    data: {
      title: data.title,
      caption: data.caption || "",
      mediaType: data.mediaType,
      objectKey: data.objectKey,
      fileName: data.fileName,
      contentType: data.contentType,
      fileData: data.fileData ? Buffer.from(data.fileData) : undefined,
      featured: Boolean(data.featured),
      active: true,
    },
  });
}

export async function deleteGalleryItem(id: number): Promise<void> {
  await prisma.galleryItem.delete({
    where: { id },
  });
}

export async function toggleGalleryStatus(
  id: number,
  active?: boolean,
  featured?: boolean
): Promise<GalleryItem> {
  return prisma.galleryItem.update({
    where: { id },
    data: {
      ...(typeof active === "boolean" ? { active } : {}),
      ...(typeof featured === "boolean" ? { featured } : {}),
    },
  });
}
