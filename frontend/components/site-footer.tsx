import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@shared/types";
import { formatBrandName } from "@frontend/lib/brand";

export function SiteFooter({ settings }: { settings?: SiteSettings }) {
  const email = settings?.email || "sales@dezoryn.com";
  const phone = settings?.phone || "+91 98765 43210";
  const whatsapp = settings?.whatsapp || "";
  const address =
    settings?.address ||
    "Highway Industrial Corridor, Pan-India Dispatch Network";
  const brand = formatBrandName(settings?.company_name);

  const cleanWaNumber = whatsapp.replace(/[^0-9]/g, "");

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Identity */}
          <div className="footer-col">
            <Link href="/" className="brand mb-4 inline-flex" aria-label={`${brand.full} Home`}>
              <div className="brand-mark">
                <span className="sr-only">{brand.full}</span>
              </div>
              <div className="brand-info">
                <b>{brand.main}</b>
                <small>{brand.sub}</small>
              </div>
            </Link>
            <p className="text-[#64748b] text-sm leading-relaxed mt-4 max-w-sm">
              {brand.full} is a dedicated manufacturer and bulk supplier of high-performance thermoplastic road marking paint, reflective glass beads, kerb coatings, and highway safety systems across India.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-[#c9a35d] font-semibold uppercase tracking-wider">
              <ShieldCheck size={16} /> Batch-Controlled Quality Sourcing
            </div>
          </div>

          {/* Col 2: Products */}
          <div className="footer-col">
            <h4>Highway Products</h4>
            <div className="footer-links">
              <Link href="/products/thermoplastic-road-marking-paint">Road Marking Paint</Link>
              <Link href="/products/reflective-glass-beads">Reflective Glass Beads</Link>
              <Link href="/products/kerb-barrier-coatings">Kerb & Barrier Coatings</Link>
              <Link href="/products/road-studs-delineators">Road Studs & Delineators</Link>
              <Link href="/products/traffic-safety-products">Traffic Safety Products</Link>
              <Link href="/products/custom-manufacturing">Project Manufacturing</Link>
            </div>
          </div>

          {/* Col 3: Sectors */}
          <div className="footer-col">
            <h4>Applications & Workforce</h4>
            <div className="footer-links">
              <Link href="/workforce">Workforce & Labour Exchange</Link>
              <Link href="/applications">National & State Highways</Link>
              <Link href="/applications">Expressways & Corridors</Link>
              <Link href="/applications">Urban Roads & Smart Cities</Link>
              <Link href="/quality">Quality Assurance Protocol</Link>
              <Link href="/gallery">Project Media Gallery</Link>
            </div>
          </div>


          {/* Col 4: Contact */}
          <div className="footer-col">
            <h4>B2B Project Desk</h4>
            <div className="footer-links">
              <a href={`mailto:${email}`} className="flex items-center gap-2">
                <Mail size={14} className="text-[#c9a35d]" /> {email}
              </a>
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-2">
                <Phone size={14} className="text-[#c9a35d]" /> {phone}
              </a>
              {cleanWaNumber && (
                <a
                  href={`https://wa.me/${cleanWaNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <MessageCircle size={14} className="text-emerald-500" /> WhatsApp Direct ({whatsapp})
                </a>
              )}
              <div className="flex items-start gap-2 text-sm text-[#64748b]">
                <MapPin size={16} className="text-[#c9a35d] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <Link href="/contact" className="mt-2 inline-flex items-center gap-1.5 text-[#c9a35d] font-bold text-xs uppercase tracking-wider hover:underline">
                Request Project BOQ Quote <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {brand.full}. All rights reserved.</span>
          <span className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-center">
            <span>MORTH & IRC Specification Aligned</span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span>Engineered for Indian Roads</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

