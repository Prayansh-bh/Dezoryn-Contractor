"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCheck2,
  ShieldCheck,
  X,
} from "lucide-react";
import type { Certificate } from "@shared/types";

interface HomeCertificatesSectionProps {
  certificates?: Certificate[];
}

const DEFAULT_FALLBACK_CERTIFICATES: Certificate[] = [
  {
    id: 1,
    title: "ISO 9001:2015 Quality Management System",
    subtitle: "Manufacturing & Supply of Thermoplastic Road Marking Materials",
    issuer: "International Organization for Standardization",
    certificateNo: "ISO-9001-IND-2024-8902",
    validUntil: "Valid Thru Dec 2027",
    imageUrl: "/images/products/thermoplastic-paint.jpg",
    active: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "MORTH Section 1014 Highway Specification",
    subtitle: "Road Marking Materials & Retro-Reflective Glass Beads Standard",
    issuer: "Ministry of Road Transport & Highways, Govt. of India",
    certificateNo: "MORTH-SEC-1014-VERIFIED",
    validUntil: "Active Project Standard",
    imageUrl: "/images/products/reflective-beads.jpg",
    active: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "NABL Laboratory Retro-Reflectance Certification",
    subtitle: "Luminance Factor & Skid Resistance Verified Laboratory Benchmarks",
    issuer: "National Accreditation Board for Testing and Calibration Laboratories",
    certificateNo: "NABL-TC-84920-LAB",
    validUntil: "Batch Tested & Certified",
    imageUrl: "/images/products/kerb-coatings.jpg",
    active: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "IRC:35-2015 Road Safety & Markings Code",
    subtitle: "Standard Specifications for Highway Delineation and Crash Safety",
    issuer: "Indian Roads Congress",
    certificateNo: "IRC-35-2015-ACC",
    validUntil: "National Code Aligned",
    imageUrl: "/images/products/road-studs.jpg",
    active: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
  },
];

/**
 * HomeCertificatesSection
 * Single Responsibility: Present the official compliance, accreditations, and quality
 * certification showcase on the Homepage with white executive architectural styling and interactive document zoom.
 */
export function HomeCertificatesSection({
  certificates = [],
}: HomeCertificatesSectionProps) {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const list = certificates.length > 0 ? certificates : DEFAULT_FALLBACK_CERTIFICATES;
  const activeList = list.filter((c) => c.active !== false);

  if (!activeList.length) return null;

  return (
    <section
      id="certificates"
      className="py-24 bg-[#ffffff] text-[#0f172a] border-b border-[#e2e8f0] relative"
    >
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-16">
          <div>
            <div className="section-label mb-3">
              <span /> 07 — COMPLIANCE & ACCREDITATIONS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight font-serif leading-tight">
              Verified Highway Quality & Safety Standards.
            </h2>
          </div>
          <p className="text-[#475569] max-w-lg text-sm sm:text-base leading-relaxed">
            Every material batch, compounding recipe, and road safety product manufactured by Dezoryn adheres to rigorous national and international quality benchmarks.
          </p>
        </div>

        {/* Certificate Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {activeList.map((cert) => (
            <article
              key={cert.id}
              className="bg-white rounded-xl border border-[#e2e8f0] hover:border-[#c9a35d] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5"
            >
              {/* Document Image Thumbnail Header */}
              <div
                className="relative h-48 bg-[#0f172a] overflow-hidden cursor-pointer"
                onClick={() => setSelectedCert(cert)}
              >
                <img
                  src={cert.imageUrl}
                  alt={cert.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-transparent to-transparent" />

                {/* Issuer Badge Over Image */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-[#0f172a] px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider shadow-sm border border-slate-200">
                    <ShieldCheck size={12} className="text-[#c9a35d]" /> {cert.issuer.split(" ")[0]}
                  </span>
                </div>

                {/* Zoom Overlay Trigger Button */}
                <div className="absolute bottom-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1 bg-[#c9a35d] text-[#0f172a] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-md group-hover:scale-105 transition-transform">
                    <Eye size={12} /> View Document
                  </span>
                </div>
              </div>

              {/* Certificate Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className="text-base font-bold text-[#0f172a] font-serif mb-1.5 group-hover:text-[#c9a35d] transition-colors cursor-pointer line-clamp-2"
                    onClick={() => setSelectedCert(cert)}
                  >
                    {cert.title}
                  </h3>

                  {cert.subtitle && (
                    <p className="text-xs text-[#64748b] leading-relaxed mb-4 line-clamp-2">
                      {cert.subtitle}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#f1f5f9] mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#64748b] font-semibold">Standard Code:</span>
                    <span className="font-mono font-bold text-[#0f172a] bg-[#f8fafc] px-2 py-0.5 rounded border border-[#e2e8f0]">
                      {cert.certificateNo || "VERIFIED"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#64748b] font-semibold">Status:</span>
                    <span className="font-semibold text-[#059669] flex items-center gap-1">
                      <CheckCircle2 size={12} /> {cert.validUntil || "Active Standard"}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Trust Seal Strip */}
        <div className="p-6 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fdfaf3] border border-[#c9a35d]/40 flex items-center justify-center text-[#c9a35d] shrink-0">
              <Award size={20} />
            </div>
            <div>
              <strong className="text-sm text-[#0f172a] block">
                Official Third-Party Laboratory Test Certificates Available for All Batches
              </strong>
              <small className="text-xs text-[#64748b]">
                Contact our engineering desk for customized NABL luminance factor and retro-reflectometer inspection reports.
              </small>
            </div>
          </div>

          <a
            href="#quote"
            className="btn btn-secondary text-xs font-bold whitespace-nowrap"
          >
            Request Batch Test Reports →
          </a>
        </div>
      </div>

      {/* Interactive High-Resolution Document Lightbox Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedCert(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#c9a35d] block">
                  OFFICIAL ACCREDITATION CERTIFICATE
                </span>
                <h3 className="text-lg font-bold text-[#0f172a] font-serif">
                  {selectedCert.title}
                </h3>
                <small className="text-xs text-[#64748b]">
                  Issued by {selectedCert.issuer} • {selectedCert.certificateNo || "Standard Certified"}
                </small>
              </div>

              <button
                type="button"
                className="w-8 h-8 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:border-[#c9a35d] transition-colors"
                onClick={() => setSelectedCert(null)}
                aria-label="Close certificate lightbox"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-6 overflow-y-auto flex items-center justify-center bg-[#06090d]">
              <img
                src={selectedCert.imageUrl}
                alt={selectedCert.title}
                className="max-h-[60vh] w-auto object-contain rounded border border-white/10 shadow-lg"
              />
            </div>

            {/* Modal Foot */}
            <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-xs text-[#64748b] font-medium">
                {selectedCert.validUntil || "Active Project Standard"}
              </span>
              <button
                type="button"
                className="btn btn-primary text-xs py-2 px-4"
                onClick={() => setSelectedCert(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
