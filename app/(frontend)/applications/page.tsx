import {
  Building2,
  Factory,
  Map,
  Plane,
  Route,
  Warehouse,
} from "lucide-react";
import { SiteShell, PageHero, PageCta } from "@frontend/components/site-shell";

const apps = [
  [
    Route,
    "National & State Highways",
    "Road markings, visibility products and traffic-safety requirements for high-volume corridors.",
  ],
  [
    Map,
    "Expressways & Corridors",
    "Project-scale supply aligned with phased construction and commissioning schedules.",
  ],
  [
    Building2,
    "Urban Roads & Smart Cities",
    "High-visibility solutions for intersections, crossings, lanes and managed city traffic.",
  ],
  [
    Plane,
    "Airports & Transit Areas",
    "Marking and guidance products for controlled-access transport infrastructure.",
  ],
  [
    Factory,
    "Industrial Campuses",
    "Durable traffic-management products for plants, mines and large private sites.",
  ],
  [
    Warehouse,
    "Logistics & Parking",
    "Lane guidance, safety zoning and reflective products for busy vehicle environments.",
  ],
];

export default function ApplicationsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="SECTORS / APPLICATIONS"
        title="One portfolio. Multiple infrastructure environments."
        text="Our products support road visibility, lane guidance and traffic management across public and private infrastructure projects."
      />
      <section className="inner-section">
        <div className="container application-page-grid">
          {apps.map(([Icon, t, d]: any, i) => (
            <article key={t}>
              <div>
                <Icon />
                <span>0{i + 1}</span>
              </div>
              <h2>{t}</h2>
              <p>{d}</p>
              <a href="/contact">Discuss this application →</a>
            </article>
          ))}
        </div>
      </section>
      <PageCta />
    </SiteShell>
  );
}
