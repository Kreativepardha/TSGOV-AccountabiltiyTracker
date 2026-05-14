import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { loadPromises, getPromiseBySlug } from "@/lib/content"
import { StatusBadge } from "@/components/StatusBadge"
import { EvidenceBadge } from "@/components/EvidenceBadge"
import { SourceCitation } from "@/components/SourceCitation"
import { BudgetBar } from "@/components/BudgetBar"

export async function generateStaticParams() {
  const promises = await loadPromises()
  return promises.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const promise = await getPromiseBySlug(slug)
  if (!promise) return { title: "Promise not found" }
  return {
    title: promise.title,
    description: promise.summary,
    openGraph: {
      title: `${promise.title} — TSGOV`,
      description: `${promise.current_status} · ${promise.evidence_grade} · ${promise.category}`,
      type: "article",
      url: `https://tsgov.in/promises/${slug}`,
    },
    twitter: {
      card: "summary",
      title: `${promise.title} — TSGOV`,
      description: promise.summary,
    },
  }
}

export default async function PromiseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const promise = await getPromiseBySlug(slug)
  if (!promise) notFound()

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link href="/promises" className="text-sm text-muted-foreground hover:underline">
          ← Back to promises
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={promise.current_status} />
          <EvidenceBadge grade={promise.evidence_grade} />
        </div>
        <h1 className="text-2xl font-bold">{promise.title}</h1>
        <p className="text-sm text-muted-foreground">{promise.manifesto_section}</p>
      </div>

      <p className="text-base leading-relaxed">{promise.summary}</p>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-4 text-sm border rounded-lg p-4 bg-gray-50">
        <div><span className="font-medium">Category:</span> {promise.category}</div>
        <div><span className="font-medium">Announced:</span> {promise.announced_date}</div>
        {promise.deadline && (
          <div className="col-span-2">
            <span className="font-medium">Deadline:</span> {promise.deadline}
          </div>
        )}
        {promise.ministry && (
          <div><span className="font-medium">Ministry:</span> {promise.ministry}</div>
        )}
        {promise.responsible_minister && (
          <div><span className="font-medium">Minister:</span> {promise.responsible_minister}</div>
        )}
        {promise.target_beneficiaries && (
          <div className="col-span-2">
            <span className="font-medium">Beneficiaries:</span> {promise.target_beneficiaries}
          </div>
        )}
        {promise.target_amount && (
          <div><span className="font-medium">Target amount:</span> {promise.target_amount}</div>
        )}
        {promise.election_cycle && (
          <div><span className="font-medium">Election cycle:</span> {promise.election_cycle}</div>
        )}
        {promise.districts.length > 0 && (
          <div className="col-span-2">
            <span className="font-medium">Districts:</span> {promise.districts.join(", ")}
          </div>
        )}
        <div><span className="font-medium">Last reviewed:</span> {promise.last_reviewed}</div>
      </div>

      {/* Budget */}
      {(promise.budget_allocated || promise.budget_spent) && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Budget</h2>
          {promise.budget_allocated && promise.budget_spent ? (
            <BudgetBar allocated={promise.budget_allocated} spent={promise.budget_spent} />
          ) : (
            <p className="text-sm text-muted-foreground">
              {promise.budget_allocated ? `Allocated: ${promise.budget_allocated}` : `Spent: ${promise.budget_spent}`}
            </p>
          )}
        </section>
      )}

      {/* Tags */}
      {promise.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {promise.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Sources */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sources</h2>
        <p className="text-xs text-muted-foreground italic">
          Evidence grade: <strong>{promise.evidence_grade}</strong> — see{" "}
          <Link href="/about#evidence" className="underline">
            grading criteria
          </Link>
        </p>
        <ul className="space-y-3">
          {promise.sources.map((s, i) => (
            <li key={i}><SourceCitation source={s} /></li>
          ))}
        </ul>
      </section>

      {/* Fact checks */}
      {promise.fact_checks.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Fact Checks</h2>
          <ul className="space-y-2">
            {promise.fact_checks.map((fc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="font-medium text-muted-foreground shrink-0">{fc.outlet}</span>
                <span className="text-muted-foreground shrink-0">·</span>
                <span className="italic">{fc.verdict}</span>
                <span className="text-muted-foreground shrink-0">·</span>
                <a href={fc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 shrink-0">
                  Read <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Updates timeline */}
      {promise.updates.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Updates</h2>
          <ol className="relative border-l border-border space-y-4 ml-2">
            {promise.updates.map((u, i) => (
              <li key={i} className="ml-6">
                <span className="absolute -left-[7px] h-3.5 w-3.5 rounded-full bg-blue-400 ring-4 ring-white" />
                <p className="text-xs text-muted-foreground font-mono mb-1">{u.date}</p>
                <p className="text-sm">{u.note}</p>
                {u.sources.map((s, j) => (
                  <div key={j} className="mt-1">
                    <SourceCitation source={s} />
                  </div>
                ))}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Share + Suggest edit */}
      <div className="border-t pt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>Share:</span>
        <a
          href={`https://twitter.com/intent/tweet?url=https://tsgov.in/promises/${promise.slug}&text=${encodeURIComponent(promise.title + " — TSGOV")}`}
          target="_blank" rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          X / Twitter
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(promise.title + " — " + "https://tsgov.in/promises/" + promise.slug)}`}
          target="_blank" rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          WhatsApp
        </a>
        <span className="ml-auto">
          <a
            href={`https://github.com/Kreativepardha/TSGOV-AccountabiltiyTracker/issues/new?template=correction.yml&title=${encodeURIComponent(`[CORRECTION] /promises/${promise.slug}`)}&slug=${encodeURIComponent(`/promises/${promise.slug}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-amber-700 hover:underline"
          >
            Suggest edit / report error →
          </a>
        </span>
      </div>
    </main>
  )
}
