"use client";

import { useState } from "react";
import { ArrowRight, Mail, Menu, X } from "lucide-react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <span>Manufacturing safer roads. Supplying stronger projects.</span>
          <div>
            <a href="mailto:sales@dezoryn.com">
              <Mail size={14} /> sales@dezoryn.com
            </a>
            <span className="divider" />
            <span>Bulk & project enquiries</span>
          </div>
        </div>
      </header>
      <nav className="nav">
        <div className="container nav-inner">
          <a className="brand" href="/" aria-label="Dezoryn Contractor home">
            <span className="brand-mark">
              <span />
            </span>
            <span>
              <b>DEZORYN</b>
              <small>CONTRACTOR</small>
            </span>
          </a>
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/products">Products</a>
            <a href="/gallery">Gallery</a>
            <a href="/quality">Quality</a>
            <a href="/applications">Applications</a>
            <a className="nav-cta" href="/contact">
              Request a Quote <ArrowRight size={17} />
            </a>
          </div>
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
    </>
  );
}
