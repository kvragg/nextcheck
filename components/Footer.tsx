import Link from "next/link";
import { Container } from "./primitives";
import { GitHubIcon } from "./icons";

export function Footer() {
  return (
    <footer className="border-t border-line py-12 mt-12">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <div className="space-y-1.5">
            <div className="text-ink font-medium">
              Built by Paul Costa, 100% via AI orchestration.
            </div>
            <div className="text-sm text-muted">
              Next.js + Supabase + AI Builder · 14 years inside the Brazilian
              financial sector.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-muted">
            <Link href="/about" className="hover:text-ink transition-colors">
              About
            </Link>
            <a
              href="https://github.com/kvragg/nextcheck"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-ink transition-colors"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
              Source
            </a>
            <a
              href="https://github.com/kvragg"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              Hire me →
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-line text-xs text-muted/70 mono uppercase tracking-[0.18em] flex flex-wrap items-center justify-between gap-2">
          <span>nextcheck · MIT · 2026</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot" />
            All systems operational
          </span>
        </div>
      </Container>
    </footer>
  );
}
