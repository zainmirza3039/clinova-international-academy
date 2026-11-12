-- Clinova admissions, institutional partnership and finance domain foundation.
-- SOURCE-ONLY FEATURE-BRANCH MIGRATION. NOT APPROVED FOR PRODUCTION APPLICATION.
-- Requires the role/authorization foundation migration and Supabase auth.users.
-- No programme, course, fee, partner, or accreditation offering is seeded here.
-- All relations remain in clinova_private with no API-role table privileges.

begin;

-- Programme catalogue: a draft programme is not a published or approved offer.
create table if not exists clinova_private.academic_programmes (
  id uuid primary key default gen_random_uuid(),
  programme_code text not null unique check (programme_code ~ '^[A-Z0-9_-]{2,40}$'),
  internal_title text not null check (length(btrim(internal_title)) between 2 and 240),
  public_title text,
  academic_domain text not null,
  status text not null default 'draft' check (status in ('draft','review','approved','published','suspended','retired')),
  created_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clinova_private.programme_versions (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references clinova_private.academic_programmes(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  version_status text not null default 'draft' check (version_status in ('draft','review','approved','published','superseded')),
  learning_outcomes jsonb not null default '[]'::jsonb check (jsonb_typeof(learning_outcomes)='array'),
  entry_requirements jsonb not null default '[]'::jsonb check (jsonb_typeof(entry_requirements)='array'),
  delivery_model text,
  credit_value numeric(8,2) check (credit_value is null or credit_value >= 0),
  approval_reference text,
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  effective_from date,
  effective_until date,
  created_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (programme_id,version_number),
  check (effective_until is null or effective_from is null or effective_until >= effective_from),
  check ((version_status in ('approved','published') and approved_by is not null and approved_at is not null) or version_status not in ('approved','published'))
);

create table if not exists clinova_private.programme_intakes (
  id uuid primary key default gen_random_uuid(),
  intake_code text not null unique,
  programme_version_id uuid not null references clinova_private.programme_versions(id) on delete restrict,
  application_opens_at timestamptz,
  application_closes_at timestamptz,
  delivery_starts_at timestamptz,
  delivery_ends_at timestamptz,
  capacity integer check (capacity is null or capacity > 0),
  intake_status text not null default 'draft' check (intake_status in ('draft','open','closed','cancelled','completed')),
  created_at timestamptz not null default now(),
  check (application_closes_at is null or application_opens_at is null or application_closes_at > application_opens_at),
  check (delivery_ends_at is null or delivery_starts_at is null or delivery_ends_at > delivery_starts_at)
);

-- Admissions.
create table if not exists clinova_private.applications (
  id uuid primary key default gen_random_uuid(),
  application_reference text not null unique,
  applicant_user_id uuid references auth.users(id) on delete restrict,
  intake_id uuid not null references clinova_private.programme_intakes(id) on delete restrict,
  applicant_full_name text not null check (length(btrim(applicant_full_name)) between 2 and 200),
  applicant_email text not null,
  applicant_phone text,
  applicant_country text,
  status text not null default 'draft' check (status in ('draft','submitted','under_review','awaiting_information','offered','conditionally_offered','rejected','withdrawn','enrolled')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_applicant_user_idx
  on clinova_private.applications(applicant_user_id);
create index if not exists applications_intake_status_idx
  on clinova_private.applications(intake_id,status);

create table if not exists clinova_private.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references clinova_private.applications(id) on delete restrict,
  document_type text not null,
  storage_bucket text not null default 'application-documents',
  storage_object_key text not null unique,
  original_filename text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0),
  sha256 text,
  uploaded_by uuid references auth.users(id) on delete restrict,
  uploaded_at timestamptz not null default now(),
  review_status text not null default 'pending' check (review_status in ('pending','accepted','rejected','replacement_requested')),
  reviewed_by uuid references auth.users(id) on delete restrict,
  reviewed_at timestamptz,
  review_rationale text
);

create table if not exists clinova_private.application_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references clinova_private.applications(id) on delete restrict,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  review_type text not null check (review_type in ('administrative','academic','identity','eligibility')),
  decision text not null check (decision in ('suitable','not_suitable','more_information','conflict_declared')),
  rationale text not null check (length(btrim(rationale)) between 10 and 4000),
  evidence_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_refs)='array'),
  reviewed_at timestamptz not null default now()
);

create table if not exists clinova_private.admission_decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references clinova_private.applications(id) on delete restrict,
  decision_number integer not null check (decision_number > 0),
  decision text not null check (decision in ('offer','conditional_offer','reject','defer','withdrawn')),
  decision_maker_id uuid not null references auth.users(id) on delete restrict,
  rationale text not null check (length(btrim(rationale)) between 10 and 4000),
  conditions jsonb not null default '[]'::jsonb check (jsonb_typeof(conditions)='array'),
  decided_at timestamptz not null default now(),
  unique (application_id,decision_number)
);

create table if not exists clinova_private.application_status_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references clinova_private.applications(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete restrict,
  from_status text,
  to_status text not null,
  reason text,
  occurred_at timestamptz not null default now(),
  check (invoice_id is not null or transaction_id is not null or refund_id is not null)
);

-- Institutions and partner management.
create table if not exists clinova_private.institutions (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null unique,
  legal_name text not null,
  display_name text not null,
  country_code char(2) not null,
  registration_identifier text,
  website_url text,
  status text not null default 'prospect' check (status in ('prospect','due_diligence','active','suspended','terminated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clinova_private.institution_contacts (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references clinova_private.institutions(id) on delete restrict,
  full_name text not null,
  job_title text,
  email text not null,
  phone text,
  contact_type text not null check (contact_type in ('primary','academic','finance','quality','legal','other')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists clinova_private.partner_agreements (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references clinova_private.institutions(id) on delete restrict,
  agreement_code text not null unique,
  version_number integer not null check (version_number > 0),
  agreement_status text not null default 'draft' check (agreement_status in ('draft','under_review','approved','active','expired','terminated')),
  scope_description text not null,
  effective_from date,
  effective_until date,
  document_bucket text,
  document_object_key text,
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (institution_id,version_number),
  unique (id,institution_id),
  check (effective_until is null or effective_from is null or effective_until >= effective_from),
  check (agreement_status not in ('approved','active') or (approved_by is not null and approved_at is not null))
);

create table if not exists clinova_private.institution_memberships (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references clinova_private.institutions(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  membership_status text not null default 'invited' check (membership_status in ('invited','active','suspended','ended')),
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  unique (institution_id,user_id),
  check (valid_until is null or valid_from is null or valid_until > valid_from)
);

create table if not exists clinova_private.partner_cohorts (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references clinova_private.institutions(id) on delete restrict,
  agreement_id uuid not null,
  intake_id uuid not null references clinova_private.programme_intakes(id) on delete restrict,
  cohort_code text not null unique,
  capacity integer check (capacity is null or capacity > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  cohort_status text not null default 'planned' check (cohort_status in ('planned','active','completed','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  foreign key (agreement_id,institution_id)
    references clinova_private.partner_agreements(id,institution_id) on delete restrict
);

create table if not exists clinova_private.partner_cohort_learners (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references clinova_private.partner_cohorts(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  membership_status text not null default 'active' check (membership_status in ('active','completed','withdrawn','removed')),
  joined_at timestamptz not null default now(),
  ended_at timestamptz,
  unique (cohort_id,user_id),
  check (ended_at is null or ended_at >= joined_at)
);

create table if not exists clinova_private.partnership_reviews (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references clinova_private.institutions(id) on delete restrict,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  review_type text not null check (review_type in ('due_diligence','annual','renewal','incident')),
  outcome text not null check (outcome in ('approved','conditional','rejected','suspended')),
  findings jsonb not null default '[]'::jsonb check (jsonb_typeof(findings)='array'),
  rationale text not null check (length(btrim(rationale)) between 10 and 4000),
  reviewed_at timestamptz not null default now()
);

-- Finance. Amounts use fixed precision; raw card data is never stored.
create table if not exists clinova_private.fee_schedules (
  id uuid primary key default gen_random_uuid(),
  schedule_code text not null unique,
  programme_version_id uuid references clinova_private.programme_versions(id) on delete restrict,
  institution_id uuid references clinova_private.institutions(id) on delete restrict,
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  schedule_status text not null default 'draft' check (schedule_status in ('draft','approved','active','retired')),
  effective_from date,
  effective_until date,
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  check (effective_until is null or effective_from is null or effective_until >= effective_from),
  check (schedule_status not in ('approved','active') or (approved_by is not null and approved_at is not null))
);

create table if not exists clinova_private.fee_schedule_items (
  id uuid primary key default gen_random_uuid(),
  fee_schedule_id uuid not null references clinova_private.fee_schedules(id) on delete restrict,
  item_code text not null,
  description text not null,
  unit_amount numeric(12,2) not null check (unit_amount >= 0),
  tax_rate numeric(6,4) not null default 0 check (tax_rate between 0 and 1),
  is_refundable boolean not null default true,
  unique (fee_schedule_id,item_code)
);

create table if not exists clinova_private.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  payer_user_id uuid references auth.users(id) on delete restrict,
  institution_id uuid references clinova_private.institutions(id) on delete restrict,
  application_id uuid references clinova_private.applications(id) on delete restrict,
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  tax_total numeric(12,2) not null default 0 check (tax_total >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  invoice_status text not null default 'draft' check (invoice_status in ('draft','issued','part_paid','paid','overdue','void','refunded')),
  issued_at timestamptz,
  due_at timestamptz,
  created_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (payer_user_id is not null or institution_id is not null),
  check (total_amount = subtotal + tax_total),
  check (invoice_status='draft' or issued_at is not null)
);

create table if not exists clinova_private.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references clinova_private.invoices(id) on delete restrict,
  fee_schedule_item_id uuid references clinova_private.fee_schedule_items(id) on delete restrict,
  description text not null,
  quantity numeric(10,2) not null check (quantity > 0),
  unit_amount numeric(12,2) not null check (unit_amount >= 0),
  tax_rate numeric(6,4) not null default 0 check (tax_rate between 0 and 1),
  line_subtotal numeric(12,2) not null check (line_subtotal >= 0),
  line_tax numeric(12,2) not null check (line_tax >= 0),
  check (line_subtotal = round(quantity * unit_amount, 2)),
  check (line_tax = round(line_subtotal * tax_rate, 2))
);

create table if not exists clinova_private.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_transaction_reference text not null,
  payer_user_id uuid references auth.users(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  transaction_status text not null check (transaction_status in ('pending','authorized','captured','failed','cancelled','refunded','partially_refunded')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider,provider_transaction_reference),
  check (transaction_status not in ('captured','refunded','partially_refunded') or verified_at is not null)
);

create table if not exists clinova_private.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references clinova_private.payment_transactions(id) on delete restrict,
  invoice_id uuid not null references clinova_private.invoices(id) on delete restrict,
  allocated_amount numeric(12,2) not null check (allocated_amount > 0),
  allocated_at timestamptz not null default now(),
  unique (transaction_id,invoice_id)
);

create table if not exists clinova_private.refunds (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references clinova_private.payment_transactions(id) on delete restrict,
  invoice_id uuid not null references clinova_private.invoices(id) on delete restrict,
  requested_by uuid not null references auth.users(id) on delete restrict,
  approved_by uuid references auth.users(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  reason text not null check (length(btrim(reason)) between 10 and 2000),
  refund_status text not null default 'requested' check (refund_status in ('requested','approved','rejected','processing','completed','failed')),
  provider_refund_reference text,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  completed_at timestamptz,
  check (approved_by is null or approved_by <> requested_by),
  check (refund_status not in ('approved','processing','completed') or (approved_by is not null and approved_at is not null))
);

create table if not exists clinova_private.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  signature_verified boolean not null,
  idempotency_key text not null unique,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_status text not null default 'received' check (processing_status in ('received','processed','ignored','failed')),
  unique (provider,provider_event_id)
);

create table if not exists clinova_private.finance_events (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references clinova_private.invoices(id) on delete restrict,
  transaction_id uuid references clinova_private.payment_transactions(id) on delete restrict,
  refund_id uuid references clinova_private.refunds(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete restrict,
  event_type text not null,
  reason text,
  event_details jsonb not null default '{}'::jsonb check (jsonb_typeof(event_details)='object'),
  occurred_at timestamptz not null default now()
);

-- Private by default: no API role gets direct table access.
revoke all on table
  clinova_private.academic_programmes,
  clinova_private.programme_versions,
  clinova_private.programme_intakes,
  clinova_private.applications,
  clinova_private.application_documents,
  clinova_private.application_reviews,
  clinova_private.admission_decisions,
  clinova_private.application_status_events,
  clinova_private.institutions,
  clinova_private.institution_contacts,
  clinova_private.partner_agreements,
  clinova_private.institution_memberships,
  clinova_private.partner_cohorts,
  clinova_private.partner_cohort_learners,
  clinova_private.partnership_reviews,
  clinova_private.fee_schedules,
  clinova_private.fee_schedule_items,
  clinova_private.invoices,
  clinova_private.invoice_lines,
  clinova_private.payment_transactions,
  clinova_private.payment_allocations,
  clinova_private.refunds,
  clinova_private.payment_webhook_events,
  clinova_private.finance_events
from public, anon, authenticated;

alter table clinova_private.academic_programmes enable row level security;
alter table clinova_private.programme_versions enable row level security;
alter table clinova_private.programme_intakes enable row level security;
alter table clinova_private.applications enable row level security;
alter table clinova_private.application_documents enable row level security;
alter table clinova_private.application_reviews enable row level security;
alter table clinova_private.admission_decisions enable row level security;
alter table clinova_private.application_status_events enable row level security;
alter table clinova_private.institutions enable row level security;
alter table clinova_private.institution_contacts enable row level security;
alter table clinova_private.partner_agreements enable row level security;
alter table clinova_private.institution_memberships enable row level security;
alter table clinova_private.partner_cohorts enable row level security;
alter table clinova_private.partner_cohort_learners enable row level security;
alter table clinova_private.partnership_reviews enable row level security;
alter table clinova_private.fee_schedules enable row level security;
alter table clinova_private.fee_schedule_items enable row level security;
alter table clinova_private.invoices enable row level security;
alter table clinova_private.invoice_lines enable row level security;
alter table clinova_private.payment_transactions enable row level security;
alter table clinova_private.payment_allocations enable row level security;
alter table clinova_private.refunds enable row level security;
alter table clinova_private.payment_webhook_events enable row level security;
alter table clinova_private.finance_events enable row level security;

-- Append-only decisions, reviews, status history, webhook receipts and finance events.
create trigger application_reviews_append_only
before update or delete on clinova_private.application_reviews
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger admission_decisions_append_only
before update or delete on clinova_private.admission_decisions
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger application_status_events_append_only
before update or delete on clinova_private.application_status_events
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger partnership_reviews_append_only
before update or delete on clinova_private.partnership_reviews
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger payment_webhook_events_append_only
before update or delete on clinova_private.payment_webhook_events
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger finance_events_append_only
before update or delete on clinova_private.finance_events
for each row execute function clinova_private.reject_governance_event_mutation();

commit;
