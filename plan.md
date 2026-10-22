# Clinova International Academy implementation plan

## Scope

Improve the existing React + TypeScript + Vite + React Router + Supabase site in place. Preserve the existing public catalogue and visual direction while removing misleading demo behaviour, correcting production-domain metadata, and establishing safe database boundaries for future authenticated learning features.

## Implementation approach

- Keep the existing page/component/data structure and add only small shared utilities where they reduce duplication.
- Use Supabase migrations for public certificate verification and preserve the existing RLS posture on enquiry tables.
- Make public pages honest about features that require authentication, payment, verified content, or owner configuration.
- Keep the production domain in one constant used by SEO metadata and static SEO files.
- Validate with the existing TypeScript, lint, and production build scripts.

## Project structure

- `src/components`: shared header, footer, page composition, cards, and form UI.
- `src/pages`: route-level public pages.
- `src/data`: typed catalogue, legal, and resource content.
- `src/hooks`: route-aware SEO and reveal/scroll behaviour.
- `src/lib`: Supabase client and shared integration helpers.
- `supabase/migrations`: reviewed schema and RLS changes.
- `public`: static robots, sitemap, route manifest, and brand assets.

## Design direction

Three candidate styles: Clinical editorial minimalism (0.06); Swiss academic precision (0.05); Warm professional learning journal (0.04).

Chosen style: **Clinical editorial minimalism**.

- **Design movement:** contemporary editorial healthcare publishing with quiet clinical confidence.
- **Core principles:** evidence-led hierarchy, generous whitespace, restrained colour, and strong readable contrast.
- **Color philosophy:** deep navy signals trust, clinical blue supports action, and teal marks verified or positive states without becoming decorative.
- **Layout paradigm:** asymmetric editorial sections with full-bleed moments and narrow reading columns rather than repetitive centred card grids.
- **Signature elements:** small uppercase section labels, fine rules, and teal verification accents.
- **Interaction philosophy:** clear, reversible, keyboard-friendly interactions with no hidden or misleading controls.
- **Animation:** subtle fade-up/reveal only; reduced-motion users receive static content.
- **Typography:** Manrope for headings, Inter for UI/body, and Newsreader sparingly for editorial emphasis.
- **Brand essence:** an online academy for healthcare professionals who want structured, practical, evidence-informed development; precise, credible, approachable.
- **Brand voice:** clear and measured. Example: “Build a stronger clinical foundation.” / “Explore learning designed around professional practice.”
- **Wordmark:** use the existing Clinova wordmark assets; do not replace them with generated text.
- **Signature brand colour:** Clinova teal `#0B9B8A`.

## Known blockers

Authentication, learner progress, admin workflows, Brevo SMTP, and production Supabase/Vercel settings require verified project access, owner-approved schema/content, and secrets that are not present in the repository. These will not be simulated in the browser.
