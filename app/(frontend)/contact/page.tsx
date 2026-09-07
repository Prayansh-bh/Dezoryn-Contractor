import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { SiteShell, PageHero } from "@frontend/components/site-shell";
import { EnquiryForm } from "@frontend/components/enquiry-form";
import { JsonLdScript } from "@frontend/components/json-ld-script";
import { SITE_CONFIG, absoluteUrl } from "@frontend/lib/seo-config";
import { getBreadcrumbJsonLd } from "@frontend/lib/json-ld";
import { getSettings } from "@backend/services/settings.service";

export const metadata: Metadata = {
  title: "Commercial Quotation & BOQ Sourcing Desk",
  description:
    "Request commercial BOQ quotations, batch technical data sheets (TDS), and bulk consignment dispatch schedules from Dezoryn Contractor commercial sales team.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Commercial Quotation & BOQ Sourcing Desk | ${SITE_CONFIG.name}`,
    description:
      "Direct B2B procurement line for highway contractors, EPC infrastructure firms, and government road authorities.",
    url: absoluteUrl("/contact"),
  },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const email = settings.email || "sales@dezoryn.com";
  const phone = settings.phone || "+91 98765 43210";
  const whatsapp = settings.whatsapp || phone;
  const address = settings.address || "Highway Industrial Corridor, Pan-India Dispatch Network";

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Contact & Quotations", url: "/contact" },
  ]);

  return (
    <SiteShell settings={settings}>
      <JsonLdScript data={breadcrumbJsonLd} />
      <PageHero
        eyebrow="COMMERCIAL DESK & QUOTATIONS"
        breadcrumbCurrent="Contact Us"
        title="Start a Project Sourcing Conversation."
        text="Connect with our technical supply team for material availability, batch production schedules, and dispatched delivery across India. We provide formal BOQ quotations for EPC contractors and government infrastructure vendors."
      />

      {/* Main Form Section */}
      <section className="py-20 bg-[#ffffff] text-[#0f172a] border-b border-[#e2e8f0]">
        <EnquiryForm />
      </section>

      {/* Contact Details & Logistics Strip */}
      <section className="py-16 bg-[#f8fafc] border-t border-[#e2e8f0] text-[#0f172a]">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg bg-white border border-[#e2e8f0] flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#c9a35d] shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] block mb-1">
                  Email Enquiries
                </span>
                <a
                  href={`mailto:${email}`}
                  className="text-base font-bold text-[#0f172a] hover:text-[#c9a35d] transition-colors break-all"
                >
                  {email}
                </a>
                <span className="text-xs text-[#64748b] block mt-1">
                  Direct response within 4 working hours
                </span>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-white border border-[#e2e8f0] flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#c9a35d] shrink-0">
                <Phone size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] block mb-1">
                  Direct B2B Hotline
                </span>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-base font-bold text-[#0f172a] hover:text-[#c9a35d] transition-colors"
                >
                  {phone}
                </a>
                <span className="text-xs text-[#64748b] block mt-1">
                  Mon – Sat, 9:00 AM – 7:00 PM IST
                </span>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-white border border-[#e2e8f0] flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#c9a35d] shrink-0">
                <MessageCircle size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] block mb-1">
                  WhatsApp Support
                </span>
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-bold text-[#0f172a] hover:text-[#c9a35d] transition-colors"
                >
                  {whatsapp}
                </a>
                <span className="text-xs text-[#64748b] block mt-1">
                  Instant message dispatch
                </span>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-white border border-[#e2e8f0] flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#c9a35d] shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] block mb-1">
                  Office / Factory Address
                </span>
                <strong className="text-sm font-bold text-[#0f172a] block leading-snug">
                  {address}
                </strong>
                <span className="text-xs text-[#64748b] block mt-1">
                  Pan-India Freight Logistics
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

