"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Mail, MapPin, PackageCheck } from "lucide-react";
import { DEFAULT_PRODUCTS } from "@shared/constants";
import { SiteShell, PageHero } from "@frontend/components/site-shell";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const f = e.currentTarget;
    try {
      const r = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(f).entries())),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "Submission failed");
      }
      f.reset();
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Please try again.");
      setStatus("error");
    }
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="CONTACT / BULK ENQUIRY"
        title="Start a project conversation."
        text="Tell us the product, approximate quantity and delivery location. Our B2B team will review the requirement for a project-specific quotation."
      />
      <section className="inner-section contact-page">
        <div className="container contact-grid">
          <aside>
            <div className="section-label">REACH DEZORYN</div>
            <h2>Bulk orders and project enquiries.</h2>
            <div className="contact-item">
              <Mail />
              <div>
                <span>Email</span>
                <a href="mailto:sales@dezoryn.com">sales@dezoryn.com</a>
              </div>
            </div>
            <div className="contact-item">
              <MapPin />
              <div>
                <span>Supply coverage</span>
                <b>Pan-India project dispatch</b>
              </div>
            </div>
            <div className="contact-item">
              <PackageCheck />
              <div>
                <span>Commercial model</span>
                <b>B2B and bulk orders only</b>
              </div>
            </div>
          </aside>
          <form className="enquiry-form" onSubmit={submit}>
            <div className="form-row">
              <label>
                Full Name
                <input required name="name" placeholder="Your name" />
              </label>
              <label>
                Company Name
                <input required name="company" placeholder="Company / organisation" />
              </label>
            </div>
            <div className="form-row">
              <label>
                Phone Number
                <input required name="phone" inputMode="tel" placeholder="+91 98765 43210" />
              </label>
              <label>
                Email Address
                <input required type="email" name="email" placeholder="name@company.com" />
              </label>
            </div>
            <div className="form-row">
              <label>
                Product
                <select required name="product" defaultValue="">
                  <option value="" disabled>Select product</option>
                  {DEFAULT_PRODUCTS.map((p) => (
                    <option key={p.slug} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Approx. Quantity
                <input required name="quantity" placeholder="e.g. 25 MT / 5,000 units" />
              </label>
            </div>
            <label>
              Delivery Location
              <input required name="location" placeholder="City, State" />
            </label>
            <label>
              Requirement Details
              <textarea name="message" rows={5} placeholder="Specification, project timeline or any special requirement" />
            </label>
            <button className="btn btn-dark" disabled={status === "sending"}>
              {status === "sending" ? "Submitting…" : "Submit Bulk Enquiry"}
              <ArrowRight />
            </button>
            {status === "success" && (
              <p className="form-message success">Your enquiry has been received.</p>
            )}
            {status === "error" && (
              <p className="form-message error">{errorMessage}</p>
            )}
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
