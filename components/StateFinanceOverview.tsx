import type { StateFinanceSnapshot } from "@/lib/state-finance"
import { formatCrore } from "@/lib/state-finance"
import { ExternalLink } from "lucide-react"

export function StateFinanceOverview({ data }: { data: StateFinanceSnapshot }) {
  const rows: { label: string; value: string; hint?: string }[] = [
    {
      label: "GSDP (projected, current prices)",
      value: `₹ ${formatCrore(data.gsdp_projected_cr)} cr`,
      hint: `${data.budget_year}`,
    },
    {
      label: "Net expenditure",
      value: `₹ ${formatCrore(data.net_expenditure_cr)} cr`,
      hint: "Total expenditure excluding debt repayment",
    },
    {
      label: "Net receipts (excl. borrowings)",
      value: `₹ ${formatCrore(data.net_receipts_excluding_borrowings_cr)} cr`,
      hint: "Receipts other than borrowings",
    },
    {
      label: "Borrowings (BE)",
      value: `₹ ${formatCrore(data.borrowings_be_cr)} cr`,
      hint: "Budget estimate",
    },
    {
      label: "Debt repayment",
      value: `₹ ${formatCrore(data.debt_repayment_cr)} cr`,
      hint: "Principal repayment budgeted",
    },
    {
      label: "Fiscal deficit",
      value: `₹ ${formatCrore(data.fiscal_deficit_cr)} cr (${data.fiscal_deficit_pct_gsdp}% of GSDP)`,
    },
    {
      label: "Revenue surplus",
      value: `₹ ${formatCrore(data.revenue_surplus_cr)} cr (${data.revenue_surplus_pct_gsdp}% of GSDP)`,
    },
    {
      label: "Outstanding debt",
      value: `${data.outstanding_debt_pct_gsdp_end_year}% of GSDP`,
      hint: "Estimated end of FY — ratio per MTFP / PRS summary",
    },
  ]

  return (
    <section className="border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-slate-50">
        <h2 className="font-semibold text-lg">Telangana state finances</h2>
        <p className="text-xs text-muted-foreground mt-1">{data.basis}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Last reviewed in tracker: {data.last_reviewed}
        </p>
      </div>
      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rows.map(row => (
          <div key={row.label} className="rounded-lg border bg-white p-3 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground leading-tight">{row.label}</p>
            <p className="text-base font-semibold text-slate-900 mt-1 tabular-nums">{row.value}</p>
            {row.hint && (
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{row.hint}</p>
            )}
          </div>
        ))}
      </div>
      <div className="px-4 pb-4 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">{data.disclaimer}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          {data.sources.map(s => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-700 hover:underline"
            >
              {s.title}
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
