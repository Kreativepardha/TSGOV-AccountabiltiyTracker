import type { Metadata } from "next"
import Link from "next/link"
import { loadPromises } from "@/lib/content"
import { StatusBadge } from "@/components/StatusBadge"
import type { GovernmentPromise } from "@/lib/schemas"

export const metadata: Metadata = {
  title: "Deadline Calendar — Promise Deadlines",
  description: "Visual calendar of all Telangana government promise deadlines, grouped by month.",
}

function monthLabel(isoDate: string): string {
  const [year, month] = isoDate.split("-")
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleString("en-IN", { month: "long", year: "numeric" })
}

export default async function CalendarPage() {
  const promises = await loadPromises()

  const withDeadline = promises.filter(p => p.deadline_date)
  const noDeadline = promises.filter(p => !p.deadline_date)

  const grouped = withDeadline.reduce<Record<string, GovernmentPromise[]>>((acc, p) => {
    const key = p.deadline_date!.slice(0, 7)
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  const sortedKeys = Object.keys(grouped).sort()
  const now = new Date().toISOString().slice(0, 7)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">← Home</Link>
        <h1 className="text-2xl font-bold mt-2">Deadline Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Promise deadlines grouped by month. Past deadlines are shown as missed or met.
        </p>
      </div>

      {sortedKeys.length === 0 && (
        <p className="text-muted-foreground text-sm">No machine-readable deadlines recorded yet.</p>
      )}

      <div className="space-y-8">
        {sortedKeys.map(monthKey => {
          const isPast = monthKey < now
          const isCurrent = monthKey === now
          return (
            <section key={monthKey} className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{monthLabel(monthKey)}</h2>
                {isCurrent && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    This month
                  </span>
                )}
                {isPast && !isCurrent && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    Past
                  </span>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {grouped[monthKey].map(p => (
                  <Link
                    key={p.slug}
                    href={`/promises/${p.slug}`}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors space-y-2 block"
                  >
                    <p className="font-medium text-sm leading-snug">{p.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={p.current_status} />
                      {p.ministry && (
                        <span className="text-xs text-muted-foreground">{p.ministry}</span>
                      )}
                    </div>
                    {p.deadline && (
                      <p className="text-xs text-muted-foreground italic">{p.deadline}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {noDeadline.length > 0 && (
        <section className="space-y-3 border-t pt-6">
          <h2 className="text-base font-semibold text-muted-foreground">No fixed deadline</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {noDeadline.map(p => (
              <Link
                key={p.slug}
                href={`/promises/${p.slug}`}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors space-y-1 block"
              >
                <p className="text-sm font-medium leading-snug">{p.title}</p>
                <StatusBadge status={p.current_status} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
