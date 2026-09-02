import { Mail, MapPin, PackageCheck, Phone, ShieldCheck } from "lucide-react";
import { SiteShell, PageHero } from "@frontend/components/site-shell";
import { EnquiryForm } from "@frontend/components/enquiry-form";

export default function ContactPage() {
  return (
    <SiteShell>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-white border border-[#e2e8f0] flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#c9a35d] shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] block mb-1">
                  Email Enquiries
                </span>
                <a
                  href="mailto:sales@dezoryn.com"
                  className="text-base font-bold text-[#0f172a] hover:text-[#c9a35d] transition-colors"
                >
                  sales@dezoryn.com
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
                  href="tel:+919876543210"
                  className="text-base font-bold text-[#0f172a] hover:text-[#c9a35d] transition-colors"
                >
                  +91 98765 43210
                </a>
                <span className="text-xs text-[#64748b] block mt-1">
                  Mon – Sat, 9:00 AM – 7:00 PM IST
                </span>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-white border border-[#e2e8f0] flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#c9a35d] shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] block mb-1">
                  Supply Coverage
                </span>
                <strong className="text-base font-bold text-[#0f172a] block">
                  Pan-India Freight Logistics
                </strong>
                <span className="text-xs text-[#64748b] block mt-1">
                  Scheduled dispatches to all major highway corridors
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
