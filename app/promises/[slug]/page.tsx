import { notFound } from "next/navigation"
import Link from "next/link"
import { loadPromises, getPromiseBySlug } from "@/lib/content"
import { StatusBadge } from "@/components/StatusBadge"
import { EvidenceBadge } from "@/components/EvidenceBadge"
import { SourceCitation } from "@/components/SourceCitation"

export async function generateStaticParams() {
  const promises = await loadPromises()
  return promises.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const promise = await getPromiseBySlug(slug)
  return { title: promise?.title ?? "Promise not found" }
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

      <div className="grid grid-cols-2 gap-4 text-sm border rounded-lg p-4 bg-gray-50">
        <div><span className="font-medium">Category:</span> {promise.category}</div>
        <div><span className="font-medium">Announced:</span> {promise.announced_date}</div>
        {promise.deadline && (
          <div className="col-span-2">
            <span className="font-medium">Deadline:</span> {promise.deadline}
          </div>
        )}
        {promise.target_beneficiaries && (
          <div className="col-span-2">
            <span className="font-medium">Beneficiaries:</span> {promise.target_beneficiaries}
          </div>
        )}
        {promise.target_amount && (
          <div><span className="font-medium">Target amount:</span> {promise.target_amount}</div>
        )}
        <div><span className="font-medium">Last reviewed:</span> {promise.last_reviewed}</div>
      </div>

      {promise.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {promise.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

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
    </main>
  )
}
