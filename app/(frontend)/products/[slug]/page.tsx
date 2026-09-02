import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { getProductBySlug } from "@backend/services/products.service";
import { SiteShell, PageCta } from "@frontend/components/site-shell";

export const dynamic = "force-dynamic";

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

  return (
    <SiteShell>
      <section className="product-hero">
        <div className="container product-hero-grid">
          <div>
            <div className="section-label">HIGHWAY PRODUCT</div>
            <span className="product-kicker">{product.kicker}</span>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <a className="btn btn-primary" href="/contact">
              Request product quotation <ArrowRight />
            </a>
          </div>
          <div className="product-monument">
            <span />
            <span />
            <span />
            <b>DEZORYN</b>
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="container detail-grid">
          <div>
            <div className="section-label">PRODUCT ADVANTAGES</div>
            <h2>Performance where the road demands it.</h2>
            <div className="feature-list">
              {product.features.map((x) => (
                <div key={x}>
                  <Check /> {x}
                </div>
              ))}
            </div>
          </div>
          <div className="detail-panel">
            <h3>Supply specifications</h3>
            {product.specs.map((x, i) => (
              <div key={x}>
                <span>0{i + 1}</span>
                {x}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="uses">
        <div className="container">
          <div className="section-label light">TYPICAL APPLICATIONS</div>
          <h2>Designed for project deployment.</h2>
          <div className="uses-grid">
            {product.uses.map((x, i) => (
              <div key={x}>
                <span>0{i + 1}</span>
                <h3>{x}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section process">
        <div className="container">
          <div className="section-label">HOW WE SUPPLY</div>
          <h2>From requirement to dispatch.</h2>
          <div className="process-grid">
            {[
              ["01", "Requirement review"],
              ["02", "Specification confirmation"],
              ["03", "Production planning"],
              ["04", "Quality verification"],
              ["05", "Bulk dispatch"],
            ].map(([n, t]) => (
              <div key={n}>
                <b>{n}</b>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCta />
    </SiteShell>
  );
}
