import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { ReactNode } from "react";
import { SmoothScrollProvider } from "@frontend/components/smooth-scroll-provider";
import { JsonLdScript } from "@frontend/components/json-ld-script";
import { SITE_CONFIG, absoluteUrl } from "@frontend/lib/seo-config";
import { getOrganizationJsonLd, getWebSiteJsonLd } from "@frontend/lib/json-ld";
import { getSettings } from "@backend/services/settings.service";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const companyName = settings.company_name || SITE_CONFIG.name;
  const title = settings.meta_title || SITE_CONFIG.defaultTitle;
  const description = settings.meta_description || SITE_CONFIG.defaultDescription;
  const ogImageUrl = absoluteUrl(SITE_CONFIG.openGraph.defaultImage);

  return {
    metadataBase: new URL(SITE_CONFIG.url),
    title: {
      default: title,
      template: `%s | ${companyName}`,
    },
    description,
    keywords: Array.from(SITE_CONFIG.defaultKeywords),
    authors: [{ name: companyName, url: SITE_CONFIG.url }],
    creator: companyName,
    publisher: companyName,
    formatDetection: {
      email: true,
      address: true,
      telephone: true,
    },
    alternates: {
      canonical: "./",
    },
    openGraph: {
      title,
      description,
      url: SITE_CONFIG.url,
      siteName: companyName,
      locale: SITE_CONFIG.openGraph.locale,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${companyName} - Highway Infrastructure & Road Safety Solutions`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SITE_CONFIG.twitter.site,
      creator: SITE_CONFIG.twitter.handle,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/favicon.svg" }],
    },
    manifest: "/site.webmanifest",
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSettings();
  const orgJsonLd = getOrganizationJsonLd(settings);
  const webSiteJsonLd = getWebSiteJsonLd(settings);

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        <JsonLdScript data={[orgJsonLd, webSiteJsonLd]} />
      </head>
      <body
        className="antialiased min-h-screen selection:bg-amber-500 selection:text-black"
        suppressHydrationWarning
      >
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}



