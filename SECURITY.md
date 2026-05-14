# Security Policy

## Reporting a vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Use [GitHub Security Advisories](https://github.com/Kreativepardha/TSGOV-AccountabiltiyTracker/security/advisories/new) to report privately. The maintainer is notified, response within 72 hours.

Alternatively, email the maintainer (see GitHub profile).

## What counts as a vulnerability

- Auth bypass on `/api/admin/*` endpoints
- Exposure of `DATABASE_URL`, `ADMIN_API_KEY`, or other secrets in code or logs
- SQL injection (we use Prisma — should be impossible, but report anyway)
- XSS in user-submitted issue content rendered in admin UI
- CSRF on admin endpoints
- Server-side request forgery (SSRF) via discovery pipeline URL fetching
- Discovery scraper consuming arbitrary external URLs without validation
- Prisma client adapter leaking connection strings
- Any way to delete / modify published content without admin auth

## What is NOT a vulnerability (will be closed)

- Public data being public (politician names, criminal cases — all sourced from public records)
- Source URL pointing to a paywalled article (we link, we don't paywall)
- Rate limit bypass on the public `/api/promises` endpoint (deliberately permissive)
- Subjective claims about content (use the correction issue template)

## Disclosure timeline

- T+0: Report received
- T+72h: Acknowledgement + initial assessment
- T+7d: Fix in progress / patch shared with reporter
- T+30d: Public advisory + credit (if reporter consents)

## Bounty

No paid bounty — this is a public-interest, non-commercial project. Credit in security advisory + repo CONTRIBUTORS file.

## Threat model in scope

- Hostile actors trying to inject false content into the discovery pipeline
- Defamation suits — content with insufficient sourcing is a security concern (editorial as much as technical)
- Database access leakage — DATABASE_URL must never appear in client bundles
- Admin key leakage via `NEXT_PUBLIC_*` env vars

## Out of scope

- DDoS on public site (Vercel handles at CDN layer)
- Brute-forcing the admin API key (would be detected, key rotated)
- Social engineering of maintainers (general security hygiene, not a TSGOV-specific issue)
