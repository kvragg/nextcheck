import { getOctokit, safeGetContent, getFileTree, countMatchesInFiles } from "@/lib/octokit";
import { pass, warn, fail, type Check } from "./types";

export const SECRETS_CHECKS: Check[] = [
  {
    id: "next-public-no-secret",
    name: "NEXT_PUBLIC_ vars don't contain secrets",
    category: "Secrets & Repo Hygiene",
    severity: "CRITICAL",
    why:
      "Any var prefixed `NEXT_PUBLIC_` is inlined into the client JS bundle. If you accidentally put a secret (SECRET_KEY, SERVICE_ROLE, API_SECRET) under that prefix, it ships to every browser.",
    fix:
      "Drop the NEXT_PUBLIC_ prefix for any sensitive var. Move the call that needs it to a Server Component / Route Handler / Server Action.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const candidates = [".env.example", ".env.local.example", ".env.production.example"];
      let suspects: string[] = [];
      for (const c of candidates) {
        const content = await safeGetContent(octo, owner, repo, c);
        if (!content) continue;
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          if (/^NEXT_PUBLIC_[A-Z_]*(SECRET|SERVICE_ROLE|PRIVATE|TOKEN|PASSWORD)/.test(line)) {
            suspects.push(line.split("=")[0]);
          }
        }
      }
      // Also scan source for inline NEXT_PUBLIC_*SECRET refs
      const files = await getFileTree(octo, owner, repo);
      const jsFiles = files.filter((p) => /\.(ts|tsx|js|jsx)$/.test(p) && !p.includes("node_modules"));
      const r = await countMatchesInFiles(
        octo,
        owner,
        repo,
        jsFiles,
        /process\.env\.NEXT_PUBLIC_[A-Z_]*(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD)/g,
        25
      );
      const total = suspects.length + r.totalMatches;
      if (total === 0) return pass("next-public-no-secret", "NEXT_PUBLIC_ vars", "No suspicious NEXT_PUBLIC_*SECRET / SERVICE_ROLE / PRIVATE found");
      return fail("next-public-no-secret", "NEXT_PUBLIC_ vars", `${total} suspicious var(s) prefixed NEXT_PUBLIC_ may be exposed to client`);
    },
  },
  {
    id: "env-example-no-real",
    name: ".env.example contains no real values",
    category: "Secrets & Repo Hygiene",
    severity: "HIGH",
    why:
      "If `.env.example` has real keys (instead of placeholders like `your-key-here`), they're committed and indexed by GitHub search — bots scrape these constantly.",
    fix:
      "Replace all values in `.env.example` with descriptive placeholders. Use the `.env.example` as documentation only.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const env = await safeGetContent(octo, owner, repo, ".env.example");
      if (env === null) return warn("env-example-no-real", ".env.example", "No .env.example file");
      const lines = env.split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"));
      // Heuristics for real values:
      //   - long base64-ish (JWT, key): eyJ..., 30+ chars
      //   - looks like UUID
      //   - starts with sk_/pk_/key_
      const suspect: string[] = [];
      for (const line of lines) {
        const value = line.split("=").slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
        if (!value) continue;
        if (/^eyJ/i.test(value)) suspect.push(line.split("=")[0]);
        else if (/^sk_|^pk_|^key_|^Bearer\s+/i.test(value)) suspect.push(line.split("=")[0]);
        else if (/^[a-f0-9]{32,}$/i.test(value)) suspect.push(line.split("=")[0]);
        else if (value.length > 35 && !/(your|example|here|change|todo|xxx|<.*>)/i.test(value)) suspect.push(line.split("=")[0]);
      }
      if (suspect.length === 0) return pass("env-example-no-real", ".env.example", `Scanned ${lines.length} lines — placeholders only`);
      return fail("env-example-no-real", ".env.example", `${suspect.length} suspicious value(s): ${suspect.slice(0, 3).join(", ")}${suspect.length > 3 ? "..." : ""}`);
    },
  },
];
