export function SiteFooter() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <a className="brand footer-brand" href="/">
            <span className="brand-mark">
              <span />
            </span>
            <span>
              <b>DEZORYN</b>
              <small>CONTRACTOR</small>
            </span>
          </a>
          <p>
            Manufacturing and bulk supply of highway safety and road-marking products for infrastructure projects.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <a href="/about">About</a>
          <a href="/products">Products</a>
          <a href="/quality">Quality</a>
        </div>
        <div>
          <h4>Products</h4>
          <a href="/products/thermoplastic-road-marking-paint">Road Marking Paint</a>
          <a href="/products/reflective-glass-beads">Glass Beads</a>
          <a href="/products/traffic-safety-products">Safety Products</a>
        </div>
        <div>
          <h4>Enquiries</h4>
          <a href="mailto:sales@dezoryn.com">sales@dezoryn.com</a>
          <span>India-wide bulk supply</span>
          <a href="/contact">Request quotation</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Dezoryn Contractor. All rights reserved.</span>
        <span>Built for safer roads.</span>
      </div>
    </footer>
  );
}
