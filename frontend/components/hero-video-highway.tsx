"use client";

import React, { useEffect, useRef } from "react";
import { HeroTelemetryHud } from "./hero-telemetry-hud";

export function HeroVideoHighway() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let animationFrameId: number | null = null;
    let isVisible = true;
    let targetPlaybackRate = 1.0;
    let currentPlaybackRate = 1.0;
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let isLoopRunning = false;

    function startLoop() {
      if (isLoopRunning || !isVisible) return;
      isLoopRunning = true;
      animationFrameId = requestAnimationFrame(update);
    }

    function stopLoop() {
      isLoopRunning = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    function handleScroll() {
      if (!isVisible) return;
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY;
      lastScrollY = scrollY;

      // Accelerate playback proportionally to scroll speed
      if (delta > 0) {
        targetPlaybackRate = Math.min(1.0 + delta * 0.025, 2.4);
      } else if (delta < 0) {
        targetPlaybackRate = Math.max(0.6, 1.0 + delta * 0.02);
      }

      startLoop();
    }

    function update() {
      if (!isVisible || !video) {
        stopLoop();
        return;
      }

      // Smoothly ease playback rate back towards normal 1.0x cruise speed
      currentPlaybackRate += (targetPlaybackRate - currentPlaybackRate) * 0.08;
      targetPlaybackRate += (1.0 - targetPlaybackRate) * 0.04;

      // Apply safely only when delta is meaningful to prevent decoder thrashing
      const roundedRate = Math.round(currentPlaybackRate * 100) / 100;
      if (Math.abs(video.playbackRate - roundedRate) > 0.02) {
        video.playbackRate = Math.max(0.4, Math.min(roundedRate, 2.5));
      }

      // Idle the rAF loop once stabilized at 1.0x cruise speed
      if (
        Math.abs(currentPlaybackRate - 1.0) < 0.02 &&
        Math.abs(targetPlaybackRate - 1.0) < 0.02
      ) {
        currentPlaybackRate = 1.0;
        targetPlaybackRate = 1.0;
        video.playbackRate = 1.0;
        stopLoop();
        return;
      }

      animationFrameId = requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            video.play().catch(() => {});
          } else {
            video.pause();
            stopLoop();
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial safe play
    video.play().catch(() => {});

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      stopLoop();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
    >
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

