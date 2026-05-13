"use client"

import { useState } from "react"

type Discovery = {
  id: string
  title: string
  body_text: string | null
  url: string
  outlet: string | null
  source_type: string | null
  date: string | null
  discovery_source: string
  suggested_category: string | null
  suggested_evidence_grade: string | null
  suggested_type: string | null
  status: string
  created_at: Date
}

type Action = "approved" | "rejected"

export function DiscoveryQueue({ items }: { items: Discovery[] }) {
  const [queue, setQueue] = useState(items)
  const [loading, setLoading] = useState<string | null>(null)

  async function act(id: string, status: Action) {
    setLoading(id)
    await fetch(`/api/admin/discoveries?id=${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "",
      },
      body: JSON.stringify({ status }),
    })
    setQueue(q => q.filter(i => i.id !== id))
    setLoading(null)
  }

  if (queue.length === 0) {
    return <p className="text-sm text-muted-foreground">All items reviewed.</p>
  }

  return (
    <div className="space-y-3">
      {queue.map(item => (
        <div key={item.id} className="border rounded-lg bg-white p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-snug">{item.title}</p>
              <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                <span className="bg-gray-100 px-2 py-0.5 rounded">{item.discovery_source}</span>
                {item.suggested_type && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{item.suggested_type}</span>
                )}
                {item.suggested_category && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{item.suggested_category}</span>
                )}
                {item.suggested_evidence_grade && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">{item.suggested_evidence_grade}</span>
                )}
                {item.outlet && <span>{item.outlet}</span>}
                {item.date && <span>{item.date}</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Read
              </a>
            </div>
          </div>

          {item.body_text && (
            <p className="text-xs text-muted-foreground line-clamp-3 bg-gray-50 rounded p-2">
              {item.body_text}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => act(item.id, "approved")}
              disabled={loading === item.id}
              className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              Approve as Promise
            </button>
            <button
              onClick={() => act(item.id, "approved")}
              disabled={loading === item.id}
              className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              Approve as Incident
            </button>
            <button
              onClick={() => act(item.id, "rejected")}
              disabled={loading === item.id}
              className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
