"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Container } from "./primitives";
import { GitHubIcon } from "./icons";

export function Nav() {
  const [open, setOpen] = useState(false);

  // Close menu on resize past breakpoint
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-line bg-bg/70">
      <Container className="flex items-center justify-between h-14 sm:h-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 group shrink-0"
          onClick={() => setOpen(false)}
        >
          <span className="relative w-6 h-6 flex items-center justify-center rounded-md bg-gradient-to-br from-green to-green-deep">
            <span className="block w-2 h-2 rounded-sm bg-bg" />
          </span>
          <span className="font-medium tracking-tight">nextcheck</span>
          <span className="mono text-[10px] text-muted ml-1 hidden xs:inline">v0.3</span>
        </Link>

        {/* Desktop nav (md+) */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            href="#how"
            className="px-3 py-1.5 text-sm text-ink-2 hover:text-ink transition-colors"
          >
            How
          </Link>
          <Link
            href="#coverage"
            className="px-3 py-1.5 text-sm text-ink-2 hover:text-ink transition-colors"
          >
            Coverage
          </Link>
          <Link
            href="/about"
            className="px-3 py-1.5 text-sm text-ink-2 hover:text-ink transition-colors"
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
            <span className="text-xs">Source</span>
          </a>
          <Link
            href="#audit"
            className="px-4 py-1.5 rounded-md bg-green text-bg text-sm font-medium hover:bg-green/90 transition-colors"
          >
            Audit
          </Link>
        </div>

        {/* Mobile: Audit button + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="#audit"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-md bg-green text-bg text-sm font-medium"
          >
            Audit
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-md border border-line-strong text-ink-2"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 bg-bg border-t border-line animate-fade-up">
          <Container className="flex flex-col gap-1 py-4">
            <Link
              href="#how"
              onClick={() => setOpen(false)}
              className="px-4 py-4 rounded-md hover:bg-card text-lg border-b border-line"
            >
              How it works
            </Link>
            <Link
              href="#coverage"
              onClick={() => setOpen(false)}
              className="px-4 py-4 rounded-md hover:bg-card text-lg border-b border-line"
            >
              Coverage
            </Link>
            <Link
              href="#audit"
              onClick={() => setOpen(false)}
              className="px-4 py-4 rounded-md hover:bg-card text-lg border-b border-line"
            >
              Run audit
            </Link>
            <Link
              href="#faq"
              onClick={() => setOpen(false)}
              className="px-4 py-4 rounded-md hover:bg-card text-lg border-b border-line"
            >
              FAQ
            </Link>
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="px-4 py-4 rounded-md hover:bg-card text-lg border-b border-line"
            >
              About
            </Link>
            <a
              href="https://github.com/kvragg/nextcheck"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="px-4 py-4 rounded-md hover:bg-card text-lg flex items-center gap-3"
            >
              <GitHubIcon className="w-5 h-5" />
              Source on GitHub
            </a>
          </Container>
        </div>
      )}
    </nav>
  );
}
