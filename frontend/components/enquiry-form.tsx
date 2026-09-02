"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, PackageCheck, ShieldAlert } from "lucide-react";
import { DEFAULT_PRODUCTS } from "@shared/constants";

function EnquiryFormInner() {
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const pParam = searchParams.get("product");
    if (pParam) {
      setSelectedProduct(pParam);
    }
  }, [searchParams]);

  const quickQuantities = ["10 MT", "25 MT", "50 MT", "100+ MT", "5,000 Units"];

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
        throw new Error(data.error || "Enquiry submission failed");
      }

      form.reset();
      setQuantity("");
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Enquiry could not be submitted. Please verify details and try again.");
      setStatus("error");
    }
  }

  return (
    <div className="container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Col: Copy & Assurance */}
        <div className="lg:col-span-5 text-[#0f172a]">
          <div className="section-label mb-3">
            <span /> 05 — COMMERCIAL DESK
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0f172a] leading-tight mb-6 font-serif">
            Request Project BOQ Quotation
          </h2>
          <p className="text-[#475569] text-base md:text-lg leading-relaxed mb-8">
            Provide your product requirements, estimated volume, and delivery destination. Our technical sales engineers will review the BOQ and prepare a project-specific supply proposal.
          </p>

          <div className="space-y-4 border-t border-[#e2e8f0] pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center shrink-0">
                <PackageCheck size={20} className="text-[#c9a35d]" />
              </div>
              <div>
                <strong className="block text-sm text-[#0f172a]">Bulk B2B Supply Model</strong>
                <span className="text-xs text-[#64748b]">Competitive rate structures for EPCs & infrastructure contractors</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-[#c9a35d]" />
              </div>
              <div>
                <strong className="block text-sm text-[#0f172a]">MORTH Specification Verification</strong>
                <span className="text-xs text-[#64748b]">Batch test certificates provided with every consignment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Form Card */}
        <div className="lg:col-span-7">
          <div className="enquiry-form-card">
            {status === "success" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#f8fafc] text-[#c9a35d] border border-[#e2e8f0] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-[#0f172a] mb-2 font-serif">Quotation Request Received</h3>
                <p className="text-[#475569] max-w-md mx-auto mb-6 text-sm leading-relaxed">
                  Thank you. Our highway technical desk is reviewing your requirements and will reach out with a detailed BOQ quote shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="btn btn-secondary text-xs"
                >
                  Submit Another Requirement
                </button>
              </div>
            ) : (
              <form onSubmit={submitEnquiry}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="enq-name">Full Name *</label>
                    <input
                      id="enq-name"
                      required
                      name="name"
                      placeholder="e.g. Rajesh Kumar"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="enq-company">Company / Contractor Name *</label>
                    <input
                      id="enq-company"
                      required
                      name="company"
                      placeholder="e.g. Apex Infra Projects"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="enq-phone">Contact Phone *</label>
                    <input
                      id="enq-phone"
                      required
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="enq-email">Business Email *</label>
                    <input
                      id="enq-email"
                      required
                      type="email"
                      name="email"
                      placeholder="rajesh@apexinfra.com"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="enq-product">Product Requirement *</label>
                    <select
                      id="enq-product"
                      required
                      name="product"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select Product Category</option>
                      {DEFAULT_PRODUCTS.map((prod) => (
                        <option key={prod.slug} value={prod.name}>
                          {prod.name}
                        </option>
                      ))}
                      <option value="Custom Compounding">Custom Material Specification</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="enq-quantity">Estimated Quantity *</label>
                    <input
                      id="enq-quantity"
                      required
                      name="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 50 MT / 5,000 units"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Quick Quantity Chips */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-xs text-[#64748b] font-semibold uppercase">Quick volume:</span>
                  {quickQuantities.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className="text-xs font-semibold px-2.5 py-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] hover:text-[#b88a3d] rounded border border-[#cbd5e1] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label htmlFor="enq-location">Project Delivery Destination (City, State) *</label>
                  <input
                    id="enq-location"
                    required
                    name="location"
                    placeholder="e.g. Vadodara-Mumbai Expressway Section, Gujarat"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="enq-message">Technical Specifications / Notes</label>
                  <textarea
                    id="enq-message"
                    name="message"
                    rows={3}
                    placeholder="Provide any specific standard (MORTH / IRC), target delivery date, or packing requirements."
                    className="form-textarea"
                  />
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 mb-4">
                    <ShieldAlert size={18} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn btn-primary w-full text-sm"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting Request…
                    </>
                  ) : (
                    <>
                      Submit Bulk Quotation Request <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnquiryForm() {
  return (
    <Suspense fallback={<div className="container text-center py-12 text-slate-400">Loading form…</div>}>
      <EnquiryFormInner />
    </Suspense>
  );
}
