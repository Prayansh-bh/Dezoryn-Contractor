"use client";

import React from "react";

export function HighwayFlowLine() {
  return (
    <div
      className="absolute left-0 right-0 top-[180px] h-[40px] pointer-events-none hidden lg:block overflow-hidden z-0"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 1200 40"
      >
        <defs>
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c9a35d" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#c9a35d" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c9a35d" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer Guide Rail */}
        <line
          x1="0"
          y1="20"
          x2="1200"
          y2="20"
          stroke="url(#roadGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
        />

        {/* Animated Dashed Highway Centerline */}
        <line
          x1="0"
          y1="20"
          x2="1200"
          y2="20"
          stroke="#c9a35d"
          strokeWidth="2.5"
          strokeDasharray="24 20"
          className="highway-flow-dashes"
        />
      </svg>
    </div>
  );
}
