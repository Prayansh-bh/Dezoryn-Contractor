"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Mail, Menu, Phone, ShieldCheck, X } from "lucide-react";
import type { SiteSettings } from "@shared/types";

export function SiteHeader({ settings }: { settings?: SiteSettings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();

  const email = settings?.email || "sales@dezoryn.com";
  const phone = settings?.phone || "+91 98765 43210";
  const companyName = settings?.company_name || "DEZORYN";

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <a href={`mailto:${email}`}>
              <Mail size={13} className="text-amber-500" /> {email}
            </a>
            <span className="opacity-30">|</span>
            <a href={`tel:${phone.replace(/\s+/g, "")}`}>
              <Phone size={13} className="text-amber-500" /> {phone}
            </a>
          </div>
        </div>
      </header>

      <nav className="nav relative">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label={`${companyName} Contractor Home`}>
            <div className="brand-mark">
              <span className="sr-only">{companyName}</span>
            </div>
            <div className="brand-info">
              <b>{companyName.toUpperCase()}</b>
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

        {/* 2px Aztec Gold Scroll Progress Hairline */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#c9a35d] to-[#f1d99b] transition-all duration-150 ease-out pointer-events-none"
          style={{ width: `${scrollProgress}%`, opacity: scrollProgress > 1 ? 1 : 0 }}
          aria-hidden="true"
        />
      </nav>
    </>
  );
}

