"use client";

import { Container, Eyebrow, GridLayer, useReveal, MagneticHover } from "./primitives";
import { AuditPreview } from "./AuditPreview";
import { ArrowDown, ArrowRight } from "lucide-react";

export function Hero() {
  useReveal();

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-32 pb-24 overflow-hidden">
      {/* Background gradient + animated pan */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-[-10%] animate-hero-pan"
          style={{
            background:
              "radial-gradient(42% 55% at 20% 35%, rgba(92,189,149,0.22), transparent 60%)," +
              "radial-gradient(38% 50% at 85% 20%, rgba(201,168,106,0.14), transparent 60%)," +
              "radial-gradient(55% 60% at 60% 90%, rgba(47,122,92,0.25), transparent 60%)," +
              "linear-gradient(180deg, #0a1512 0%, #07080a 50%, #0a0e0c 100%)",
          }}
        />
        {/* Subtle SVG paths */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.18]"
          preserveAspectRatio="none"
          viewBox="0 0 1200 800"
          aria-hidden
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <path
              key={i}
              d={`M 0 ${520 + i * 22} Q 600 ${490 + i * 22 - i * 2} 1200 ${
                520 + i * 22 + i * 1.2
              }`}
              stroke={i < 10 ? "rgba(201,168,106,0.5)" : "rgba(92,189,149,0.5)"}
              strokeWidth={0.5}
              fill="none"
            />
          ))}
        </svg>
      </div>

      {/* Overlays */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,8,10,0.4) 0%, rgba(7,8,10,0.7) 50%, rgba(7,8,10,0.95) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(80% 80% at 50% 40%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <GridLayer size={80} opacity={0.04} />

      <Container className="relative z-[2]">
        {/* Eyebrow strip */}
        <div className="reveal flex items-center gap-4 mb-10 sm:mb-14">
          <Eyebrow>Security audit · Next.js + Supabase</Eyebrow>
          <div className="flex-1 h-px bg-line" />
          <span className="mono text-[10.5px] uppercase tracking-[0.14em] text-muted hidden sm:inline">
            v0.3 · open source · MIT
          </span>
        </div>

        {/* Hero grid: copy + mock */}
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-20 items-center">
          {/* Left: copy */}
          <div>
            <h1
              className="reveal text-display font-medium text-balance mb-7"
              style={{ textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
            >
              Audit your Next.js
              <br />
              <span className="text-ink-2">
                before your auditor
              </span>
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(180deg, #c9a86a 0%, #8a7548 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                does it for you.
              </span>
            </h1>

            <p className="reveal reveal-d1 text-lg leading-relaxed text-ink-2 max-w-xl">
              Ten production-grade security checks. A 0&ndash;100 score. A
              downloadable PDF. In under 30 seconds &mdash; from someone who&apos;s
              watched these fail from inside the bank.
            </p>

            <div className="reveal reveal-d2 flex flex-wrap gap-3 mt-10">
              <MagneticHover strength={10}>
                <a
                  href="#audit"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-green text-bg font-medium hover:bg-green/90 transition-colors"
                >
                  Start audit <ArrowRight className="w-4 h-4" />
                </a>
              </MagneticHover>
              <a
                href="#how"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md border border-line-strong hover:bg-card transition-colors text-ink-2"
              >
                <ArrowDown className="w-4 h-4" /> How it works
              </a>
            </div>

            {/* Trust strip */}
            <div className="reveal reveal-d3 mt-14 pt-7 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-5">
              <TrustStat k="Checks" v="10" />
              <TrustStat k="Runtime" v="~30s" />
              <TrustStat k="Output" v="PDF + JSON" />
              <TrustStat k="Sign-up" v="None" />
            </div>
          </div>

          {/* Right: animated mock */}
          <div className="reveal reveal-d2 relative">
            <AuditPreview />
            <div
              className="mono absolute -top-3 -right-2 px-3.5 py-2 rounded-full bg-bg/90 text-gold border text-[10.5px] tracking-[0.12em] uppercase flex items-center gap-2"
              style={{
                borderColor: "var(--line-gold)",
                boxShadow: "0 0 30px rgba(201,168,106,0.18)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-gold"
                style={{ boxShadow: "0 0 8px var(--gold)" }}
              />
              live demo
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="reveal reveal-d4 absolute left-1/2 -translate-x-1/2 bottom-2 flex flex-col items-center gap-2 text-muted">
          <div className="mono text-[10px] tracking-[0.2em] uppercase">scroll</div>
          <div className="w-px h-9 bg-gradient-to-b from-muted to-transparent" />
        </div>
      </Container>
    </section>
  );
}

function TrustStat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="mono text-[10px] tracking-[0.18em] uppercase text-muted mb-2">
        {k}
      </div>
      <div className="text-sm font-medium text-ink">{v}</div>
    </div>
  );
}
