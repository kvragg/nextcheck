"use client";

import { useEffect } from "react";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-6xl 3xl:max-w-7xl 4xl:max-w-[1600px] mx-auto px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
      {children}
    </span>
  );
}

export function GridLayer({
  size = 80,
  opacity = 0.04,
}: {
  size?: number;
  opacity?: number;
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        maskImage:
          "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
      }}
    />
  );
}

export function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function MagneticHover({
  children,
  strength = 12,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  return (
    <span
      className="inline-block transition-transform duration-300"
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translate(0, 0)";
      }}
    >
      {children}
    </span>
  );
}
