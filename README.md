# nextcheck

[![Live](https://img.shields.io/badge/live-nextcheck--six.vercel.app-10b981?style=flat-square)](https://nextcheck-six.vercel.app)
[![CI](https://github.com/kvragg/nextcheck/actions/workflows/ci.yml/badge.svg)](https://github.com/kvragg/nextcheck/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-D97757?style=flat-square)](https://claude.com/claude-code)

**Live: https://nextcheck-six.vercel.app**

Free security audit for public Next.js + Supabase repositories. Paste a GitHub URL, get a 0–100 score, ten production-grade checks, and a downloadable PDF — in under 30 seconds.

Built end-to-end via AI orchestration. [About →](https://nextcheck-six.vercel.app/about)

---

## What it checks

| # | Category | Check |
|---|---|---|
| 1 | Next.js | `Content-Security-Policy` header in `next.config` |
| 2 | Next.js | `Strict-Transport-Security` header in `next.config` |
| 3 | Next.js | `.env*` files in `.gitignore` |
| 4 | Next.js | No `console.log` left in `app/` source |
| 5 | React | No raw `dangerouslySetInnerHTML` usage |
| 6 | Supabase | RLS enabled in migrations (`ENABLE ROW LEVEL SECURITY`) |
| 7 | Supabase | `SECURITY DEFINER` functions with proper `REVOKE EXECUTE` |
| 8 | General | Dependabot configured (`.github/dependabot.yml`) |
| 9 | General | CI workflow present (`.github/workflows/`) |
| 10 | General | No wildcard versions (`"*"` / `"latest"`) in `package.json` |

Each check returns **PASS / WARN / FAIL** with an explanation. The overall score is weighted (PASS=10, WARN=5, FAIL=0) and normalized to 100.

---

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- Octokit (GitHub REST + git tree API — works without a token for public repos)
- `@react-pdf/renderer` for downloadable PDF reports
- Geist (font), Lucide (icons), Framer Motion (kept minimal)
- Deploy: Vercel (edge runtime for OG image)

---

## Local development

```bash
git clone https://github.com/kvragg/nextcheck.git
cd nextcheck
pnpm install
cp .env.example .env.local
# Optional: add GITHUB_TOKEN with `public_repo` scope for higher rate limits
pnpm dev
```

Open http://localhost:3000, paste a Next.js repo URL, see the results.

---

## Why this exists

I spent 14 years inside the Brazilian financial services sector — credit analysis, agribusiness lending, regulatory compliance. I&apos;ve watched reconciliation fail at 3am, webhooks fire twice, audit trails disappear the day before the regulator shows up. Production security isn&apos;t theatre.

This is the same set of checks I run against my own SaaS work, exposed for free. If your repo shows FAIL items, [I can help fix them](https://github.com/kvragg).

---

## License

MIT — see [LICENSE](LICENSE).

---

Built by [Paul Costa](https://github.com/kvragg). Next.js + Supabase + AI Orchestration for SaaS founders.
