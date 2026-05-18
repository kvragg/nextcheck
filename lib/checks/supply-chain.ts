import { getOctokit, safeGetContent } from "@/lib/octokit";
import { pass, warn, fail, type Check } from "./types";

export const SUPPLY_CHAIN_CHECKS: Check[] = [
  {
    id: "pinned-deps",
    name: "No wildcard versions in package.json",
    category: "Supply Chain",
    severity: "MEDIUM",
    why:
      "Using `\"*\"` or `\"latest\"` means every `npm install` can pull a different version — including one that was just compromised by a supply-chain attack (event-stream, ua-parser-js, colors.js).",
    fix:
      "Pin to a major or exact version (`\"^1.2.3\"`). Commit lockfile. Use Dependabot to upgrade deliberately.",
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
  {
    id: "lockfile-committed",
    name: "Lockfile committed (pnpm/npm/yarn)",
    category: "Supply Chain",
    severity: "HIGH",
    why:
      "Without a lockfile in git, `install` resolves dependencies fresh every time — your CI, your laptop, and your production deploy can each get different transitive dependencies. Builds become non-reproducible.",
    fix:
      "Commit one of: `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`. Configure CI to use `--frozen-lockfile` / `npm ci`.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const candidates = ["pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lockb", "bun.lock"];
      for (const c of candidates) {
        const exists = await safeGetContent(octo, owner, repo, c);
        if (exists !== null) return pass("lockfile-committed", "Lockfile", `${c} committed`);
      }
      return fail("lockfile-committed", "Lockfile", "No lockfile (pnpm-lock / package-lock / yarn.lock / bun.lockb) committed");
    },
  },
  {
    id: "node-modules-gitignored",
    name: "node_modules in .gitignore",
    category: "Supply Chain",
    severity: "HIGH",
    why:
      "Committing node_modules bloats the repo (often >100MB), exposes pinned malicious deps to the world, and prevents the lockfile from being authoritative.",
    fix:
      "Add `node_modules` (and `node_modules/`) to .gitignore. If already committed, `git rm -r --cached node_modules` and rebuild.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const gi = await safeGetContent(octo, owner, repo, ".gitignore");
      if (!gi) return fail("node-modules-gitignored", "node_modules gitignored", ".gitignore not found");
      return /^node_modules\/?$/m.test(gi)
        ? pass("node-modules-gitignored", "node_modules gitignored", "node_modules is ignored")
        : fail("node-modules-gitignored", "node_modules gitignored", "node_modules not in .gitignore");
    },
  },
  {
    id: "no-dangerous-postinstall",
    name: "No suspicious postinstall scripts",
    category: "Supply Chain",
    severity: "HIGH",
    why:
      "A package.json `scripts.postinstall` runs arbitrary code every install — favorite vector of supply-chain attacks (curl | bash, fetch credentials, persist backdoor).",
    fix:
      "Review your own postinstall. If it's not your code, audit it carefully. Consider `--ignore-scripts` in CI and only run scripts from trusted top-level deps.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const pkg = await safeGetContent(octo, owner, repo, "package.json");
      if (!pkg) return fail("no-dangerous-postinstall", "Postinstall scripts", "package.json not found");
      const m = pkg.match(/"postinstall"\s*:\s*"([^"]+)"/);
      if (!m) return pass("no-dangerous-postinstall", "Postinstall scripts", "No postinstall script");
      const script = m[1];
      const suspicious = /\bcurl\b|\bwget\b|\bbash\b|\bsh\s+-c\b|\bnode\s+-e\b/.test(script);
      return suspicious
        ? fail("no-dangerous-postinstall", "Postinstall scripts", `Suspicious postinstall: "${script}"`)
        : warn("no-dangerous-postinstall", "Postinstall scripts", `Has postinstall: "${script}" — review (informational)`);
    },
  },
];
