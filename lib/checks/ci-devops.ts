import { getOctokit, safeGetContent, pathExists, getFileTree } from "@/lib/octokit";
import { pass, warn, fail, type Check } from "./types";

export const CI_DEVOPS_CHECKS: Check[] = [
  {
    id: "dependabot",
    name: "Dependabot or Renovate configured",
    category: "CI / DevOps",
    severity: "MEDIUM",
    why:
      "Without automated dependency updates, vulnerabilities sit unpatched. Even the most diligent team forgets to run `npm audit` weekly.",
    fix:
      "Add `.github/dependabot.yml` (npm + github-actions ecosystems, weekly) or a `renovate.json` config.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const candidates = [".github/dependabot.yml", ".github/dependabot.yaml", "renovate.json", ".github/renovate.json", ".renovaterc.json"];
      for (const c of candidates) {
        const file = await safeGetContent(octo, owner, repo, c);
        if (file !== null) return pass("dependabot", "Dependency updates", `${c} configured`);
      }
      return warn("dependabot", "Dependency updates", "No Dependabot or Renovate config — dependency updates not automated");
    },
  },
  {
    id: "ci-workflow",
    name: "CI workflow present",
    category: "CI / DevOps",
    severity: "MEDIUM",
    why:
      "Without CI, a broken build or failing tests can land in main without anyone noticing. The first time you find out is when production breaks.",
    fix:
      "Add `.github/workflows/ci.yml` running at minimum `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm build`, `pnpm test` on push/PR.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const exists = await pathExists(octo, owner, repo, ".github/workflows");
      if (!exists) return warn("ci-workflow", "CI workflow", "No .github/workflows folder — no automated CI detected");
      // Try to confirm there's at least one .yml inside
      const files = await getFileTree(octo, owner, repo);
      const ymls = files.filter((p) => p.startsWith(".github/workflows/") && /\.ya?ml$/.test(p));
      if (ymls.length === 0) return warn("ci-workflow", "CI workflow", ".github/workflows folder is empty");
      return pass("ci-workflow", "CI workflow", `${ymls.length} workflow(s) configured`);
    },
  },
  {
    id: "ci-pinned-actions",
    name: "GitHub Actions pinned by SHA (not @vN)",
    category: "CI / DevOps",
    severity: "MEDIUM",
    why:
      "`uses: actions/checkout@v4` follows a mutable tag — a maintainer (or attacker who compromises the maintainer) can rewrite v4 to point at malicious code that runs with your repo's secrets.",
    fix:
      "Pin by 40-char SHA: `uses: actions/checkout@b4ffde65f...`. Dependabot can update the SHA + comment with the version.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const files = await getFileTree(octo, owner, repo);
      const ymls = files.filter((p) => p.startsWith(".github/workflows/") && /\.ya?ml$/.test(p));
      if (ymls.length === 0) return warn("ci-pinned-actions", "Actions SHA pinning", "No workflow files");
      let totalUses = 0;
      let pinnedBySha = 0;
      for (const yml of ymls) {
        const content = await safeGetContent(octo, owner, repo, yml);
        if (!content) continue;
        const usesMatches = content.match(/uses:\s*[^\s@]+@\S+/g) ?? [];
        for (const u of usesMatches) {
          totalUses++;
          if (/@[a-f0-9]{40}/.test(u)) pinnedBySha++;
        }
      }
      if (totalUses === 0) return pass("ci-pinned-actions", "Actions SHA pinning", "No external actions used");
      const pct = Math.round((pinnedBySha / totalUses) * 100);
      if (pct === 100) return pass("ci-pinned-actions", "Actions SHA pinning", `All ${totalUses} actions pinned by SHA`);
      if (pct >= 50) return warn("ci-pinned-actions", "Actions SHA pinning", `${pinnedBySha}/${totalUses} (${pct}%) actions pinned by SHA — pin the rest`);
      return fail("ci-pinned-actions", "Actions SHA pinning", `Only ${pinnedBySha}/${totalUses} (${pct}%) actions pinned by SHA — supply-chain risk`);
    },
  },
  {
    id: "security-md",
    name: "SECURITY.md disclosure policy",
    category: "CI / DevOps",
    severity: "LOW",
    why:
      "Without a SECURITY.md, researchers who find bugs have no clear channel — they either disclose publicly (zero-day) or move on. SECURITY.md keeps reports private and actionable.",
    fix:
      "Add `SECURITY.md` at repo root or in `.github/`. Include: supported versions, how to report (email/HackerOne), expected response time, scope.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const candidates = ["SECURITY.md", ".github/SECURITY.md", "docs/SECURITY.md"];
      for (const c of candidates) {
        const f = await safeGetContent(octo, owner, repo, c);
        if (f !== null) return pass("security-md", "SECURITY.md", `${c} present`);
      }
      return warn("security-md", "SECURITY.md", "No SECURITY.md — no clear vulnerability reporting channel");
    },
  },
];
