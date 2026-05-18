import type { ScoreBreakdown } from "@/lib/score";
import { scoreColor } from "@/lib/score";

export function ScoreCard({ score, repo }: { score: ScoreBreakdown; repo: string }) {
  return (
    <div className="rounded-xl border border-line-strong bg-card p-5 sm:p-6 mb-6">
      <div className="flex items-start justify-between gap-6 mb-5">
        <div className="min-w-0">
          <div className="mono text-[10.5px] text-muted uppercase tracking-[0.18em] mb-1.5">
            Repository
          </div>
          <div className="mono text-sm break-all">{repo}</div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-5xl sm:text-6xl font-bold leading-none tabular-nums ${scoreColor(score.score)}`}>
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

      {/* Status totals */}
      <div className="grid grid-cols-4 gap-2 text-center mb-5">
        <Stat label="Pass" value={score.pass} cls="text-green" />
        <Stat label="Warn" value={score.warn} cls="text-warn" />
        <Stat label="Fail" value={score.fail} cls="text-fail" />
        <Stat label="Skip" value={score.skip} cls="text-muted" />
      </div>

      {/* By category mini-scores */}
      <div className="border-t border-line pt-4">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted mb-3">
          By category
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {score.byCategory.map((c) => (
            <div key={c.category} className="flex items-center gap-3 p-2 rounded bg-bg">
              <div className={`text-base font-bold tabular-nums w-9 text-right ${scoreColor(c.score)}`}>
                {c.score}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{c.category}</div>
                <div className="mono text-[10px] text-muted">{c.results.length} check{c.results.length !== 1 && "s"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className="rounded-md border border-line bg-bg py-3">
      <div className={`text-xl sm:text-2xl font-bold tabular-nums ${cls}`}>{value}</div>
      <div className="mono text-[10px] text-muted uppercase tracking-[0.16em] mt-0.5">
        {label}
      </div>
    </div>
  );
}
