"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, PackageCheck } from "lucide-react";
import { DEFAULT_PRODUCTS } from "@shared/constants";

export function EnquiryForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submission failed");
      }

      form.reset();
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Enquiry could not be submitted. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="container enquiry-grid">
      <div className="enquiry-copy">
        <div className="section-label">05 — PROJECT ENQUIRY</div>
        <h2>Tell us what your<br />project needs.</h2>
        <p>
          Share your product, approximate quantity and delivery location. Our B2B team will review the requirement and respond with a project-specific quotation.
        </p>
        <div className="contact-note">
          <PackageCheck />
          <div>
            <strong>Bulk orders only</strong>
            <span>Pricing is shared after requirement review.</span>
          </div>
        </div>
      </div>
      <form className="enquiry-form" onSubmit={submitEnquiry}>
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
            Product Requirement
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
          <textarea name="message" rows={4} placeholder="Specification, project timeline or any special requirement" />
        </label>
        <button className="btn btn-dark" disabled={status === "sending"}>
          {status === "sending" ? "Submitting…" : "Submit Bulk Enquiry"}
          <ArrowRight size={19} />
        </button>
        {status === "success" && (
          <p className="form-message success">Thank you. Your enquiry has been received.</p>
        )}
        {status === "error" && (
          <p className="form-message error">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
