"use client";

import React, { useRef, useState, useCallback } from "react";
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

/**
 * Custom lightweight 3D specular card tilt hook
 */
function useCardTilt() {
  const cardRef = useRef<HTMLElement>(null);
  const [transform, setTransform] = useState<string>("");
  const [sheenStyle, setSheenStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-4deg to +4deg)
    const rotateX = ((y - centerY) / centerY) * -3.5;
    const rotateY = ((x - centerX) / centerX) * 3.5;

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`
    );

    // Specular light sheen tracking cursor
    setSheenStyle({
      opacity: 0.12,
      background: `radial-gradient(circle 240px at ${x}px ${y}px, rgba(201, 163, 93, 0.4), transparent 80%)`,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)");
    setSheenStyle({ opacity: 0, transition: "opacity 0.4s ease" });
  }, []);

  return { cardRef, transform, sheenStyle, handleMouseMove, handleMouseLeave };
}

export function ProductCard({
  product,
}: {
  product: Product;
  index?: number;
}) {
  const imageSrc =
    product.imageUrl ||
    PRODUCT_IMAGES[product.slug] ||
    "/images/products/product-placeholder.jpg";
  const isUploadedImage = imageSrc.startsWith("/uploads/");
  const { cardRef, transform, sheenStyle, handleMouseMove, handleMouseLeave } =
    useCardTilt();

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="product-card-modern relative transition-all duration-300 ease-out will-change-transform"
      style={{ transform: transform || undefined }}
    >
      {/* Dynamic Specular Sheen Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-lg overflow-hidden transition-opacity"
        style={sheenStyle}
        aria-hidden="true"
      />

      <div className="product-card-image">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          unoptimized={isUploadedImage}
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
                className="inline-flex items-center gap-1.5 text-xs text-[#334155] bg-[#f1f5f9] border border-[#e2e8f0] px-2.5 py-1 rounded"
              >
                <CheckCircle2 size={12} className="text-[#c9a35d] shrink-0" />
                <span>{feat}</span>
              </span>
            ))}
          </div>
        )}

        <div className="product-card-footer">
          <Link
            href={`/products/${product.slug}`}
            className="product-card-link group/link"
          >
            <span>Technical Specs</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover/link:translate-x-1"
            />
          </Link>
          <Link
            href={`/contact?product=${encodeURIComponent(product.name)}`}
            className="text-xs font-bold text-[#c9a35d] uppercase tracking-wider hover:text-[#b88a3d] hover:underline"
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
  index = 0,
}: {
  product: {
    no: string;
    slug?: string;
    imageUrl?: string | null;
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
  const imageSrc =
    product.imageUrl ||
    PRODUCT_IMAGES[imageSlug] ||
    "/images/products/product-placeholder.jpg";
  const isUploadedImage = imageSrc.startsWith("/uploads/");
  const { cardRef, transform, sheenStyle, handleMouseMove, handleMouseLeave } =
    useCardTilt();

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="product-card-modern relative transition-all duration-300 ease-out will-change-transform"
      style={{
        transform: transform || undefined,
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Dynamic Specular Sheen Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-lg overflow-hidden transition-opacity"
        style={sheenStyle}
        aria-hidden="true"
      />

      <div className="product-card-image">
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          unoptimized={isUploadedImage}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="product-card-badge">{product.tag}</div>
      </div>

      <div className="product-card-body">
        <div className="text-xs font-bold text-[#c9a35d] uppercase tracking-wider mb-2">
          {product.no} — Category
        </div>
        <h3>{product.title}</h3>
        <p>{product.text}</p>

        <div className="product-card-footer">
          <Link
            href={`/products/${imageSlug}`}
            className="product-card-link group/link"
          >
            <span>View Specifications</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover/link:translate-x-1"
            />
          </Link>
          <Link
            href={`/contact?product=${encodeURIComponent(product.title)}`}
            className="text-xs font-bold text-[#c9a35d] uppercase tracking-wider hover:text-[#b88a3d] hover:underline"
          >
            Quick Quote
          </Link>
        </div>
      </div>
    </article>
  );
}

