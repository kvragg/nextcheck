import { getOctokit, safeGetContent, pathExists } from "@/lib/octokit";
import type { Check, CheckContext, CheckResult } from "./types";

export const checks: Check[] = [
  // ---- Next.js ----
  {
    id: "next-csp",
    name: "CSP headers in next.config",
    async run({ owner, repo }) {
      const cfg = await readNextConfig(owner, repo);
      if (!cfg) return fail("next-csp", "CSP headers", "next.config not found");
      const hasCsp = /Content-Security-Policy/i.test(cfg);
      return hasCsp
        ? pass("next-csp", "CSP headers", "Content-Security-Policy header configured")
        : fail("next-csp", "CSP headers", "No Content-Security-Policy header found in next.config");
    },
  },
  {
    id: "next-hsts",
    name: "HSTS header in next.config",
    async run({ owner, repo }) {
      const cfg = await readNextConfig(owner, repo);
      if (!cfg) return fail("next-hsts", "HSTS header", "next.config not found");
      const hasHsts = /Strict-Transport-Security/i.test(cfg);
      return hasHsts
        ? pass("next-hsts", "HSTS header", "Strict-Transport-Security configured")
        : warn("next-hsts", "HSTS header", "No HSTS header in next.config (Vercel sets a default, still worth declaring)");
    },
  },
  {
    id: "env-gitignore",
    name: ".env in .gitignore",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const gi = await safeGetContent(octo, owner, repo, ".gitignore");
      if (!gi) return fail("env-gitignore", ".env in .gitignore", ".gitignore not found");
      const ok = /^\.env(\..*)?$|^\*\.env|^\.env\*/m.test(gi);
      return ok
        ? pass("env-gitignore", ".env in .gitignore", ".env files are ignored")
        : fail("env-gitignore", ".env in .gitignore", ".env not found in .gitignore — secrets may be committed");
    },
  },
  {
    id: "no-console-prod",
    name: "console.log in app/ or pages/",
    async run({ owner, repo }) {
      const octo = getOctokit();
      try {
        const res = await octo.search.code({
          q: `"console.log" repo:${owner}/${repo} path:app extension:ts extension:tsx`,
          per_page: 5,
        });
        const count = res.data.total_count;
        if (count === 0) return pass("no-console-prod", "console.log in app/", "No console.log found in app/ TS files");
        if (count <= 3) return warn("no-console-prod", "console.log in app/", `Found ${count} console.log occurrences in app/ — review before prod`);
        return fail("no-console-prod", "console.log in app/", `Found ${count}+ console.log occurrences in app/ — strip before prod`);
      } catch (err) {
        return warn("no-console-prod", "console.log in app/", `Search API failed (${(err as Error).message}). Manual: grep -r 'console.log' app/`);
      }
    },
  },
  {
    id: "no-dangerous-html",
    name: "dangerouslySetInnerHTML usage",
    async run({ owner, repo }) {
      const octo = getOctokit();
      try {
        const res = await octo.search.code({
          q: `"dangerouslySetInnerHTML" repo:${owner}/${repo} extension:tsx extension:jsx`,
          per_page: 5,
        });
        const count = res.data.total_count;
        if (count === 0) return pass("no-dangerous-html", "dangerouslySetInnerHTML", "No dangerouslySetInnerHTML usage detected");
        return warn("no-dangerous-html", "dangerouslySetInnerHTML", `Found ${count} usage(s) — ensure each input is sanitized (DOMPurify or equivalent)`);
      } catch (err) {
        return warn("no-dangerous-html", "dangerouslySetInnerHTML", `Search API failed (${(err as Error).message}). Manual review recommended.`);
      }
    },
  },

  // ---- Supabase ----
  {
    id: "supabase-rls",
    name: "RLS enabled in migrations",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const hasMigrations = await pathExists(octo, owner, repo, "supabase/migrations");
      if (!hasMigrations) {
        return warn("supabase-rls", "RLS in migrations", "No supabase/migrations folder — RLS check skipped (no Supabase usage detected)");
      }
      try {
        const { data } = await octo.repos.getContent({ owner, repo, path: "supabase/migrations" });
        if (!Array.isArray(data)) return warn("supabase-rls", "RLS in migrations", "Unexpected migrations folder structure");

        const sqlFiles = data.filter((f) => f.type === "file" && f.name.endsWith(".sql"));
        if (sqlFiles.length === 0) return warn("supabase-rls", "RLS in migrations", "No .sql files in supabase/migrations");

        const sample = sqlFiles.slice(-10);
        let createTableCount = 0;
        let enableRlsCount = 0;
        for (const file of sample) {
          const content = await safeGetContent(octo, owner, repo, `supabase/migrations/${file.name}`);
          if (!content) continue;
          createTableCount += (content.match(/create\s+table/gi) ?? []).length;
          enableRlsCount += (content.match(/enable\s+row\s+level\s+security/gi) ?? []).length;
        }

        if (createTableCount === 0) {
          return pass("supabase-rls", "RLS in migrations", `Scanned ${sample.length} migration files — no new tables (informational)`);
        }
        if (enableRlsCount >= createTableCount) {
          return pass("supabase-rls", "RLS in migrations", `${enableRlsCount} ENABLE RLS for ${createTableCount} CREATE TABLE — all covered`);
        }
        return fail("supabase-rls", "RLS in migrations", `Only ${enableRlsCount} ENABLE RLS for ${createTableCount} CREATE TABLE — gap detected`);
      } catch (err) {
        return warn("supabase-rls", "RLS in migrations", `Scan failed: ${(err as Error).message}`);
      }
    },
  },
  {
    id: "supabase-security-definer",
    name: "SECURITY DEFINER without REVOKE",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const hasMigrations = await pathExists(octo, owner, repo, "supabase/migrations");
      if (!hasMigrations) {
        return warn("supabase-security-definer", "SECURITY DEFINER + REVOKE", "No supabase/migrations folder — check skipped");
      }
      try {
        const { data } = await octo.repos.getContent({ owner, repo, path: "supabase/migrations" });
        if (!Array.isArray(data)) return warn("supabase-security-definer", "SECURITY DEFINER + REVOKE", "Unexpected migrations structure");

        const sqlFiles = data.filter((f) => f.type === "file" && f.name.endsWith(".sql")).slice(-10);
        let definerCount = 0;
        let revokeCount = 0;
        for (const file of sqlFiles) {
          const content = await safeGetContent(octo, owner, repo, `supabase/migrations/${file.name}`);
          if (!content) continue;
          definerCount += (content.match(/security\s+definer/gi) ?? []).length;
          revokeCount += (content.match(/revoke\s+execute\s+on\s+function[^;]+from\s+(public|anon|authenticated)/gi) ?? []).length;
        }

        if (definerCount === 0) {
          return pass("supabase-security-definer", "SECURITY DEFINER + REVOKE", "No SECURITY DEFINER functions detected");
        }
        if (revokeCount >= definerCount) {
          return pass("supabase-security-definer", "SECURITY DEFINER + REVOKE", `${definerCount} SECURITY DEFINER functions, all with REVOKE EXECUTE`);
        }
        return fail("supabase-security-definer", "SECURITY DEFINER + REVOKE", `${definerCount} SECURITY DEFINER but only ${revokeCount} REVOKE — privilege escalation risk`);
      } catch (err) {
        return warn("supabase-security-definer", "SECURITY DEFINER + REVOKE", `Scan failed: ${(err as Error).message}`);
      }
    },
  },

  // ---- Geral ----
  {
    id: "dependabot",
    name: "Dependabot configured",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const cfg =
        (await safeGetContent(octo, owner, repo, ".github/dependabot.yml")) ??
        (await safeGetContent(octo, owner, repo, ".github/dependabot.yaml"));
      return cfg
        ? pass("dependabot", "Dependabot", "Dependabot config found")
        : warn("dependabot", "Dependabot", "No .github/dependabot.yml — dependency updates not automated");
    },
  },
  {
    id: "ci-workflow",
    name: "CI workflow present",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const exists = await pathExists(octo, owner, repo, ".github/workflows");
      return exists
        ? pass("ci-workflow", "CI workflow", ".github/workflows folder present")
        : warn("ci-workflow", "CI workflow", "No .github/workflows folder — no automated CI detected");
    },
  },
  {
    id: "pinned-deps",
    name: "No wildcard versions in package.json",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const pkg = await safeGetContent(octo, owner, repo, "package.json");
      if (!pkg) return fail("pinned-deps", "Pinned deps", "package.json not found");
      const hasWildcards = /"\*"|"latest"/.test(pkg);
      return hasWildcards
        ? fail("pinned-deps", "Pinned deps", 'package.json contains "*" or "latest" — non-reproducible builds')
        : pass("pinned-deps", "Pinned deps", "No wildcard versions detected");
    },
  },
];

async function readNextConfig(owner: string, repo: string): Promise<string | null> {
  const octo = getOctokit();
  return (
    (await safeGetContent(octo, owner, repo, "next.config.ts")) ??
    (await safeGetContent(octo, owner, repo, "next.config.js")) ??
    (await safeGetContent(octo, owner, repo, "next.config.mjs"))
  );
}

export async function runAllChecks(ctx: CheckContext): Promise<CheckResult[]> {
  const results = await Promise.allSettled(checks.map((c) => c.run(ctx)));
  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : fail(checks[i].id, checks[i].name, `Check threw: ${String(r.reason)}`)
  );
}

function pass(id: string, name: string, message: string): CheckResult {
  return { id, name, status: "PASS", message };
}
function warn(id: string, name: string, message: string): CheckResult {
  return { id, name, status: "WARN", message };
}
function fail(id: string, name: string, message: string): CheckResult {
  return { id, name, status: "FAIL", message };
}
