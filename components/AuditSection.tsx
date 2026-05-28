"use client";

import { useState } from "react";
import { Loader2, Download, ArrowRight } from "lucide-react";
import { Container, Eyebrow, useReveal } from "./primitives";
import { ScoreCard } from "./ScoreCard";
import { CheckRow } from "./CheckRow";
import { computeScore, scoreColor } from "@/lib/score";
import type { CheckResult } from "@/lib/checks/types";

type AuditResponse = {
  owner: string;
  repo: string;
  results: CheckResult[];
};

export function AuditSection() {
  useReveal();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAudit(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setAudit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!audit) return;
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(audit),
    });
    if (!res.ok) {
      setError("PDF generation failed");
      return;
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nextcheck-${audit.owner}-${audit.repo}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const score = audit ? computeScore(audit.results) : null;
  const repoLabel = audit ? `${audit.owner}/${audit.repo}` : "";

  return (
    <section id="audit" className="py-20 sm:py-24 lg:py-32 border-t border-line scroll-mt-20">
      <Container>
        <div className="reveal max-w-2xl mb-8 sm:mb-12">
          <Eyebrow>Audit</Eyebrow>
          <h2 className="text-h2 font-medium mt-3 text-balance">
            Run a real audit now.
            <span className="text-muted"> 30 checks, ~30 seconds, no sign-up.</span>
          </h2>
        </div>

        <div className="reveal reveal-d1 max-w-3xl xl:max-w-4xl">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-8 sm:mb-10">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              required
              disabled={loading}
              className="flex-1 min-w-0 px-4 py-3.5 rounded-md border border-line-strong bg-card focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20 transition-colors disabled:opacity-50 font-mono text-sm"
              aria-label="GitHub repository URL"
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="px-5 py-3.5 rounded-md bg-ink text-bg font-medium hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Auditing
                </>
              ) : (
                <>
                  Audit <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {loading && (
            <div className="space-y-2 animate-fade-up">
              <div className="h-32 rounded-md border border-line shimmer" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-md border border-line shimmer" />
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-md border border-fail/30 bg-fail/10 text-fail text-sm animate-fade-up">
              {error}
            </div>
          )}

          {audit && score && (
            <div className="animate-fade-up">
              <ScoreCard score={score} repo={repoLabel} />

              <div className="flex items-center justify-between mb-4">
                <div className="mono text-[10.5px] text-muted uppercase tracking-[0.18em]">
                  Findings · {audit.results.length} checks
                </div>
                <button
                  onClick={downloadPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line-strong hover:bg-card text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>

              <div className="space-y-6">
                {score.byCategory.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-medium">{cat.category}</h3>
                      <span className={`mono text-xs tabular-nums ${scoreColor(cat.score)}`}>
                        {cat.score}/100 · {cat.results.length} check{cat.results.length !== 1 && "s"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {cat.results.map((r, i) => (
                        <CheckRow key={r.id} check={r} index={i} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
