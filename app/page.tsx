"use client";

import { useState } from "react";
import { Loader2, Download, ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { ScoreCard } from "@/components/ScoreCard";
import { CheckRow } from "@/components/CheckRow";
import { Footer } from "@/components/Footer";
import { computeScore } from "@/lib/score";
import type { CheckResult } from "@/lib/checks/types";

type AuditResponse = {
  owner: string;
  repo: string;
  results: CheckResult[];
};

export default function HomePage() {
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
    <div className="min-h-screen bg-grid">
      <main className="max-w-2xl mx-auto px-6 py-16">
        <Hero />

        <form onSubmit={handleSubmit} className="flex gap-2 mb-12">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            required
            disabled={loading}
            className="flex-1 px-4 py-3 rounded border border-border bg-card focus:border-pass focus:outline-none focus:ring-2 focus:ring-pass/20 transition-colors disabled:opacity-50 font-mono text-sm"
            aria-label="GitHub repository URL"
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="px-5 py-3 rounded bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
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
          <div className="space-y-2 animate-fade-in">
            <div className="h-32 rounded border border-border shimmer" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded border border-border shimmer" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 rounded border border-fail/30 bg-fail/10 text-fail text-sm animate-fade-in">
            {error}
          </div>
        )}

        {audit && score && (
          <>
            <ScoreCard score={score} repo={repoLabel} />

            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-muted font-mono uppercase tracking-wider">
                Findings
              </div>
              <button
                onClick={downloadPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border hover:bg-card text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>

            <div className="space-y-2">
              {audit.results.map((r, i) => (
                <CheckRow key={r.id} check={r} index={i} />
              ))}
            </div>
          </>
        )}

        <Footer />
      </main>
    </div>
  );
}
