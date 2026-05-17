import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="mt-24 pt-8 border-t border-border text-sm text-muted">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-foreground font-medium">
            Built by Paul Costa, 100% via AI orchestration.
          </div>
          <div>
            Next.js + Supabase + AI Builder · 14 years inside the Brazilian financial sector.
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            About
          </Link>
          <a
            href="https://github.com/kvragg/nextcheck"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <GitHubIcon className="w-4 h-4" /> Source
          </a>
          <a
            href="https://github.com/kvragg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Hire me <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
