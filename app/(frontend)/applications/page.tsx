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

export default function ApplicationsPage() {
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
    <SiteShell>
      <PageHero
        eyebrow="SECTORS & APPLICATIONS"
        breadcrumbCurrent="Applications"
        title="Engineered for Demanding Traffic & Varied Highway Environments."
        text="From 8-lane expressways to high-traffic urban junctions and airport aprons, our highway products deliver verified durability, retro-reflectivity, and safety across public and private infrastructure projects."
      />

      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sectors.map((sector, i) => {
              const Icon = sector.icon;
              return (
                <article
                  key={sector.title}
                  className="p-8 rounded-lg bg-white border border-slate-200 hover:border-amber-500 transition-colors shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-12 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <Icon size={24} />
                      </div>
                      <span className="text-xs font-black text-slate-400">0{i + 1}</span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-3">{sector.title}</h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">{sector.desc}</p>

                    <div className="p-3 bg-slate-50 rounded border border-slate-100 text-xs text-slate-700 mb-6">
                      <strong className="text-amber-700 block mb-1">Recommended Portfolio:</strong>
                      {sector.products}
                    </div>
                  </div>

                  <Link
                    href={`/contact?product=${encodeURIComponent(sector.title)}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider hover:text-amber-600 transition-colors mt-auto pt-4 border-t border-slate-100"
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
