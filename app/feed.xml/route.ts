import { loadPromises, loadIncidents } from "@/lib/content"

export const dynamic = "force-static"

const SITE = "https://tsgov.in"
const TITLE = "TSGOV Accountability Tracker"
const DESC = "Non-partisan archive tracking Telangana government promises and governance incidents."

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function GET() {
  const [promises, incidents] = await Promise.all([loadPromises(), loadIncidents()])

  const promiseItems = promises.map(p => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/promises/${p.slug}</link>
      <guid>${SITE}/promises/${p.slug}</guid>
      <description>${esc(p.summary)}</description>
      <category>${esc(p.category)}</category>
      <pubDate>${new Date(p.announced_date).toUTCString()}</pubDate>
    </item>`).join("")

  const incidentItems = incidents.map(i => `
    <item>
      <title>${esc(i.title)}</title>
      <link>${SITE}/incidents/${i.slug}</link>
      <guid>${SITE}/incidents/${i.slug}</guid>
      <description>${esc(i.district)} — ${esc(i.category)}</description>
      <category>${esc(i.category)}</category>
      <pubDate>${new Date(i.date).toUTCString()}</pubDate>
    </item>`).join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(TITLE)}</title>
    <link>${SITE}</link>
    <description>${esc(DESC)}</description>
    <language>en-in</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${promiseItems}
    ${incidentItems}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
