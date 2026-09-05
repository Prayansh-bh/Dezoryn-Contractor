"use client";

import React, { useEffect, useRef } from "react";
import { HeroTelemetryHud } from "./hero-telemetry-hud";

export function HeroVideoHighway() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId: number;
    let targetPlaybackRate = 1.0;
    let currentPlaybackRate = 1.0;
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;

    function handleScroll() {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY;
      lastScrollY = scrollY;

      // Accelerate playback proportionally to scroll speed
      if (delta > 0) {
        targetPlaybackRate = Math.min(1.0 + delta * 0.035, 2.8);
      } else if (delta < 0) {
        targetPlaybackRate = Math.max(0.5, 1.0 + delta * 0.025);
      }
    }

    function update() {
      if (video) {
        // Smoothly ease playback rate back towards normal 1.0x cruise speed
        currentPlaybackRate += (targetPlaybackRate - currentPlaybackRate) * 0.08;
        targetPlaybackRate += (1.0 - targetPlaybackRate) * 0.04;

        // Apply safely to video element
        if (Number.isFinite(currentPlaybackRate) && currentPlaybackRate > 0.1) {
          video.playbackRate = Math.max(0.3, Math.min(currentPlaybackRate, 3.5));
        }
      }
      animationFrameId = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    animationFrameId = requestAnimationFrame(update);

    // Auto-play safety
    video.play().catch(() => {
      // Autoplay with sound disabled is permitted by modern browsers
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <video
        ref={videoRef}
        src="/highway-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out"
        style={{
          filter: "contrast(1.06) brightness(1.02)",
        }}
      />
      <HeroTelemetryHud />
    </div>
  );
}

