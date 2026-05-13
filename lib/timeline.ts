import { loadPromises, loadIncidents } from "./content"

export type TimelineEvent = {
  date: string
  type: "promise_update" | "incident" | "promise_announced"
  title: string
  slug: string
  href: string
  category: string
  note?: string
}

export async function buildTimeline(): Promise<TimelineEvent[]> {
  const [promises, incidents] = await Promise.all([loadPromises(), loadIncidents()])
  const events: TimelineEvent[] = []

  for (const p of promises) {
    events.push({
      date: p.announced_date,
      type: "promise_announced",
      title: `Promise: ${p.title}`,
      slug: p.slug,
      href: `/promises/${p.slug}`,
      category: p.category,
    })
    for (const u of p.updates) {
      events.push({
        date: u.date,
        type: "promise_update",
        title: p.title,
        slug: p.slug,
        href: `/promises/${p.slug}`,
        category: p.category,
        note: u.note,
      })
    }
  }

  for (const i of incidents) {
    events.push({
      date: i.date,
      type: "incident",
      title: i.title,
      slug: i.slug,
      href: `/incidents/${i.slug}`,
      category: i.category,
    })
  }

  return events.sort((a, b) => b.date.localeCompare(a.date))
}
