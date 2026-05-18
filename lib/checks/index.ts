import { NEXTJS_CHECKS } from "./nextjs";
import { REACT_CHECKS } from "./react-code";
import { SUPABASE_CHECKS } from "./supabase";
import { SUPPLY_CHAIN_CHECKS } from "./supply-chain";
import { CI_DEVOPS_CHECKS } from "./ci-devops";
import { SECRETS_CHECKS } from "./secrets";
import { DOCS_CHECKS } from "./docs";
import { clearTreeCache } from "@/lib/octokit";
import type { Check, CheckContext, CheckResult } from "./types";

export const checks: Check[] = [
  ...NEXTJS_CHECKS,
  ...REACT_CHECKS,
  ...SUPABASE_CHECKS,
  ...SUPPLY_CHAIN_CHECKS,
  ...CI_DEVOPS_CHECKS,
  ...SECRETS_CHECKS,
  ...DOCS_CHECKS,
];

export async function runAllChecks(ctx: CheckContext): Promise<CheckResult[]> {
  clearTreeCache();
  const results = await Promise.allSettled(checks.map((c) => c.run(ctx)));
  return results.map((r, i) => {
    const check = checks[i];
    if (r.status === "fulfilled") {
      return {
        ...r.value,
        category: check.category,
        severity: check.severity,
        why: check.why,
        fix: check.fix,
      };
    }
    return {
      id: check.id,
      name: check.name,
      status: "FAIL" as const,
      message: `Check threw: ${String(r.reason).slice(0, 200)}`,
      category: check.category,
      severity: check.severity,
      why: check.why,
      fix: check.fix,
    };
  });
}

export type { CheckResult } from "./types";
