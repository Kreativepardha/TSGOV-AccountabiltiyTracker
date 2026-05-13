# Editorial Policy — TSGOV Accountability Tracker

## Source Tiers

| Tier | Evidence Grade | Acceptable Sources |
|---|---|---|
| 1 | Official Record | Government Orders (GOs), gazette notifications, budget documents, RTI responses |
| 2 | Primary Evidence | Official social media accounts of government/CMO, formal press releases |
| 3 | Multiple Sources | Three or more independent credible national/regional news outlets |
| 4 | Single Source | One established outlet (The Hindu, NDTV, Deccan Chronicle, Telangana Today, etc.) |
| 5 | Allegation | Social media, Reddit threads, screenshots, WhatsApp forwards |

## Language Rules

All content must:
- Describe **what happened**, not why or the motive behind it
- Use passive voice for unverified claims: "Allegations surfaced" not "X committed fraud"
- Attribute all claims to a named source
- Include the `[Allegation]` tag anywhere the evidence grade is Allegation

Banned words and phrases:
- traitor, dictator, corrupt (used as a noun without legal finding)
- anti-[religion], puppet, stooge
- scam, fraud, loot (used as fact without Official Record evidence)

## Correction Process

1. A correction is reported via a GitHub Issue with:
   - The specific claim alleged to be wrong
   - A credible counter-source (Tier 1–4 only)
2. An editor reviews the claim within 7 days
3. If validated, the content file's `updates[]` array is amended with:
   - The correction note
   - The counter-source
   - The date of correction
4. The original entry is **not deleted** — old versions are preserved in git history
5. The correction is committed and merged; the GitHub Issue is closed with a reference to the commit

## What We Do Not Publish

- Unverified financial claims (e.g. "₹X stolen") without at least Single Source evidence
- Private personal information (home addresses, phone numbers, family member details) of any individual
- Edited video clips or screenshots as standalone evidence (they may be referenced alongside corroborating sources)
- WhatsApp forwards without independent corroboration
- Exit poll predictions or electoral projections

## Source Archiving

All Twitter/X, Reddit, and social media sources **must** be archived via [archive.org](https://web.archive.org) before being cited. The `archived_url` field in the source schema is required for all `twitter_post`, `journalist_tweet`, and `reddit_thread` source types.

## Conflict of Interest

Contributors must disclose in the Pull Request description any:
- Political party membership or association
- Financial relationship with individuals or organisations covered in the entry
- Personal relationship with individuals named in the entry

Entries with undisclosed conflicts of interest will be removed pending re-review.

## Scope

This platform tracks:
- Telangana state government (current ruling party)
- Past governments' promises that remain relevant
- All parties' elected representatives in Telangana state

The platform is explicitly designed to expand beyond any single party. BRS, BJP, and other party entries will be added in future phases.
