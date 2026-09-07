"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronRight, Mail, Menu, Phone, ShieldCheck, X } from "lucide-react";
import type { SiteSettings } from "@shared/types";

export function SiteHeader({ settings }: { settings?: SiteSettings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const email = settings?.email || "sales@dezoryn.com";
  const phone = settings?.phone || "+91 98765 43210";
  const companyName = settings?.company_name || "DEZORYN";

  useEffect(() => {
    let ticking = false;

    const updateProgressBar = () => {
      const el = progressBarRef.current;
      if (!el) return;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / totalScroll)) : 0;
      el.style.transform = `scaleX(${progress})`;
      el.style.opacity = progress > 0.005 ? "1" : "0";
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgressBar);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgressBar();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change or escape key
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Products", href: "/products" },
    { label: "Quality", href: "/quality" },
    { label: "Applications", href: "/applications" },
    { label: "Workforce", href: "/workforce" },
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
                  <span>{link.label}</span>
                  {menuOpen && <ChevronRight size={14} className="text-[#c9a35d] md:hidden" />}
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
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* 2px Aztec Gold Scroll Progress Hairline */}
        <div
          ref={progressBarRef}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c9a35d] to-[#f1d99b] origin-left transition-opacity duration-200 ease-out pointer-events-none"
          style={{ transform: "scaleX(0)", opacity: 0, willChange: "transform" }}
          aria-hidden="true"
        />
      </nav>

      {/* Backdrop overlay for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

