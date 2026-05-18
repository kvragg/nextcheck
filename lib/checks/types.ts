export type CheckStatus = "PASS" | "WARN" | "FAIL" | "SKIP";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type Category =
  | "Next.js Headers"
  | "React & Code Quality"
  | "Supabase & RLS"
  | "Supply Chain"
  | "CI / DevOps"
  | "Secrets & Repo Hygiene"
  | "Docs & Compliance";

export type CheckResult = {
  id: string;
  name: string;
  category: Category;
  severity: Severity;
  status: CheckStatus;
  message: string;
  why?: string;
  fix?: string;
};

export type CheckContext = {
  owner: string;
  repo: string;
};

export type Check = {
  id: string;
  name: string;
  category: Category;
  severity: Severity;
  why: string;
  fix: string;
  run: (ctx: CheckContext) => Promise<Omit<CheckResult, "category" | "severity" | "why" | "fix">>;
};

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  CRITICAL: 25,
  HIGH: 12,
  MEDIUM: 6,
  LOW: 3,
  INFO: 1,
};

export const CATEGORY_ORDER: Category[] = [
  "Next.js Headers",
  "React & Code Quality",
  "Supabase & RLS",
  "Supply Chain",
  "CI / DevOps",
  "Secrets & Repo Hygiene",
  "Docs & Compliance",
];

// Helpers used by all check modules
export function pass(id: string, name: string, message: string) {
  return { id, name, status: "PASS" as const, message };
}
export function warn(id: string, name: string, message: string) {
  return { id, name, status: "WARN" as const, message };
}
export function fail(id: string, name: string, message: string) {
  return { id, name, status: "FAIL" as const, message };
}
export function skip(id: string, name: string, message: string) {
  return { id, name, status: "SKIP" as const, message };
}
