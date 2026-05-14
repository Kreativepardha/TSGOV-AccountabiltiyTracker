import type { AssetDeclaration } from "@/lib/schemas"

function formatInr(n: number): string {
  if (!n) return "—"
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} lakh`
  return `₹${n.toLocaleString("en-IN")}`
}

export function AssetsBarChart({
  declarations,
}: {
  declarations: AssetDeclaration[]
}) {
  if (declarations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No asset declarations on record.
      </p>
    )
  }

  const sorted = [...declarations].sort((a, b) => a.year.localeCompare(b.year))
  const max = Math.max(
    ...sorted.map(d => d.total_assets_inr ?? 0),
    1
  )

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {sorted.map(d => {
          const total = d.total_assets_inr ?? 0
          const movable = d.movable_inr ?? 0
          const immovable = d.immovable_inr ?? 0
          const totalPct = (total / max) * 100
          const movablePct = total > 0 ? (movable / total) * 100 : 0
          const immovablePct = total > 0 ? (immovable / total) * 100 : 0

          return (
            <div key={d.year} className="space-y-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono font-medium">
                  {d.year}
                  {d.election_type && (
                    <span className="text-muted-foreground ml-2">
                      ({d.election_type})
                    </span>
                  )}
                </span>
                <span className="font-mono font-semibold">
                  {formatInr(total)}
                </span>
              </div>
              <div
                className="h-6 bg-gray-100 rounded overflow-hidden"
                style={{ width: `${Math.max(totalPct, 2)}%` }}
                title={`${formatInr(total)} total`}
              >
                <div className="h-full flex">
                  {immovablePct > 0 && (
                    <div
                      className="h-full bg-sky-500"
                      style={{ width: `${immovablePct}%` }}
                      title={`Immovable: ${formatInr(immovable)}`}
                    />
                  )}
                  {movablePct > 0 && (
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${movablePct}%` }}
                      title={`Movable: ${formatInr(movable)}`}
                    />
                  )}
                </div>
              </div>
              {d.liabilities_inr ? (
                <p className="text-xs text-muted-foreground">
                  Liabilities: {formatInr(d.liabilities_inr)}
                </p>
              ) : null}
              {d.source_url && (
                <a
                  href={d.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline"
                >
                  Source
                </a>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 bg-sky-500 rounded-sm" />
          Immovable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 bg-emerald-500 rounded-sm" />
          Movable
        </span>
      </div>
      <p className="text-xs italic text-muted-foreground">
        Approximate per ADR public records. Bars scaled relative to the highest
        declared total.
      </p>
    </div>
  )
}
