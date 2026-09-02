import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronRight, FileText, Layers, Package, ShieldCheck } from "lucide-react";
import { getProductBySlug } from "@backend/services/products.service";
import { SiteShell, PageCta } from "@frontend/components/site-shell";

export const dynamic = "force-dynamic";

const PRODUCT_IMAGES: Record<string, string> = {
  "thermoplastic-road-marking-paint": "/images/products/thermoplastic-paint.jpg",
  "reflective-glass-beads": "/images/products/reflective-glass-beads.jpg",
  "kerb-barrier-coatings": "/images/products/kerb-barrier-coatings.jpg",
  "road-studs-delineators": "/images/products/road-studs-delineators.jpg",
  "traffic-safety-products": "/images/products/traffic-safety-products.jpg",
  "custom-manufacturing": "/images/products/custom-manufacturing.jpg",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.active) {
    notFound();
  }

  const imageSrc =
    PRODUCT_IMAGES[product.slug] || "/images/products/thermoplastic-paint.jpg";

  return (
    <SiteShell>
      {/* Product Hero Section */}
      <section className="bg-slate-950 text-white py-16 lg:py-24 border-b border-amber-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="container relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8 uppercase tracking-wider">
            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-amber-500" />
            <Link href="/products" className="hover:text-amber-500 transition-colors">Products</Link>
            <ChevronRight size={12} className="text-amber-500" />
            <span className="text-amber-500">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Product Info */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-widest mb-4">
                <ShieldCheck size={14} /> {product.kicker || "Industrial Grade Specification"}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                {product.name}
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-normal">
                {product.description}
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  href={`/contact?product=${encodeURIComponent(product.name)}`}
                  className="btn btn-primary"
                >
                  Request Commercial Quotation <ArrowRight size={16} />
                </Link>
                <a
                  href="mailto:sales@dezoryn.com?subject=Technical Data Sheet Request - "
                  className="btn btn-ghost text-xs"
                >
                  <FileText size={15} /> Request Technical Data Sheet
                </a>
              </div>
            </div>

            {/* Right: Product Image Box */}
            <div className="lg:col-span-5">
              <div className="relative h-[340px] sm:h-[400px] rounded-lg overflow-hidden border border-amber-500/30 shadow-2xl">
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Standard Industrial Consignment Packaging
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications & Advantages Section */}
      <section className="py-20 bg-[#f8fafc] text-[#0f172a] border-b border-[#e2e8f0]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Advantages */}
            <div className="lg:col-span-7">
              <div className="section-label mb-3">
                <span /> PERFORMANCE ADVANTAGES
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mb-6 font-serif">
                Engineered for High Traffic & Adverse Weather
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {product.features.map((feature) => (
                  <div
                    key={feature}
                    className="p-4 rounded-lg bg-white border border-[#e2e8f0] flex items-start gap-3 shadow-sm"
                  >
                    <CheckCircle2 size={18} className="text-[#c9a35d] shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-[#1e293b]">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Applications List */}
              <div className="mt-12">
                <div className="section-label mb-3">
                  <span /> RECOMMENDED APPLICATION ZONES
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-4 font-serif">
                  Where this product is deployed:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {product.uses.map((use, i) => (
                    <div
                      key={use}
                      className="p-3 bg-white rounded border border-[#e2e8f0] text-center shadow-sm"
                    >
                      <span className="block text-xs font-bold text-[#c9a35d] mb-1">0{i + 1}</span>
                      <span className="text-xs font-semibold text-[#334155]">{use}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="lg:col-span-5">
              <div className="p-8 rounded-lg bg-[#090d14] text-white border border-[rgba(201,163,93,0.25)] shadow-2xl">
                <div className="flex items-center gap-2 text-[#f0d796] text-xs font-bold uppercase tracking-wider mb-6">
                  <Layers size={16} /> Supply Specifications
                </div>
                <h3 className="text-xl font-bold text-white mb-6 font-serif">
                  Commercial & Packaging Parameters
                </h3>

                <div className="space-y-4">
                  {product.specs.map((spec, i) => (
                    <div
                      key={spec}
                      className="flex items-start gap-3 pb-4 border-b border-[rgba(255,255,255,0.08)] last:border-0 last:pb-0 text-sm"
                    >
                      <span className="text-[#c9a35d] font-bold text-xs mt-0.5">
                        0{i + 1}.
                      </span>
                      <span className="text-slate-300">{spec}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-3 text-xs text-[#94a3b8] mb-4">
                    <Package size={16} className="text-[#c9a35d] shrink-0" />
                    <span>Custom bulk packaging & palleted containers available upon request.</span>
                  </div>
                  <Link
                    href={`/contact?product=${encodeURIComponent(product.name)}`}
                    className="btn btn-primary w-full text-xs"
                  >
                    Request Project Quotation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production & Dispatch Protocol */}
      <section className="py-16 bg-white border-t border-[#e2e8f0] text-[#0f172a]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="section-label justify-center mb-2">
              <span /> ORDER EXECUTION
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] font-serif">
              From Requirement Review to Site Dispatch
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              ["01", "BOQ Review", "Specification alignment"],
              ["02", "Sample Approval", "Laboratory check"],
              ["03", "Batch Production", "Continuous QC logging"],
              ["04", "Test Certification", "MTC generation"],
              ["05", "Phased Dispatch", "Scheduled site arrival"],
            ].map(([num, title, desc]) => (
              <div
                key={num}
                className="p-5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-center shadow-sm"
              >
                <span className="text-[#c9a35d] font-black text-sm block mb-1">{num}</span>
                <strong className="text-[#0f172a] text-sm block">{title}</strong>
                <span className="text-xs text-[#64748b] mt-1 block">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCta />
    </SiteShell>
  );
}
