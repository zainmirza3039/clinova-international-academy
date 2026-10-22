# Clinova implementation outcomes

- [x] Audit the existing React/Vite/Supabase repository, routes, migrations, metadata, and scripts before changing application code.
- [x] Preserve existing public routes and publish a synchronized static route manifest for the current route set.
- [x] Replace stale `clinovainternationalacademy.co.uk` canonical and sitemap references with `clinovainternationalacademy.co.uk`.
- [x] Ensure contact form controls have submitted field names and preserve backend-confirmed success messaging.
- [x] Remove fabricated learner dashboard metrics and replace them with an honest authenticated-platform entry state.
- [x] Remove hardcoded certificate records from the public frontend and add a public-read/RLS migration for explicitly public certificates.
- [ ] Implement Supabase Auth registration, login, verification, reset, protected routes, and learner data isolation after the production Supabase project and redirect URLs are confirmed.
- [ ] Implement trusted admin certificate issuance/revocation and content management with backend authorization.
- [ ] Configure Brevo/Supabase SMTP with verified sender credentials without committing secrets.
- [ ] Supply owner-approved legal, faculty, partner, programme, pricing, and accreditation content before publication claims are made.
- [ ] Run browser QA against configured Supabase/Vercel environments and verify deployment only after credentials and project identity are confirmed.
