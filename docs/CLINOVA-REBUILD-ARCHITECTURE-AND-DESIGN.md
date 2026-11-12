# Clinova International Academy — Rebuild Architecture & Design Blueprint

**Status:** Proposed architecture and design baseline — owner-approved direction, not implementation or launch approval.  
**Reference:** MedicPro International Academy (medicprointernationalacademy.co.uk).  
**Brand decision:** Retain Clinova identity and existing logo.  
**Scope:** Complete public academy website, LMS, administration, institutional workflows and credential systems.  
**Deployment boundary:** Existing Clinova Vercel team/project only. No production deployment, DNS change, hosted schema change, migration, data deletion or secret rotation is authorized by this document.

## 1. Product direction

Build Clinova as a healthcare education institution with a public-facing academy website and a secure, role-based learning platform behind it. Follow MedicPro's institutional information architecture: prominent academy introduction, mission/vision, who-we-serve pathways, subject departments, programme discovery, faculty, admissions, updates, institutional partnerships and clear contact actions.

Clinova must not copy MedicPro's name, copy, imagery, testimonials, course inventory, staff details, metrics, legal claims or accreditation statements. All Clinova content must be original and owner-verified.

The product has three governed domains:

1. **Academy and public information** — brand, departments, faculty, programme catalogue, admissions, news/resources, policies, contact and institutional partnerships.
2. **CPD learning platform** — course applications/enrolments, course delivery, learning progress, course assessments, completion decisions and CPD completion credentials.
3. **Professional competency certification** — separately governed schemes, candidate eligibility, evidence, independent assessment, impartiality review, certification decisions and professional credentials.

CPD participation or course completion must never automatically confer professional competency certification. A Clinova credential must not imply statutory registration, a licence to practise, UKAS accreditation or recognition by another body unless that exact status has been formally awarded and verified.

## 2. Reference-site patterns to adopt

| MedicPro pattern | Clinova implementation |
|---|---|
| Institutional hero and primary enquiry/admission actions | Strong academy positioning with distinct Explore Programmes and Apply/Enquire actions |
| Mission, vision and director/leadership content | Verified academy purpose, governance and leadership |
| Audience pathways (undergraduate, postgraduate, partners, online) | Doctors, DPTs/physiotherapists, nurses and allied health professionals; institutional partners |
| Department-led catalogue | Searchable subject areas with clear programme-type taxonomy |
| Faculty and staff directory | Verified faculty profiles, credentials, teaching roles and biographies |
| Admissions form | Multi-step application with save/resume, secure document upload and reference number |
| News and announcements | CMS-managed updates with editorial review and publication history |
| Testimonials and institutional statistics | Display only when Clinova has genuine, documented evidence and permission |
| Contact and consultation CTA | Clear contact route, enquiry tracking and privacy notice |

Reference-site content currently indicates departments, faculty, programmes, admissions, partner pathways and institutional pages. These are structural patterns only; Clinova's own approved content is the source of truth.

## 3. Recommended technical architecture

### Application

- **Next.js App Router + TypeScript** for server-rendered public pages, metadata, structured data, route-level loading/error states and authenticated application routes.
- **React** component system with accessible primitives and a Clinova design-token layer.
- **Tailwind CSS** for implementation styling, with reusable semantic components rather than page-specific utility sprawl.
- **Zod** (or equivalent runtime schemas) for validation at server boundaries.
- **Playwright** for critical browser journeys; unit/component tests for domain logic and UI.

**Why replatform from the current Vite SPA:** the academy is both a search-facing institutional site and a secure application platform. Server rendering and server-side route/data boundaries are a better fit for indexable programme and department pages, protected workflows and server-only integrations. Preserve useful brand assets, verified content, route intent, SEO metadata and tests where they pass review; do not blindly port existing components or draft records.

### Backend and data

- **Existing Supabase project** is the preferred backend target, subject to restored project access and a read-only inventory. Do not create a replacement project or alter the existing project until access, ownership, data and environment have been confirmed.
- **PostgreSQL** as the system of record.
- **Supabase Auth** for identity, email verification, password recovery and session management.
- **Supabase SSR** integration for server-rendered authentication and secure cookie/session handling.
- **Row Level Security** on every exposed table; least-privilege grants; private schemas for sensitive records.
- **Supabase Storage** with private buckets for learner evidence, application documents, course files and controlled documents. Use short-lived signed access where appropriate.
- **Next.js Route Handlers / Server Actions** for validated application commands and provider callbacks. Use Edge Functions only where their execution model adds value.
- **Email provider and payment provider** remain integration decisions; do not assume a provider or mark payment/enrolment as complete until a verified callback is received.

Never expose service-role/secret keys in browser code. Authorization must use trusted server-controlled claims/records, never user-editable user metadata. Do not trust client-supplied role, price, course status, completion, assessment result or certificate status.

### Deployment and environments

- Use the existing Vercel team `clinovainternationalacademy-1798` and project `clinova-international-academy`.
- Keep production domain `clinovainternationalacademy.co.uk` attached to the existing project unless a separately approved change is required.
- Establish isolated local, preview/staging and production configuration. Preview must not write to production learner records or send real transactional communications.
- Production deploys, indexing activation, domain changes and environment-variable edits require separate owner approval.
- Use GitHub feature branches and pull requests. Require typecheck, lint, unit tests, build, accessibility checks and critical E2E flows before merge.

## 4. Application surfaces and route map

### Public academy

- `/` — Home
- `/about` — Mission, vision, leadership and governance
- `/departments` and `/departments/[slug]` — Subject areas
- `/programmes` and `/programmes/[slug]` — Programme catalogue and detail
- `/cpd` and `/cpd/[slug]` — CPD catalogue and detail
- `/faculty` and `/faculty/[slug]` — Faculty directory and profile
- `/admissions` and `/apply` — Admissions guidance and application
- `/institutions` and `/institutions/partner-with-us` — Institutional collaboration
- `/news` and `/news/[slug]` — Announcements and articles
- `/resources` and `/resources/[slug]` — Educational resources
- `/quality`, `/policies`, `/legal`, `/privacy`, `/contact`
- `/verify/[credential-id]` — Public, privacy-minimised credential verification

### Learner and teaching workspace

- `/portal` — Role-aware portal entry
- `/portal/learner` — Enrolments, learning progress, assessments, CPD history and credentials
- `/portal/instructor` — Assigned courses, lesson authoring (where permitted), learner support and marking
- `/portal/assessor` — Certification assessment assignments and evidence submission
- `/portal/partner` — Institution-specific cohorts, learners and reporting, if partner contracts permit

### Administration

- `/admin` — Operational overview
- `/admin/admissions` — Application review and decisions
- `/admin/people` — Learners, faculty and staff records
- `/admin/catalogue` — Departments, programmes, CPD courses and intakes
- `/admin/learning` — Course content, cohorts, enrolments and assessment operations
- `/admin/certification` — Scheme governance, eligibility, evidence, decisions and credential lifecycle
- `/admin/content` — CMS, editorial workflow and publication
- `/admin/quality` — Controlled policies, review records, complaints, appeals and corrective actions
- `/admin/finance` — Payment reconciliation and refunds, only after provider selection
- `/admin/settings` — Roles, permissions, configuration and audit access

Route presence does not mean the corresponding service is enabled. Each route must be gated by feature readiness and role authorization.

## 5. Roles and separation of duties

Roles are assigned out-of-band by trusted administrators and enforced on the server and database. Use granular permissions rather than a single broad admin flag.

| Role | Permitted responsibility | Explicit restriction |
|---|---|---|
| Public visitor | Read published public content; submit approved public forms | No private records |
| Applicant | Manage own application and own uploaded evidence | Cannot review or approve own application |
| Learner | Access own enrolments, course materials, progress and credentials | Cannot alter completion, grades or credential state |
| Instructor | Manage assigned teaching content and learners within assignment scope | No certification decision authority by default |
| Assessor | Assess assigned certification candidates and submit evidence/results | Cannot decide or issue the same candidate's credential |
| Eligibility reviewer | Review candidate eligibility against a versioned scheme | Cannot bypass scheme rules or decide certification |
| Certification decision-maker | Independently record a reasoned decision | Must be independent of assessment for the same case |
| Impartiality/quality officer | Review conflicts, quality events and controlled records | No self-approval of conflicted work |
| Admissions officer | Review applications and record admission decisions | No access to unrelated certification evidence |
| Content editor/reviewer/publisher | Draft, review and publish public content through controlled workflow | No access to learner private records unless separately authorized |
| Partner manager | Access contracted partner cohort information only | No cross-partner access |
| Super administrator | Manage system configuration and role assignment | Privileged actions audited and restricted |

For every privileged workflow, record actor, action, target, timestamp, reason, prior state and resulting state. Sensitive role assignment and credential revocation require stronger confirmation and auditability.

## 6. Domain model — proposed logical modules

These are logical bounded contexts, not a final migration or SQL schema. Normalize relationships and avoid storing course structures as opaque JSON blobs.

### Identity and access
- `profiles`, `role_assignments`, `permission_definitions`, `user_consents`, `sessions/security events`
- Keep auth identity separate from academic profile fields.
- Use trusted claims or protected role tables; never permit self-service role elevation.

### Institutional catalogue and CMS
- `departments`, `programme_types`, `programmes`, `programme_metadata`
- `faculty_profiles`, `programme_faculty`
- `content_items`, `content_versions`, `review_decisions`, `publication_events`
- Public reads use published, approved projections only.

### Admissions and partnerships
- `applications`, `application_documents`, `application_reviews`, `admission_decisions`
- `institutions`, `partner_agreements`, `partner_users`, `partner_cohorts`
- Personal documents stored privately; access is limited to the applicant and assigned authorized reviewers.

### CPD learning
- `courses`, `course_versions`, `course_modules`, `lessons`, `learning_assets`, `learning_outcomes`
- `intakes/cohorts`, `applications`, `enrolments`, `lesson_progress`
- `assessments`, `assessment_attempts`, `submissions`, `marks/feedback`
- `completion_reviews`, `cpd_credentials`, `credential_events`
- Completion criteria are versioned and approved per course; learners cannot write authoritative progress, marks or completion decisions directly.

### Professional competency certification — separate domain
- `certification_schemes`, `scheme_versions`, `competency_standards`, `eligibility_rules`
- `certification_applications`, `candidate_evidence`, `eligibility_reviews`
- `assessment_assignments`, `assessment_records`, `impartiality_reviews`
- `certification_decisions`, `professional_credentials`, `credential_status_events`
- Keep these records and decision rules separate from CPD courses, CPD assessments and CPD credentials.

### Governance and operations
- `audit_events`, `controlled_documents`, `policy_versions`, `complaints`, `appeals`, `corrective_actions`
- `notifications`, `notification_preferences`, `payment_transactions`, `refunds`
- Retention, access and deletion rules must be approved before real personal data is collected.

## 7. Critical workflows

### Admissions
1. Applicant selects an available programme/intake and sees approved entry, delivery, fee and refund terms.
2. Applicant creates or verifies identity, completes a validated application and uploads only required documents.
3. Server assigns a non-guessable application reference and stores documents privately.
4. Authorized admissions staff review and request missing information or record a reasoned decision.
5. Applicant receives status updates through configured transactional email; all transitions are audited.

### CPD course lifecycle
1. Author creates a draft course version.
2. Academic/content reviewer checks syllabus, outcomes, faculty, hours, assessment, delivery, commercial and credential fields.
3. Authorized publisher approves a specific immutable version.
4. Only then can the course be listed as open and an intake/enrolment flow enabled.
5. Learner progresses through authorized course materials and course-specific assessment.
6. Server evaluates the approved completion rule; authorized completion decision is recorded.
7. A CPD credential snapshot is issued with unique verification identifier and auditable lifecycle.

### Professional certification lifecycle
1. Candidate applies to a defined, approved scheme version.
2. Eligibility reviewer checks evidence against the published criteria.
3. Independent assessor records assessment evidence and outcome.
4. Impartiality/conflict review is completed.
5. Separate decision-maker records an independent reasoned decision.
6. Only an authorized issuance action creates the professional credential.
7. Renewal, suspension, withdrawal, complaint and appeal events are controlled and audited.

### Public credential verification
- Accept a random, non-sequential verification identifier.
- Return only the minimum approved public fields: credential type, holder display name (if policy permits), credential title/scope, issue date and current status.
- Never expose candidate evidence, account identifiers, contact data, assessment marks or internal notes.
- Revocation/suspension must update the public status without deleting the historical audit record.
- CPD completion credentials and professional competency credentials must be clearly distinguished.

## 8. Visual design system

### Brand foundation (retain)
- Existing Clinova logo and abstract book/healthcare-learning mark.
- Primary navy: `#082B4C`.
- Sage: `#66877D`.
- Supporting muted blue-grey: `#526D79`.
- Editorial paper surface: `#F5F3ED`; white content surface; warm neutral divider: `#D9D8D0`.
- Existing logo assets are retained; do not redraw or replace without approval.

### Typography and layout
- Editorial serif for large institutional headings (current design token direction: Newsreader/Georgia).
- Highly legible sans-serif for navigation, body, forms and dashboards (Source Sans 3/system fallback).
- Generous whitespace, restrained borders, square-to-subtle corner radii and low-elevation surfaces.
- Desktop content width around 1180–1240px; mobile single-column layout with carefully prioritised actions.
- Use authentic healthcare education photography with consistent crop and tone; no fabricated faculty portraits or institution imagery.

### Public homepage composition
1. Slim utility strip for verified contact/admissions information.
2. Main header: logo, primary navigation, clear Apply/Enquire action; responsive mobile menu.
3. Hero: institutional statement, short proof-based supporting copy, primary and secondary CTAs, editorial healthcare education image.
4. Introduction and leadership/director message (only after owner verification).
5. Mission and vision in a calm editorial layout.
6. Audience pathways for doctors, physiotherapists/DPTs, nurses, allied health professionals and institutions.
7. Department/subject-area grid.
8. Featured programmes/CPD only when approved and open; otherwise use a clearly labelled catalogue preview or enquiry CTA.
9. Faculty spotlight using verified profiles.
10. Quality, governance and institutional approach.
11. News and announcements from the CMS.
12. Genuine learner feedback only with permission and evidence.
13. Strong admissions/contact CTA and detailed footer with policies.

### Catalogue and detail pages
- Search and filters by department, programme type, delivery mode and availability.
- Clear card hierarchy: subject, title, concise summary, status, approved duration/CPD hours and next action.
- Detail page includes overview, audience, entry requirements, outcomes, module outline, delivery, assessment, fees and credential terms only when each field is approved.
- Distinguish draft, awaiting approval, open, closed and archived states; never imply an unavailable course can be purchased.

### Portal and admin interface
- Separate product shell from public website: compact sidebar, top utility bar, page title, breadcrumbs and content workspace.
- Data-dense tables with explicit filters, empty states, loading states and actionable errors.
- Use status labels and audit context; avoid decorative analytics or invented metrics.
- Responsive layouts must support practical tablet and mobile workflows.

### Interaction and accessibility
- Keyboard-operable navigation, dialogs, forms and tables; visible focus; semantic landmarks and heading order.
- WCAG 2.2 AA target; colour contrast verified, not assumed.
- Respect reduced-motion preferences; use subtle transitions only where they clarify state.
- Forms need inline validation, clear errors, upload progress, save/resume where appropriate and accessible success/failure messages.
- No hover-only information, no fake buttons, no dead links and no invented loading success.

## 9. Content, privacy and regulatory guardrails

- Use Clinova's current brand and owner-approved facts. Confirm legal entity, UK address, leadership, faculty credentials, contact details and public policies before launch.
- Do not claim UKAS accreditation or imply Clinova is accredited. Accreditation-preparation material is not evidence of award.
- Keep CPD and certification language distinct. A CPD completion credential is not a licence or professional competency certification.
- Review every course's exact version, author, reviewer, learning outcomes, hours, assessment, delivery, fees and certificate terms before publication.
- Obtain appropriate permission for testimonials, photography and personal profiles.
- Design for UK GDPR and applicable data protection obligations: lawful basis, data minimisation, transparent privacy notices, retention schedule, access controls, processor agreements and subject-rights handling. Obtain specialist legal review before production collection.
- Avoid collecting passport/identity evidence until necessity, lawful basis, retention and secure access have been approved.
- Payments must use a compliant provider-hosted/tokenized flow; do not store raw card details.

## 10. Delivery sequence and acceptance gates

### Phase A — architecture and design (current)
- Confirm product boundaries, role matrix, route map, data domains and integrations.
- Produce public-site wireframes and visual direction; portal/admin shell concepts.
- Validate content inventory, existing logo/assets, SEO routes and reference patterns.
- Decide whether existing Supabase project is usable after access is restored.
- Output: approved architecture, page inventory, design tokens and interactive frontend preview.

### Phase B — platform foundation
- Create isolated application foundation and environment configuration.
- Implement shared design system, navigation, route shells, error/loading/empty states.
- Add CI gates and accessibility baseline.
- No production data or production deployment.

### Phase C — public academy
- Build server-rendered public pages, CMS publication flow, metadata, sitemap and structured data.
- Preserve useful existing URLs with redirects only after route/SEO review.

### Phase D — backend and identity
- Confirm environment and data inventory.
- Design and review migrations; apply only to an isolated non-production database.
- Implement Auth, granular roles, RLS, private storage and negative-access tests.

### Phase E — LMS and admissions
- Build applications, enrolments, course authoring, learning delivery, progress, assessments and notifications.
- Run end-to-end tests with synthetic users and records.

### Phase F — certification and credential lifecycle
- Implement scheme governance and independent role separation.
- Validate credential issuance, public verification, suspension/revocation, audit and privacy.

### Phase G — operational readiness
- Security review, RLS/advisor review, accessibility, performance, SEO, backup/restore and incident procedures.
- Owner acceptance of content, policies, fees, integrations and domain/indexing settings.
- Production release only after explicit approval.

## 11. Current verified constraints and unresolved dependencies

- Existing repository is a Vite + React + TypeScript single-page application, not a Next.js application.
- Existing README explicitly states that learner, admin, certificate, verification and enquiry workflows are not operational in the current release.
- Existing source contains useful Clinova brand assets, draft catalogue data, route/content inventories and prior security-oriented design work. Draft programme and CPD records are not approved live offers.
- Existing Supabase project access returned a permission error during this architecture inspection. Its current schema, data, migration ledger, Auth configuration, storage and security posture could not be independently verified in this session.
- Existing Vercel project is present in the dedicated Clinova team and is linked to the existing GitHub repository. Latest recorded production deployment state was READY; this is not proof of a completed rebuild.
- Existing PR #26 remains open and is not the implementation target for this architecture branch. Do not merge it as a substitute for the approved rebuild direction.
- Payment provider, transactional email provider, course content/media hosting, legal/privacy review, final faculty/leadership details, programme approvals, fees and any accreditation status remain unresolved.

## 12. Decisions requested before implementation

1. Confirm whether the existing Supabase project can be restored to read access and whether it is the intended long-term production database. No new project or reset is assumed.
2. Confirm whether Next.js replatforming is accepted as the target application architecture. Recommendation: yes, because public SEO and secure server-side workflows are core requirements.
3. Confirm the first preview milestone: public homepage + navigation + departments/programme discovery + admissions entry point, with the portal/admin shells shown as design-only previews.
4. Confirm which original Clinova course/programme records have final academic approval and may be prepared for publication. No draft record is promoted automatically.

---

**Release rule:** A successful build, preview or test is not authorization to collect real personal data, issue credentials, claim accreditation, change production infrastructure or publish the site.
