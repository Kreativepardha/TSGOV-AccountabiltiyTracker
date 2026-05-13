import Link from "next/link"
import { ArrowRight, Shield, FileCheck, AlertTriangle } from "lucide-react"
import { loadPromises, loadIncidents } from "@/lib/content"
import { IncidentCard } from "@/components/IncidentCard"

export default async function HomePage() {
  const [promises, incidents] = await Promise.all([loadPromises(), loadIncidents()])

  const recentIncidents = incidents.slice(0, 3)
  const recentUpdates = promises
    .flatMap(p =>
      p.updates.map(u => ({ ...u, promiseTitle: p.title, slug: p.slug }))
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  const stats = [
    { label: "Promises tracked", value: promises.length, icon: FileCheck, color: "text-blue-600" },
    {
      label: "Fulfilled",
      value: promises.filter(p => p.current_status === "Fulfilled").length,
      icon: Shield,
      color: "text-emerald-600",
    },
    {
      label: "Delayed / Abandoned",
      value: promises.filter(p =>
        ["Delayed", "Abandoned"].includes(p.current_status)
      ).length,
      icon: AlertTriangle,
      color: "text-amber-600",
    },
    {
      label: "Incidents documented",
      value: incidents.length,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-14">
      {/* Hero */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
          Non-partisan · Source-first · Evidence-graded
        </div>
        <h1 className="text-4xl font-bold tracking-tight leading-tight">
          TSGOV Accountability Tracker
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A public archive tracking Telangana government promises, actions, and governance
          outcomes. Every claim is sourced, graded, and open to correction.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            href="/promises"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View all promises <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/incidents"
            className="inline-flex items-center gap-2 border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            View incidents
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-lg border p-4 space-y-2">
              <Icon className={`h-5 w-5 ${s.color}`} />
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </section>

      {/* Recent Incidents */}
      {recentIncidents.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Incidents</h2>
            <Link href="/incidents" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          {recentIncidents.map(i => (
            <IncidentCard key={i.slug} incident={i} />
          ))}
        </section>
      )}

      {/* Recent Promise Updates */}
      {recentUpdates.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Promise Updates</h2>
            <Link href="/timeline" className="text-sm text-blue-600 hover:underline">
              Full timeline →
            </Link>
          </div>
          {recentUpdates.map((u, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground font-mono">{u.date}</p>
              <Link
                href={`/promises/${u.slug}`}
                className="font-medium text-sm hover:underline block"
              >
                {u.promiseTitle}
              </Link>
              <p className="text-sm text-muted-foreground">{u.note}</p>
            </div>
          ))}
        </section>
      )}

      {/* Evidence Grade explainer */}
      <section className="space-y-4 border rounded-lg p-6">
        <h2 className="text-xl font-semibold">How we grade evidence</h2>
        <p className="text-sm text-muted-foreground">
          Every entry carries one of these grades. Lower grades don&apos;t mean a story
          is false — they mean less evidence is available for independent verification.
        </p>
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-6 font-medium">Grade</th>
                <th className="text-left py-2 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Official Record", "Government orders, gazette notifications, RTI responses"],
                ["Primary Evidence", "Official government social media, press releases"],
                ["Multiple Sources", "Three or more independent credible outlets"],
                ["Single Source", "One credible outlet or verified journalist"],
                ["Allegation", "Unverified claims — reported as allegation, not established fact"],
              ].map(([grade, meaning]) => (
                <tr key={grade} className="border-b last:border-0">
                  <td className="py-2 pr-6 font-medium whitespace-nowrap">{grade}</td>
                  <td className="py-2 text-muted-foreground">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
