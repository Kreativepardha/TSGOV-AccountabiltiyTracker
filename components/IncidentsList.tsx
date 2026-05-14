"use client"

import { useState, useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IncidentCard } from "./IncidentCard"
import { DEMOGRAPHICS, DEMOGRAPHIC_LABELS } from "@/lib/constants"
import type { IncidentFrontmatter } from "@/lib/schemas"

type IncidentWithBody = IncidentFrontmatter & { body: string }

export function IncidentsList({ incidents }: { incidents: IncidentWithBody[] }) {
  const [demographic, setDemographic] = useState<string>("all")

  const filtered = useMemo(() => {
    if (demographic === "all") return incidents
    return incidents.filter(i => i.affected_demographic === demographic)
  }, [incidents, demographic])

  const womenCount = useMemo(
    () => incidents.filter(i => i.affected_demographic === "women").length,
    [incidents]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium">Affected demographic:</span>
        <button
          onClick={() => setDemographic("women")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            demographic === "women"
              ? "bg-rose-100 border-rose-200 text-rose-900 font-medium"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          Crimes against women ({womenCount})
        </button>
        <Select value={demographic} onValueChange={setDemographic}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Demographic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All demographics</SelectItem>
            {DEMOGRAPHICS.map(d => (
              <SelectItem key={d} value={d}>
                {DEMOGRAPHIC_LABELS[d]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {demographic !== "all" && (
          <button
            onClick={() => setDemographic("all")}
            className="text-xs underline text-muted-foreground"
          >
            clear
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {incidents.length} incidents
      </p>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No incidents match this filter.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(i => (
            <IncidentCard key={i.slug} incident={i} />
          ))}
        </div>
      )}
    </div>
  )
}
