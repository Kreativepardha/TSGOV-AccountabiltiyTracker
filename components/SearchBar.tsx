"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type SearchDoc = {
  id: string
  type: "promise" | "incident"
  title: string
  body: string
  href: string
  category: string
}

export function SearchBar() {
  const docsRef = useRef<SearchDoc[]>([])
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchDoc[]>([])
  const [loaded, setLoaded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch("/search-index.json")
      .then(r => r.json())
      .then((docs: SearchDoc[]) => {
        docsRef.current = docs
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return }
    const lower = q.toLowerCase()
    const found = docsRef.current
      .filter(
        d =>
          d.title.toLowerCase().includes(lower) ||
          d.body.toLowerCase().includes(lower) ||
          d.category.toLowerCase().includes(lower)
      )
      .slice(0, 10)
    setResults(found)
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(value), 200)
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search promises, incidents..."
        value={query}
        onChange={e => handleChange(e.target.value)}
        className="max-w-xl"
        autoFocus
      />
      {!loaded && <p className="text-sm text-muted-foreground">Loading search index…</p>}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map(r => (
            <div key={r.id} className="border rounded-lg p-4 space-y-1">
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="text-xs">{r.type}</Badge>
                <span className="text-xs text-muted-foreground">{r.category}</span>
              </div>
              <Link href={r.href} className="font-medium hover:underline underline-offset-2 block">
                {r.title}
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-2">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      {loaded && query.trim() && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  )
}
