"use client";

import React, { useEffect, useRef } from "react";

interface Sparkle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  speed: number;
  phase: number;
  color: string;
}

export function HeroTelemetryHud() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let isVisible = true;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Glass bead retro-reflective micro-sparkles
    const sparkles: Sparkle[] = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      baseAlpha: Math.random() * 0.45 + 0.15,
      alpha: 0,
      speed: Math.random() * 0.025 + 0.01,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? "#c9a35d" : "#f1d99b",
    }));

    let time = 0;

    const render = () => {
      if (!isVisible) {
        animationId = 0;
        return;
      }

      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      // Draw subtle telemetry coordinates reticle on right side
      ctx.save();
      ctx.strokeStyle = "rgba(201, 163, 93, 0.22)";
      ctx.lineWidth = 1;

      // Coordinate marker box in bottom-right area (above scroll button)
      const boxWidth = 160;
      const boxHeight = 44;
      const rightMargin = 36;
      const boxX = width - boxWidth - rightMargin;
      const boxY = height - 104;

      if (boxX > 320) {
        const cornerLen = 6;
        ctx.strokeStyle = "rgba(201, 163, 93, 0.4)";
        ctx.lineWidth = 1.2;

        // Top-left corner reticle
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerLen);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerLen, boxY);
        ctx.stroke();

        // Top-right corner reticle
        ctx.beginPath();
        ctx.moveTo(boxX + boxWidth - cornerLen, boxY);
        ctx.lineTo(boxX + boxWidth, boxY);
        ctx.lineTo(boxX + boxWidth, boxY + cornerLen);
        ctx.stroke();

        // Bottom-left corner reticle (no continuous bottom line)
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + boxHeight - cornerLen);
        ctx.lineTo(boxX, boxY + boxHeight);
        ctx.lineTo(boxX + cornerLen, boxY + boxHeight);
        ctx.stroke();

        // Bottom-right corner reticle (no continuous bottom line)
        ctx.beginPath();
        ctx.moveTo(boxX + boxWidth - cornerLen, boxY + boxHeight);
        ctx.lineTo(boxX + boxWidth, boxY + boxHeight);
        ctx.lineTo(boxX + boxWidth, boxY + boxHeight - cornerLen);
        ctx.stroke();

        // Technical HUD text
        ctx.font = "9px monospace";
        ctx.fillStyle = "rgba(100, 116, 139, 0.8)";
        ctx.fillText("MORTH CL. 803 // QC ACTIVE", boxX + 8, boxY + 16);
        ctx.fillStyle = "rgba(201, 163, 93, 0.9)";
        ctx.fillText(`TEL: ${(Math.sin(time) * 2 + 102.4).toFixed(1)}°C THERMAL`, boxX + 8, boxY + 32);
      }
      ctx.restore();

      // Render retro-reflective glass bead sparkles
      for (const sp of sparkles) {
        sp.phase += sp.speed;
        sp.alpha = sp.baseAlpha * (0.5 + 0.5 * Math.sin(sp.phase));

        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = sp.color;
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
          if (isVisible && !animationId) {
            animationId = requestAnimationFrame(render);
          } else if (!isVisible && animationId) {
            cancelAnimationFrame(animationId);
            animationId = 0;
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);
    animationId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-1"
      aria-hidden="true"
    />
  );
}
