import { ExternalLink, Twitter, FileText, Globe, Youtube } from "lucide-react"
import type { Source } from "@/lib/schemas"

const ICONS: Record<string, React.ReactNode> = {
  twitter_post:      <Twitter className="h-3 w-3 text-sky-500 shrink-0" />,
  journalist_tweet:  <Twitter className="h-3 w-3 text-sky-600 shrink-0" />,
  official_social:   <Twitter className="h-3 w-3 text-blue-700 shrink-0" />,
  reddit_thread:     <Globe className="h-3 w-3 text-orange-500 shrink-0" />,
  government_record: <FileText className="h-3 w-3 text-green-600 shrink-0" />,
  rti_response:      <FileText className="h-3 w-3 text-green-700 shrink-0" />,
  news_article:      <ExternalLink className="h-3 w-3 shrink-0" />,
  youtube_video:     <Youtube className="h-3 w-3 text-red-500 shrink-0" />,
  press_release:     <FileText className="h-3 w-3 shrink-0" />,
}

const SOCIAL_TYPES = new Set(["twitter_post", "journalist_tweet", "reddit_thread"])

export function SourceCitation({ source }: { source: Source }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {ICONS[source.source_type]}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        {source.label}
      </a>
      <span className="text-xs">— {source.outlet}, {source.date}</span>
      {source.archived_url ? (
        <a
          href={source.archived_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground ml-1 underline"
        >
          [archived]
        </a>
      ) : SOCIAL_TYPES.has(source.source_type) ? (
        <span className="text-xs text-amber-600 ml-1">[no archive — may be deleted]</span>
      ) : null}
    </span>
  )
}
