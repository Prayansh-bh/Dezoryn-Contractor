import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-content">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="section-label">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}

export function PageCta() {
  return (
    <section className="page-cta">
      <div className="container cta-grid">
        <div>
          <div className="section-label light">PROJECT SUPPLY</div>
          <h2>Ready to review your highway requirements?</h2>
          <p>
            Connect with our technical supply team for material availability, batch planning and dispatched delivery.
          </p>
        </div>
        <div className="cta-actions">
          <a className="btn btn-light" href="/contact">
            Request Quotation <ArrowRight size={18} />
          </a>
          <a className="btn btn-ghost" href="/products">
            Browse All Products
          </a>
        </div>
      </div>
    </section>
  );
}
