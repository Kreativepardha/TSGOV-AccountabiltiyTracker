# Content Contributor Guide — TSGOV Accountability Tracker

## Adding a Promise

1. Create a new file: `content/promises/your-slug.json`
2. Copy this template:

```json
{
  "slug": "your-slug",
  "title": "Promise title — concise, neutral",
  "category": "Welfare",
  "manifesto_section": "Six Guarantees — Guarantee X",
  "announced_date": "YYYY-MM-DD",
  "deadline": "Optional — text OK e.g. '100 days from swearing-in'",
  "target_beneficiaries": "Optional — who benefits",
  "target_amount": "Optional — e.g. ₹2500/month",
  "current_status": "In Progress",
  "evidence_grade": "Single Source",
  "summary": "Plain English, max 500 chars, neutral tone. Describe what was promised and what has happened. No editorialising.",
  "sources": [
    {
      "label": "Descriptive label — outlet + headline",
      "url": "https://...",
      "date": "YYYY-MM-DD",
      "outlet": "The Hindu",
      "source_type": "news_article"
    }
  ],
  "updates": [],
  "tags": ["tag1", "tag2"],
  "last_reviewed": "YYYY-MM-DD"
}
```

3. Run `npm run validate` — fix any errors before opening a PR
4. Open a PR. CI will validate the schema automatically.

### Required fields checklist
- [ ] `slug` — matches filename (without .json)
- [ ] `title` — concise, neutral, no editorialising
- [ ] `category` — must be one of the valid enum values
- [ ] `current_status` — must be one of the valid enum values
- [ ] `evidence_grade` — must be one of the valid enum values
- [ ] `sources` — at least 1 source with `source_type` filled
- [ ] `last_reviewed` — today's date

## Adding an Incident

1. Create: `content/incidents/YYYY-MM-slug.md`
2. Copy this template:

```markdown
---
slug: YYYY-MM-slug
title: Incident title — factual, no editorialising
date: "YYYY-MM-DD"
category: Education
district: Hyderabad
people_involved:
  - Role Title, Organisation (not bare names without roles)
evidence_grade: Single Source
sources:
  - label: Descriptive label
    url: https://...
    date: "YYYY-MM-DD"
    outlet: The Hindu
    source_type: news_article
tags: [tag1, tag2]
related_promises: []
last_reviewed: "YYYY-MM-DD"
---

Write the incident body here in Markdown. Describe what happened, who was involved
(by role, not just name), and what evidence exists.

Use passive voice for unverified claims. Add [Allegation] tag where evidence grade
is Allegation.

> **Story discovered via:** Note the original discovery source if different from citations.
```

3. For Twitter/Reddit sources, archive first:
   - Go to [web.archive.org](https://web.archive.org/save)
   - Enter the URL and save
   - Add the archive URL as `archived_url` in the source

## Updating an Existing Entry

**Never overwrite existing content.** Instead, add to the `updates[]` array:

```json
"updates": [
  {
    "date": "YYYY-MM-DD",
    "note": "What changed — neutral tone",
    "sources": [{ ... }]
  }
]
```

Also update `current_status` and `evidence_grade` if the new source changes the picture. Update `last_reviewed` to today.

## PR Checklist

Before opening a PR:
- [ ] `npm run validate` passes with no errors
- [ ] All sources have `source_type` filled
- [ ] Social/Reddit sources have `archived_url`
- [ ] Summary/body is neutral (no banned words)
- [ ] `last_reviewed` is set to today
- [ ] PR description discloses any conflict of interest
