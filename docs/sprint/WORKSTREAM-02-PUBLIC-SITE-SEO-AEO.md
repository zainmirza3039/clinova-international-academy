# Workstream 02 — Public website and SEO/AEO

## Objective
Make Clinova's public institutional website accurate, navigable, credible and discoverable for its international healthcare education audience.

## Ownership
- Homepage, about, contact, admissions and institutional partnership public journeys
- Public navigation, footer, responsive and accessibility defects
- Search intent and URL ownership
- Technical SEO, structured data, canonical, sitemap and robots/noindex boundaries
- AEO/GEO-ready factual content, entity clarity and source-backed claims

## Acceptance criteria
- Public pages accurately describe Clinova and its programmes without implying unearned accreditation or approval.
- Each indexable page has a distinct purpose, title, description, canonical and useful page content.
- Existing indexing allowlist is preserved unless content and release evidence justify a separately reviewed change.
- Preview remains noindex.
- Internal links lead to real, relevant destinations; no placeholder claims, fake reviews or fabricated credentials.
- SEO/AEO implementation follows `docs/CLINOVA-SEO-AEO-STRATEGY.md`.

## Exclusions
No learner dashboard, enrolment persistence, assessment logic or admin access changes.

## Dependencies
May consume approved programme metadata from Workstream 03. Do not publish draft programme records.

## Verification
Route checks, metadata/canonical/sitemap tests, mobile layout, keyboard navigation and factual content review.

## Release rule
Preview only; do not widen production indexing or deploy to the live domain.