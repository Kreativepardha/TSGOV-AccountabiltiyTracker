import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Public API",
  description: "Free public JSON API for TSGOV promise and incident data.",
}

export default function ApiDocsPage() {
  const BASE = "https://tsgov.in"
  const endpoints = [
    { method: "GET", path: "/api/promises", desc: "All tracked promises with full metadata, sources, updates, and scores." },
    { method: "GET", path: "/api/incidents", desc: "All documented governance incidents with full metadata and sources." },
    { method: "GET", path: "/feed.xml", desc: "RSS feed of promises and incidents. Subscribe in any RSS reader." },
  ]

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">← Home</Link>
        <h1 className="text-2xl font-bold mt-2">Public API</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Free, open, no API key required. Data licensed CC-BY-4.0.
          Please credit TSGOV Accountability Tracker and link back.
        </p>
      </div>

      <div className="space-y-4">
        {endpoints.map(ep => (
          <div key={ep.path} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {ep.method}
              </span>
              <code className="text-sm font-mono">{BASE}{ep.path}</code>
            </div>
            <p className="text-sm text-muted-foreground">{ep.desc}</p>
            <a
              href={ep.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Try it →
            </a>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Example — fetch all promises</h2>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">{`fetch("${BASE}/api/promises")
  .then(r => r.json())
  .then(data => {
    console.log(data.meta.count, "promises")
    data.data.forEach(p => {
      console.log(p.title, p.current_status)
    })
  })`}</pre>
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">Rate limits</h2>
        <p>No rate limit — data is static and served via CDN. Please cache responses on your end (max-age: 1 hour).</p>
        <h2 className="font-semibold text-foreground mt-4">License</h2>
        <p>
          Data is published under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline" target="_blank" rel="noopener noreferrer">
            CC-BY-4.0
          </a>. Commercial use permitted with attribution.
        </p>
      </section>
    </main>
  )
}
