import type { ScoreBreakdown } from "@/lib/score";
import { scoreColor } from "@/lib/score";

export function ScoreCard({ score, repo }: { score: ScoreBreakdown; repo: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 mb-6 animate-slide-up">
      <div className="flex items-start justify-between gap-6 mb-5">
        <div>
          <div className="text-xs text-muted font-mono uppercase tracking-wider mb-1">
            Repository
          </div>
          <div className="font-mono text-sm break-all">{repo}</div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-5xl font-bold leading-none ${scoreColor(score.score)}`}>
            {score.score}
          </div>
          <div className="text-xs text-muted font-mono mt-1">
            GRADE <span className="text-foreground font-bold">{score.grade}</span>
          </div>
        </div>
      </div>

      <div className="h-2 rounded-full bg-border overflow-hidden mb-4 relative">
        <div
          className="h-full score-bar transition-all duration-700 ease-out"
          style={{ width: `${score.score}%` }}
        />
      </div>

      <p className="text-sm text-muted mb-5">{score.verdict}</p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded border border-border bg-background py-3">
          <div className="text-2xl font-bold text-pass">{score.pass}</div>
          <div className="text-[10px] text-muted font-mono uppercase tracking-wider mt-0.5">
            Pass
          </div>
        </div>
        <div className="rounded border border-border bg-background py-3">
          <div className="text-2xl font-bold text-warn">{score.warn}</div>
          <div className="text-[10px] text-muted font-mono uppercase tracking-wider mt-0.5">
            Warn
          </div>
        </div>
        <div className="rounded border border-border bg-background py-3">
          <div className="text-2xl font-bold text-fail">{score.fail}</div>
          <div className="text-[10px] text-muted font-mono uppercase tracking-wider mt-0.5">
            Fail
          </div>
        </div>
      </div>
    </div>
  );
}
