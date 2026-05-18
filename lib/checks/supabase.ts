import { getOctokit, getFileTree, safeGetContent, countMatchesInFiles, pathExists } from "@/lib/octokit";
import { pass, warn, fail, skip, type Check } from "./types";

async function listMigrations(owner: string, repo: string): Promise<string[]> {
  const octo = getOctokit();
  const files = await getFileTree(octo, owner, repo);
  return files.filter((p) => p.startsWith("supabase/migrations/") && p.endsWith(".sql"));
}

async function concatMigrations(owner: string, repo: string, max: number = 15): Promise<string> {
  const octo = getOctokit();
  const sqlFiles = (await listMigrations(owner, repo)).slice(-max);
  const chunks: string[] = [];
  for (const f of sqlFiles) {
    const c = await safeGetContent(octo, owner, repo, f);
    if (c) chunks.push(c);
  }
  return chunks.join("\n\n");
}

export const SUPABASE_CHECKS: Check[] = [
  {
    id: "supabase-rls-enabled",
    name: "RLS enabled on user-facing tables",
    category: "Supabase & RLS",
    severity: "CRITICAL",
    why:
      "Without `ENABLE ROW LEVEL SECURITY`, any authenticated user can read/write every row in the table via the anon key from the browser. This is the #1 Supabase production leak.",
    fix:
      "For every `CREATE TABLE` that contains user data, add `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;` in the same migration.",
    async run({ owner, repo }) {
      const sqlFiles = await listMigrations(owner, repo);
      if (sqlFiles.length === 0) return skip("supabase-rls-enabled", "RLS enabled", "No supabase/migrations folder — Supabase not used");
      const sql = await concatMigrations(owner, repo);
      const creates = (sql.match(/create\s+table[^;]+;/gi) ?? []).length;
      const enables = (sql.match(/enable\s+row\s+level\s+security/gi) ?? []).length;
      if (creates === 0) return pass("supabase-rls-enabled", "RLS enabled", `Scanned ${sqlFiles.length} migrations — no new tables`);
      if (enables >= creates) return pass("supabase-rls-enabled", "RLS enabled", `${enables} ENABLE RLS for ${creates} CREATE TABLE — covered`);
      return fail("supabase-rls-enabled", "RLS enabled", `Only ${enables} ENABLE RLS for ${creates} CREATE TABLE — ${creates - enables} table(s) likely exposed`);
    },
  },
  {
    id: "supabase-policies-exist",
    name: "RLS policies exist (not just ENABLE)",
    category: "Supabase & RLS",
    severity: "CRITICAL",
    why:
      "ENABLE RLS without any CREATE POLICY blocks ALL access (deny-by-default) — sounds safe but apps break and devs disable it. Without policies, the table is either useless or insecure.",
    fix:
      "Per table, add explicit `CREATE POLICY` statements: SELECT/INSERT/UPDATE/DELETE × (anon|authenticated|service_role) with `USING` / `WITH CHECK` predicates that reference auth.uid().",
    async run({ owner, repo }) {
      const sqlFiles = await listMigrations(owner, repo);
      if (sqlFiles.length === 0) return skip("supabase-policies-exist", "Policies exist", "No supabase/migrations folder");
      const sql = await concatMigrations(owner, repo);
      const enables = (sql.match(/enable\s+row\s+level\s+security/gi) ?? []).length;
      const policies = (sql.match(/create\s+policy/gi) ?? []).length;
      if (enables === 0) return skip("supabase-policies-exist", "Policies exist", "No ENABLE RLS found — see RLS check");
      if (policies >= enables) return pass("supabase-policies-exist", "Policies exist", `${policies} policies for ${enables} RLS-enabled tables — looks covered`);
      return fail("supabase-policies-exist", "Policies exist", `${enables} tables with RLS but only ${policies} policies — gaps likely deny all access`);
    },
  },
  {
    id: "supabase-policies-permissive",
    name: "No permissive policies (USING true / USING auth.role())",
    category: "Supabase & RLS",
    severity: "CRITICAL",
    why:
      "A policy with `USING (true)` or `USING (auth.role() = 'authenticated')` lets any logged-in user read every row — effectively the same as no RLS at all.",
    fix:
      "Every policy should narrow rows to the owner: `USING (auth.uid() = user_id)` or join through a tenant table. Never USING (true) on user data.",
    async run({ owner, repo }) {
      const sqlFiles = await listMigrations(owner, repo);
      if (sqlFiles.length === 0) return skip("supabase-policies-permissive", "Permissive policies", "No supabase/migrations folder");
      const sql = await concatMigrations(owner, repo);
      const permissive = (sql.match(/using\s*\(\s*(true|auth\.role\(\)\s*=\s*['"]authenticated['"])\s*\)/gi) ?? []).length;
      if (permissive === 0) return pass("supabase-policies-permissive", "Permissive policies", "No USING(true) or USING(auth.role()='authenticated') detected");
      return fail("supabase-policies-permissive", "Permissive policies", `${permissive} permissive policy(ies) detected — review against intended access model`);
    },
  },
  {
    id: "security-definer-revoke",
    name: "SECURITY DEFINER functions paired with REVOKE EXECUTE",
    category: "Supabase & RLS",
    severity: "HIGH",
    why:
      "A `SECURITY DEFINER` function runs with the owner's privileges, bypassing RLS. Without `REVOKE EXECUTE FROM public/anon`, any client can call it and escalate privileges.",
    fix:
      "After every CREATE FUNCTION ... SECURITY DEFINER, add `REVOKE EXECUTE ON FUNCTION <name> FROM public, anon, authenticated;` then `GRANT EXECUTE ... TO <intended_role>;`.",
    async run({ owner, repo }) {
      const sqlFiles = await listMigrations(owner, repo);
      if (sqlFiles.length === 0) return skip("security-definer-revoke", "SECURITY DEFINER + REVOKE", "No supabase/migrations folder");
      const sql = await concatMigrations(owner, repo);
      const definers = (sql.match(/security\s+definer/gi) ?? []).length;
      const revokes = (sql.match(/revoke\s+execute\s+on\s+function[^;]+from\s+(public|anon|authenticated)/gi) ?? []).length;
      if (definers === 0) return pass("security-definer-revoke", "SECURITY DEFINER + REVOKE", "No SECURITY DEFINER functions");
      if (revokes >= definers) return pass("security-definer-revoke", "SECURITY DEFINER + REVOKE", `${definers} definers, all with REVOKE`);
      return fail("security-definer-revoke", "SECURITY DEFINER + REVOKE", `${definers} SECURITY DEFINER but only ${revokes} REVOKE — privilege-escalation risk`);
    },
  },
  {
    id: "security-definer-search-path",
    name: "SECURITY DEFINER with explicit search_path",
    category: "Supabase & RLS",
    severity: "MEDIUM",
    why:
      "A SECURITY DEFINER function inherits the caller's search_path by default. An attacker can create malicious functions in a schema earlier in the path to hijack the call (CVE pattern).",
    fix:
      "Every SECURITY DEFINER should set `SET search_path = ''` (empty) or `SET search_path = pg_catalog, public`. Use fully qualified names inside.",
    async run({ owner, repo }) {
      const sqlFiles = await listMigrations(owner, repo);
      if (sqlFiles.length === 0) return skip("security-definer-search-path", "search_path", "No supabase/migrations folder");
      const sql = await concatMigrations(owner, repo);
      const definers = (sql.match(/security\s+definer/gi) ?? []).length;
      const withSearchPath = (sql.match(/security\s+definer[\s\S]{0,200}?set\s+search_path/gi) ?? []).length;
      if (definers === 0) return pass("security-definer-search-path", "search_path", "No SECURITY DEFINER functions");
      if (withSearchPath >= definers) return pass("security-definer-search-path", "search_path", `${definers} definers, all set search_path`);
      return warn("security-definer-search-path", "search_path", `${definers - withSearchPath} SECURITY DEFINER function(s) without explicit search_path — search-path hijacking risk`);
    },
  },
  {
    id: "service-role-leak",
    name: "service_role key not used in client code",
    category: "Supabase & RLS",
    severity: "CRITICAL",
    why:
      "The service_role key bypasses RLS entirely. If it ever flows to the browser (via NEXT_PUBLIC_, hardcoded, or imported in a Client Component), anyone reading your JS bundle has full database access.",
    fix:
      "Service role key lives only in server-side code (Route Handlers, Server Actions, Edge Functions). Never expose via NEXT_PUBLIC_*. Use anon key + RLS in client code.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const files = await getFileTree(octo, owner, repo);
      const clientFiles = files.filter((p) => /\.(ts|tsx|js|jsx)$/.test(p) && !p.includes("node_modules"));
      if (clientFiles.length === 0) return warn("service-role-leak", "service_role leak", "No JS/TS files");
      const r = await countMatchesInFiles(
        octo,
        owner,
        repo,
        clientFiles,
        /NEXT_PUBLIC_[A-Z_]*(SERVICE_ROLE|SERVICE|SECRET)|service_role.*['"`]eyJ/g,
        30
      );
      if (r.totalMatches === 0) return pass("service-role-leak", "service_role leak", `Scanned ${r.scanned} files — no service_role exposure detected`);
      return fail("service-role-leak", "service_role leak", `${r.totalMatches} suspicious match(es) — service_role may be exposed to client`);
    },
  },
];
