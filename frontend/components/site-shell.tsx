import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { getSettings } from "@backend/services/settings.service";
import type { SiteSettings } from "@shared/types";

export async function SiteShell({
  children,
  settings: propSettings,
}: {
  children: ReactNode;
  settings?: SiteSettings;
}) {
  const settings = propSettings || (await getSettings());

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader settings={settings} />
      <main className="flex-grow">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}


export function PageHero({
  eyebrow,
  title,
  text,
  breadcrumbCurrent,
}: {
  eyebrow: string;
  title: string;
  text: string;
  breadcrumbCurrent?: string;
}) {
  return (
    <section className="page-hero">
      <div className="page-hero-grid" />
      <div className="container relative z-10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-amber-500" />
          <span className="text-amber-500">{breadcrumbCurrent || eyebrow}</span>
        </div>

        <div className="section-label">
          <span /> {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}

export function PageCta() {
  return (
    <section className="page-cta">
      <div className="container">
        <div className="cta-grid">
          <div>
            <div className="section-label">
              <span /> B2B PROJECT INQUIRY
            </div>
            <h2>Ready to source highway products for your project?</h2>
            <p>
              Connect with our technical supply team for material availability, batch production schedules, and dispatched delivery across India.
            </p>
          </div>
          <div className="cta-actions">
            <Link href="/contact" className="btn btn-primary">
              Request Project Quotation <ArrowRight size={16} />
            </Link>
            <Link href="/products" className="btn btn-ghost">
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
