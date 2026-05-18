import { getOctokit, getFileTree, filesByExt, countMatchesInFiles, safeGetContent } from "@/lib/octokit";
import { pass, warn, fail, type Check } from "./types";

export const REACT_CHECKS: Check[] = [
  {
    id: "env-gitignore",
    name: ".env files in .gitignore",
    category: "React & Code Quality",
    severity: "CRITICAL",
    why:
      "Committing a `.env` file leaks every API key, database URL, and secret to anyone with read access — and once pushed, it's in git history forever. Single biggest cause of credential leaks.",
    fix:
      "Add `.env*` (or at minimum `.env`, `.env.local`, `.env.production.local`) to .gitignore. If already committed, rotate every secret and use BFG/git-filter-repo to scrub history.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const gi = await safeGetContent(octo, owner, repo, ".gitignore");
      if (!gi) return fail("env-gitignore", ".env in .gitignore", ".gitignore file not found in repo");
      const ok = /^\.env(\..*)?$|^\*\.env|^\.env\*/m.test(gi);
      return ok
        ? pass("env-gitignore", ".env in .gitignore", ".env* files are ignored")
        : fail("env-gitignore", ".env in .gitignore", ".env not in .gitignore — secrets may be committed");
    },
  },
  {
    id: "no-console-prod",
    name: "console.log in app/ source",
    category: "React & Code Quality",
    severity: "LOW",
    why:
      "console.log calls left in production leak debugging info to DevTools — sometimes including user data, JWTs, or internal IDs. Also indicate code went out without proper review.",
    fix:
      "Replace with a real logger (pino, winston) gated by NODE_ENV, or use eslint-plugin-no-console.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const files = await getFileTree(octo, owner, repo);
      const tsFiles = filesByExt(files, "app/", [".ts", ".tsx"]);
      if (tsFiles.length === 0) {
        const srcFiles = filesByExt(files, "src/app/", [".ts", ".tsx"]);
        if (srcFiles.length === 0) {
          return warn("no-console-prod", "console.log in app/", "No app/ TS files (Pages Router? src/app?)");
        }
        const r = await countMatchesInFiles(octo, owner, repo, srcFiles, /console\.log\s*\(/g, 25);
        return r.totalMatches === 0
          ? pass("no-console-prod", "console.log in src/app/", `Scanned ${r.scanned} files — no console.log`)
          : warn("no-console-prod", "console.log in src/app/", `${r.totalMatches} console.log in ${r.scanned} files`);
      }
      const r = await countMatchesInFiles(octo, owner, repo, tsFiles, /console\.log\s*\(/g, 25);
      if (r.totalMatches === 0) return pass("no-console-prod", "console.log in app/", `Scanned ${r.scanned} files — clean`);
      if (r.totalMatches <= 3) return warn("no-console-prod", "console.log in app/", `${r.totalMatches} console.log in ${r.scanned} files — review`);
      return fail("no-console-prod", "console.log in app/", `${r.totalMatches}+ console.log in ${r.scanned} files — strip before prod`);
    },
  },
  {
    id: "no-dangerous-html",
    name: "dangerouslySetInnerHTML usage",
    category: "React & Code Quality",
    severity: "HIGH",
    why:
      "dangerouslySetInnerHTML bypasses React's auto-escaping. If the input isn't sanitized, attacker controls the DOM = XSS. Many devs forget that markdown/rich-text/CMS content needs explicit sanitization.",
    fix:
      "Sanitize every input with DOMPurify or isomorphic-dompurify before passing. Better: render markdown via react-markdown with a safe schema instead.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const files = await getFileTree(octo, owner, repo);
      const reactFiles = files.filter((p) => p.endsWith(".tsx") || p.endsWith(".jsx"));
      if (reactFiles.length === 0) return warn("no-dangerous-html", "dangerouslySetInnerHTML", "No .tsx/.jsx files");
      const r = await countMatchesInFiles(octo, owner, repo, reactFiles, /dangerouslySetInnerHTML/g, 30);
      if (r.totalMatches === 0) return pass("no-dangerous-html", "dangerouslySetInnerHTML", `Scanned ${r.scanned} files — no usage`);
      return warn("no-dangerous-html", "dangerouslySetInnerHTML", `${r.totalMatches} usage(s) across ${r.scanned} files — verify sanitization (DOMPurify or equivalent)`);
    },
  },
  {
    id: "no-eval",
    name: "eval() / new Function() usage",
    category: "React & Code Quality",
    severity: "CRITICAL",
    why:
      "eval() and new Function() execute arbitrary strings as JavaScript. If any input flows into them, attacker has RCE in your runtime. Almost never legitimately needed in modern Next.js.",
    fix:
      "Remove all eval/new Function. Use JSON.parse for parsing, lookup tables for dispatch, or compiled templates (React JSX) for dynamic rendering.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const files = await getFileTree(octo, owner, repo);
      const jsFiles = files.filter((p) => /\.(ts|tsx|js|jsx|mjs)$/.test(p) && !p.includes("node_modules"));
      if (jsFiles.length === 0) return warn("no-eval", "eval() usage", "No JS/TS files");
      const r = await countMatchesInFiles(octo, owner, repo, jsFiles, /\beval\s*\(|new\s+Function\s*\(/g, 30);
      if (r.totalMatches === 0) return pass("no-eval", "eval() usage", `Scanned ${r.scanned} files — no eval/new Function`);
      return fail("no-eval", "eval() usage", `${r.totalMatches} eval()/new Function() occurrences in ${r.scanned} files — code-injection risk`);
    },
  },
  {
    id: "no-tabnabbing",
    name: "target=\"_blank\" with rel=\"noopener noreferrer\"",
    category: "React & Code Quality",
    severity: "MEDIUM",
    why:
      "A link with target=\"_blank\" but no rel=\"noopener\" lets the new tab access `window.opener` and redirect your origin tab to a phishing page. Reverse tabnabbing.",
    fix:
      "Always pair target=\"_blank\" with rel=\"noopener noreferrer\". eslint-plugin-react flags this with `react/jsx-no-target-blank`.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const files = await getFileTree(octo, owner, repo);
      const reactFiles = files.filter((p) => p.endsWith(".tsx") || p.endsWith(".jsx"));
      if (reactFiles.length === 0) return warn("no-tabnabbing", "Tabnabbing risk", "No .tsx/.jsx files");
      const r = await countMatchesInFiles(
        octo,
        owner,
        repo,
        reactFiles,
        /target=["']_blank["'](?![^>]*rel=["'][^"']*(noopener|noreferrer))/g,
        30
      );
      if (r.totalMatches === 0) return pass("no-tabnabbing", "Tabnabbing", `Scanned ${r.scanned} files — no unsafe target=_blank`);
      return warn("no-tabnabbing", "Tabnabbing", `${r.totalMatches} link(s) with target=_blank but no rel=noopener noreferrer`);
    },
  },
  {
    id: "no-localstorage-secrets",
    name: "Sensitive data in localStorage / sessionStorage",
    category: "React & Code Quality",
    severity: "HIGH",
    why:
      "localStorage and sessionStorage are accessible to any JS running on the page, including injected XSS payloads or 3rd-party scripts (analytics, ads). Putting tokens or PII there is a known anti-pattern.",
    fix:
      "Store auth tokens in httpOnly cookies set by the server. Use IndexedDB only for non-sensitive cached data. Never store JWTs, refresh tokens, or PII in Web Storage.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const files = await getFileTree(octo, owner, repo);
      const jsFiles = files.filter((p) => /\.(ts|tsx|js|jsx)$/.test(p) && !p.includes("node_modules"));
      if (jsFiles.length === 0) return warn("no-localstorage-secrets", "localStorage secrets", "No JS/TS files");
      const r = await countMatchesInFiles(
        octo,
        owner,
        repo,
        jsFiles,
        /(localStorage|sessionStorage)\.setItem\s*\(\s*['"](.*?(token|jwt|secret|password|auth|key|api_?key|session)).*?['"]/gi,
        30
      );
      if (r.totalMatches === 0) return pass("no-localstorage-secrets", "localStorage secrets", `Scanned ${r.scanned} files — no obvious sensitive keys stored`);
      return fail("no-localstorage-secrets", "localStorage secrets", `${r.totalMatches} occurrence(s) of token/secret/auth/jwt being stored in Web Storage`);
    },
  },
];
