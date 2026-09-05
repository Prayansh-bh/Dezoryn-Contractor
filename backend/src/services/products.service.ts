import { prisma } from "../db/prisma";
import { DEFAULT_PRODUCTS } from "@shared/constants";
import type { Product, SaveProductInput } from "@shared/types";
import { deleteMediaFile } from "../storage/local-storage.service";

export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((p) => ({
    ...p,
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
    uses: Array.isArray(p.uses) ? (p.uses as string[]) : [],
    specs: Array.isArray(p.specs) ? (p.specs as string[]) : [],
  }));
}

export async function getActiveProducts(): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((p) => ({
      ...p,
      features: Array.isArray(p.features) ? (p.features as string[]) : [],
      uses: Array.isArray(p.uses) ? (p.uses as string[]) : [],
      specs: Array.isArray(p.specs) ? (p.specs as string[]) : [],
    }));
  } catch (error) {
    console.warn("⚠️ [ProductsService] Error fetching active products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const p = await prisma.product.findUnique({
      where: { slug },
    });
    if (p) {
      return {
        ...p,
        features: Array.isArray(p.features) ? (p.features as string[]) : [],
        uses: Array.isArray(p.uses) ? (p.uses as string[]) : [],
        specs: Array.isArray(p.specs) ? (p.specs as string[]) : [],
      };
    }
    return null;
  } catch (error) {
    console.warn(`⚠️ [ProductsService] Error fetching product slug ${slug}:`, error);
    return null;
  }
}

export async function saveProduct(data: SaveProductInput): Promise<Product> {
  let sortOrder = Number(data.sortOrder);

  if (data.id) {
    const updated = await prisma.product.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        name: data.name,
        kicker: data.kicker,
        description: data.description,
        features: data.features,
        uses: data.uses,
        specs: data.specs,
        active: data.active,
        sortOrder: sortOrder > 0 ? sortOrder : 1,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
      },
    });
    return {
      ...updated,
      features: Array.isArray(updated.features) ? (updated.features as string[]) : [],
      uses: Array.isArray(updated.uses) ? (updated.uses as string[]) : [],
      specs: Array.isArray(updated.specs) ? (updated.specs as string[]) : [],
    };
  }

  return await prisma.$transaction(async (tx) => {
    // Explicit PostgreSQL table lock serializes concurrent allocations to guarantee strictly distinct sortOrder
    await tx.$executeRawUnsafe(`LOCK TABLE products IN EXCLUSIVE MODE`);

    let finalSortOrder = sortOrder;
    if (!finalSortOrder || finalSortOrder <= 0) {
      const maxOrder = await tx.product.aggregate({
        _max: { sortOrder: true },
      });
      finalSortOrder = (maxOrder._max.sortOrder || 0) + 1;
    } else {
      // If a specific sortOrder was requested that already exists, allocate next available sequential order
      const existing = await tx.product.findFirst({
        where: { sortOrder: finalSortOrder },
      });
      if (existing) {
        const maxOrder = await tx.product.aggregate({
          _max: { sortOrder: true },
        });
        finalSortOrder = (maxOrder._max.sortOrder || 0) + 1;
      }
    }

    const created = await tx.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        kicker: data.kicker,
        description: data.description,
        features: data.features,
        uses: data.uses,
        specs: data.specs,
        active: data.active,
        sortOrder: finalSortOrder,
        imageUrl: data.imageUrl ?? null,
      },
    });
    return {
      ...created,
      features: Array.isArray(created.features) ? (created.features as string[]) : [],
      uses: Array.isArray(created.uses) ? (created.uses as string[]) : [],
      specs: Array.isArray(created.specs) ? (created.specs as string[]) : [],
    };
  });
}

export async function deleteProduct(id: number): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`LOCK TABLE products IN EXCLUSIVE MODE`);

    await tx.product.delete({
      where: { id },
    });

    // Resequence remaining products sequentially
    const remaining = await tx.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].sortOrder !== i + 1) {
        await tx.product.update({
          where: { id: remaining[i].id },
          data: { sortOrder: i + 1 },
        });
      }
    }
  });

  // Clean up orphaned product image on disk if unreferenced elsewhere
  if (product.imageUrl && product.imageUrl.startsWith("/uploads/products/")) {
    const stillReferenced = await prisma.product.count({
      where: { imageUrl: product.imageUrl },
    });
    if (stillReferenced === 0) {
      await deleteMediaFile(product.imageUrl).catch((err) => {
        console.warn("⚠️ [ProductsService] Failed to delete orphaned product image:", err);
      });
    }
  }
}

