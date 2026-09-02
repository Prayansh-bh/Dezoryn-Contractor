import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import "./multi-pages.css";
import "./premium.css";

export const metadata: Metadata = {
  title: "Dezoryn Contractor | Highway Product Manufacturer",
  description:
    "Manufacturer and bulk supplier of highway safety and road-marking products for infrastructure projects across India.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
