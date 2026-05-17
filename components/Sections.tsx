"use client";

import { Container, Eyebrow, useReveal } from "./primitives";
import { CheckCircle2, AlertTriangle, XCircle, ScrollText, ShieldCheck, Database, ListOrdered, Cpu, Lock, Workflow, GitBranch, Pin } from "lucide-react";

export function HowItWorks() {
  useReveal();
  const steps = [
    {
      n: "01",
      title: "Paste a public repo URL",
      desc: "Any public GitHub repo. No login. No install. No GitHub App to approve.",
    },
    {
      n: "02",
      title: "We run 10 checks via the git tree API",
      desc: "Headers, RLS, SECURITY DEFINER, dependency pinning, CI, Dependabot, dangerous HTML. ~30 seconds.",
    },
    {
      n: "03",
      title: "Get a score, a verdict, and a PDF",
      desc: "0–100 weighted score. A–F grade. PASS/WARN/FAIL per check. Downloadable report.",
    },
  ];

  return (
    <section id="how" className="py-20 sm:py-24 lg:py-32 border-t border-line">
      <Container>
        <div className="reveal max-w-2xl mb-10 sm:mb-14 lg:mb-16">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-h2 font-medium mt-3 text-balance">
            Three steps. Under a minute.
            <span className="text-muted"> No setup required.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-line border border-line md:border-0">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`reveal reveal-d${i + 1} bg-bg p-6 sm:p-8 lg:p-10`}
            >
              <div className="mono text-xs text-muted tracking-[0.18em] mb-4 sm:mb-6">
                {s.n}
              </div>
              <h3 className="text-lg sm:text-xl font-medium mb-3 text-balance">{s.title}</h3>
              <p className="text-ink-2 leading-relaxed text-sm sm:text-base">{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

const CHECK_ITEMS = [
  { Icon: ShieldCheck, name: "Content-Security-Policy header", cat: "Next.js" },
  { Icon: Lock, name: "Strict-Transport-Security header", cat: "Next.js" },
  { Icon: ScrollText, name: ".env files in .gitignore", cat: "Hygiene" },
  { Icon: Cpu, name: "No console.log in app/", cat: "Code quality" },
  { Icon: AlertTriangle, name: "No dangerouslySetInnerHTML usage", cat: "React" },
  { Icon: Database, name: "RLS enabled in migrations", cat: "Supabase" },
  { Icon: ShieldCheck, name: "SECURITY DEFINER + REVOKE EXECUTE", cat: "Supabase" },
  { Icon: GitBranch, name: "Dependabot configured", cat: "Supply chain" },
  { Icon: Workflow, name: "CI workflow present", cat: "DevOps" },
  { Icon: Pin, name: "No wildcard versions in package.json", cat: "Supply chain" },
];

export function Coverage() {
  useReveal();
  return (
    <section id="coverage" className="py-20 sm:py-24 lg:py-32 border-t border-line">
      <Container>
        <div className="reveal max-w-2xl mb-10 sm:mb-14 lg:mb-16">
          <Eyebrow>Coverage</Eyebrow>
          <h2 className="text-h2 font-medium mt-3 text-balance">
            Ten checks I actually run
            <span className="text-muted"> against my own SaaS work.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 3xl:grid-cols-3 gap-px bg-line border border-line">
          {CHECK_ITEMS.map((c, i) => (
            <div
              key={c.name}
              className={`reveal reveal-d${(i % 4) + 1} bg-bg p-4 sm:p-5 flex items-start gap-3 sm:gap-4`}
            >
              <c.Icon className="w-5 h-5 shrink-0 text-green mt-0.5" aria-hidden />
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-[15px] font-medium leading-snug">{c.name}</div>
                <div className="mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.16em] text-muted mt-1">
                  {c.cat}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: "Is this safe to run on my private repo?",
    a: "No — only public repos. nextcheck uses the GitHub public REST and git tree APIs without auth (unless you set GITHUB_TOKEN for higher rate limits). For private repos, clone locally and run the same checks yourself.",
  },
  {
    q: "How is the score calculated?",
    a: "Weighted: PASS = 10 points, WARN = 5 points, FAIL = 0 points. Normalized to 100. Grade: A (90+), B (75+), C (60+), D (40+), F (below).",
  },
  {
    q: "Do you store the audit results?",
    a: "Not yet. v0.3 runs entirely in-flight and renders results on your screen. Persistence (shareable audit URLs, history) is planned for v0.4.",
  },
  {
    q: "Why these ten checks specifically?",
    a: "These are the ones I see fail most often in production SaaS work — and the cheapest to verify from outside the codebase. I'd rather ten checks done well than thirty with false positives.",
  },
  {
    q: "Can I contribute new checks?",
    a: "Yes. Open an issue or PR at github.com/kvragg/nextcheck. Each check is a single function in lib/checks/ — easy to add.",
  },
];

export function FAQ() {
  useReveal();
  return (
    <section id="faq" className="py-20 sm:py-24 lg:py-32 border-t border-line">
      <Container>
        <div className="reveal max-w-2xl mb-10 sm:mb-14 lg:mb-16">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="text-h2 font-medium mt-3 text-balance">
            Questions, answered.
          </h2>
        </div>

        <div className="divide-y divide-line border-y border-line max-w-3xl">
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={i}
              className={`reveal reveal-d${(i % 4) + 1} group py-5 sm:py-6`}
            >
              <summary className="cursor-pointer list-none flex items-start gap-3 sm:gap-4 hover:text-green transition-colors py-1">
                <span className="mono text-xs text-muted shrink-0 mt-1.5 group-open:text-green">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-base sm:text-lg font-medium flex-1">{item.q}</span>
                <span className="text-muted shrink-0 group-open:rotate-45 transition-transform text-xl leading-none">
                  +
                </span>
              </summary>
              <div className="mt-3 sm:mt-4 pl-8 sm:pl-10 text-ink-2 leading-relaxed text-sm sm:text-base">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function CTA() {
  useReveal();
  return (
    <section className="py-20 sm:py-24 lg:py-32 border-t border-line relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 50%, rgba(92,189,149,0.12), transparent 70%)",
        }}
      />
      <Container className="relative">
        <div className="reveal max-w-3xl mx-auto text-center">
          <h2 className="text-h2 font-medium mb-4 sm:mb-5 text-balance">
            Audit your repo. Free, public, in under a minute.
          </h2>
          <p className="text-ink-2 text-base sm:text-lg mb-8 sm:mb-10">
            If you find FAIL items you want help fixing — I do this for SaaS
            founders. Otherwise: keep shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#audit"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md bg-green text-bg font-medium hover:bg-green/90 transition-colors"
            >
              Run an audit now
            </a>
            <a
              href="https://github.com/kvragg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md border border-line-strong hover:bg-card transition-colors text-ink-2"
            >
              Hire me
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
