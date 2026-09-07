import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Factory,
  Map,
  Plane,
  Route,
  Warehouse,
} from "lucide-react";
import { SiteShell, PageHero, PageCta } from "@frontend/components/site-shell";
import { JsonLdScript } from "@frontend/components/json-ld-script";
import { SITE_CONFIG, absoluteUrl } from "@frontend/lib/seo-config";
import { getBreadcrumbJsonLd } from "@frontend/lib/json-ld";

import { getSettings } from "@backend/services/settings.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Highway Application Zones: Expressways, Toll Plazas & Runways",
  description:
    "Recommended application zones for road marking materials: National Highways, Greenfield Expressways, Smart City junctions, Airport Aprons, and Industrial Logistics Parks.",
  alternates: {
    canonical: "/applications",
  },
  openGraph: {
    title: `Highway Application Zones: Expressways, Toll Plazas & Runways | ${SITE_CONFIG.name}`,
    description:
      "Formulated for extreme road environments: high-speed multi-lane transit corridors, container yards, and heavy axle loads.",
    url: absoluteUrl("/applications"),
  },
};

export default async function ApplicationsPage() {
  const settings = await getSettings();
  const companyName = settings.company_name || "Dezoryn Contractor";

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Sectors & Applications", url: "/applications" },
  ]);

  const sectors = [
    {
      icon: Route,
      title: "National & State Highways",
      desc: "High-volume arterial corridors requiring superior daytime luminance, deep glass bead retro-reflection, and durable edge lines resistant to heavy axle tire shear.",
      products: "Thermoplastic Road Marking, Reflective Glass Beads, Road Studs",
    },
    {
      icon: Map,
      title: "Expressways & Greenfield Corridors",
      desc: "High-speed multi-lane expressways demanding long-range night guidance, impact-dampening delineators, and phased batch supply aligned with rapid paving schedules.",
      products: "Solar Road Studs, High-Index Glass Beads, Kerb Coatings",
    },
    {
      icon: Building2,
      title: "Urban Roads & Smart Cities",
      desc: "Intersections, zebra crossings, cycle paths, and bus corridors where rapid setting time is vital to minimize urban traffic interruption.",
      products: "Fast-Dry Thermoplastic, Cold Applied Coatings, Traffic Bollards",
    },
    {
      icon: Plane,
      title: "Airports & Controlled Transit Areas",
      desc: "Runway taxiways, apron markings, and terminal perimeter roads that mandate strict optical retro-reflectivity and high skid resistance.",
      products: "Specialized Airport Grade Marking, High-Purity Beads",
    },
    {
      icon: Factory,
      title: "Industrial Campuses & Mining Sites",
      desc: "Internal plant transit routes, heavy loading docks, and hazardous facility zones needing chemical-resistant coatings and heavy-duty traffic cones.",
      products: "Heavy-Duty Kerb Coatings, Safety Barricades, Speed Calibers",
    },
    {
      icon: Warehouse,
      title: "Logistics Hubs & Parking Terminals",
      desc: "High-frequency container yards, warehouse distribution centres, and multi-level parking decks requiring clear zoning lines and reflective bollards.",
      products: "Thermoplastic Line Paint, Directional Studs, Spring Bollards",
    },
  ];

  return (
    <SiteShell settings={settings}>
      <JsonLdScript data={breadcrumbJsonLd} />
      <PageHero
        eyebrow="SECTORS & APPLICATIONS"
        breadcrumbCurrent="Applications"
        title="Engineered for Demanding Traffic & Varied Highway Environments."
        text={`From 8-lane expressways to high-traffic urban junctions and airport aprons, ${companyName} highway products deliver verified durability, retro-reflectivity, and safety across public and private infrastructure projects.`}
      />

      <section className="py-20 bg-[#f8fafc] text-[#0f172a] border-b border-[#e2e8f0]">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sectors.map((sector, i) => {
              const Icon = sector.icon;
              return (
                <article
                  key={sector.title}
                  className="p-8 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#c9a35d] transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-12 rounded bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#c9a35d]">
                        <Icon size={24} />
                      </div>
                      <span className="text-xs font-black text-[#c9a35d]">0{i + 1}</span>
                    </div>

                    <h2 className="text-xl font-bold text-[#0f172a] mb-3 font-serif">{sector.title}</h2>
                    <p className="text-[#475569] text-sm leading-relaxed mb-6">{sector.desc}</p>

                    <div className="p-3 bg-[#f8fafc] rounded border border-[#e2e8f0] text-xs text-[#334155] mb-6">
                      <strong className="text-[#c9a35d] block mb-1">Recommended Portfolio:</strong>
                      {sector.products}
                    </div>
                  </div>

                  <Link
                    href={`/contact?product=${encodeURIComponent(sector.title)}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#0f172a] uppercase tracking-wider hover:text-[#c9a35d] transition-colors mt-auto pt-4 border-t border-[#f1f5f9]"
                  >
                    Discuss Sector Supply <ArrowRight size={14} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <PageCta />
    </SiteShell>
  );
}
