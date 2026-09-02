import { Award, Factory, Handshake, ShieldCheck, Truck } from "lucide-react";
import { SiteShell, PageHero, PageCta } from "@frontend/components/site-shell";

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="COMPANY / ABOUT"
        title="Engineering confidence into every kilometre."
        text="Dezoryn Contractor is a manufacturing-led highway products company serving contractors, EPC organisations, distributors and infrastructure projects across India."
      />
      <section className="inner-section">
        <div className="container story-grid">
          <div>
            <div className="section-label">OUR PURPOSE</div>
            <h2>Strong supply begins with disciplined manufacturing.</h2>
          </div>
          <div>
            <p>
              Infrastructure projects cannot pause for inconsistent material or
              uncertain dispatch. Our work starts with understanding the
              application, quantity and delivery schedule—then aligning
              production around the real project requirement.
            </p>
            <p>
              We focus on road-marking and traffic-safety products where
              visibility, durability and consistency directly influence road
              performance.
            </p>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <div className="section-label light">WHAT DEFINES US</div>
          <div className="value-grid">
            {[
              [
                Factory,
                "Manufacturing discipline",
                "Repeatable processes and controlled batches.",
              ],
              [
                ShieldCheck,
                "Quality responsibility",
                "Checks built into sourcing, production and dispatch.",
              ],
              [
                Truck,
                "Project readiness",
                "Bulk supply planned around site timelines.",
              ],
              [
                Handshake,
                "B2B partnership",
                "Clear communication from enquiry to delivery.",
              ],
              [
                Award,
                "Performance focus",
                "Products selected for demanding road conditions.",
              ],
            ].map(([Icon, t, d]: any) => (
              <article key={t}>
                <Icon />
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section">
        <div className="container split-highlight">
          <div className="big-number">INDIA</div>
          <div>
            <div className="section-label">OUR MARKET</div>
            <h2>Built for Indian infrastructure.</h2>
            <p>
              From highways and expressways to smart-city roads, airports and
              industrial campuses, our portfolio supports organisations executing
              projects at scale.
            </p>
            <a className="text-link" href="/applications">
              Explore applications →
            </a>
          </div>
        </div>
      </section>

      <PageCta />
    </SiteShell>
  );
}
