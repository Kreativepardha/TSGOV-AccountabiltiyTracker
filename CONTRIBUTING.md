# Contributing to TSGOV Accountability Tracker

TSGOV is a non-partisan public archive. We accept contributions from anyone — citizens, journalists, researchers, students — provided every claim is **sourced** and **evidence-graded**.

## Quick links

- **Suggest a new promise:** [open issue](https://github.com/Kreativepardha/TSGOV-AccountabiltiyTracker/issues/new?template=add-promise.yml)
- **Report an incident:** [open issue](https://github.com/Kreativepardha/TSGOV-AccountabiltiyTracker/issues/new?template=add-incident.yml)
- **Submit a correction:** [open issue](https://github.com/Kreativepardha/TSGOV-AccountabiltiyTracker/issues/new?template=correction.yml)
- **Security disclosure:** see [SECURITY.md](./SECURITY.md)

## Editorial principles (non-negotiable)

1. **Every claim must be sourced.** Minimum: one credible URL per fact. Multiple sources preferred.
2. **Source must be linkable.** No "I heard from a friend." No hearsay. No anonymous WhatsApp forwards.
3. **Allegations are labelled as allegations.** Until conviction, criminal cases stay at status `pending`. Until proven, claims stay at evidence grade `Allegation`.
4. **Non-partisan.** Track government performance regardless of party. Same scrutiny for INC, BRS, BJP, AIMIM.
5. **Corrections welcome.** If you find an error, open an issue. Fixes ship same day.

## How to contribute code

### 1. Fork + clone

```bash
git clone https://github.com/<your-username>/TSGOV-AccountabiltiyTracker.git
cd TSGOV-AccountabiltiyTracker
npm install
cp .env.example .env.local   # fill in DATABASE_URL etc — ask maintainer for dev DB access
npm run dev
```

### 2. Branch naming

- `feat/<short-desc>` — new feature
- `fix/<short-desc>` — bug fix
- `data/<promise-slug>` — adding a single promise
- `data/incident-<slug>` — adding a single incident
- `chore/<short-desc>` — refactor, docs, tooling

### 3. Run checks before opening PR

```bash
npm run validate    # Zod schema validation on all content/
npm run test:unit   # unit tests
npm run build       # full Next.js build + Prisma generate
```

All three must pass.

### 4. Open PR

- Target branch: `main`
- Fill out the PR template (sources verified, evidence grade reasoned, etc.)
- A maintainer reviews within 48 hours
- Required: Vercel build green, 1 maintainer approval, all comments resolved

## How to add data (without code)

You don't need to write code to contribute facts. Use issue templates — a maintainer will translate to JSON/MD for you:

- **Promise issue template** → asks for: title, category, deadline, sources, evidence grade
- **Incident issue template** → asks for: title, date, district, category, sources
- **Correction template** → existing slug + what's wrong + correct source

The maintainer adds the entry and credits you in the commit.

## What we won't accept

- Unsourced claims (even from reputable journalists' tweets without article links — the article is the source)
- Partisan framing (e.g. "Congress is destroying Telangana" — say what happened, link sources)
- Personal attacks or defamation against individuals — even politicians have a right to reply via /admin
- Scraped content from paywalled sites without their license permission
- Duplicate entries (search first via `/search` or `/api/promises`)

## Code style

- TypeScript strict mode
- Tailwind classes — no inline styles
- Server components by default; client components only when needed (`"use client"`)
- All content validated via Zod schemas in `lib/schemas.ts`
- Components in `components/` (kebab-case for new files, PascalCase exports)

## Questions?

- [Open a discussion](https://github.com/Kreativepardha/TSGOV-AccountabiltiyTracker/discussions)
- Email maintainer: see GitHub profile

## License

By contributing, you agree your contributions are licensed under CC-BY-4.0 (data) and MIT (code).
