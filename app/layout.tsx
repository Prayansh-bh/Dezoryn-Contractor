import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { ReactNode } from "react";
import { SmoothScrollProvider } from "@frontend/components/smooth-scroll-provider";
import "./globals.css";
import "./multi-pages.css";
import "./premium.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

import { getSettings } from "@backend/services/settings.service";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title =
    settings.meta_title ||
    "Dezoryn Contractor | Industrial Highway Product Manufacturer & Bulk Supply";
  const description =
    settings.meta_description ||
    "Leading manufacturer and bulk supplier of high-performance thermoplastic road marking paint, reflective glass beads, kerb coatings, road studs, and highway safety products across India.";

  return {
    title,
    description,
    keywords: [
      "road marking paint manufacturer",
      "thermoplastic road paint India",
      "reflective glass beads",
      "highway safety products bulk",
      "kerb barrier coatings",
      "solar road studs",
      "EPC contractor road supply",
    ],
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}


export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body
        className="antialiased min-h-screen selection:bg-amber-500 selection:text-black"
        suppressHydrationWarning
      >
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}


