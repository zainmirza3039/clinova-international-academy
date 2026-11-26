# Clinova SEO, AEO and GEO Strategy
**Reference case study:** PainFix Physiotherapy Clinic  
**Prepared:** 27 November 2026  
**Status:** Strategy and implementation specification; not authorization to enable indexing, publish draft education content, change production settings, or deploy.

## 1. Purpose

This document adapts the search strategy used on PainFix Physiotherapy Clinic to Clinova International Academy. PainFix is a useful real-world case study because its SEO work was based on query/page evidence, clear URL ownership, local entity consistency, clinical expertise, controlled metadata experiments, internal links, structured data and pre-release regression tests.

The transfer is methodological, not a copy-and-paste of keywords. PainFix is a local physiotherapy provider in Multan. Clinova is an international healthcare education institution. Their audiences, conversion goals, search markets and eligible claims are different.

**Strategic objective for Clinova:** build discoverability for verified healthcare education programmes and institutional services while establishing an authoritative, factually accurate institutional entity.

## 2. PainFix case study: what the evidence shows

The following figures are historical Google Search Console observations documented in PainFix's SEO implementation records. They are evidence of search visibility at the recorded dates, not guaranteed current rankings or proof that one change alone caused a ranking improvement.

### 2.1 Local commercial query ownership

PainFix assigned broad local discovery to one canonical homepage instead of maintaining several competing local landing pages.

Pakistan-filtered GSC data for 12 October–10 November 2026 recorded:

| Query | Landing URL | Impressions | Clicks | Average position |
|---|---|---:|---:|---:|
| physiotherapist in Multan | / | 23 | 1 | 6.78 |
| physiotherapist Multan | / | 27 | 0 | 6.70 |
| physiotherapy Multan | / | 32 | 1 | 8.63 |
| physiotherapy in Multan | / | 14 | 0 | 8.93 |
| best physiotherapist in Multan | / | 7 | 0 | 11.00 |

**Lesson:** choose the strongest existing URL based on query/page evidence, assign it one primary intent cluster, and stop near-duplicate pages competing for the same intent. The PainFix homepage became the owner of broad local clinic discovery; booking and home-visit pages retained separate conversion intents.

### 2.2 Search snippet and clinician-selection AEO

PainFix's 23 November 2026 AEO record reported a 28-day Pakistan-filtered GSC sample:

| Query | Impressions | Clicks | Average position |
|---|---:|---:|---:|
| physiotherapy multan | 43 | 0 | 9.3 |
| physiotherapist in multan | 34 | 1 | 9.4 |
| physiotherapist multan | 31 | 0 | 7.5 |
| best physiotherapist in multan | 3 | 0 | Sample too small for strong conclusions |

The work added one useful, factual question: **“How should I choose a physiotherapist in Multan?”** Its answer explained verifiable selection criteria such as qualifications, relevant experience, assessment quality and treatment-goal discussion. One source of truth powered both the visible FAQ and existing FAQ JSON-LD.

**Lesson:** answer a real user question with concise, independently useful guidance. Do not add FAQs solely to insert keywords or promise a rich result. Structured data must match visible page content.

### 2.3 Protect informational query ownership

PainFix preserved a high-impression informational article rather than redirecting or merging it into a commercial service page.

Its 23 November 2026 Pakistan-filtered 28-day sample recorded:

| Query | Existing landing page | Impressions | Clicks | Average position |
|---|---|---:|---:|---:|
| kamar dard ki exercise | /blog/best-exercises-for-lower-back-pain | 136 | 1 | 8.68 |
| kamar dard exercise | same article | 23 | 0 | 7.96 |
| kamar ki exercise | same article | 16 | 0 | 7.56 |

The exercise guide retained practical exercise instructions; a separate article retained warning signs and exercise-safety intent. Contextual links connected them without collapsing their distinct purposes.

**Lesson:** do not consolidate two pages just because they mention the same topic. Separate intent first; link the informational resource to the relevant commercial or programme page.

### 2.4 Technical and entity consistency

PainFix's documented work also included:
- One canonical homepage and clear redirect ownership for redundant local landing URLs.
- A sitewide clinic entity with a stable `@id`, reused rather than duplicated across pages.
- Clinician profile and condition-page entity relationships.
- Distinct title, H1, description and canonical checks.
- Sitemap and route tests.
- Preview QA before merge or production release.
- Search Console measurement after enough impressions accumulated.

**Lesson:** structured data, canonical URLs, internal links and visible page facts must reinforce the same entity and page purpose.

## 3. What Clinova should transfer — and what it must not copy

| PainFix method | Clinova adaptation |
|---|---|
| One homepage owns broad local discovery | One institutional homepage owns broad brand/institutional discovery |
| Condition and service URL ownership | Programme, subject-area, faculty, resource and partnership URL ownership |
| Clinician credentials and profiles | Verified faculty, academic leadership and institutional governance profiles |
| Local FAQ answering selection questions | Programme eligibility, CPD meaning, learning format and institutional collaboration FAQs |
| MedicalClinic / Person entity relationships | Organization, EducationalOrganization where justified, Person and Course entities only when supported |
| Local SEO and GBP consistency | International organization identity, verified address/contact details and country-specific operational facts |
| Appointment and home-visit conversions | Programme enquiries, approved enrolments and institutional partnership enquiries |
| Clinical content review | Academic/editorial review, subject-matter review and exact-version publication approval |

Do not transfer PainFix's Multan keywords, local landing-page strategy, clinic schema, clinical claims or local business conversion pattern to Clinova.

## 4. Clinova's present indexing and content constraints

The existing Clinova repository's `docs/SEO-INDEXING-BOUNDARIES.md` currently records a deliberately narrow indexability allowlist:
- `/`
- `/contact`
- `/accessibility-statement`
- `/external-linking-policy`

Other known routes are currently noindex and excluded from the sitemap while their content, functionality, policies or evidence remain incomplete. The indexing gate is default-off in Preview and requires an approved production release sequence.

The existing content inventory also records that programme and CPD source records are draft-only; learner authentication, enrolment, assessments, certificate issuance, public verification and enquiry submission are not operationally enabled. Source-level `published` flags are not proof of clinical/editorial review or approval.

**Therefore, this strategy does not authorize enabling indexing or publishing catalogue pages.** Expand the indexable route allowlist only after each page has verified facts, approved content, a working user journey and a specific release decision. Keep draft, closed, placeholder, private and authenticated routes out of the index.

## 5. Search-intent architecture and keyword-to-URL ownership

Each coherent intent cluster should have one preferred URL. Do not create multiple URLs targeting the same broad phrase.

### 5.1 Institutional and brand intent

| Intent cluster | Preferred page | Notes |
|---|---|---|
| Clinova International Academy | Homepage `/` | Brand/entity identity and institutional proposition |
| International healthcare education academy | Homepage `/` | Broad institutional intent; avoid unsupported superlatives |
| About Clinova, mission and governance | `/about` | Publish only verified history, leadership and governance facts |
| Contact Clinova | `/contact` | Accurate legal identity and contact details |

### 5.2 Professional education and CPD intent

Activate only when programme details and enrolment status are approved.

| Intent cluster | Preferred page | Supporting topics |
|---|---|---|
| CPD courses for healthcare professionals | `/cpd-courses` or existing canonical catalogue route | CPD programmes, professional development |
| Physiotherapy CPD courses | Relevant verified programme detail | Musculoskeletal rehabilitation, manual therapy, sports rehabilitation |
| Medical CPD programmes | Relevant verified programme detail | Clinical updates, evidence-informed practice |
| Nursing CPD programmes | Relevant verified programme detail | Clinical skills, patient safety |
| Allied health professional development | Relevant verified catalogue/department page | Interdisciplinary professional education |
| Individual programme name | One canonical programme detail URL | Objectives, audience, syllabus, delivery, assessment and enrolment status |

Do not publish a programme page merely because a title exists in a source file. Each page requires confirmed programme scope, audience, objectives, faculty (if named), learning hours (if claimed), delivery method, assessment and commercial status.

### 5.3 Academic subject-area intent

Potential subject clusters include physiotherapy and rehabilitation, medicine, nursing, pharmacy, dentistry, psychology, nutrition, occupational therapy, sports and exercise, and healthcare management.

These are potential taxonomy groups, not evidence that Clinova operates an approved department or currently offers programmes in every subject. Use a subject-area landing page only when it has substantive, approved content and a meaningful set of related programmes or resources. Avoid thin category pages.

### 5.4 Faculty and expertise intent

A faculty profile should own the person's name and verified professional/academic expertise. Publish only confirmed qualifications, roles, areas of teaching, affiliations and biography. Do not create fictional faculty, imply institutional employment from an informal relationship, or publish unverified credentials.

### 5.5 Institutional partnership intent

A verified institutional partnership page can target:
- Healthcare education partnerships.
- CPD training for hospitals and healthcare organisations.
- Institutional healthcare training collaboration.
- Academic collaboration in healthcare education.

The page must distinguish an invitation to discuss collaboration from an existing agreement. Only name partners when the relationship and permission to display it are confirmed.

### 5.6 Informational resource intent

Educational articles should answer a specific professional or learner question and link contextually to relevant programmes or subject pages. Preserve distinct intents:
- Explanatory article: answers a knowledge question.
- Programme page: explains a specific learning offer.
- Institutional page: explains Clinova's verified capability or partnership pathway.

Do not turn every article into a sales page. Do not claim clinical guidance is peer-reviewed, clinically approved or authored by a named expert without evidence.

## 6. International SEO strategy

Clinova's international ambition does not justify creating country pages for every market.

### Initial approach
1. Establish one authoritative global institutional domain and consistent organization identity.
2. Use clear international English and explain UK-specific terms where necessary.
3. Identify priority markets from actual enquiries, enrolments, partnership demand and Search Console data.
4. Create a country-specific landing page only when Clinova has a genuine operational, regulatory, delivery, pricing, support or partnership distinction for that market.
5. Use hreflang only when there are true language or regional page variants with equivalent content; do not use it as a country-keyword signal.
6. Do not imply a programme is recognized by a national regulator or professional body unless the recognition is verified for that jurisdiction.

Avoid doorway pages, thin translated pages and duplicated country/discipline combinations.

## 7. On-page SEO specification

Every eligible public page should have:
- One clear primary search intent and one preferred canonical URL.
- A unique, descriptive title and meta description.
- One clear H1 that describes the page.
- An opening paragraph that directly explains what the page offers or answers.
- Logical H2/H3 sections based on user questions and programme information.
- Accurate internal links to relevant subject, programme, faculty, resource and contact pages.
- Descriptive image alt text where an image conveys information; decorative images should not receive keyword-stuffed alt text.
- A visible author/reviewer identity only where the person and review are confirmed.
- Clear last-reviewed or publication dates only when they reflect real editorial records.
- No unsupported accreditation, CPD hours, certificate, qualification, employment or outcome claims.

Do not repeat exact-match keywords in every heading. Use natural terminology and synonyms that clarify the topic.

## 8. AEO: answer-engine optimization

AEO should make Clinova's verified information easy to understand, extract and cite in conventional search answers and assistant responses.

### Page answer pattern
For each important question:
1. Put a direct, concise answer near the top.
2. Explain the conditions, scope or exceptions.
3. Provide the supporting detail, process or evidence.
4. Link to the authoritative Clinova page or policy.
5. Keep the answer consistent with the visible page and current operational status.

### Priority question clusters

**Institutional identity**
- What is Clinova International Academy?
- Who does Clinova serve?
- Where is Clinova based?
- What types of healthcare education does Clinova provide?

**CPD education**
- What does CPD mean for healthcare professionals?
- Who can apply for a particular programme?
- How many learning hours does a programme include?
- How is learning assessed?
- What does a Clinova completion certificate confirm?

**Professional certification**
- Is a CPD completion certificate the same as professional competency certification?
- What is the difference between course completion and independent competence assessment?
- What does a certificate verification result confirm?

**Institutional partnerships**
- How can a hospital or university discuss a training partnership?
- What information is needed for an institutional enquiry?
- Does an enquiry mean a partnership is already established?

Only publish answers once the relevant policy or service is approved. If an activity is not yet operational, say so plainly rather than writing an aspirational answer as if it were live.

### FAQ and structured-data rules
- FAQs must answer real questions and be visible to users.
- Keep a single source of truth for the visible FAQ and any matching JSON-LD.
- Structured data must represent the visible page accurately.
- Do not expect FAQ rich results or promise enhanced search appearance.
- Do not add schema solely to target a search feature.
- Avoid fake reviews, ratings, testimonials, course outcomes or accreditation facts.

## 9. GEO: generative-engine optimization and institutional entity clarity

GEO is not a separate guaranteed ranking system. The practical objective is to make Clinova's factual identity, expertise, programmes and policies unambiguous and independently verifiable.

Priorities:
- Publish consistent legal/institutional name, canonical domain and verified contact facts.
- Maintain a clear About page and governance information.
- Provide substantive faculty profiles with verified qualifications and roles.
- Publish programme pages with transparent objectives, audience, delivery and assessment.
- Cite credible source material in educational resources and identify authors/reviewers accurately.
- Publish real policies and distinguish public policies from internal controlled documents.
- Make institutional partnerships and accreditation status precise and verifiable.
- Ensure important facts exist in crawlable HTML, not only in images, PDFs or client-side widgets.
- Keep organization details consistent across the website and legitimate external institutional profiles.

Do not create fake third-party mentions, fabricated citations, synthetic reviews, mass-produced AI articles or unearned authority signals. Do not claim that an LLM crawler being allowed guarantees inclusion in AI answers.

## 10. Structured data and entity model

Use only types and properties that accurately describe visible, verified content. Candidate types for later review:
- `Organization` or an appropriate educational organization subtype for the academy.
- `WebSite` and `WebPage` for the site and its public pages.
- `Person` for verified faculty or leadership profiles.
- `Course` for a real, sufficiently documented programme.
- `Event` for a real event with confirmed date, location or delivery details.
- `Article` for substantive educational resources with accurate author/date information.
- `BreadcrumbList` where the visible navigation hierarchy supports it.

Use one stable organization `@id` across the site and connect relevant pages to that entity. Do not emit Course, Event, Person, Offer, accreditation or credential schema for placeholders, unverified records or unavailable services. Do not use `EducationalOccupationalProgram`, `Course` or other schema as a way to imply formal recognition that has not been awarded.

## 11. Internal linking model

Build links around the user's next useful step:
- Homepage → About, verified subject areas, approved programmes, partnership information and contact.
- Subject area → relevant approved programmes and high-quality resources.
- Programme detail → eligibility, faculty, delivery, assessment, relevant policies and enrolment/enquiry.
- Faculty profile → programmes and subject areas they genuinely teach.
- Resource article → related learning programme only when relevant; also link to supporting sources.
- Partnership page → institutional enquiry and relevant training capability.
- Policy pages → the services and workflows governed by those policies.

Use descriptive anchor text. Avoid repeated sitewide exact-match anchors and orphaned pages. Do not link to unavailable application, enrolment, verification or payment journeys as if they work.

## 12. Technical SEO and release checks

For each approved public release:
- Confirm one canonical origin and consistent trailing-slash policy.
- Verify status codes, redirects and 404 behavior.
- Verify title, description, H1, canonical, robots directives and Open Graph metadata.
- Check sitemap contains only approved canonical indexable URLs.
- Check robots.txt and noindex behavior for private, draft, admin and closed routes.
- Validate JSON-LD syntax and page/schema consistency.
- Check mobile rendering, page speed, accessibility and internal-link integrity.
- Confirm the preview uses the correct environment and does not expose production-only data.
- Run route, metadata, canonical, sitemap and structured-data regression tests.
- Review the preview before merging; do not activate indexing simply because a build succeeds.

## 13. Measurement and experiments

### Baseline before each change
Capture:
- Search Console property and date range.
- Country, search type, device and page/query filters.
- Impressions, clicks, CTR and average position.
- Query-to-page mapping and any competing URLs.
- Relevant conversion counts from actual operational records.

### Reporting cadence
- Weekly technical/indexing review during launch.
- Query/page performance review at 28-day intervals when enough data exists.
- Compare equivalent date windows and country/device filters.
- Separate brand, informational, programme-commercial and institutional-partnership queries.
- Track qualified enquiries and completed enrolments, not CTA clicks alone.
- Record page changes and release dates so experiments can be interpreted.

### Controlled test protocol
1. State the observed problem and baseline.
2. Form one specific hypothesis.
3. Change the smallest relevant page element or group.
4. Preserve URL, canonical and unrelated content unless the test explicitly concerns them.
5. Test in preview.
6. Release only after approval.
7. Wait for recrawl and sufficient impressions.
8. Compare CTR, clicks, impressions, position and qualified conversion outcomes.
9. Keep, revert or iterate based on evidence; do not attribute every fluctuation to the change.

## 14. Clinova implementation priorities

| Priority | Work | Acceptance criteria |
|---|---|---|
| P0 | Preserve the existing indexing allowlist | Only approved routes are indexable; draft/private routes remain excluded |
| P0 | Confirm canonical domain and metadata | One canonical origin; route metadata and robots behavior pass tests |
| P0 | Audit sitemap, redirects and 404 handling | No draft, duplicate, private or broken URLs in sitemap |
| P1 | Approve institutional homepage content | Verified identity, audience, educational scope and clear enquiry action |
| P1 | Create keyword-to-URL map for approved content | One primary intent and preferred URL per cluster |
| P1 | Improve About, governance and faculty evidence | Only confirmed names, roles, credentials and policies |
| P1 | Publish approved programme detail pages | Complete verified course facts and functioning user journey |
| P1 | Add visible answer-led FAQs | Questions reflect real user needs; answers match current policy and status |
| P2 | Add accurate structured data | Schema matches visible, verified page content |
| P2 | Expand international pages selectively | Country-specific operational value and demand are evidenced |
| P2 | Build institutional partnership content | Clear proposition, verified capability and functioning enquiry route |

## 15. Source documents and traceability

PainFix reference material inspected in its GitHub repository:
- `docs/seo/keyword-to-url-ownership-plan-2026-11.md`
- `docs/seo/homepage-commercial-seo-priority-1.md`
- `docs/seo/homepage-local-commercial-priority-3.md`
- `docs/seo/homepage-aeo-clinician-selection-2026-11-23.md`
- `docs/seo/back-pain-exercise-ctr-test-2026-11-23.md`
- `docs/seo/back-pain-content-ctr-priority-2.md`
- `docs/seo/dr-zain-profile-condition-entities-2026-11-23.md`
- `docs/seo/condition-service-intent-map-2026-11-27.md`

Clinova source material inspected in the existing development branch:
- `docs/SEO-INDEXING-BOUNDARIES.md`
- `docs/CLINOVA-CONTENT-INVENTORY.md`
- `docs/CLINOVA-MASTER-DEVELOPMENT-SPECIFICATION.md`
- `docs/CLINOVA-REBUILD-ARCHITECTURE-AND-DESIGN.md`
- `docs/SUPABASE-IMPLEMENTATION-STATUS.md`

**Final rule:** PainFix is the example of disciplined execution and measurement, not a promise that Clinova will achieve the same rankings. Clinova's SEO/AEO programme must be driven by its own verified content, audience demand, institutional evidence and measured search performance.
