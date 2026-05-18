import { getOctokit, readAnyOf } from "@/lib/octokit";
import { pass, warn, fail, type Check } from "./types";

const NEXT_CONFIGS = ["next.config.ts", "next.config.js", "next.config.mjs"];
const MIDDLEWARE = ["middleware.ts", "middleware.js", "src/middleware.ts", "src/middleware.js"];
const PROXY = ["proxy.ts", "proxy.js", "src/proxy.ts", "src/proxy.js"]; // Next 16+

async function readSecurityConfig(owner: string, repo: string) {
  const octo = getOctokit();
  const parts: string[] = [];
  const config = await readAnyOf(octo, owner, repo, NEXT_CONFIGS);
  if (config) parts.push(config.content);
  const mw = await readAnyOf(octo, owner, repo, MIDDLEWARE);
  if (mw) parts.push(mw.content);
  const proxy = await readAnyOf(octo, owner, repo, PROXY);
  if (proxy) parts.push(proxy.content);
  return parts.join("\n\n--- SEPARATOR ---\n\n");
}

export const NEXTJS_CHECKS: Check[] = [
  {
    id: "csp-header",
    name: "Content-Security-Policy header",
    category: "Next.js Headers",
    severity: "HIGH",
    why:
      "Without CSP, a single XSS payload can exfiltrate user data, hijack sessions, or inject crypto miners. CSP turns most XSS bugs into blocked errors.",
    fix:
      "Add a CSP header in next.config.{ts,js,mjs} via the headers() async function, or set it inside middleware/proxy. Use nonces or hashes for inline scripts.",
    async run({ owner, repo }) {
      const cfg = await readSecurityConfig(owner, repo);
      if (!cfg) return fail("csp-header", "CSP header", "next.config / middleware / proxy not found");
      return /content-security-policy/i.test(cfg)
        ? pass("csp-header", "CSP header", "Content-Security-Policy declared")
        : fail("csp-header", "CSP header", "No Content-Security-Policy header declared");
    },
  },
  {
    id: "csp-quality",
    name: "CSP without unsafe-inline / unsafe-eval / wildcard",
    category: "Next.js Headers",
    severity: "HIGH",
    why:
      "A CSP that allows 'unsafe-inline' or 'unsafe-eval' barely improves on no CSP — most XSS payloads still work. Wildcards in default-src or script-src reopen the door.",
    fix:
      "Replace 'unsafe-inline' with nonces or hashes. Remove 'unsafe-eval' (Next.js doesn't need it for production). Avoid '*' in script-src / default-src.",
    async run({ owner, repo }) {
      const cfg = await readSecurityConfig(owner, repo);
      if (!cfg || !/content-security-policy/i.test(cfg)) {
        return warn("csp-quality", "CSP quality", "No CSP found — quality check skipped");
      }
      const issues: string[] = [];
      if (/'unsafe-inline'/i.test(cfg)) issues.push("uses 'unsafe-inline'");
      if (/'unsafe-eval'/i.test(cfg)) issues.push("uses 'unsafe-eval'");
      if (/(script-src|default-src)[^;]*\s\*/i.test(cfg)) issues.push("uses wildcard in script-src/default-src");
      return issues.length === 0
        ? pass("csp-quality", "CSP quality", "No unsafe-inline / unsafe-eval / wildcard detected")
        : fail("csp-quality", "CSP quality", `CSP weakens itself: ${issues.join(", ")}`);
    },
  },
  {
    id: "hsts-header",
    name: "Strict-Transport-Security header",
    category: "Next.js Headers",
    severity: "HIGH",
    why:
      "Without HSTS, a single HTTP request gives an attacker on the network a chance to MITM and inject content. HSTS forces browsers to upgrade to HTTPS automatically.",
    fix:
      "Add `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` in next.config headers() or middleware/proxy.",
    async run({ owner, repo }) {
      const cfg = await readSecurityConfig(owner, repo);
      if (!cfg) return fail("hsts-header", "HSTS header", "next.config / middleware / proxy not found");
      return /strict-transport-security/i.test(cfg)
        ? pass("hsts-header", "HSTS header", "Strict-Transport-Security declared")
        : warn("hsts-header", "HSTS header", "No HSTS header declared (Vercel sets a default, still worth being explicit)");
    },
  },
  {
    id: "hsts-quality",
    name: "HSTS with max-age ≥ 1 year + includeSubDomains",
    category: "Next.js Headers",
    severity: "MEDIUM",
    why:
      "A short max-age (hours/days) gives almost no protection. Without includeSubDomains, an attacker can target *.yoursite.com. Without preload, the first visit is still vulnerable.",
    fix:
      "Use `max-age=63072000` (2 years), add `includeSubDomains; preload` and submit at hstspreload.org once stable.",
    async run({ owner, repo }) {
      const cfg = await readSecurityConfig(owner, repo);
      if (!cfg || !/strict-transport-security/i.test(cfg)) {
        return warn("hsts-quality", "HSTS quality", "HSTS not declared — quality check skipped");
      }
      const ageMatch = cfg.match(/max-age=(\d+)/i);
      const age = ageMatch ? parseInt(ageMatch[1], 10) : 0;
      const hasSubdomains = /includesubdomains/i.test(cfg);
      const hasPreload = /preload/i.test(cfg);
      const issues: string[] = [];
      if (age < 31536000) issues.push(`max-age=${age} < 1 year`);
      if (!hasSubdomains) issues.push("missing includeSubDomains");
      if (!hasPreload) issues.push("missing preload");
      return issues.length === 0
        ? pass("hsts-quality", "HSTS quality", "max-age ≥ 1y, includeSubDomains, preload all present")
        : warn("hsts-quality", "HSTS quality", `HSTS weakened: ${issues.join("; ")}`);
    },
  },
  {
    id: "x-content-type-options",
    name: "X-Content-Type-Options: nosniff",
    category: "Next.js Headers",
    severity: "MEDIUM",
    why:
      "Without nosniff, browsers can MIME-sniff user-uploaded files as HTML/JS and execute them. Trivial to set, blocks a class of XSS via file upload.",
    fix:
      "Add `X-Content-Type-Options: nosniff` to the global headers() in next.config.",
    async run({ owner, repo }) {
      const cfg = await readSecurityConfig(owner, repo);
      if (!cfg) return warn("x-content-type-options", "X-Content-Type-Options", "config not found");
      return /x-content-type-options[\s\S]*?nosniff/i.test(cfg)
        ? pass("x-content-type-options", "X-Content-Type-Options", "nosniff declared")
        : warn("x-content-type-options", "X-Content-Type-Options", "Missing X-Content-Type-Options: nosniff");
    },
  },
  {
    id: "x-frame-options",
    name: "X-Frame-Options or frame-ancestors",
    category: "Next.js Headers",
    severity: "MEDIUM",
    why:
      "Without it, your app can be embedded in an iframe on a malicious site for clickjacking (user thinks they click 'Like' on Facebook, actually clicks 'Transfer money' on you).",
    fix:
      "Add `X-Frame-Options: DENY` (or `SAMEORIGIN`) and/or CSP `frame-ancestors 'none'`.",
    async run({ owner, repo }) {
      const cfg = await readSecurityConfig(owner, repo);
      if (!cfg) return warn("x-frame-options", "X-Frame-Options", "config not found");
      const hasXfo = /x-frame-options/i.test(cfg);
      const hasFa = /frame-ancestors/i.test(cfg);
      return hasXfo || hasFa
        ? pass("x-frame-options", "X-Frame-Options", "X-Frame-Options or CSP frame-ancestors set")
        : warn("x-frame-options", "X-Frame-Options", "Missing X-Frame-Options and CSP frame-ancestors — clickjacking risk");
    },
  },
  {
    id: "referrer-policy",
    name: "Referrer-Policy strict",
    category: "Next.js Headers",
    severity: "LOW",
    why:
      "The default `no-referrer-when-downgrade` leaks the full URL (with query params, tokens, internal paths) to third parties. Strict policy preserves privacy.",
    fix:
      "Add `Referrer-Policy: strict-origin-when-cross-origin` (or `no-referrer`).",
    async run({ owner, repo }) {
      const cfg = await readSecurityConfig(owner, repo);
      if (!cfg) return warn("referrer-policy", "Referrer-Policy", "config not found");
      const m = cfg.match(/referrer-policy[^,\n]*['"]([^'"]+)['"]/i);
      if (!m) return warn("referrer-policy", "Referrer-Policy", "Missing Referrer-Policy header");
      const value = m[1].toLowerCase();
      const strict = ["strict-origin", "strict-origin-when-cross-origin", "no-referrer", "same-origin"].includes(value);
      return strict
        ? pass("referrer-policy", "Referrer-Policy", `Strict policy: ${value}`)
        : warn("referrer-policy", "Referrer-Policy", `Loose policy: ${value} — consider strict-origin-when-cross-origin`);
    },
  },
  {
    id: "permissions-policy",
    name: "Permissions-Policy restrictive",
    category: "Next.js Headers",
    severity: "LOW",
    why:
      "By default browsers grant access to camera, microphone, geolocation, etc. to anything embedded. A restrictive Permissions-Policy reduces attack surface.",
    fix:
      "Add `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` and enable only what you actually use.",
    async run({ owner, repo }) {
      const cfg = await readSecurityConfig(owner, repo);
      if (!cfg) return warn("permissions-policy", "Permissions-Policy", "config not found");
      return /permissions-policy/i.test(cfg)
        ? pass("permissions-policy", "Permissions-Policy", "Permissions-Policy declared")
        : warn("permissions-policy", "Permissions-Policy", "Missing Permissions-Policy — sensitive APIs not locked down");
    },
  },
  {
    id: "powered-by-disabled",
    name: "X-Powered-By header disabled",
    category: "Next.js Headers",
    severity: "LOW",
    why:
      "Exposing 'X-Powered-By: Next.js' tells attackers exactly which CVEs to try. Defense in depth: silence unnecessary version disclosure.",
    fix:
      "Set `poweredByHeader: false` in next.config.{ts,js,mjs}.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const cfg = await readAnyOf(octo, owner, repo, NEXT_CONFIGS);
      if (!cfg) return warn("powered-by-disabled", "X-Powered-By", "next.config not found");
      return /poweredbyheader\s*:\s*false/i.test(cfg.content)
        ? pass("powered-by-disabled", "X-Powered-By", "poweredByHeader: false")
        : warn("powered-by-disabled", "X-Powered-By", "poweredByHeader not disabled — Next.js version leaked in header");
    },
  },
];
