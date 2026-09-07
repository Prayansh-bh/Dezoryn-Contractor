/**
 * Enterprise SEO & Discoverability Configuration for Dezoryn Contractor
 * Strictly complies with Google Search Essentials & Schema.org guidelines.
 */

export const SITE_CONFIG = {
  name: "Dezoryn Contractor",
  legalName: "Dezoryn Contractor Private Limited",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.dezoryn.com",
  defaultTitle: "Dezoryn Contractor | MORTH 803 Thermoplastic Paint & Highway Safety Products Manufacturer",
  titleTemplate: "%s | Dezoryn Contractor",
  defaultDescription:
    "Leading manufacturer and bulk supplier of high-performance thermoplastic road marking paint (MORTH 803 / IRC:35), retro-reflective glass beads, solar road studs, kerb barrier coatings, and certified highway safety workforce across India.",
  defaultKeywords: [
    // Core Highway Marking Products
    "thermoplastic road marking paint",
    "MORTH 803 road paint manufacturer",
    "hot applied thermoplastic road marking material",
    "reflective road marking paint India",
    "IRC 35 compliant road marking paint",
    "white and yellow thermoplastic paint",
    
    // Glass Beads & Optical Elements
    "retro-reflective glass beads manufacturer",
    "BS 6088 Class A glass beads",
    "AASHTO M247 drop-on glass beads",
    "intermix glass beads for road paint",
    
    // Highway Safety & Delineation
    "solar road studs manufacturer",
    "cat eyes road markers India",
    "highway delineators and hazard markers",
    "kerb barrier protective coatings",
    "water-based acrylic kerb paint",
    
    // B2B Procurement & Workforce
    "highway road safety contractor India",
    "bulk road marking paint supplier",
    "certified road marking machine operators",
    "highway applicator workforce exchange",
    "EPC contractor road safety materials",
    "NHAI approved road marking products",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Dezoryn Contractor",
    defaultImage: "/images/products/thermoplastic-paint.jpg",
    defaultImageAlt: "Dezoryn Industrial Highway Road Marking Material Manufacturing Facility",
  },
  twitter: {
    handle: "@dezoryn",
    site: "@dezoryn",
    cardType: "summary_large_image",
  },
  company: {
    telephone: "+91 98765 43210",
    email: "sales@dezoryn.com",
    address: {
      streetAddress: "Industrial Area, Highway Corridor",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      postalCode: "110001",
      addressCountry: "IN",
    },
    geo: {
      latitude: "28.6139",
      longitude: "77.2090",
    },
  },
} as const;

export function absoluteUrl(path: string): string {
  const base = SITE_CONFIG.url.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
