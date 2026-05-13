"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "./StatusBadge"
import { EvidenceBadge } from "./EvidenceBadge"
import { PROMISE_STATUSES } from "@/lib/constants"
import type { GovernmentPromise } from "@/lib/schemas"

export function PromisesTable({ promises }: { promises: GovernmentPromise[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const categories = Array.from(new Set(promises.map(p => p.category))).sort()

  const filtered = promises.filter(p => {
    const q = search.toLowerCase()
    const matchesSearch =
      p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "all" || p.current_status === statusFilter
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search promises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROMISE_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {promises.length} promises
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[38%]">Promise</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Evidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No promises match your filters.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map(p => (
              <TableRow key={p.slug}>
                <TableCell>
                  <Link
                    href={`/promises/${p.slug}`}
                    className="font-medium hover:underline underline-offset-2"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.summary}</p>
                </TableCell>
                <TableCell className="text-sm">{p.category}</TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {p.deadline ?? "—"}
                </TableCell>
                <TableCell><StatusBadge status={p.current_status} /></TableCell>
                <TableCell><EvidenceBadge grade={p.evidence_grade} /></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
