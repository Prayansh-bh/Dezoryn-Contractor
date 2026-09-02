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
      <section className="py-20 bg-[#090d14] text-white">
        <EnquiryForm />
      </section>

      {/* Contact Details & Logistics Strip */}
      <section className="py-16 bg-[#06090d] border-t border-[rgba(201,163,93,0.22)] text-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-[#0e141f] border border-[rgba(201,163,93,0.18)] flex items-start gap-4 shadow-lg">
              <div className="w-12 h-12 rounded bg-[#070a0f] border border-[rgba(201,163,93,0.25)] flex items-center justify-center text-[#c9a35d] shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                  Email Enquiries
                </span>
                <a
                  href="mailto:sales@dezoryn.com"
                  className="text-base font-bold text-white hover:text-[#f0d796] transition-colors"
                >
                  sales@dezoryn.com
                </a>
                <span className="text-xs text-[#94a3b8] block mt-1">
                  Direct response within 4 working hours
                </span>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[#0e141f] border border-[rgba(201,163,93,0.18)] flex items-start gap-4 shadow-lg">
              <div className="w-12 h-12 rounded bg-[#070a0f] border border-[rgba(201,163,93,0.25)] flex items-center justify-center text-[#c9a35d] shrink-0">
                <Phone size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                  Direct B2B Hotline
                </span>
                <a
                  href="tel:+919876543210"
                  className="text-base font-bold text-white hover:text-[#f0d796] transition-colors"
                >
                  +91 98765 43210
                </a>
                <span className="text-xs text-[#94a3b8] block mt-1">
                  Mon – Sat, 9:00 AM – 7:00 PM IST
                </span>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[#0e141f] border border-[rgba(201,163,93,0.18)] flex items-start gap-4 shadow-lg">
              <div className="w-12 h-12 rounded bg-[#070a0f] border border-[rgba(201,163,93,0.25)] flex items-center justify-center text-[#c9a35d] shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                  Supply Coverage
                </span>
                <strong className="text-base font-bold text-white block">
                  Pan-India Freight Logistics
                </strong>
                <span className="text-xs text-[#94a3b8] block mt-1">
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
