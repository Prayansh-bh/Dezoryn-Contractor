"use client";

import React, { useEffect, useRef, useState } from "react";

interface MetricOdometerProps {
  value: string;
  label: string;
  index: number;
}

function parseMetricValue(raw: string): { num: number; prefix: string; suffix: string } {
  // e.g. "500+ MT" -> num: 500, prefix: "", suffix: "+ MT"
  // e.g. "100%" -> num: 100, prefix: "", suffix: "%"
  // e.g. "15+" -> num: 15, prefix: "", suffix: "+"
  // e.g. "Pan-India" -> non-numeric
  const match = raw.match(/^([^\d]*)(\d+)(.*)$/);
  if (!match) {
    return { num: 0, prefix: "", suffix: raw };
  }
  return {
    prefix: match[1],
    num: parseInt(match[2], 10),
    suffix: match[3],
  };
}

export function MetricOdometer({ value, label, index }: MetricOdometerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState<string>(value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const parsed = parseMetricValue(value);
    // If it's pure text like "Pan-India", keep as is
    if (parsed.num === 0 && parsed.suffix === value) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true);
            setHasAnimated(true);

            const duration = 1400; // ms
            const startTime = performance.now();
            const startVal = 0;
            const targetVal = parsed.num;

            const animateCount = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease-out exponential deceleration curve
              const easeProgress = 1 - Math.pow(2, -10 * progress);
              const currentVal = Math.round(startVal + (targetVal - startVal) * easeProgress);

              setDisplayValue(`${parsed.prefix}${currentVal}${parsed.suffix}`);

              if (progress < 1) {
                requestAnimationFrame(animateCount);
              } else {
                setDisplayValue(value);
              }
            };

            requestAnimationFrame(animateCount);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [value, hasAnimated]);

  return (
    <div
      ref={containerRef}
      className={`metric-odometer-card relative flex flex-col justify-center pl-6 py-2 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      {/* Progressive Laser Draw Accent Border */}
      <span
        className={`absolute left-0 top-0 bottom-0 w-[2px] bg-[#c9a35d] origin-top transition-transform duration-1000 ease-out ${
          isVisible ? "scale-y-100" : "scale-y-0"
        }`}
        style={{
          boxShadow: isVisible ? "0 0 8px rgba(201, 163, 93, 0.4)" : "none",
          transitionDelay: `${index * 110}ms`,
        }}
      />

      <span className="text-[#c9a35d] font-black text-2xl lg:text-3xl tracking-tight font-display font-feature-settings-num">
        {displayValue}
      </span>
      <span className="text-xs uppercase tracking-wider text-[#64748b] font-semibold mt-1.5">
        {label}
      </span>
    </div>
  );
}

export function CapabilitiesStrip({
  capabilities,
}: {
  capabilities: readonly [string, string][];
}) {
  return (
    <section className="bg-[#f8fafc] border-y border-[#e2e8f0] py-12 text-[#0f172a] relative z-20 overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {capabilities.map(([val, lbl], idx) => (
            <MetricOdometer key={lbl} value={val} label={lbl} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
