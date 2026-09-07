import type { MetadataRoute } from "next";
import { getActiveProducts } from "@backend/services/products.service";
import { SITE_CONFIG, absoluteUrl } from "@frontend/lib/seo-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProducts().catch(() => []);
  const now = new Date();

  // Core Static Commercial & Informational Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_CONFIG.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/products"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/workforce"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/quality"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/applications"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/gallery"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Dynamic Product Pages
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
