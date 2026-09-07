import { SITE_CONFIG, absoluteUrl } from "./seo-config";
import type { Product, SiteSettings } from "@shared/types";

/**
 * Structured Data Generator for Organization / Corporation
 */
export function getOrganizationJsonLd(settings?: SiteSettings) {
  const companyName = settings?.company_name || SITE_CONFIG.name;
  const email = settings?.email || SITE_CONFIG.company.email;
  const telephone = settings?.phone || SITE_CONFIG.company.telephone;
  const addressText = settings?.address || SITE_CONFIG.company.address.streetAddress;
  const description = settings?.meta_description || SITE_CONFIG.defaultDescription;

  return {
    "@context": "https://schema.org",
    "@type": "Corporation",
    "@id": `${SITE_CONFIG.url}/#organization`,
    name: companyName,
    legalName: companyName,
    url: SITE_CONFIG.url,
    logo: absoluteUrl("/favicon.svg"),
    image: absoluteUrl(SITE_CONFIG.openGraph.defaultImage),
    description,
    telephone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: addressText,
      addressLocality: SITE_CONFIG.company.address.addressLocality,
      addressRegion: SITE_CONFIG.company.address.addressRegion,
      postalCode: SITE_CONFIG.company.address.postalCode,
      addressCountry: SITE_CONFIG.company.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_CONFIG.company.geo.latitude,
      longitude: SITE_CONFIG.company.geo.longitude,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone,
        contactType: "sales",
        email,
        availableLanguage: ["English", "Hindi"],
        areaServed: "IN",
      },
    ],
    sameAs: [],
  };
}

/**
 * Structured Data Generator for WebSite Search
 */
export function getWebSiteJsonLd(settings?: SiteSettings) {
  const companyName = settings?.company_name || SITE_CONFIG.name;
  const description = settings?.meta_description || SITE_CONFIG.defaultDescription;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: companyName,
    description,
    publisher: {
      "@id": `${SITE_CONFIG.url}/#organization`,
    },
    inLanguage: "en-IN",
  };
}

/**
 * Structured Data Generator for Highway Industrial Products
 */
export function getProductJsonLd(product: Product, settings?: SiteSettings) {
  const companyName = settings?.company_name || SITE_CONFIG.name;
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : absoluteUrl(product.imageUrl)
    : absoluteUrl(SITE_CONFIG.openGraph.defaultImage);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.description,
    image: [imageUrl],
    category: "Highway Safety Products & Industrial Road Marking Materials",
    brand: {
      "@type": "Brand",
      name: companyName,
    },
    manufacturer: {
      "@id": `${SITE_CONFIG.url}/#organization`,
      name: companyName,
    },
    url: productUrl,
    sku: `DEZ-${product.slug.toUpperCase().slice(0, 10)}`,
    mpn: `MORTH-${product.slug.toUpperCase()}`,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: "0",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": `${SITE_CONFIG.url}/#organization`,
        name: companyName,
      },
      description: "Available on BOQ, bulk consignment, and commercial project order basis.",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Standard Compliance",
        value: "MORTH Clause 803 / IRC:35 / BS 6088",
      },
      ...(product.specs || []).map((spec, i) => ({
        "@type": "PropertyValue",
        name: `Specification ${i + 1}`,
        value: spec,
      })),
    ],
  };
}

/**
 * Structured Data Generator for Navigation Breadcrumb Lists
 */
export function getBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

/**
 * Structured Data Generator for Workforce & Labour Exchange Service
 */
export function getWorkforceServiceJsonLd(settings?: SiteSettings) {
  const companyName = settings?.company_name || SITE_CONFIG.name;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_CONFIG.url}/workforce#service`,
    name: `${companyName} Workforce & Certified Road Marking Labour Exchange`,
    serviceType: "Industrial Highway Contractor Labour & Machine Operator Deployment",
    provider: {
      "@id": `${SITE_CONFIG.url}/#organization`,
      name: companyName,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    description:
      "Pan-India on-demand deployment of certified thermoplastic road marking machine operators, road stud fixing crews, and specialized highway safety labor.",
    termsOfService: `${SITE_CONFIG.url}/contact`,
  };
}
