import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { CheckResult } from "@/lib/checks/types";

const STATUS_META = {
  PASS: {
    Icon: CheckCircle2,
    color: "text-pass",
    bg: "bg-pass/10",
    border: "border-pass/30",
    label: "Pass",
  },
  WARN: {
    Icon: AlertTriangle,
    color: "text-warn",
    bg: "bg-warn/10",
    border: "border-warn/30",
    label: "Warn",
  },
  FAIL: {
    Icon: XCircle,
    color: "text-fail",
    bg: "bg-fail/10",
    border: "border-fail/30",
    label: "Fail",
  },
} as const;

export function CheckRow({ check, index }: { check: CheckResult; index: number }) {
  const meta = STATUS_META[check.status];
  const Icon = meta.Icon;

  return (
    <div
      className={`rounded border ${meta.border} ${meta.bg} p-4 flex items-start gap-3 animate-slide-up`}
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: "backwards" }}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${meta.color}`} aria-hidden />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="font-medium">{check.name}</div>
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider ${meta.color}`}
          >
            {meta.label}
          </span>
        </div>
        <div className="text-sm text-muted">{check.message}</div>
      </div>
    </div>
  );
}
