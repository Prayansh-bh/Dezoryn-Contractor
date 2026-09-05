"use client";

import React, { useEffect, useRef } from "react";
import { Gauge } from "lucide-react";

export function QcRadarVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const ringRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let isIntersecting = false;
    let lastTimestamp = performance.now();
    let timePhase = 0;
    let scrollPhase = 0;
    let beamAngle = 0;

    // Cycle duration in milliseconds when idle
    const CYCLE_DURATION = 3800;
    // Scroll sensitivity multiplier
    const SCROLL_WEIGHT = 1.25;

    const updateScrollPhase = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const totalDistance = windowHeight + rect.height;
      // Normalizes scroll through viewport
      const currentProgress = (windowHeight - rect.top) / totalDistance;
      scrollPhase = currentProgress * SCROLL_WEIGHT;
    };

    const renderLoop = (timestamp: number) => {
      if (!isIntersecting) {
        rafId = null;
        return;
      }

      const dt = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Advance time phase smoothly
      timePhase += dt / CYCLE_DURATION;

      // Advance radar beam angle (360 degrees every 3.2 seconds)
      beamAngle = (beamAngle + (dt / 3200) * 360) % 360;
      if (beamRef.current) {
        beamRef.current.style.transform = `rotate(${beamAngle.toFixed(1)}deg)`;
      }

      // Calculate total combined phase
      const basePhase = timePhase + scrollPhase;

      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const ringEl = ringRefs[i].current;
        if (!ringEl) continue;

        // Stagger each ring evenly by (i / ringCount)
        const rawPhase = basePhase + i / ringCount;
        // Clean positive modulo 1.0
        const phase = ((rawPhase % 1) + 1) % 1;

        // Scale: emerges from core edge (0.54) to max expansion (1.36)
        const scale = 0.54 + phase * 0.82;

        // 3D Depth: travels from behind core (-25px) forward towards screen (+40px)
        const translateZ = -25 + phase * 65;

        // Opacity curve: fades in quickly from 0 -> 0.85, stays visible, fades out to 0 at perimeter
        let opacity = 0;
        if (phase < 0.15) {
          opacity = (phase / 0.15) * 0.85;
        } else if (phase <= 0.65) {
          opacity = 0.85 - (phase - 0.15) * 0.4;
        } else {
          opacity = Math.max(0, (1 - phase) / 0.35) * 0.65;
        }

        ringEl.style.transform = `perspective(900px) translate3d(0, 0, ${translateZ.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        ringEl.style.opacity = opacity.toFixed(3);
      }

      rafId = window.requestAnimationFrame(renderLoop);
    };

    const onScroll = () => {
      updateScrollPhase();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) {
            lastTimestamp = performance.now();
            updateScrollPhase();
            if (!rafId) {
              rafId = window.requestAnimationFrame(renderLoop);
            }
          } else if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      },
      { rootMargin: "150px 0px 150px 0px" }
    );

    observer.observe(container);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    updateScrollPhase();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={containerRef} className="quality-visual group/radar">
      {/* SVG Laser Connector Lines to Callout Tags */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-1 overflow-visible"
        aria-hidden="true"
      >
        {/* Core center coordinate is ~ 50% 50% */}
        {/* Line to Tag 1 (Top Left) */}
        <line
          x1="50%"
          y1="50%"
          x2="28%"
          y2="22%"
          className="qc-laser-line line-q1"
        />
        {/* Line to Tag 2 (Right Center) */}
        <line
          x1="50%"
          y1="50%"
          x2="78%"
          y2="42%"
          className="qc-laser-line line-q2"
        />
        {/* Line to Tag 3 (Bottom Left) */}
        <line
          x1="50%"
          y1="50%"
          x2="32%"
          y2="80%"
          className="qc-laser-line line-q3"
        />
      </svg>

      {/* Unified 3D Radar Stage */}
      <div className="qc-stage">
        {/* 360° Rotating Phosphor Beam Ray */}
        <div
          ref={beamRef}
          className="qc-radar-beam"
          aria-hidden="true"
        />

        {/* Strictly 3 Unified Firing Concentric Rings (Phase Synchronized Time + Scroll) */}
        <div ref={ringRefs[0]} className="qc-unified-ring ring-1" />
        <div ref={ringRefs[1]} className="qc-unified-ring ring-2" />
        <div ref={ringRefs[2]} className="qc-unified-ring ring-3" />

        {/* Central Dark Core Emitter */}
        <div className="qc-ring-core" />

        {/* Center Content */}
        <div className="q-ring-center">
          <Gauge className="transition-transform duration-300 group-hover/radar:rotate-12" />
          <strong>QC</strong>
          <span>at every batch</span>
        </div>
      </div>

      {/* Floating Callout Tags with Hardware Accelerated Levitation */}
      <span className="q-tag q1 hover:border-[#c9a35d] hover:shadow-lg transition-all">
        Raw material check
      </span>
      <span className="q-tag q2 hover:border-[#c9a35d] hover:shadow-lg transition-all">
        Batch traceability
      </span>
      <span className="q-tag q3 hover:border-[#c9a35d] hover:shadow-lg transition-all">
        Dispatch verification
      </span>
    </div>
  );
}

