import fs from "fs"
import path from "path"
import { z } from "zod"

const SourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
})

export const StateFinanceSnapshotSchema = z.object({
  budget_year: z.string(),
  basis: z.string(),
  last_reviewed: z.string(),
  currency: z.string(),
  gsdp_projected_cr: z.number(),
  net_expenditure_cr: z.number(),
  net_receipts_excluding_borrowings_cr: z.number(),
  borrowings_be_cr: z.number(),
  debt_repayment_cr: z.number(),
  fiscal_deficit_cr: z.number(),
  fiscal_deficit_pct_gsdp: z.number(),
  revenue_surplus_cr: z.number(),
  revenue_surplus_pct_gsdp: z.number(),
  outstanding_debt_pct_gsdp_end_year: z.number(),
  disclaimer: z.string(),
  sources: z.array(SourceSchema),
})

export type StateFinanceSnapshot = z.infer<typeof StateFinanceSnapshotSchema>

export function loadStateFinance(): StateFinanceSnapshot | null {
  const fp = path.join(process.cwd(), "content/state-finance.json")
  if (!fs.existsSync(fp)) return null
  const raw = JSON.parse(fs.readFileSync(fp, "utf-8"))
  return StateFinanceSnapshotSchema.parse(raw)
}

/** Format integer ₹ crore amounts like Indian numbering */
export function formatCrore(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)
}
