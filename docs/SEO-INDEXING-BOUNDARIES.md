# Clinova search-indexing boundaries

## Canonical origin

The verified canonical origin is `https://www.clinovainternationalacademy.co.uk`. Both the apex and `www` domains are verified on the existing Vercel project and currently return HTTP 200; the Vercel Production `VITE_SITE_URL` already names the `www` origin. SEO URLs and sitemap entries use that one canonical host. The deployment configuration is not changed to add redirects.

## Indexable public routes

The build-time and runtime allowlist contains only `/`, `/contact`, `/accessibility-statement`, and `/external-linking-policy`. The homepage metadata identifies Clinova and clearly states that no CPD course, application, examination, credential, or live-verification service is open. The contact page uses owner-confirmed legal identity and registered virtual-office facts. The Accessibility Statement is preserved exactly as owner-approved, including its MyUniHub and support-contact details. The External Linking Policy is owner-approved.

Every other known route is noindex and omitted from the sitemap. This includes empty events and faculty directories; admissions, application, programme, CPD, education-resource and certification/assessment pages that are closed, draft, status-only or awaiting evidence; the Privacy, Terms, Cookie and Refund placeholders; and authenticated, admin, verification and CMS paths. Dynamic programme, course, article, department and learning-resource details are never included merely because a source record says `published`; unlisted paths fail closed at runtime.

## Robots, sitemap and metadata

In an enabled production build, `robots.txt` permits public crawling, disallows private account/admin/application/verification/CMS paths, and points to the canonical sitemap. The sitemap is generated solely from the four-route allowlist. Known noindex routes receive static noindex shells; runtime route metadata also defaults every unlisted path to `noindex, nofollow` and removes canonical/JSON-LD data. Eligible routes receive route-specific title, description, canonical URL, Open Graph, Twitter Card and conservative WebSite/ContactPage/WebPage JSON-LD using only verified Clinova identity, logo and route facts. No Course, Event, Person, medical-approval, certificate-eligibility, accreditation or offer schema is emitted.

## Release gate

`VITE_INDEXING_ENABLED` is false in Preview and remains false in Production until the first authorised production deployment has completed successfully. The Vercel build command continues to force the existing auth, verification, learner-data and enquiry gates off; only the indexing override is removed so the existing per-environment value can take effect. After the successful release build is verified, set `VITE_INDEXING_ENABLED=true` for Production only, keep Preview false, redeploy the same approved main commit, and recheck live robots, sitemap, canonical tags and metadata. No Supabase schema, data, role, permission, Auth or storage setting is changed by this SEO work.
