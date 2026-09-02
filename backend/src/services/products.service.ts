import { prisma } from "../db/prisma";
import { DEFAULT_PRODUCTS } from "@shared/constants";
import type { Product, SaveProductInput } from "@shared/types";

export async function ensureInitialProducts(): Promise<void> {
  try {
    const count = await prisma.product.count();
    if (count === 0) {
      for (let i = 0; i < DEFAULT_PRODUCTS.length; i++) {
        const p = DEFAULT_PRODUCTS[i];
        await prisma.product.create({
          data: {
            slug: p.slug,
            name: p.name,
            kicker: p.kicker,
            description: p.description,
            features: p.features,
            uses: p.uses,
            specs: p.specs,
            sortOrder: i + 1,
            active: true,
          },
        });
      }
    }
  } catch (error) {
    console.warn("⚠️ [ProductsService] Could not ensure initial products:", error);
  }
}

export async function getAllProducts(): Promise<Product[]> {
  await ensureInitialProducts();
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
    await ensureInitialProducts();
    const rows = await prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length) {
      return rows.map((p) => ({
        ...p,
        features: Array.isArray(p.features) ? (p.features as string[]) : [],
        uses: Array.isArray(p.uses) ? (p.uses as string[]) : [],
        specs: Array.isArray(p.specs) ? (p.specs as string[]) : [],
      }));
    }
  } catch (error) {
    console.warn("⚠️ [ProductsService] Fallback to static product list:", error);
  }
  return DEFAULT_PRODUCTS.map((p, i) => ({ ...p, id: i + 1, active: true, sortOrder: i + 1 }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    await ensureInitialProducts();
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
  } catch (error) {
    console.warn(`⚠️ [ProductsService] Fallback for slug ${slug}:`, error);
  }
  const fallback = DEFAULT_PRODUCTS.find((p) => p.slug === slug);
  return fallback ? { ...fallback, id: 0, active: true, sortOrder: 0 } : null;
}

export async function saveProduct(data: SaveProductInput): Promise<Product> {
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
        sortOrder: data.sortOrder,
      },
    });
    return {
      ...updated,
      features: Array.isArray(updated.features) ? (updated.features as string[]) : [],
      uses: Array.isArray(updated.uses) ? (updated.uses as string[]) : [],
      specs: Array.isArray(updated.specs) ? (updated.specs as string[]) : [],
    };
  }

  const created = await prisma.product.create({
    data: {
      slug: data.slug,
      name: data.name,
      kicker: data.kicker,
      description: data.description,
      features: data.features,
      uses: data.uses,
      specs: data.specs,
      active: data.active,
      sortOrder: data.sortOrder,
    },
  });
  return {
    ...created,
    features: Array.isArray(created.features) ? (created.features as string[]) : [],
    uses: Array.isArray(created.uses) ? (created.uses as string[]) : [],
    specs: Array.isArray(created.specs) ? (created.specs as string[]) : [],
  };
}

export async function deleteProduct(id: number): Promise<void> {
  await prisma.product.delete({
    where: { id },
  });
}
