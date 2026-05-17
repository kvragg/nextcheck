import type { CheckResult } from "@/lib/checks/types";

export type ScoreBreakdown = {
  score: number; // 0-100
  total: number;
  pass: number;
  warn: number;
  fail: number;
  grade: "A" | "B" | "C" | "D" | "F";
  verdict: string;
};

/**
 * Weighted score:
 *   PASS = 10 points
 *   WARN = 5 points
 *   FAIL = 0 points
 *   max = checks.length * 10  →  normalized to 100
 */
export function computeScore(results: CheckResult[]): ScoreBreakdown {
  const total = results.length;
  const pass = results.filter((r) => r.status === "PASS").length;
  const warn = results.filter((r) => r.status === "WARN").length;
  const fail = results.filter((r) => r.status === "FAIL").length;

  const raw = pass * 10 + warn * 5;
  const max = total * 10;
  const score = max === 0 ? 0 : Math.round((raw / max) * 100);

  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";

  const verdict =
    grade === "A"
      ? "Production-ready security posture."
      : grade === "B"
      ? "Solid baseline. Tighten a couple of items before scaling."
      : grade === "C"
      ? "Acceptable for a prototype. Needs hardening before users."
      : grade === "D"
      ? "Significant gaps. Treat as pre-production only."
      : "Critical exposure. Do not ship to production users.";

  return { score, total, pass, warn, fail, grade, verdict };
}

export function scoreColor(score: number): string {
  if (score >= 75) return "text-pass";
  if (score >= 40) return "text-warn";
  return "text-fail";
}
