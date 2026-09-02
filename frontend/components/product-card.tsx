import { ArrowRight, Check } from "lucide-react";
import type { Product } from "@shared/types";

export function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  return (
    <a className="catalog-card" href={`/products/${product.slug}`}>
      <div className="catalog-no">0{index + 1}</div>
      <div className="catalog-art">
        <span />
        <span />
        <span />
      </div>
      <span className="catalog-kicker">{product.kicker}</span>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <div className="catalog-link">
        View product details <ArrowRight />
      </div>
    </a>
  );
}

export function HomeProductCard({
  product,
  index,
}: {
  product: { no: string; title: string; text: string; tag: string };
  index: number;
}) {
  return (
    <article className="product-card">
      <div className="product-top">
        <span>{product.no}</span>
        <ArrowRight />
      </div>
      <div className="product-icon">
        <span />
        <span />
        <span />
      </div>
      <h3>{product.title}</h3>
      <p>{product.text}</p>
      <div className="product-tag">
        <Check size={14} />
        {product.tag}
      </div>
    </article>
  );
}
