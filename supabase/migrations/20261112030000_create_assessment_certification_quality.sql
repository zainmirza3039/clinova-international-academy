-- Clinova assessment, professional competency certification and quality domains.
-- SOURCE-ONLY FEATURE-BRANCH MIGRATION. NOT APPROVED FOR PRODUCTION APPLICATION.
-- Requires role, admissions/institution/finance foundations and existing public
-- content_items, course_enrollments, and Supabase auth.users.
-- CPD completion certificates and professional competency credentials are separate.

begin;

-- CPD assessment and examination.
create table if not exists clinova_private.assessment_definitions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  assessment_type text not null check (assessment_type in ('formative','summative','examination','practical')),
  title text not null,
  pass_mark numeric(7,2) check (pass_mark is null or pass_mark >= 0),
  total_marks numeric(7,2) not null check (total_marks > 0),
  max_attempts smallint check (max_attempts is null or max_attempts > 0),
  time_limit_minutes integer check (time_limit_minutes is null or time_limit_minutes > 0),
  definition_status text not null default 'draft' check (definition_status in ('draft','review','approved','published','retired')),
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (content_item_id,version_number),
  check (pass_mark is null or pass_mark <= total_marks),
  check (definition_status not in ('approved','published') or (approved_by is not null and approved_at is not null))
);

create table if not exists clinova_private.assessment_items (
  id uuid primary key default gen_random_uuid(),
  assessment_definition_id uuid not null references clinova_private.assessment_definitions(id) on delete restrict,
  item_code text not null,
  item_type text not null check (item_type in ('single_choice','multiple_choice','short_answer','long_answer','numeric','case_based')),
  stem text not null,
  max_marks numeric(7,2) not null check (max_marks > 0),
  answer_key jsonb,
  marking_rubric jsonb not null default '{}'::jsonb check (jsonb_typeof(marking_rubric)='object'),
  sequence_number integer not null check (sequence_number > 0),
  created_at timestamptz not null default now(),
  unique (assessment_definition_id,item_code),
  unique (assessment_definition_id,sequence_number)
);

create table if not exists clinova_private.assessment_options (
  id uuid primary key default gen_random_uuid(),
  assessment_item_id uuid not null references clinova_private.assessment_items(id) on delete restrict,
  option_code text not null,
  option_text text not null,
  is_correct boolean not null default false,
  sequence_number integer not null check (sequence_number > 0),
  unique (assessment_item_id,option_code),
  unique (assessment_item_id,sequence_number)
);

create table if not exists clinova_private.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_definition_id uuid not null references clinova_private.assessment_definitions(id) on delete restrict,
  enrollment_id uuid not null references public.course_enrollments(id) on delete restrict,
  learner_id uuid not null references auth.users(id) on delete restrict,
  attempt_number smallint not null check (attempt_number > 0),
  attempt_status text not null default 'in_progress' check (attempt_status in ('in_progress','submitted','marked','moderation_pending','released','voided','expired')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  expires_at timestamptz,
  unique (assessment_definition_id,enrollment_id,attempt_number),
  check (submitted_at is null or submitted_at >= started_at),
  check (expires_at is null or expires_at > started_at),
  check (attempt_status='in_progress' or submitted_at is not null)
);

create table if not exists clinova_private.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references clinova_private.assessment_attempts(id) on delete restrict,
  assessment_item_id uuid not null references clinova_private.assessment_items(id) on delete restrict,
  response_payload jsonb not null,
  submitted_at timestamptz not null default now(),
  unique (attempt_id,assessment_item_id)
);

create table if not exists clinova_private.assessment_marks (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references clinova_private.assessment_attempts(id) on delete restrict,
  assessment_item_id uuid not null references clinova_private.assessment_items(id) on delete restrict,
  marker_id uuid not null references auth.users(id) on delete restrict,
  awarded_marks numeric(7,2) not null check (awarded_marks >= 0),
  feedback text,
  rubric_version text,
  marked_at timestamptz not null default now(),
  unique (attempt_id,assessment_item_id,marker_id)
);

create table if not exists clinova_private.assessment_results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references clinova_private.assessment_attempts(id) on delete restrict,
  total_awarded numeric(8,2) not null check (total_awarded >= 0),
  total_available numeric(8,2) not null check (total_available > 0),
  passed boolean not null,
  result_status text not null default 'pending_moderation' check (result_status in ('pending_moderation','approved','released','withheld','voided')),
  calculated_at timestamptz not null default now(),
  released_at timestamptz,
  check (total_awarded <= total_available),
  check (result_status <> 'released' or released_at is not null)
);

create table if not exists clinova_private.assessment_moderation (
  id uuid primary key default gen_random_uuid(),
  assessment_result_id uuid not null references clinova_private.assessment_results(id) on delete restrict,
  moderator_id uuid not null references auth.users(id) on delete restrict,
  moderation_outcome text not null check (moderation_outcome in ('approved','amend_marks','reassess','withhold')),
  rationale text not null check (length(btrim(rationale)) between 10 and 4000),
  moderated_at timestamptz not null default now()
);

create table if not exists clinova_private.completion_decisions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.course_enrollments(id) on delete restrict,
  decision_number integer not null check (decision_number > 0),
  decision text not null check (decision in ('complete','incomplete','withheld')),
  decided_by uuid not null references auth.users(id) on delete restrict,
  rationale text not null check (length(btrim(rationale)) between 10 and 4000),
  decided_at timestamptz not null default now(),
  unique (enrollment_id,decision_number)
);

create table if not exists clinova_private.assessment_events (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references clinova_private.assessment_attempts(id) on delete restrict,
  assessment_result_id uuid references clinova_private.assessment_results(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete restrict,
  event_type text not null,
  reason text,
  event_details jsonb not null default '{}'::jsonb check (jsonb_typeof(event_details)='object'),
  occurred_at timestamptz not null default now(),
  check (attempt_id is not null or assessment_result_id is not null)
);

-- Professional competency certification: separate from CPD completion.
create table if not exists clinova_private.certification_schemes (
  id uuid primary key default gen_random_uuid(),
  scheme_code text not null unique,
  title text not null,
  professional_domain text not null,
  scheme_status text not null default 'draft' check (scheme_status in ('draft','review','approved','open','suspended','retired')),
  created_at timestamptz not null default now()
);

create table if not exists clinova_private.certification_scheme_versions (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references clinova_private.certification_schemes(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  version_status text not null default 'draft' check (version_status in ('draft','review','approved','active','superseded')),
  eligibility_rules jsonb not null default '{}'::jsonb check (jsonb_typeof(eligibility_rules)='object'),
  assessment_method text not null,
  approval_reference text,
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (scheme_id,version_number),
  check (version_status not in ('approved','active') or (approved_by is not null and approved_at is not null))
);

create table if not exists clinova_private.certification_scheme_units (
  id uuid primary key default gen_random_uuid(),
  scheme_version_id uuid not null references clinova_private.certification_scheme_versions(id) on delete restrict,
  unit_code text not null,
  title text not null,
  sequence_number integer not null check (sequence_number > 0),
  unique (scheme_version_id,unit_code),
  unique (scheme_version_id,sequence_number)
);

create table if not exists clinova_private.certification_criteria (
  id uuid primary key default gen_random_uuid(),
  scheme_unit_id uuid not null references clinova_private.certification_scheme_units(id) on delete restrict,
  criterion_code text not null,
  criterion_text text not null,
  evidence_requirements jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_requirements)='array'),
  unique (scheme_unit_id,criterion_code)
);

create table if not exists clinova_private.certification_applications (
  id uuid primary key default gen_random_uuid(),
  application_reference text not null unique,
  scheme_version_id uuid not null references clinova_private.certification_scheme_versions(id) on delete restrict,
  candidate_user_id uuid not null references auth.users(id) on delete restrict,
  application_status text not null default 'draft' check (application_status in ('draft','submitted','eligibility_review','eligible','not_eligible','assessment','decision_pending','certified','rejected','withdrawn','appealed')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  check (application_status='draft' or submitted_at is not null)
);

create table if not exists clinova_private.certification_evidence (
  id uuid primary key default gen_random_uuid(),
  certification_application_id uuid not null references clinova_private.certification_applications(id) on delete restrict,
  criterion_id uuid references clinova_private.certification_criteria(id) on delete restrict,
  evidence_type text not null,
  storage_bucket text not null default 'certification-evidence',
  storage_object_key text not null unique,
  evidence_description text not null,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  uploaded_at timestamptz not null default now()
);

create table if not exists clinova_private.eligibility_reviews (
  id uuid primary key default gen_random_uuid(),
  certification_application_id uuid not null references clinova_private.certification_applications(id) on delete restrict,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  outcome text not null check (outcome in ('eligible','not_eligible','more_information','conflict_declared')),
  rationale text not null check (length(btrim(rationale)) between 10 and 4000),
  reviewed_at timestamptz not null default now()
);

create table if not exists clinova_private.certification_assessor_assignments (
  id uuid primary key default gen_random_uuid(),
  certification_application_id uuid not null references clinova_private.certification_applications(id) on delete restrict,
  assessor_id uuid not null references auth.users(id) on delete restrict,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  assignment_status text not null default 'active' check (assignment_status in ('active','completed','withdrawn')),
  assigned_at timestamptz not null default now(),
  unique (certification_application_id,assessor_id)
);

create table if not exists clinova_private.competency_assessments (
  id uuid primary key default gen_random_uuid(),
  assessor_assignment_id uuid not null references clinova_private.certification_assessor_assignments(id) on delete restrict,
  scheme_unit_id uuid not null references clinova_private.certification_scheme_units(id) on delete restrict,
  outcome text not null check (outcome in ('competent','not_yet_competent','insufficient_evidence')),
  rationale text not null check (length(btrim(rationale)) between 10 and 4000),
  assessed_at timestamptz not null default now(),
  unique (assessor_assignment_id,scheme_unit_id)
);

create table if not exists clinova_private.competency_observations (
  id uuid primary key default gen_random_uuid(),
  competency_assessment_id uuid not null references clinova_private.competency_assessments(id) on delete restrict,
  criterion_id uuid not null references clinova_private.certification_criteria(id) on delete restrict,
  observation text not null,
  outcome text not null check (outcome in ('met','not_met','not_observed')),
  evidence_reference text,
  observed_at timestamptz not null default now(),
  unique (competency_assessment_id,criterion_id)
);

create table if not exists clinova_private.impartiality_reviews (
  id uuid primary key default gen_random_uuid(),
  certification_application_id uuid not null references clinova_private.certification_applications(id) on delete restrict,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  conflict_declared boolean not null,
  mitigation text,
  outcome text not null check (outcome in ('clear','mitigated','reassign','stop_process')),
  reviewed_at timestamptz not null default now()
);

create table if not exists clinova_private.certification_decisions (
  id uuid primary key default gen_random_uuid(),
  certification_application_id uuid not null references clinova_private.certification_applications(id) on delete restrict,
  decision_number integer not null check (decision_number > 0),
  decision_maker_id uuid not null references auth.users(id) on delete restrict,
  outcome text not null check (outcome in ('certify','defer','reject','suspend','revoke')),
  rationale text not null check (length(btrim(rationale)) between 10 and 4000),
  decided_at timestamptz not null default now(),
  unique (certification_application_id,decision_number)
);

create table if not exists clinova_private.professional_credentials (
  id uuid primary key default gen_random_uuid(),
  certification_application_id uuid not null references clinova_private.certification_applications(id) on delete restrict,
  certification_decision_id uuid not null unique references clinova_private.certification_decisions(id) on delete restrict,
  credential_number text not null unique,
  verification_code uuid not null unique default gen_random_uuid(),
  issued_at timestamptz not null default now(),
  valid_until date,
  credential_status text not null default 'active' check (credential_status in ('active','suspended','revoked','expired')),
  check (valid_until is null or valid_until >= issued_at::date)
);

create table if not exists clinova_private.certification_appeals (
  id uuid primary key default gen_random_uuid(),
  certification_application_id uuid not null references clinova_private.certification_applications(id) on delete restrict,
  appealed_decision_id uuid not null references clinova_private.certification_decisions(id) on delete restrict,
  appellant_user_id uuid not null references auth.users(id) on delete restrict,
  grounds text not null check (length(btrim(grounds)) between 10 and 4000),
  appeal_status text not null default 'submitted' check (appeal_status in ('submitted','under_review','upheld','partially_upheld','dismissed','withdrawn')),
  submitted_at timestamptz not null default now()
);

create table if not exists clinova_private.certification_events (
  id uuid primary key default gen_random_uuid(),
  certification_application_id uuid references clinova_private.certification_applications(id) on delete restrict,
  credential_id uuid references clinova_private.professional_credentials(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete restrict,
  event_type text not null,
  reason text,
  event_details jsonb not null default '{}'::jsonb check (jsonb_typeof(event_details)='object'),
  occurred_at timestamptz not null default now(),
  check (certification_application_id is not null or credential_id is not null)
);

-- Quality management and operational assurance.
create table if not exists clinova_private.controlled_documents (
  id uuid primary key default gen_random_uuid(),
  document_code text not null unique,
  title text not null,
  document_type text not null,
  owner_user_id uuid references auth.users(id) on delete restrict,
  document_status text not null default 'draft' check (document_status in ('draft','review','approved','current','superseded','withdrawn')),
  created_at timestamptz not null default now()
);

create table if not exists clinova_private.controlled_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references clinova_private.controlled_documents(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  storage_bucket text not null default 'quality-controlled-documents',
  storage_object_key text not null unique,
  content_sha256 text not null,
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  effective_from date,
  effective_until date,
  created_at timestamptz not null default now(),
  unique (document_id,version_number),
  check (effective_until is null or effective_from is null or effective_until >= effective_from),
  check (approved_by is null or approved_at is not null)
);

create table if not exists clinova_private.internal_audits (
  id uuid primary key default gen_random_uuid(),
  audit_reference text not null unique,
  audit_scope text not null,
  lead_auditor_id uuid not null references auth.users(id) on delete restrict,
  audit_status text not null default 'planned' check (audit_status in ('planned','in_progress','completed','cancelled')),
  planned_start date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists clinova_private.audit_findings (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references clinova_private.internal_audits(id) on delete restrict,
  finding_reference text not null unique,
  severity text not null check (severity in ('observation','minor','major','critical')),
  finding text not null,
  evidence_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_refs)='array'),
  owner_user_id uuid references auth.users(id) on delete restrict,
  raised_at timestamptz not null default now()
);

create table if not exists clinova_private.corrective_actions (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references clinova_private.audit_findings(id) on delete restrict,
  action_owner_id uuid not null references auth.users(id) on delete restrict,
  root_cause text not null,
  action_plan text not null,
  due_at date,
  completed_at timestamptz,
  verified_by uuid references auth.users(id) on delete restrict,
  verified_at timestamptz,
  action_status text not null default 'planned' check (action_status in ('planned','in_progress','completed','verified','overdue','cancelled')),
  check (verified_by is null or verified_at is not null)
);

create table if not exists clinova_private.complaints_and_appeals (
  id uuid primary key default gen_random_uuid(),
  case_reference text not null unique,
  case_type text not null check (case_type in ('complaint','academic_appeal','certification_appeal','service_complaint')),
  submitted_by uuid references auth.users(id) on delete restrict,
  subject text not null,
  description text not null,
  case_status text not null default 'received' check (case_status in ('received','acknowledged','investigating','response_due','resolved','escalated','closed')),
  received_at timestamptz not null default now()
);

create table if not exists clinova_private.complaint_case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references clinova_private.complaints_and_appeals(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete restrict,
  event_type text not null,
  rationale text,
  occurred_at timestamptz not null default now()
);

create table if not exists clinova_private.quality_risks (
  id uuid primary key default gen_random_uuid(),
  risk_reference text not null unique,
  risk_title text not null,
  risk_description text not null,
  likelihood smallint not null check (likelihood between 1 and 5),
  impact smallint not null check (impact between 1 and 5),
  owner_user_id uuid references auth.users(id) on delete restrict,
  mitigation_plan text,
  risk_status text not null default 'open' check (risk_status in ('open','mitigating','accepted','closed')),
  reviewed_at timestamptz not null default now()
);

create table if not exists clinova_private.quality_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('controlled_document','internal_audit','audit_finding','corrective_action','complaint_case','risk','staff_competency')),
  entity_id uuid not null,
  actor_user_id uuid references auth.users(id) on delete restrict,
  event_type text not null,
  rationale text,
  event_details jsonb not null default '{}'::jsonb check (jsonb_typeof(event_details)='object'),
  occurred_at timestamptz not null default now()
);

create table if not exists clinova_private.staff_competencies (
  id uuid primary key default gen_random_uuid(),
  staff_user_id uuid not null references auth.users(id) on delete restrict,
  competency_code text not null,
  evidence_reference text,
  assessed_by uuid references auth.users(id) on delete restrict,
  assessed_at timestamptz,
  valid_until date,
  competency_status text not null default 'pending' check (competency_status in ('pending','competent','development_required','expired')),
  unique (staff_user_id,competency_code),
  check (assessed_at is not null or assessed_by is null)
);

create table if not exists clinova_private.operational_report_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_code text not null,
  reporting_period_start date not null,
  reporting_period_end date not null,
  generated_by uuid references auth.users(id) on delete restrict,
  data_snapshot jsonb not null check (jsonb_typeof(data_snapshot)='object'),
  generated_at timestamptz not null default now(),
  unique (report_code,reporting_period_start,reporting_period_end),
  check (reporting_period_end >= reporting_period_start)
);

-- Private tables: no direct API role access.
revoke all on table
  clinova_private.assessment_definitions,
  clinova_private.assessment_items,
  clinova_private.assessment_options,
  clinova_private.assessment_attempts,
  clinova_private.assessment_responses,
  clinova_private.assessment_marks,
  clinova_private.assessment_results,
  clinova_private.assessment_moderation,
  clinova_private.completion_decisions,
  clinova_private.assessment_events,
  clinova_private.certification_schemes,
  clinova_private.certification_scheme_versions,
  clinova_private.certification_scheme_units,
  clinova_private.certification_criteria,
  clinova_private.certification_applications,
  clinova_private.certification_evidence,
  clinova_private.eligibility_reviews,
  clinova_private.certification_assessor_assignments,
  clinova_private.competency_assessments,
  clinova_private.competency_observations,
  clinova_private.impartiality_reviews,
  clinova_private.certification_decisions,
  clinova_private.professional_credentials,
  clinova_private.certification_appeals,
  clinova_private.certification_events,
  clinova_private.controlled_documents,
  clinova_private.controlled_document_versions,
  clinova_private.internal_audits,
  clinova_private.audit_findings,
  clinova_private.quality_events,
  clinova_private.corrective_actions,
  clinova_private.complaints_and_appeals,
  clinova_private.complaint_case_events,
  clinova_private.quality_risks,
  clinova_private.staff_competencies,
  clinova_private.operational_report_snapshots
from public, anon, authenticated;

alter table clinova_private.assessment_definitions enable row level security;
alter table clinova_private.assessment_items enable row level security;
alter table clinova_private.assessment_options enable row level security;
alter table clinova_private.assessment_attempts enable row level security;
alter table clinova_private.assessment_responses enable row level security;
alter table clinova_private.assessment_marks enable row level security;
alter table clinova_private.assessment_results enable row level security;
alter table clinova_private.assessment_moderation enable row level security;
alter table clinova_private.completion_decisions enable row level security;
alter table clinova_private.assessment_events enable row level security;
alter table clinova_private.certification_schemes enable row level security;
alter table clinova_private.certification_scheme_versions enable row level security;
alter table clinova_private.certification_scheme_units enable row level security;
alter table clinova_private.certification_criteria enable row level security;
alter table clinova_private.certification_applications enable row level security;
alter table clinova_private.certification_evidence enable row level security;
alter table clinova_private.eligibility_reviews enable row level security;
alter table clinova_private.certification_assessor_assignments enable row level security;
alter table clinova_private.competency_assessments enable row level security;
alter table clinova_private.competency_observations enable row level security;
alter table clinova_private.impartiality_reviews enable row level security;
alter table clinova_private.certification_decisions enable row level security;
alter table clinova_private.professional_credentials enable row level security;
alter table clinova_private.certification_appeals enable row level security;
alter table clinova_private.certification_events enable row level security;
alter table clinova_private.controlled_documents enable row level security;
alter table clinova_private.controlled_document_versions enable row level security;
alter table clinova_private.internal_audits enable row level security;
alter table clinova_private.audit_findings enable row level security;
alter table clinova_private.quality_events enable row level security;
alter table clinova_private.corrective_actions enable row level security;
alter table clinova_private.complaints_and_appeals enable row level security;
alter table clinova_private.complaint_case_events enable row level security;
alter table clinova_private.quality_risks enable row level security;
alter table clinova_private.staff_competencies enable row level security;
alter table clinova_private.operational_report_snapshots enable row level security;

-- Immutable assessment/certification decisions and audit evidence.
create trigger assessment_responses_append_only
before update or delete on clinova_private.assessment_responses
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger assessment_marks_append_only
before update or delete on clinova_private.assessment_marks
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger competency_observations_append_only
before update or delete on clinova_private.competency_observations
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger certification_evidence_append_only
before update or delete on clinova_private.certification_evidence
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger quality_events_append_only
before update or delete on clinova_private.quality_events
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger assessment_moderation_append_only
before update or delete on clinova_private.assessment_moderation
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger completion_decisions_append_only
before update or delete on clinova_private.completion_decisions
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger assessment_events_append_only
before update or delete on clinova_private.assessment_events
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger eligibility_reviews_append_only
before update or delete on clinova_private.eligibility_reviews
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger competency_assessments_append_only
before update or delete on clinova_private.competency_assessments
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger impartiality_reviews_append_only
before update or delete on clinova_private.impartiality_reviews
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger certification_decisions_append_only
before update or delete on clinova_private.certification_decisions
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger certification_events_append_only
before update or delete on clinova_private.certification_events
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger complaint_case_events_append_only
before update or delete on clinova_private.complaint_case_events
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger controlled_document_versions_append_only
before update or delete on clinova_private.controlled_document_versions
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger audit_findings_append_only
before update or delete on clinova_private.audit_findings
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger operational_report_snapshots_append_only
before update or delete on clinova_private.operational_report_snapshots
for each row execute function clinova_private.reject_governance_event_mutation();

commit;
