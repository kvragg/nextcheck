import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nextcheck — Security audit for Next.js repos",
  description: "Paste a public GitHub URL, get 10 security checks + PDF report. Built for Next.js + Supabase SaaS.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
