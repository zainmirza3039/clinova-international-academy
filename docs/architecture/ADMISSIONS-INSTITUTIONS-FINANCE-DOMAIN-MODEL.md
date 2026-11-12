# Clinova — Admissions, Institutions and Finance Domain Model

**Status:** Source-only schema foundation committed on `docs/clinova-rebuild-architecture`.  
**Production:** Not applied.  
**Data:** No programmes, intakes, institutions, fees, invoices or payment records have been seeded.

## 1. Integration with existing schema

The live database already has 17 public tables, including `profiles`, `content_items`, `content_versions`, CPD enrolments, lessons, progress and CPD certificates. The new domain migration does not recreate or rename these existing relations.

The new schema adds a separate academy programme catalogue and intake model. It does not assume that draft programme/course material in the repository is an approved offering. Programme rows are created in `draft` state; approved/published versions require an approver and approval timestamp.

The existing `profiles` relation remains the user profile identity surface. New admissions and institution relations reference `auth.users` for identity and keep application-specific snapshots where necessary for an auditable admission record.

## 2. Admissions domain

Relations:
- `academic_programmes`
- `programme_versions`
- `programme_intakes`
- `applications`
- `application_documents`
- `application_reviews`
- `admission_decisions`
- `application_status_events`

Design points:
- Versioned programme requirements and learning outcomes.
- Intakes reference a specific programme version.
- Application reference is unique and assigned by a trusted command.
- Applicants may begin without an Auth account; `applicant_user_id` remains nullable until identity linking is verified.
- Uploaded documents store private bucket/object keys, never public URLs.
- Application reviews, admission decisions and status events are append-only.
- Final admission decisions are distinct from reviewer recommendations.
- Submitted applications require a submission timestamp.

## 3. Institutional management

Relations:
- `institutions`
- `institution_contacts`
- `partner_agreements`
- `institution_memberships`
- `partner_cohorts`
- `partner_cohort_learners`
- `partnership_reviews`

Design points:
- Institution records distinguish prospect, due diligence, active, suspended and terminated states.
- Agreement versions are retained; approved/active agreements require an approver and timestamp.
- Cohorts reference an agreement and intake. A composite foreign key prevents a cohort from linking an agreement belonging to a different institution.
- Memberships and cohort membership are separate from role assignments. A membership alone does not grant access; the role-assignment system must also grant an institution-scoped permission.
- Partnership review outcomes are append-only evidence.

## 4. Finance

Relations:
- `fee_schedules`, `fee_schedule_items`
- `invoices`, `invoice_lines`
- `payment_transactions`, `payment_allocations`
- `refunds`
- `payment_webhook_events`
- `finance_events`

Design points:
- Monetary values use fixed-precision numeric columns and explicit ISO currency codes.
- Invoice totals must reconcile to subtotal plus tax.
- Invoice line arithmetic is constrained to quantity × unit price and line tax.
- Provider transaction IDs and webhook event IDs are unique and idempotent.
- Captured/authorized payment states require a verified provider event timestamp.
- Processed webhooks require a verified signature and processed timestamp.
- Refund approval is separate from refund request; requester and approver must differ.
- No raw card number, CVV, or payment authentication secret is stored.
- Financial events are append-only.

The database constraints are necessary but not sufficient for financial integrity. Before any live payment integration, server-side command functions must additionally enforce:
- allocation total does not exceed verified captured amount;
- cumulative allocations do not exceed invoice balance;
- refunds do not exceed the refundable captured/allocated balance;
- invoice totals equal the sum of invoice lines before issue;
- transaction and invoice currencies match;
- webhook signatures are verified against the provider's documented scheme;
- idempotency is enforced in the same transaction as the financial state change.

## 5. Security boundary

All newly added relations are in `clinova_private`, have RLS enabled, and explicitly revoke table privileges from `PUBLIC`, `anon` and `authenticated`. No public view or direct Data API access is created in this migration.

The migration relies on the existing append-only trigger function introduced by the role foundation migration. It does not revoke existing private-schema USAGE or existing function privileges because existing content RPC wrappers and triggers depend on them.

A later access layer must provide narrowly scoped server commands and public-safe read projections. Do not grant direct learner, partner, admissions, or finance table access to authenticated clients.

Applicant document storage requires a dedicated private Storage bucket named `application-documents`. The migration sets this bucket key as the document default but does not create or change Storage buckets. Storage provisioning and object policies are a separate reviewed step.

## 6. Required runtime test coverage

The local test file `tests/database/admissions-institutions-finance.local.sql` checks:
- programme/intake/application relationships;
- application review and decision records;
- institution/agreement/cohort tenant integrity;
- invoice line arithmetic;
- payment transaction and allocation creation;
- append-only decision and finance evidence;
- absence of direct API-role table grants.

Additional tests still required:
- document object path ownership and private bucket access;
- application owner and admissions reviewer isolation;
- partner A cannot read partner B;
- finance officer cannot change academic or certification outcomes;
- currency consistency and aggregate financial reconciliation;
- webhook signature failure and replay/idempotency;
- refund approval separation and balance limits;
- application state-transition command authorization.

## 7. Validation state

The migration and tests are committed, but not yet runtime executed. The current execution container does not have local PostgreSQL server binaries, and hosted production is not a safe substitute for a disposable test database. The test runner is wired to apply both new migrations and run the local SQL test suites once free local PostgreSQL tooling is available.

No production migration, Storage bucket change, payment provider, or data write has occurred.
