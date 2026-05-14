import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import {
  loadPoliticians,
  getPoliticianBySlug,
  loadIncidents,
} from "@/lib/content"
import { Badge } from "@/components/ui/badge"
import { PoliticianProfileTabs } from "@/components/PoliticianProfileTabs"
import { PARTY_COLORS } from "@/lib/constants"

export async function generateStaticParams() {
  const politicians = await loadPoliticians()
  return politicians.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = await getPoliticianBySlug(slug)
  if (!p) return { title: "Politician not found" }
  const cases = p.criminal_cases.length
  const desc = `${p.position}${p.ministry ? ` (${p.ministry})` : ""} · ${p.party}${
    p.constituency ? ` · ${p.constituency}` : ""
  } · ${cases} criminal case${cases === 1 ? "" : "s"} on public record.`
  return {
    title: `${p.name} — TSGOV`,
    description: desc,
    openGraph: {
      title: `${p.name} — TSGOV`,
      description: desc,
      type: "profile",
      url: `https://tsgov.in/politicians/${slug}`,
      ...(p.photo_url ? { images: [p.photo_url] } : {}),
    },
    twitter: {
      card: "summary",
      title: `${p.name} — TSGOV`,
      description: desc,
    },
  }
}

function nameMatches(haystack: string, name: string): boolean {
  const h = haystack.toLowerCase()
  const tokens = name.toLowerCase().split(/\s+/).filter(t => t.length > 2)
  return tokens.some(t => h.includes(t))
}

export default async function PoliticianDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const politician = await getPoliticianBySlug(slug)
  if (!politician) notFound()

  // Pull related incidents where this politician is mentioned.
  const incidents = await loadIncidents()
  const related = incidents
    .filter(
      i =>
        i.people_involved.some(person => nameMatches(person, politician.name)) ||
        nameMatches(i.title, politician.name) ||
        nameMatches(i.body, politician.name)
    )
    .slice(0, 20)
    .map(i => ({
      type: "incident" as const,
      title: i.title,
      href: `/incidents/${i.slug}`,
      date: i.date,
      outlet: i.sources[0]?.outlet,
    }))

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href="/politicians"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to politicians
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {politician.photo_url ? (
          <img
            src={politician.photo_url}
            alt={politician.name}
            className="w-32 h-32 rounded-lg object-cover border bg-gray-100"
          />
        ) : (
          <div className="w-32 h-32 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400 text-3xl font-bold">
            {politician.name
              .split(/\s+/)
              .map(w => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs ${PARTY_COLORS[politician.party] ?? ""}`}
            >
              {politician.party}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {politician.position}
            </Badge>
            {politician.ministry && (
              <Badge variant="secondary" className="text-xs">
                {politician.ministry}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold leading-tight">{politician.name}</h1>
          {politician.constituency && (
            <p className="text-muted-foreground">
              {politician.constituency}
              {politician.district ? ` · ${politician.district} district` : ""}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {politician.myneta_url && (
              <a
                href={politician.myneta_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                MyNeta affidavit <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {politician.wikipedia_url && (
              <a
                href={politician.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Wikipedia <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {politician.bio && (
        <p className="text-base leading-relaxed">{politician.bio}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm border rounded-lg p-4 bg-gray-50">
        {politician.age !== undefined && (
          <div>
            <span className="font-medium">Age:</span> {politician.age}
          </div>
        )}
        {politician.education && (
          <div className="col-span-2">
            <span className="font-medium">Education:</span> {politician.education}
          </div>
        )}
        {politician.profession && (
          <div className="col-span-2">
            <span className="font-medium">Profession:</span> {politician.profession}
          </div>
        )}
        {politician.election_cycle && (
          <div>
            <span className="font-medium">Election cycle:</span>{" "}
            {politician.election_cycle}
          </div>
        )}
      </div>

      <PoliticianProfileTabs politician={politician} related={related} />

      <div className="border-t pt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>Share:</span>
        <a
          href={`https://twitter.com/intent/tweet?url=https://tsgov.in/politicians/${
            politician.slug
          }&text=${encodeURIComponent(politician.name + " — TSGOV")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          X / Twitter
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            politician.name +
              " — https://tsgov.in/politicians/" +
              politician.slug
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          WhatsApp
        </a>
      </div>
    </main>
  )
}
