import { ExternalLink } from "lucide-react"

export const metadata = { title: "About & Editorial Policy" }

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">About TSGOV Accountability Tracker</h1>
        <p className="text-muted-foreground">
          A non-partisan public archive tracking Telangana government promises and
          governance outcomes. Every claim is sourced, evidence-graded, and open to
          public correction.
        </p>
        <p className="text-sm">
          Found an error?{" "}
          <a
            href="https://github.com/your-org/tsgov/issues/new"
            className="underline inline-flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open a GitHub issue <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </section>

      <section id="mission" className="space-y-3">
        <h2 className="text-xl font-semibold">Mission</h2>
        <p className="text-sm leading-relaxed">
          TSGOV Accountability Tracker is a non-partisan public archive that tracks election
          promises, government actions, and governance outcomes in Telangana. Every claim on
          this platform is sourced, graded, and open to correction. We cover all parties —
          the platform is designed from day one to expand beyond any single government.
        </p>
      </section>

      <section id="principles" className="space-y-3">
        <h2 className="text-xl font-semibold">Core Principles</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li><strong>Source-first</strong> — no entry exists without at least one verifiable citation</li>
          <li><strong>Neutral tone</strong> — describe actions, not intent; record outcomes, not character</li>
          <li><strong>Evidence grading</strong> — every claim carries a confidence level</li>
          <li><strong>Correctability</strong> — editorial corrections are public and logged</li>
          <li><strong>Scope expansion</strong> — designed from day one to cover all parties</li>
        </ol>
      </section>

      <section id="evidence" className="space-y-4">
        <h2 className="text-xl font-semibold">Evidence Grading System</h2>
        <p className="text-sm text-muted-foreground">
          Every promise and incident carries one of these grades. A lower grade does not mean
          a story is false — it means less independent evidence is available for verification.
        </p>
        <div className="overflow-x-auto border rounded-lg">
          <table className="text-sm w-full">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-medium">Grade</th>
                <th className="text-left px-4 py-3 font-medium">Meaning</th>
                <th className="text-left px-4 py-3 font-medium">Acceptable Sources</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Official Record", "Directly from government", "GOs, gazette, RTI responses, budget documents"],
                ["Primary Evidence", "Official statements", "Official social media (@TelanganaCMO), press releases"],
                ["Multiple Sources", "Corroborated", "3+ independent credible outlets reporting the same fact"],
                ["Single Source", "One credible report", "One established news outlet or verified journalist"],
                ["Allegation", "Unverified claim", "Social media, Reddit, screenshots — reported as allegation only"],
              ].map(([grade, meaning, sources]) => (
                <tr key={grade} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium align-top whitespace-nowrap">{grade}</td>
                  <td className="px-4 py-3 text-muted-foreground align-top">{meaning}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs align-top">{sources}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="editorial" className="space-y-3">
        <h2 className="text-xl font-semibold">Editorial Policy</h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p><strong>Language rules:</strong> All entries must describe what happened, not why. Use passive voice for allegations (&ldquo;Allegations surfaced&rdquo; not &ldquo;X stole&rdquo;). The following words are banned: traitor, dictator, corrupt (as noun), puppet, scam (as fact unless proven via Official Record).</p>
          <p><strong>Corrections:</strong> Errors are reported via GitHub Issues. The reviewer examines the claim, updates the content file&apos;s <code>updates[]</code> array with a correction note and new source, and commits. Old versions are preserved in git history. We do not delete — we correct transparently.</p>
          <p><strong>What we do not publish:</strong> Unverified financial claims, private personal information, edited video clips, WhatsApp forwards without corroboration.</p>
          <p><strong>Source archiving:</strong> All Twitter/X, Reddit, and social media sources must be archived via archive.org before being cited. Screenshots alone are insufficient — they are classified as <em>Allegation</em> grade.</p>
          <p><strong>Conflict of interest:</strong> Contributors must disclose any affiliation with parties, candidates, or organisations covered in an entry.</p>
        </div>
      </section>

      <section id="legal" className="space-y-3">
        <h2 className="text-xl font-semibold">Legal Disclaimer</h2>
        <div className="space-y-2 text-sm leading-relaxed text-muted-foreground border rounded-lg p-4 bg-gray-50">
          <p>TSGOV Accountability Tracker is a public information archive. It does not constitute legal advice, electoral advice, or advocacy for any political party.</p>
          <p>Entries marked <strong>Allegation</strong> are reported allegations, not established facts. They are included because the allegations have appeared in credible reporting and are of public interest.</p>
          <p>This platform has no affiliation with any political party, government body, or electoral organisation. All content is based on publicly available sources, with links included for independent verification.</p>
          <p>Corrections are welcome and actively incorporated. To report an inaccuracy, open a GitHub issue with the specific claim and a credible counter-source.</p>
        </div>
      </section>
    </main>
  )
}
