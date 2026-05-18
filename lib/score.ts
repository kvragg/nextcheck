import type { CheckResult, Severity, Category } from "@/lib/checks/types";
import { SEVERITY_WEIGHT, CATEGORY_ORDER } from "@/lib/checks/types";

export type ScoreBreakdown = {
  score: number;
  total: number;
  pass: number;
  warn: number;
  fail: number;
  skip: number;
  grade: "A" | "B" | "C" | "D" | "F";
  verdict: string;
  bySeverity: Record<Severity, { pass: number; warn: number; fail: number; skip: number }>;
  byCategory: { category: Category; score: number; results: CheckResult[] }[];
};

/**
 * Weighted score:
 *   Start at 100.
 *   For each scored check (PASS/WARN/FAIL/SKIP):
 *     FAIL  → subtract full severity weight
 *     WARN  → subtract half severity weight
 *     PASS  → 0
 *     SKIP  → 0 (not counted; e.g. Supabase check on a non-Supabase project)
 *   Floor at 0, ceiling at 100.
 *
 * Severity weights (negative impact on FAIL):
 *   CRITICAL = 25, HIGH = 12, MEDIUM = 6, LOW = 3, INFO = 1
 */
export function computeScore(results: CheckResult[]): ScoreBreakdown {
  let score = 100;
  const bySeverity: Record<Severity, { pass: number; warn: number; fail: number; skip: number }> = {
    CRITICAL: { pass: 0, warn: 0, fail: 0, skip: 0 },
    HIGH: { pass: 0, warn: 0, fail: 0, skip: 0 },
    MEDIUM: { pass: 0, warn: 0, fail: 0, skip: 0 },
    LOW: { pass: 0, warn: 0, fail: 0, skip: 0 },
    INFO: { pass: 0, warn: 0, fail: 0, skip: 0 },
  };
  let pass = 0;
  let warn = 0;
  let fail = 0;
  let skip = 0;
  for (const r of results) {
    const w = SEVERITY_WEIGHT[r.severity];
    if (r.status === "FAIL") {
      score -= w;
      fail++;
      bySeverity[r.severity].fail++;
    } else if (r.status === "WARN") {
      score -= Math.round(w / 2);
      warn++;
      bySeverity[r.severity].warn++;
    } else if (r.status === "PASS") {
      pass++;
      bySeverity[r.severity].pass++;
    } else {
      skip++;
      bySeverity[r.severity].skip++;
    }
  }
  score = Math.max(0, Math.min(100, score));

  const grade: ScoreBreakdown["grade"] =
    score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";

  const verdict =
    grade === "A"
      ? "Production-ready security posture."
      : grade === "B"
      ? "Solid baseline. Tighten a couple of items before scaling."
      : grade === "C"
      ? "Acceptable for a prototype. Needs hardening before production users."
      : grade === "D"
      ? "Significant gaps. Treat as pre-production only."
      : "Critical exposure. Do not ship to production users.";

  const byCategory = CATEGORY_ORDER.map((cat) => {
    const catResults = results.filter((r) => r.category === cat);
    if (catResults.length === 0) return null;
    let catScore = 100;
    for (const r of catResults) {
      const w = SEVERITY_WEIGHT[r.severity];
      if (r.status === "FAIL") catScore -= w * 1.5;
      else if (r.status === "WARN") catScore -= Math.round(w * 0.75);
    }
    catScore = Math.max(0, Math.min(100, Math.round(catScore)));
    return { category: cat, score: catScore, results: catResults };
  }).filter(Boolean) as { category: Category; score: number; results: CheckResult[] }[];

  return { score, total: results.length, pass, warn, fail, skip, grade, verdict, bySeverity, byCategory };
}

export function scoreColor(score: number): string {
  if (score >= 75) return "text-green";
  if (score >= 40) return "text-warn";
  return "text-fail";
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case "CRITICAL":
      return "text-fail border-fail/40 bg-fail/10";
    case "HIGH":
      return "text-warn border-warn/40 bg-warn/10";
    case "MEDIUM":
      return "text-gold border-gold/40 bg-gold/10";
    case "LOW":
      return "text-ink-2 border-line-strong bg-card";
    case "INFO":
      return "text-muted border-line bg-card";
  }
}
