/**
 * Brand Name Formatter
 * Splits company name into main brand label and descriptor for UI layout badges.
 *
 * Example:
 * "Dezoryn Contractor" -> { main: "DEZORYN", sub: "CONTRACTOR", full: "Dezoryn Contractor" }
 * "Apex Highway Solutions" -> { main: "APEX", sub: "HIGHWAY SOLUTIONS", full: "Apex Highway Solutions" }
 * "Dezoryn" -> { main: "DEZORYN", sub: "CONTRACTOR", full: "Dezoryn" }
 */
export function formatBrandName(companyName?: string) {
  const full = (companyName || "Dezoryn Contractor").trim();
  const parts = full.split(/\s+/);

  if (parts.length === 1) {
    return {
      main: parts[0].toUpperCase(),
      sub: "CONTRACTOR",
      full,
    };
  }

  const main = parts[0].toUpperCase();
  const sub = parts.slice(1).join(" ").toUpperCase();

  return {
    main,
    sub,
    full,
  };
}
