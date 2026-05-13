import type { PromiseScore } from "@/lib/content"

function ScoreRing({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color =
    score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444"

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="rotate-[-90deg]">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={r} fill="none"
        stroke={color} strokeWidth="12"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  )
}

export function ScoreCard({ score }: { score: PromiseScore }) {
  const color =
    score.overall >= 70
      ? "text-emerald-600"
      : score.overall >= 45
      ? "text-amber-600"
      : "text-red-600"

  const label =
    score.overall >= 70 ? "Good" : score.overall >= 45 ? "Moderate" : "Poor"

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Government Delivery Score</h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-shrink-0">
          <ScoreRing score={score.overall} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${color}`}>{score.overall}</span>
            <span className={`text-xs font-medium ${color}`}>{label}</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
          <Stat
            label="Fulfilled"
            value={score.fulfilled}
            total={score.total}
            color="bg-emerald-100 text-emerald-700"
          />
          <Stat
            label="On Track"
            value={score.onTrack}
            total={score.total}
            color="bg-blue-100 text-blue-700"
          />
          <Stat
            label="Concerning"
            value={score.concerning}
            total={score.total}
            color="bg-red-100 text-red-700"
          />
          <Stat
            label="Total tracked"
            value={score.total}
            total={score.total}
            color="bg-gray-100 text-gray-700"
          />
        </div>
      </div>

      {Object.keys(score.byMinistry).length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Score by Ministry</p>
          <div className="space-y-1">
            {Object.entries(score.byMinistry)
              .sort((a, b) => b[1].score - a[1].score)
              .map(([ministry, data]) => (
                <MinistryRow key={ministry} ministry={ministry} score={data.score} count={data.count} />
              ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Score 0–100: Fulfilled=100, Partially Fulfilled=60, In Progress=40, Delayed=20, Abandoned/Contradicted=0
      </p>
    </div>
  )
}

function Stat({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className={`rounded-lg px-3 py-2 ${color}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-xs opacity-70">{pct}%</p>
    </div>
  )
}

function MinistryRow({ ministry, score, count }: { ministry: string; score: number; count: number }) {
  const color = score >= 70 ? "bg-emerald-400" : score >= 45 ? "bg-amber-400" : "bg-red-400"
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-36 truncate text-muted-foreground">{ministry}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="font-medium w-6 text-right">{score}</span>
      <span className="text-muted-foreground w-12">({count} item{count !== 1 ? "s" : ""})</span>
    </div>
  )
}
