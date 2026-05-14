"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CASE_STATUS_COLORS } from "@/lib/constants"
import { AssetsBarChart } from "./AssetsBarChart"
import type { Politician } from "@/lib/schemas"

type RelatedItem = {
  type: "incident" | "discovery"
  title: string
  href: string
  date?: string
  outlet?: string
}

export function PoliticianProfileTabs({
  politician,
  related,
}: {
  politician: Politician
  related: RelatedItem[]
}) {
  const tabs = [
    { id: "cases", label: `Criminal Cases (${politician.criminal_cases.length})` },
    { id: "assets", label: `Assets (${politician.asset_declarations.length})` },
    { id: "news", label: `News (${related.length})` },
  ] as const
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("cases")

  return (
    <div className="space-y-4">
      <div role="tablist" className="border-b flex gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              active === t.id
                ? "border-blue-600 text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "cases" && (
        <div className="space-y-3">
          {politician.criminal_cases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No publicly documented criminal cases on record.
            </p>
          ) : (
            <ol className="relative border-l border-border space-y-4 ml-2">
              {politician.criminal_cases.map((c, i) => (
                <li key={c.id ?? i} className="ml-6">
                  <span className="absolute -left-[7px] h-3.5 w-3.5 rounded-full bg-red-400 ring-4 ring-white" />
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {c.date_filed && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {c.date_filed}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {c.case_type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${CASE_STATUS_COLORS[c.status] ?? ""}`}
                    >
                      {c.status}
                    </Badge>
                    {c.is_serious && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-red-100 text-red-800 border-red-200"
                      >
                        serious
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{c.summary}</p>
                  {c.ipc_sections.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Sections: {c.ipc_sections.join(", ")}
                    </p>
                  )}
                  {c.court && (
                    <p className="text-xs text-muted-foreground">
                      Court: {c.court}
                      {c.case_number ? ` · ${c.case_number}` : ""}
                    </p>
                  )}
                  {c.source_url && (
                    <a
                      href={c.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      Source
                    </a>
                  )}
                </li>
              ))}
            </ol>
          )}
          <p className="text-xs italic text-muted-foreground border-t pt-3">
            All cases default to “pending” status unless a public conviction or
            acquittal is on record. Information sourced from MyNeta / ADR
            affidavits.
          </p>
        </div>
      )}

      {active === "assets" && (
        <div className="space-y-3">
          <AssetsBarChart declarations={politician.asset_declarations} />
        </div>
      )}

      {active === "news" && (
        <div className="space-y-3">
          {related.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No related incidents or discoveries mention {politician.name} yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {related.map((r, i) => (
                <li key={i} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    {r.date && <span className="font-mono">{r.date}</span>}
                    <Badge variant="outline" className="text-xs">
                      {r.type}
                    </Badge>
                    {r.outlet && <span>{r.outlet}</span>}
                  </div>
                  <a
                    href={r.href}
                    className="font-medium hover:underline"
                  >
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
