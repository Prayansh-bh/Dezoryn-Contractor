import { getActiveProducts } from "@backend/services/products.service";
import { SiteShell, PageHero, PageCta } from "@frontend/components/site-shell";
import { ProductCard } from "@frontend/components/product-card";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <SiteShell>
      <PageHero
        eyebrow="PRODUCT PORTFOLIO"
        title="Highway products made for real project conditions."
        text="Explore our core manufacturing and bulk-supply portfolio. Every quotation is prepared against specification, quantity, packaging and delivery location."
      />
      <section className="inner-section">
        <div className="container catalog-grid">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} index={index} />
          ))}
        </div>
      </section>
      <PageCta />
    </SiteShell>
  );
}
