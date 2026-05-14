import { BarChart3, ExternalLink } from "lucide-react"

export function SiteTrafficCard() {
  const onVercel = process.env.VERCEL === "1"

  return (
    <section className="border rounded-lg p-4 bg-gradient-to-br from-blue-50/80 to-white space-y-3">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
          <BarChart3 className="h-5 w-5" aria-hidden />
        </div>
        <div className="space-y-1 min-w-0">
          <h2 className="font-semibold text-lg">Website visits</h2>
          <p className="text-sm text-muted-foreground leading-snug">
            Visitor analytics are collected with{" "}
            <strong className="text-foreground font-medium">Vercel Analytics</strong> when the site runs on
            Vercel. Open your project in the Vercel dashboard and use the{" "}
            <strong className="text-foreground font-medium">Analytics</strong> tab for page views, visitors,
            top pages, and regions.
          </p>
          {onVercel ? (
            <p className="text-xs text-green-800 bg-green-50 border border-green-200 rounded-md px-2 py-1.5 mt-2 inline-block">
              Analytics is active on this deployment (Vercel).
            </p>
          ) : (
            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 mt-2 inline-block">
              Running locally or outside Vercel — analytics will record once the production site is deployed
              there.
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-sm pt-1">
        <a
          href="https://vercel.com/docs/analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-700 font-medium hover:underline"
        >
          Vercel Analytics docs
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        <a href="https://vercel.com/dashboard" className="text-blue-700 font-medium hover:underline">
          Vercel dashboard →
        </a>
      </div>
    </section>
  )
}
