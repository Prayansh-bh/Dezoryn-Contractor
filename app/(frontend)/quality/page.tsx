import {
  CheckCircle2,
  ClipboardCheck,
  Factory,
  PackageCheck,
  Search,
} from "lucide-react";
import { SiteShell, PageHero, PageCta } from "@frontend/components/site-shell";

export default function QualityPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="MANUFACTURING / QUALITY"
        title="Consistency designed into the process."
        text="Quality is managed across material selection, production controls, batch review, packaging and pre-dispatch verification."
      />
      <section className="inner-section">
        <div className="container quality-steps">
          {[
            [
              Search,
              "01",
              "Incoming material review",
              "Selected inputs are checked against defined purchase and production requirements.",
            ],
            [
              Factory,
              "02",
              "Controlled manufacturing",
              "Production parameters and batch discipline support consistent output.",
            ],
            [
              ClipboardCheck,
              "03",
              "Batch verification",
              "Relevant product and order checks are completed before packing.",
            ],
            [
              PackageCheck,
              "04",
              "Packing control",
              "Quantity, labels and packaging format are verified against the order.",
            ],
            [
              CheckCircle2,
              "05",
              "Dispatch release",
              "The final order review confirms delivery details before movement.",
            ],
          ].map(([Icon, n, t, d]: any) => (
            <article key={n}>
              <div>
                <Icon />
                <span>{n}</span>
              </div>
              <h2>{t}</h2>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="quality-statement">
        <div className="container">
          <span>OUR QUALITY PRINCIPLE</span>
          <blockquote>
            “Deliver the specification agreed, in the quantity committed, with the consistency a large project expects.”
          </blockquote>
        </div>
      </section>
      <PageCta />
    </SiteShell>
  );
}
