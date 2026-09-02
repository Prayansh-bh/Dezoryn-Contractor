import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Product } from "@shared/types";

const PRODUCT_IMAGES: Record<string, string> = {
  "thermoplastic-road-marking-paint": "/images/products/thermoplastic-paint.jpg",
  "reflective-glass-beads": "/images/products/reflective-glass-beads.jpg",
  "kerb-barrier-coatings": "/images/products/kerb-barrier-coatings.jpg",
  "road-studs-delineators": "/images/products/road-studs-delineators.jpg",
  "traffic-safety-products": "/images/products/traffic-safety-products.jpg",
  "custom-manufacturing": "/images/products/custom-manufacturing.jpg",
};

export function ProductCard({
  product,
}: {
  product: Product;
  index?: number;
}) {
  const imageSrc =
    PRODUCT_IMAGES[product.slug] || "/images/products/thermoplastic-paint.jpg";

  return (
    <article className="product-card-modern">
      <div className="product-card-image">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="product-card-badge">{product.kicker || "Highway Grade"}</div>
      </div>

      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p>{product.description}</p>

        {product.features && product.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {product.features.slice(0, 2).map((feat) => (
              <span
                key={feat}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded"
              >
                <CheckCircle2 size={12} className="text-amber-500 shrink-0" />
                <span>{feat}</span>
              </span>
            ))}
          </div>
        )}

        <div className="product-card-footer">
          <Link
            href={`/products/${product.slug}`}
            className="product-card-link"
          >
            Technical Specs <ArrowRight size={14} />
          </Link>
          <Link
            href={`/contact?product=${encodeURIComponent(product.name)}`}
            className="text-xs font-bold text-amber-600 uppercase tracking-wider hover:underline"
          >
            Request Quote
          </Link>
        </div>
      </div>
    </article>
  );
}

export function HomeProductCard({
  product,
}: {
  product: {
    no: string;
    slug?: string;
    title: string;
    text: string;
    tag: string;
  };
  index?: number;
}) {
  const imageSlug =
    product.slug ||
    product.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const imageSrc = PRODUCT_IMAGES[imageSlug] || "/images/products/thermoplastic-paint.jpg";

  return (
    <article className="product-card-modern">
      <div className="product-card-image">
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="product-card-badge">{product.tag}</div>
      </div>

      <div className="product-card-body">
        <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
          {product.no} — Category
        </div>
        <h3>{product.title}</h3>
        <p>{product.text}</p>

        <div className="product-card-footer">
          <Link
            href={`/products/${imageSlug}`}
            className="product-card-link"
          >
            View Specifications <ArrowRight size={14} />
          </Link>
          <Link
            href={`/contact?product=${encodeURIComponent(product.title)}`}
            className="text-xs font-bold text-amber-600 uppercase tracking-wider hover:underline"
          >
            Quick Quote
          </Link>
        </div>
      </div>
    </article>
  );
}
