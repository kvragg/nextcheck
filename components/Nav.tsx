"use client";

import Link from "next/link";
import { Container } from "./primitives";
import { GitHubIcon } from "./icons";

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-line bg-bg/70">
      <Container className="flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative w-6 h-6 flex items-center justify-center rounded-md bg-gradient-to-br from-green to-green-deep">
            <span className="block w-2 h-2 rounded-sm bg-bg" />
          </span>
          <span className="font-medium tracking-tight">nextcheck</span>
          <span className="mono text-[10px] text-muted ml-1">v0.3</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="#how"
            className="hidden sm:inline px-3 py-1.5 text-sm text-ink-2 hover:text-ink transition-colors"
          >
            How
          </Link>
          <Link
            href="#coverage"
            className="hidden sm:inline px-3 py-1.5 text-sm text-ink-2 hover:text-ink transition-colors"
          >
            Coverage
          </Link>
          <Link
            href="/about"
            className="hidden sm:inline px-3 py-1.5 text-sm text-ink-2 hover:text-ink transition-colors"
          >
            About
          </Link>
          <a
            href="https://github.com/kvragg/nextcheck"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line-strong hover:bg-card text-sm transition-colors"
            aria-label="Source on GitHub"
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Source</span>
          </a>
          <Link
            href="#audit"
            className="px-3 py-1.5 rounded-md bg-green text-bg text-sm font-medium hover:bg-green/90 transition-colors"
          >
            Audit
          </Link>
        </div>
      </Container>
    </nav>
  );
}
