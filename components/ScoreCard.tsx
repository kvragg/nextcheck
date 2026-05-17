import type { ScoreBreakdown } from "@/lib/score";
import { scoreColor } from "@/lib/score";

export function ScoreCard({ score, repo }: { score: ScoreBreakdown; repo: string }) {
  return (
    <div className="rounded-xl border border-line-strong bg-card p-6 mb-6">
      <div className="flex items-start justify-between gap-6 mb-5">
        <div>
          <div className="mono text-[10.5px] text-muted uppercase tracking-[0.18em] mb-1.5">
            Repository
          </div>
          <div className="mono text-sm break-all">{repo}</div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-5xl font-bold leading-none tabular-nums ${scoreColor(score.score)}`}>
            {score.score}
          </div>
          <div className="mono text-[10.5px] text-muted mt-1.5">
            GRADE <span className="text-ink font-bold">{score.grade}</span>
          </div>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-line overflow-hidden mb-5">
        <div
          className="h-full score-bar transition-all duration-700 ease-out"
          style={{ width: `${score.score}%` }}
        />
      </div>

      <p className="text-sm text-ink-2 mb-5">{score.verdict}</p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Pass" value={score.pass} cls="text-pass" />
        <Stat label="Warn" value={score.warn} cls="text-warn" />
        <Stat label="Fail" value={score.fail} cls="text-fail" />
      </div>
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className="rounded-md border border-line bg-bg py-3">
      <div className={`text-2xl font-bold tabular-nums ${cls}`}>{value}</div>
      <div className="mono text-[10px] text-muted uppercase tracking-[0.16em] mt-0.5">
        {label}
      </div>
    </div>
  );
}
