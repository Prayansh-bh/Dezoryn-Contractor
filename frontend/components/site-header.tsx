"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Mail, Menu, Phone, ShieldCheck, X } from "lucide-react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Products", href: "/products" },
    { label: "Quality", href: "/quality" },
    { label: "Applications", href: "/applications" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-amber-500" />
            <span>ISO COMPLIANT • PAN-INDIA PROJECT DISPATCH • EPC BULK SUPPLY</span>
          </div>
          <div className="topbar-links">
            <a href="mailto:sales@dezoryn.com">
              <Mail size={13} className="text-amber-500" /> sales@dezoryn.com
            </a>
            <span className="opacity-30">|</span>
            <a href="tel:+919876543210">
              <Phone size={13} className="text-amber-500" /> +91 98765 43210
            </a>
          </div>
        </div>
      </header>

      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Dezoryn Contractor Home">
            <div className="brand-mark">
              <span className="sr-only">Dezoryn</span>
            </div>
            <div className="brand-info">
              <b>DEZORYN</b>
              <small>CONTRACTOR</small>
            </div>
          </Link>

          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={isActive ? "active" : ""}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/contact"
              className="nav-cta"
              onClick={() => setMenuOpen(false)}
            >
              Request a Quote <ArrowRight size={15} />
            </Link>
          </div>

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
    </>
  );
}
