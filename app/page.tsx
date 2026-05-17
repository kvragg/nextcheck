"use client";

import { useState } from "react";

type CheckResult = {
  id: string;
  name: string;
  status: "PASS" | "WARN" | "FAIL";
  message: string;
};

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

  const passCount = audit?.results.filter((r) => r.status === "PASS").length ?? 0;
  const warnCount = audit?.results.filter((r) => r.status === "WARN").length ?? 0;
  const failCount = audit?.results.filter((r) => r.status === "FAIL").length ?? 0;

  return (
    <main className="min-h-screen flex flex-col items-center p-8">
      <div className="w-full max-w-2xl mt-12">
        <h1 className="text-4xl font-bold mb-2">nextcheck</h1>
        <p className="text-zinc-400 mb-8">
          Paste a public GitHub URL of a Next.js repo. Get 10 security checks + PDF report.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            required
            className="flex-1 px-4 py-3 rounded bg-zinc-900 border border-zinc-800 focus:border-zinc-600 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded bg-white text-black font-medium disabled:opacity-50"
          >
            {loading ? "Auditing..." : "Audit"}
          </button>
        </form>

        {error && (
          <div className="p-4 rounded bg-red-900/30 border border-red-800 text-red-200 mb-4">
            {error}
          </div>
        )}

        {audit && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4 text-sm">
                <span className="text-pass">{passCount} PASS</span>
                <span className="text-warn">{warnCount} WARN</span>
                <span className="text-fail">{failCount} FAIL</span>
              </div>
              <button
                onClick={downloadPdf}
                className="px-4 py-2 rounded border border-zinc-700 hover:bg-zinc-900 text-sm"
              >
                Download PDF
              </button>
            </div>

            <div className="space-y-2">
              {audit.results.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded border border-zinc-800 flex items-start gap-3"
                >
                  <span
                    className={`w-16 font-medium ${
                      r.status === "PASS"
                        ? "text-pass"
                        : r.status === "WARN"
                        ? "text-warn"
                        : "text-fail"
                    }`}
                  >
                    {r.status}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-zinc-400 mt-1">{r.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <footer className="mt-16 pt-8 border-t border-zinc-800 text-sm text-zinc-500">
          <p>
            Built by{" "}
            <a
              href="https://www.upwork.com/freelancers/~"
              className="underline hover:text-zinc-300"
            >
              Paul Costa
            </a>{" "}
            · Next.js + Supabase + AI Builder · Available for security audits and
            fintech SaaS work.
          </p>
        </footer>
      </div>
    </main>
  );
}
