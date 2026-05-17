import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About",
  description:
    "nextcheck was built end-to-end via AI orchestration by Paul Costa — Next.js + Supabase engineer with 14 years inside the Brazilian financial services sector.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-grid">
      <main className="max-w-2xl mx-auto px-6 py-16 animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to audit
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-2">About nextcheck</h1>
        <p className="text-muted mb-12">
          A short writeup on what this is, why it exists, and how it was built.
        </p>

        <section className="space-y-6 text-foreground/90 leading-relaxed">
          <div>
            <h2 className="text-xl font-bold mb-3">What it is</h2>
            <p>
              A free, public tool that runs 10 production-grade security checks
              on any public Next.js GitHub repository. It scans for CSP/HSTS
              headers, <code className="font-mono text-pass">.env</code> file
              hygiene, leaked <code className="font-mono">console.log</code>{" "}
              calls, unescaped HTML injection, Supabase RLS coverage, dangerous{" "}
              <code className="font-mono">SECURITY DEFINER</code> functions,
              Dependabot, CI, and dependency pinning. Returns a 0&ndash;100
              score, a verdict, and a downloadable PDF.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Why it exists</h2>
            <p>
              I spent 14 years inside the Brazilian financial services sector
              &mdash; credit analysis, lending, regulatory compliance. I&apos;ve
              seen what happens when reconciliation fails at 3am, when a webhook
              fires twice, when an audit trail goes missing the day before the
              regulator shows up. Production security is not theatre &mdash; it&apos;s
              the difference between a working business and a phone call from
              your lawyer.
            </p>
            <p className="mt-3">
              Most security tools are either heavyweight enterprise platforms or
              hobby scripts. nextcheck is the middle: ten focused checks I
              actually run against my own SaaS work, exposed for free so other
              builders can ship safer.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">How it was built</h2>
            <p>
              nextcheck was built end-to-end via{" "}
              <span className="text-pass">AI orchestration</span> &mdash; I spec,
              review, and test every line, while Claude Code handles the actual
              typing. Stack:
            </p>
            <ul className="mt-3 space-y-1 text-muted font-mono text-sm">
              <li>• Next.js 16 (App Router) + TypeScript + Tailwind</li>
              <li>• Octokit (GitHub REST + git tree API)</li>
              <li>• @react-pdf/renderer for PDF reports</li>
              <li>• Geist (font), Lucide (icons), Framer Motion (kept simple)</li>
              <li>• Vercel (edge-aware deploy)</li>
            </ul>
            <p className="mt-3">
              Time from blank repo to live URL: a single evening session.
              That&apos;s the bet I&apos;m making with my career &mdash; that one
              experienced person orchestrating AI correctly produces software
              indistinguishable from a five-person team. Try the tool. Read
              the source. Judge for yourself.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Who I am</h2>
            <p>
              <span className="font-medium">Paul Costa.</span> Independent
              software engineer focused on Next.js, Supabase, payments, and AI
              integration for SaaS founders. Based in Brazil (GMT-3). Available
              for bug fixes, refactors, Supabase/RLS work, Stripe webhook
              hardening, and AI feature builds.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <a
              href="https://github.com/kvragg/nextcheck"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border hover:bg-card transition-colors text-sm"
            >
              <GitHubIcon className="w-4 h-4" /> Source on GitHub
            </a>
            <a
              href="https://github.com/kvragg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-foreground text-background hover:bg-foreground/90 transition-colors text-sm font-medium"
            >
              Hire me <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
