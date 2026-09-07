import React from "react";

interface JsonLdScriptProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * XSS-Safe JSON-LD Script Injector Component
 */
export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
