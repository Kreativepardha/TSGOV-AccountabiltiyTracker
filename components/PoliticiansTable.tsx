"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
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
import { PARTIES, POSITIONS, PARTY_COLORS } from "@/lib/constants"
import type { Politician } from "@/lib/schemas"

function formatInr(n: number): string {
  if (!n || n <= 0) return "—"
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} lakh`
  return `₹${n.toLocaleString("en-IN")}`
}

function latestAssetTotal(p: Politician): number {
  if (p.asset_declarations.length === 0) return 0
  const sorted = [...p.asset_declarations].sort((a, b) =>
    b.year.localeCompare(a.year)
  )
  return sorted[0]?.total_assets_inr ?? 0
}

function seriousCaseCount(p: Politician): number {
  return p.criminal_cases.filter(c => c.is_serious).length
}

type SortKey = "cases" | "assets" | "name"

export function PoliticiansTable({ politicians }: { politicians: Politician[] }) {
  const [search, setSearch] = useState("")
  const [partyFilter, setPartyFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [districtFilter, setDistrictFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("cases")

  const districts = useMemo(
    () =>
      Array.from(
        new Set(politicians.map(p => p.district).filter(Boolean) as string[])
      ).sort(),
    [politicians]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = politicians.filter(p => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.constituency?.toLowerCase().includes(q) ?? false) ||
        (p.ministry?.toLowerCase().includes(q) ?? false)
      const matchesParty = partyFilter === "all" || p.party === partyFilter
      const matchesPosition =
        positionFilter === "all" || p.position === positionFilter
      const matchesDistrict =
        districtFilter === "all" || p.district === districtFilter
      return matchesSearch && matchesParty && matchesPosition && matchesDistrict
    })

    return [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name)
      if (sortKey === "assets")
        return latestAssetTotal(b) - latestAssetTotal(a)
      // cases desc
      return b.criminal_cases.length - a.criminal_cases.length
    })
  }, [politicians, search, partyFilter, positionFilter, districtFilter, sortKey])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name, constituency, ministry..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={partyFilter} onValueChange={setPartyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Party" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All parties</SelectItem>
            {PARTIES.map(p => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All positions</SelectItem>
            {POSITIONS.map(p => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {districts.length > 0 && (
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All districts</SelectItem>
              {districts.map(d => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cases">Most criminal cases</SelectItem>
            <SelectItem value="assets">Highest declared assets</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {politicians.length} politicians
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%]">Name</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Constituency</TableHead>
            <TableHead>Position</TableHead>
            <TableHead className="text-right">Criminal cases</TableHead>
            <TableHead className="text-right">Declared assets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No politicians match your filters.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map(p => {
              const cases = p.criminal_cases.length
              const serious = seriousCaseCount(p)
              const assets = latestAssetTotal(p)
              return (
                <TableRow key={p.slug}>
                  <TableCell>
                    <Link
                      href={`/politicians/${p.slug}`}
                      className="font-medium hover:underline underline-offset-2"
                    >
                      {p.name}
                    </Link>
                    {p.ministry && (
                      <p className="text-xs text-muted-foreground mt-1">{p.ministry}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${PARTY_COLORS[p.party] ?? ""}`}
                    >
                      {p.party}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.constituency ?? "—"}
                    {p.district && (
                      <p className="text-xs text-muted-foreground">{p.district}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{p.position}</TableCell>
                  <TableCell className="text-right">
                    {cases === 0 ? (
                      <span className="text-muted-foreground">0</span>
                    ) : serious > 0 ? (
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800 border-red-200 text-xs"
                      >
                        {cases} ({serious} serious)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {cases}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono">
                    {formatInr(assets)}
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
