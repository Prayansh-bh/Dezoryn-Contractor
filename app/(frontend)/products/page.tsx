import Link from "next/link";
import { ArrowRight, PackageX } from "lucide-react";
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
                Active Manufacturing Lines {products.length > 0 ? `(${products.length})` : ""}
              </h2>
            </div>
            <span className="text-xs font-medium text-[#64748b]">
              Bulk dispatch available pan-India via scheduled logistics.
            </span>
          </div>

          {products.length > 0 ? (
            <div className="catalog-grid">
              {products.map((product, index) => (
                <ProductCard key={product.slug} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] p-12 text-center shadow-sm max-w-2xl mx-auto my-8">
              <div className="w-14 h-14 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center mx-auto mb-4 text-[#c9a35d]">
                <PackageX size={26} />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] font-serif mb-2">
                Catalog Under Batch Revision
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed max-w-md mx-auto mb-6">
                Our manufacturing catalog is currently being updated with latest MORTH testing standards and technical batch datasheets. Contact our sales engineering team directly for custom compounding and bulk quotes.
              </p>
              <Link href="/contact" className="btn btn-primary inline-flex items-center gap-2">
                Request Specification Sheet <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <PageCta />
    </SiteShell>
  );
}

