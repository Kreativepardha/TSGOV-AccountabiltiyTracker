import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { loadIncidents, getIncidentBySlug } from "@/lib/content"
import { EvidenceBadge } from "@/components/EvidenceBadge"
import { SourceCitation } from "@/components/SourceCitation"
import { Badge } from "@/components/ui/badge"

export async function generateStaticParams() {
  const incidents = await loadIncidents()
  return incidents.map(i => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const incident = await getIncidentBySlug(slug)
  if (!incident) return { title: "Incident not found" }
  return {
    title: incident.title,
    description: `${incident.category} · ${incident.district} · ${incident.date}`,
    openGraph: {
      title: `${incident.title} — TSGOV`,
      description: `${incident.category} in ${incident.district} (${incident.date})`,
      type: "article",
      url: `https://tsgov.in/incidents/${slug}`,
    },
    twitter: {
      card: "summary",
      title: `${incident.title} — TSGOV`,
      description: `${incident.category} in ${incident.district}`,
    },
  }
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const incident = await getIncidentBySlug(slug)
  if (!incident) notFound()

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link href="/incidents" className="text-sm text-muted-foreground hover:underline">
          ← Back to incidents
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground font-mono">{incident.date}</span>
          <Badge variant="outline">{incident.category}</Badge>
          <EvidenceBadge grade={incident.evidence_grade} />
        </div>
        <h1 className="text-2xl font-bold">{incident.title}</h1>
        <p className="text-sm text-muted-foreground">District: {incident.district}</p>
      </div>

      {incident.people_involved.length > 0 && (
        <div className="text-sm">
          <span className="font-medium">People/entities involved: </span>
          {incident.people_involved.join(", ")}
        </div>
      )}

      <div className="prose prose-neutral max-w-none text-base">
        <ReactMarkdown>{incident.body}</ReactMarkdown>
      </div>

      {incident.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {incident.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sources</h2>
        <p className="text-xs text-muted-foreground italic">
          Evidence grade: <strong>{incident.evidence_grade}</strong>
        </p>
        <ul className="space-y-3">
          {incident.sources.map((s, i) => (
            <li key={i}><SourceCitation source={s} /></li>
          ))}
        </ul>
      </section>

      {incident.related_promises.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Related Promises</h2>
          <ul className="space-y-1">
            {incident.related_promises.map(pSlug => (
              <li key={pSlug}>
                <Link
                  href={`/promises/${pSlug}`}
                  className="text-sm underline hover:text-foreground"
                >
                  {pSlug}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Share + Suggest edit */}
      <div className="border-t pt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>Share:</span>
        <a
          href={`https://twitter.com/intent/tweet?url=https://tsgov.in/incidents/${incident.slug}&text=${encodeURIComponent(incident.title + " — TSGOV")}`}
          target="_blank" rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          X / Twitter
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(incident.title + " — " + "https://tsgov.in/incidents/" + incident.slug)}`}
          target="_blank" rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          WhatsApp
        </a>
        <span className="ml-auto">
          <a
            href={`https://github.com/Kreativepardha/TSGOV-AccountabiltiyTracker/issues/new?template=correction.yml&title=${encodeURIComponent(`[CORRECTION] /incidents/${incident.slug}`)}`}
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
