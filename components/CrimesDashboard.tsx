"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CRIME_CATEGORIES, CRIME_CATEGORY_LABELS } from "@/lib/constants"
import type { CrimeStatistic } from "@/lib/schemas"

export function CrimesDashboard({ stats }: { stats: CrimeStatistic[] }) {
  const years = useMemo(
    () => Array.from(new Set(stats.map(s => s.year))).sort((a, b) => b.localeCompare(a)),
    [stats]
  )
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return stats.filter(s => {
      const matchesYear = yearFilter === "all" || s.year === yearFilter
      const matchesCat = categoryFilter === "all" || s.category === categoryFilter
      return matchesYear && matchesCat
    })
  }, [stats, yearFilter, categoryFilter])

  // Group by district -> total + by category
  const byDistrict = useMemo(() => {
    const map = new Map<string, { total: number; byCat: Record<string, number> }>()
    for (const s of filtered) {
      const entry = map.get(s.district) ?? { total: 0, byCat: {} }
      entry.total += s.count
      entry.byCat[s.category] = (entry.byCat[s.category] ?? 0) + s.count
      map.set(s.district, entry)
    }
    return Array.from(map.entries())
      .map(([district, v]) => ({ district, ...v }))
      .sort((a, b) => b.total - a.total)
  }, [filtered])

  const total = filtered.reduce((acc, s) => acc + s.count, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map(y => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CRIME_CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>
                {CRIME_CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">{total.toLocaleString("en-IN")}</p>
          <p className="text-sm text-muted-foreground">
            Total reported{yearFilter !== "all" ? ` in ${yearFilter}` : ""}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">{byDistrict.length}</p>
          <p className="text-sm text-muted-foreground">Districts with data</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">
            {filtered.length > 0 ? new Set(filtered.map(s => s.category)).size : 0}
          </p>
          <p className="text-sm text-muted-foreground">Categories</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">
            {byDistrict[0]?.district ?? "—"}
          </p>
          <p className="text-sm text-muted-foreground">Top district by count</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>District</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Top category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {byDistrict.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground py-8"
              >
                No crime statistics for the selected filter.
              </TableCell>
            </TableRow>
          ) : (
            byDistrict.map(d => {
              const top = Object.entries(d.byCat).sort(
                (a, b) => b[1] - a[1]
              )[0]
              return (
                <TableRow key={d.district}>
                  <TableCell className="font-medium">{d.district}</TableCell>
                  <TableCell className="text-right font-mono">
                    {d.total.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    {top ? (
                      <Badge variant="outline" className="text-xs">
                        {CRIME_CATEGORY_LABELS[top[0]] ?? top[0]} · {top[1]}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
