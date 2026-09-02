import type { Product } from "../types";

export const DEFAULT_PRODUCTS: Omit<Product, "id" | "active" | "sortOrder">[] = [
  {
    slug: "thermoplastic-road-marking-paint",
    name: "Thermoplastic Road Marking Paint",
    kicker: "High-performance lane marking",
    description:
      "Hot-applied road marking compound developed for sharp lines, dependable adhesion and long service life under heavy traffic.",
    features: [
      "High daytime visibility",
      "Compatible with reflective glass beads",
      "Rapid setting after application",
      "Built for heavy traffic corridors",
    ],
    uses: [
      "National highways",
      "Expressways",
      "Urban lane markings",
      "Zebra crossings",
    ],
    specs: [
      "White, yellow and project shades",
      "Custom packing for bulk supply",
      "Project-specific formulation review",
      "Batch-controlled production",
    ],
  },
  {
    slug: "reflective-glass-beads",
    name: "Reflective Glass Beads",
    kicker: "Night visibility engineered in",
    description:
      "Precision-graded drop-on and intermix glass beads that return headlight illumination to drivers for safer night-time navigation.",
    features: [
      "Strong retro-reflectivity",
      "Controlled gradation",
      "Clean, consistent beads",
      "Suitable for road-marking systems",
    ],
    uses: [
      "Highway lane lines",
      "Urban road markings",
      "Airport surfaces",
      "Safety zones",
    ],
    specs: [
      "Drop-on and intermix grades",
      "Moisture-protected packaging",
      "Bulk bags available",
      "Specification-led supply",
    ],
  },
  {
    slug: "kerb-barrier-coatings",
    name: "Kerb & Barrier Coatings",
    kicker: "Protection with high visibility",
    description:
      "Durable coatings for concrete kerbs, medians and metal barriers, developed to retain visual clarity across demanding outdoor conditions.",
    features: [
      "Weather resistant",
      "Strong surface coverage",
      "Visible project colours",
      "Contractor-friendly application",
    ],
    uses: [
      "Kerb stones",
      "Concrete dividers",
      "Crash barriers",
      "Industrial roads",
    ],
    specs: [
      "Project shade matching",
      "Bulk pails and drums",
      "Surface-specific recommendation",
      "Batch consistency checks",
    ],
  },
  {
    slug: "road-studs-delineators",
    name: "Road Studs & Delineators",
    kicker: "Guidance through every condition",
    description:
      "High-impact road guidance products for curves, medians and lane boundaries where dependable visibility and clear direction matter.",
    features: [
      "High reflective response",
      "Impact-resistant construction",
      "Weather-ready materials",
      "Multiple application formats",
    ],
    uses: [
      "Sharp curves",
      "Medians",
      "Tunnels",
      "Lane separation",
    ],
    specs: [
      "Reflective and solar options",
      "Multiple reflector colours",
      "Bulk project packing",
      "Installation guidance",
    ],
  },
  {
    slug: "traffic-safety-products",
    name: "Traffic Safety Products",
    kicker: "Safer work zones at scale",
    description:
      "A coordinated range of cones, bollards, barricades and reflectors for highway projects, diversions and active construction zones.",
    features: [
      "High-visibility surfaces",
      "Reusable project-grade build",
      "Easy handling and placement",
      "Bulk quantity availability",
    ],
    uses: [
      "Work zones",
      "Traffic diversions",
      "Toll plazas",
      "Emergency management",
    ],
    specs: [
      "Cones and bollards",
      "Barricading products",
      "Reflective accessories",
      "Project bundle supply",
    ],
  },
  {
    slug: "custom-manufacturing",
    name: "Project-Specific Manufacturing",
    kicker: "Built around your BOQ",
    description:
      "Specification-led production, packaging and dispatch planning for contractors whose project requirements do not fit an off-the-shelf order.",
    features: [
      "Requirement review",
      "Custom production planning",
      "Packaging alignment",
      "Phased dispatch support",
    ],
    uses: [
      "EPC projects",
      "Government tenders",
      "Distributor programs",
      "Large private infrastructure",
    ],
    specs: [
      "BOQ-based quotation",
      "Sample approval workflow",
      "Defined batch planning",
      "Delivery scheduling",
    ],
  },
];

export const DEFAULT_SITE_SETTINGS: Record<string, string> = {
  company_name: "Dezoryn Contractor",
  email: "sales@dezoryn.com",
  phone: "+91 98765 43210",
  address: "Industrial Area, Highway Corridor, India",
  whatsapp: "+91 98765 43210",
  hero_title: "Built for the road. Engineered for scale.",
  hero_text: "Premium highway products for infrastructure projects across India.",
  meta_title: "Dezoryn Contractor | Highway Product Manufacturer",
  meta_description: "Manufacturer and bulk supplier of highway safety products across India.",
};

export const CAPABILITIES: [string, string][] = [
  ["Batch-controlled", "Manufacturing"],
  ["Project-scale", "Bulk capacity"],
  ["Pan-India", "Dispatch network"],
  ["B2B", "Dedicated support"],
];
