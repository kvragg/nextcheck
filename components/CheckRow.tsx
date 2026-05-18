"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, ChevronDown } from "lucide-react";
import type { CheckResult } from "@/lib/checks/types";
import { severityColor } from "@/lib/score";

const STATUS_META = {
  PASS: { Icon: CheckCircle2, cls: "text-green" },
  WARN: { Icon: AlertTriangle, cls: "text-warn" },
  FAIL: { Icon: XCircle, cls: "text-fail" },
  SKIP: { Icon: MinusCircle, cls: "text-muted" },
} as const;

export function CheckRow({ check, index }: { check: CheckResult; index: number }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[check.status];
  const Icon = meta.Icon;
  const hasDetails = !!(check.why || check.fix);

  return (
    <div
      className="rounded-md border border-line bg-card transition-colors animate-fade-up"
      style={{ animationDelay: `${index * 25}ms`, animationFillMode: "backwards" }}
    >
      <button
        type="button"
        onClick={() => hasDetails && setOpen((v) => !v)}
        className={`w-full text-left p-4 flex items-start gap-3 ${hasDetails ? "cursor-pointer hover:bg-bg-2" : "cursor-default"}`}
        aria-expanded={open}
      >
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${meta.cls}`} aria-hidden />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-sm sm:text-[15px]">{check.name}</span>
            <span
              className={`mono text-[9.5px] tracking-wider uppercase px-1.5 py-0.5 rounded border ${severityColor(check.severity)}`}
            >
              {check.severity}
            </span>
          </div>
          <div className="text-sm text-muted">{check.message}</div>
        </div>
        {hasDetails && (
          <ChevronDown
            className={`w-4 h-4 shrink-0 mt-1 text-muted transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        )}
      </button>

      {open && hasDetails && (
        <div className="px-4 pb-4 pt-1 border-t border-line space-y-3 animate-fade-up">
          {check.why && (
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted mb-1.5">
                Why it matters
              </div>
              <p className="text-sm text-ink-2 leading-relaxed">{check.why}</p>
            </div>
          )}
          {check.fix && (
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted mb-1.5">
                How to fix
              </div>
              <p className="text-sm text-ink-2 leading-relaxed">{check.fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
