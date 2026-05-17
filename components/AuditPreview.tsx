"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

type Line = {
  status: "PASS" | "WARN" | "FAIL";
  name: string;
};

const LINES: Line[] = [
  { status: "PASS", name: "CSP headers" },
  { status: "WARN", name: "HSTS header" },
  { status: "PASS", name: ".env in .gitignore" },
  { status: "PASS", name: "console.log scan" },
  { status: "PASS", name: "dangerouslySetInnerHTML" },
  { status: "FAIL", name: "RLS in migrations" },
  { status: "WARN", name: "SECURITY DEFINER + REVOKE" },
  { status: "PASS", name: "Dependabot configured" },
  { status: "PASS", name: "CI workflow" },
  { status: "PASS", name: "No wildcard versions" },
];

const ICON = {
  PASS: { Icon: CheckCircle2, cls: "text-green" },
  WARN: { Icon: AlertTriangle, cls: "text-warn" },
  FAIL: { Icon: XCircle, cls: "text-fail" },
} as const;

export function AuditPreview() {
  const [visible, setVisible] = useState(0);
  const score =
    LINES.slice(0, visible).reduce(
      (acc, l) => acc + (l.status === "PASS" ? 10 : l.status === "WARN" ? 5 : 0),
      0
    ) / Math.max(LINES.length, 1) * 10;
  const scoreInt = Math.round(score);
  const done = visible >= LINES.length;

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i++;
      if (i > LINES.length + 4) {
        i = 0;
        setVisible(0);
        return;
      }
      setVisible(Math.min(i, LINES.length));
    };
    const iv = setInterval(tick, 600);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      className="rounded-xl bg-bg-2 border border-line overflow-hidden"
      style={{ boxShadow: "0 30px 80px rgba(0, 0, 0, 0.4)" }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-line"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0) 100%)",
        }}
      >
        <div className="flex gap-1.5">
          {["#e85d4a", "#e7b844", "#5cbd95"].map((c) => (
            <div
              key={c}
              className="w-2.5 h-2.5 rounded-full opacity-80"
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="mono text-[10.5px] tracking-[0.12em] uppercase text-muted">
          nextcheck · /vercel/next.js
        </div>
        <div className="mono text-[10.5px] text-green flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot"
            style={{ boxShadow: "0 0 8px var(--green)" }}
          />
          live
        </div>
      </div>

      {/* Score row */}
      <div className="px-5 py-4 border-b border-line">
        <div className="flex items-center justify-between mb-2">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted">
            score
          </div>
          <div className="text-3xl font-bold tabular-nums">
            <span
              className={
                scoreInt >= 75 ? "text-green" : scoreInt >= 40 ? "text-warn" : "text-fail"
              }
            >
              {scoreInt}
            </span>
            <span className="text-muted text-base font-normal">/100</span>
          </div>
        </div>
        <div className="h-1 rounded-full bg-line overflow-hidden">
          <div
            className="h-full score-bar transition-all duration-500 ease-out"
            style={{ width: `${scoreInt}%` }}
          />
        </div>
      </div>

      {/* Lines */}
      <div className="px-2 py-2 min-h-[368px]">
        {LINES.slice(0, visible).map((l, i) => {
          const meta = ICON[l.status];
          const Icon = meta.Icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2 rounded animate-fade-up"
            >
              <Icon className={`w-4 h-4 shrink-0 ${meta.cls}`} aria-hidden />
              <div className="flex-1 text-sm">{l.name}</div>
              <span
                className={`mono text-[10px] font-bold tracking-wider ${meta.cls}`}
              >
                {l.status}
              </span>
            </div>
          );
        })}
        {!done &&
          Array.from({ length: Math.max(0, 6 - visible) }).map((_, i) => (
            <div key={`s-${i}`} className="px-3 py-2 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full shimmer" />
              <div className="h-3 rounded shimmer flex-1" />
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-line bg-black/30">
        <div className="mono text-[10.5px] text-muted">
          {visible}/{LINES.length} checks
        </div>
        <div className="mono text-[10.5px] text-muted">PDF ready · 1.2 KB</div>
      </div>
    </div>
  );
}
