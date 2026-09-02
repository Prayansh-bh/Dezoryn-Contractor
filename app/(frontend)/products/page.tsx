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
        breadcrumbCurrent="Products"
        title="Industrial Highway Products Engineered for Real Project Scale."
        text="Explore our complete line of road marking compounds, retro-reflective glass beads, protective coatings, and highway safety hardware. Each product is formulated and batched for high durability under heavy vehicular traffic."
      />

      <section className="inner-section">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10 pb-6 border-b border-[#e2e8f0]">
            <div>
              <span className="text-xs font-bold text-[#c9a35d] uppercase tracking-widest block mb-1">
                Standard Supply Catalog
              </span>
              <h2 className="text-2xl font-bold text-[#0f172a] font-serif">
                Active Manufacturing Lines ({products.length})
              </h2>
            </div>
            <span className="text-xs font-medium text-[#64748b]">
              Bulk dispatch available pan-India via scheduled logistics.
            </span>
          </div>

          <div className="catalog-grid">
            {products.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <PageCta />
    </SiteShell>
  );
}
