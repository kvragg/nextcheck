# nextcheck

**Live: https://nextcheck-six.vercel.app**

Security audit tool for public Next.js GitHub repos. Paste a URL, get 10 checks + a PDF report.

## What it checks

| # | Category | Check |
|---|---|---|
| 1 | Next.js | CSP headers in `next.config` |
| 2 | Next.js | HSTS header in `next.config` |
| 3 | Next.js | `.env` files in `.gitignore` |
| 4 | Next.js | No `console.log` in production code |
| 5 | Next.js | No raw `dangerouslySetInnerHTML` |
| 6 | Supabase | RLS enabled in migrations |
| 7 | Supabase | `SECURITY DEFINER` with `REVOKE` |
| 8 | General | Dependabot configured |
| 9 | General | CI workflow present |
| 10 | General | No wildcard versions in `package.json` |

## Stack

- Next.js 15 (App Router)
- TypeScript, Tailwind CSS
- Octokit (GitHub REST API)
- `@react-pdf/renderer` for PDF generation
- Supabase (audit history)
- Deploy: Vercel

## Local setup

```bash
pnpm install
cp .env.example .env.local
# Fill in:
#   GITHUB_TOKEN (public_repo scope is enough)
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
pnpm dev
```

Open `http://localhost:3000`, paste a Next.js repo URL, get results.

## Why this exists

I build production-grade web SaaS with Next.js + Supabase + AI-pair-programming workflows. This tool runs the same security checks I apply to my own builds — exposed for free so anyone can audit their Next.js project in 60 seconds.

If your repo shows `FAIL` items, I can help fix them. See [my Upwork profile](#).
