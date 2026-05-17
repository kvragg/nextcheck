import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const SITE_URL = "https://nextcheck-six.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "nextcheck — Security audit for Next.js + Supabase repos",
    template: "%s · nextcheck",
  },
  description:
    "Paste a public GitHub URL of a Next.js repo. Get 10 production-grade security checks in 30 seconds — CSP, HSTS, RLS, SECURITY DEFINER, console.log leaks, dangerouslySetInnerHTML, dependency pinning, CI, Dependabot. PDF report included.",
  keywords: [
    "Next.js security audit",
    "Supabase RLS check",
    "SaaS security scanner",
    "fintech engineering",
    "AI orchestration",
  ],
  authors: [{ name: "Paul Costa", url: "https://github.com/kvragg" }],
  creator: "Paul Costa",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "nextcheck — Security audit for Next.js + Supabase repos",
    description:
      "10 production-grade checks in 30 seconds. CSP, HSTS, RLS, SECURITY DEFINER, console.log leaks, more. Built by an AI Orchestrator.",
    siteName: "nextcheck",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "nextcheck — Security audit for Next.js + Supabase repos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "nextcheck — Security audit for Next.js + Supabase repos",
    description:
      "10 production-grade checks in 30 seconds. CSP, HSTS, RLS, more. PDF included.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
