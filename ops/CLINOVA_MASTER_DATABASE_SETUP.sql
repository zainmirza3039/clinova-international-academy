-- CLINOVA MASTER DATABASE SETUP
-- Consolidated SQL Editor script from the three reviewed feature-branch migrations.
-- Target project: ssxpmcbqfdggfsoqbxac (Clinova International Academy).
-- SOURCE-ONLY: NOT YET RUNTIME-TESTED. DO NOT RUN ON PRODUCTION UNTIL REVIEWED.
-- Does not modify existing public-table grants/policies or provision administrators.
-- Does not create Storage buckets, frontend routes, payment provider integrations,
-- or the remaining domain command APIs/workflow enforcement.
-- Take a database backup and verify the selected Supabase project before execution.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '0';
-- Clinova relational authorization foundation.
-- SOURCE-ONLY FEATURE-BRANCH MIGRATION. NOT APPROVED FOR PRODUCTION APPLICATION.
-- Depends on Supabase auth.uid() and auth.users.
-- This migration deliberately does not alter existing policies, grants,
-- app_metadata role helper, or the existing private-schema ACL. Those changes
-- require a separately tested compatibility migration.


create schema if not exists clinova_private;

create table if not exists clinova_private.roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique check (role_key ~ '^[a-z][a-z0-9_]*$'),
  display_name text not null check (length(btrim(display_name)) between 1 and 120),
  description text,
  is_privileged boolean not null default false,
  is_assignable boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists clinova_private.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique check (permission_key ~ '^[a-z][a-z0-9_.]*$'),
  domain text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (domain, action)
);

create table if not exists clinova_private.role_permissions (
  role_id uuid not null references clinova_private.roles(id) on delete restrict,
  permission_id uuid not null references clinova_private.permissions(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists clinova_private.user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  role_id uuid not null references clinova_private.roles(id) on delete restrict,
  scope_type text not null check (scope_type in ('global','institution','programme','cohort','course','scheme','case')),
  scope_id uuid,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete restrict,
  grant_reason text not null check (length(btrim(grant_reason)) between 10 and 2000),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  check ((scope_type = 'global' and scope_id is null) or (scope_type <> 'global' and scope_id is not null)),
  check (valid_until is null or valid_until > valid_from),
  check ((revoked_at is null and revoked_by is null) or (revoked_at is not null and revoked_by is not null))
);

-- Do not use a time-dependent partial unique index: PostgreSQL requires
-- immutable predicates, and expired assignments must be re-grantable.
drop index if exists clinova_private.user_role_assignments_active_unique;
create index if not exists user_role_assignments_scope_lookup_idx
  on clinova_private.user_role_assignments(user_id, role_id, scope_type, scope_id)
  where revoked_at is null;

create index if not exists user_role_assignments_user_active_idx
  on clinova_private.user_role_assignments(user_id, valid_from, valid_until)
  where revoked_at is null;

create table if not exists clinova_private.role_change_requests (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references auth.users(id) on delete restrict,
  role_id uuid not null references clinova_private.roles(id) on delete restrict,
  scope_type text not null check (scope_type in ('global','institution','programme','cohort','course','scheme','case')),
  scope_id uuid,
  request_action text not null check (request_action in ('grant','revoke')),
  requested_by uuid not null references auth.users(id) on delete restrict,
  requested_at timestamptz not null default now(),
  reason text not null check (length(btrim(reason)) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired','cancelled')),
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  expires_at timestamptz not null default (now() + interval '48 hours'),
  applied_assignment_id uuid references clinova_private.user_role_assignments(id) on delete restrict,
  idempotency_key text not null unique,
  check ((scope_type = 'global' and scope_id is null) or (scope_type <> 'global' and scope_id is not null)),
  check (approved_by is null or approved_by <> requested_by),
  check ((status = 'approved' and approved_by is not null and approved_at is not null) or status <> 'approved')
);

create table if not exists clinova_private.role_assignment_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references clinova_private.role_change_requests(id) on delete restrict,
  assignment_id uuid references clinova_private.user_role_assignments(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete restrict,
  target_user_id uuid not null references auth.users(id) on delete restrict,
  role_key text not null,
  scope_type text not null,
  scope_id uuid,
  event_type text not null check (event_type in ('requested','approved','rejected','granted','revoked','expired','cancelled','emergency_suspended')),
  reason text not null,
  occurred_at timestamptz not null default now(),
  correlation_id uuid
);

create table if not exists clinova_private.admin_bootstrap_events (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references auth.users(id) on delete restrict,
  role_key text not null,
  operator_reference text not null,
  approval_reference text not null,
  reason text not null check (length(btrim(reason)) between 10 and 2000),
  completed_at timestamptz not null default now(),
  unique (target_user_id),
  unique (operator_reference)
);

-- No API role receives table privileges. Keep implementation relations private.
revoke all on table
  clinova_private.roles,
  clinova_private.permissions,
  clinova_private.role_permissions,
  clinova_private.user_role_assignments,
  clinova_private.role_change_requests,
  clinova_private.role_assignment_events,
  clinova_private.admin_bootstrap_events
from public, anon, authenticated;

alter table clinova_private.roles enable row level security;
alter table clinova_private.permissions enable row level security;
alter table clinova_private.role_permissions enable row level security;
alter table clinova_private.user_role_assignments enable row level security;
alter table clinova_private.role_change_requests enable row level security;
alter table clinova_private.role_assignment_events enable row level security;
alter table clinova_private.admin_bootstrap_events enable row level security;

-- Append-only governance evidence. Mutation is rejected even for privileged
-- application paths; maintenance requires a separately reviewed owner procedure.
create or replace function clinova_private.reject_governance_event_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog
as $
begin
  raise exception 'Governance evidence is append-only'
    using errcode = '55000';
end;
$;

revoke all on function clinova_private.reject_governance_event_mutation() from public, anon, authenticated;

drop trigger if exists role_assignment_events_append_only on clinova_private.role_assignment_events;
create trigger role_assignment_events_append_only
before update or delete on clinova_private.role_assignment_events
for each row execute function clinova_private.reject_governance_event_mutation();

drop trigger if exists admin_bootstrap_events_append_only on clinova_private.admin_bootstrap_events;
create trigger admin_bootstrap_events_append_only
before update or delete on clinova_private.admin_bootstrap_events
for each row execute function clinova_private.reject_governance_event_mutation();

-- Fixed role catalogue.
insert into clinova_private.roles(role_key, display_name, description, is_privileged) values
('super_admin','Super administrator','Platform security and controlled role governance.',true),
('academy_admin','Academy administrator','Operational academy administration.',true),
('admissions_officer','Admissions officer','Scoped applicant and admissions workflow.'),
('finance_officer','Finance officer','Scoped finance and reconciliation workflow.'),
('applicant','Applicant','Own admissions records.'),
('learner','Learner','Own learning and assessment records.'),
('instructor','Instructor','Assigned teaching and learner progress.'),
('content_author','Content author','Draft and version content.'),
('clinical_reviewer','Clinical reviewer','Independent clinical content review.'),
('editorial_reviewer','Editorial reviewer','Independent editorial content review.'),
('content_publisher','Content publisher','Publish approved content versions.'),
('assessor','Assessor','Assigned competency evidence and assessment.'),
('eligibility_reviewer','Eligibility reviewer','Professional scheme eligibility review.'),
('certification_decision_maker','Certification decision maker','Independent certification decisions.'),
('impartiality_officer','Impartiality officer','Conflicts and impartiality oversight.'),
('quality_officer','Quality officer','Quality management and audit evidence.'),
('partner_manager','Partner manager','Institution-scoped partner operations.')
on conflict (role_key) do update set
 display_name=excluded.display_name, description=excluded.description, is_privileged=excluded.is_privileged;

insert into clinova_private.permissions(permission_key,domain,action,description) values
('platform.settings.manage','platform','settings_manage','Manage platform-level settings.'),
('access.roles.request','access','roles_request','Request a scoped role change.'),
('access.roles.approve','access','roles_approve','Approve ordinary scoped role changes.'),
('access.roles.approve_privileged','access','roles_approve_privileged','Approve controlled privileged role changes.'),
('access.roles.revoke','access','roles_revoke','Revoke authorized scoped assignments.'),
('admissions.application.read','admissions','application_read','Read assigned applications.'),
('admissions.application.review','admissions','application_review','Review assigned applications.'),
('admissions.application.decide','admissions','application_decide','Record admission decisions.'),
('admissions.documents.review','admissions','documents_review','Review private applicant documents.'),
('institutions.read','institutions','read','Read assigned institution records.'),
('institutions.manage','institutions','manage','Manage institution records.'),
('institutions.agreements.manage','institutions','agreements_manage','Manage partner agreements.'),
('institutions.members.manage','institutions','members_manage','Manage scoped memberships.'),
('finance.fees.manage','finance','fees_manage','Manage approved fee schedules.'),
('finance.invoices.read','finance','invoices_read','Read scoped invoices.'),
('finance.invoices.issue','finance','invoices_issue','Issue invoices.'),
('finance.payments.reconcile','finance','payments_reconcile','Reconcile verified payment events.'),
('finance.refunds.request','finance','refunds_request','Request refunds.'),
('finance.refunds.approve','finance','refunds_approve','Approve refunds subject to limits and controls.'),
('learning.catalogue.read','learning','catalogue_read','Read published catalogue.'),
('learning.courses.manage','learning','courses_manage','Manage assigned course delivery.'),
('learning.enrolments.read','learning','enrolments_read','Read scoped enrolments.'),
('learning.enrolments.manage','learning','enrolments_manage','Manage scoped enrolments.'),
('learning.progress.read','learning','progress_read','Read scoped learner progress.'),
('learning.progress.record','learning','progress_record','Record teaching progress.'),
('assessment.definition.manage','assessment','definition_manage','Manage assessment definitions.'),
('assessment.items.manage','assessment','items_manage','Manage assessment items and answer keys.'),
('assessment.attempts.start_own','assessment','attempt_start_own','Start own permitted assessment attempts.'),
('assessment.attempts.submit_own','assessment','attempt_submit_own','Submit own assessment attempts.'),
('assessment.marking.record','assessment','marking_record','Mark assigned work.'),
('assessment.moderation.review','assessment','moderation_review','Moderate assessment outcomes.'),
('assessment.results.release','assessment','results_release','Release approved assessment results.'),
('certification.scheme.manage','certification','scheme_manage','Manage versioned certification schemes.'),
('certification.application.read','certification','application_read','Read assigned candidate applications.'),
('certification.eligibility.review','certification','eligibility_review','Review candidate eligibility.'),
('certification.evidence.read','certification','evidence_read','Read assigned evidence.'),
('certification.assessment.record','certification','assessment_record','Record assigned competency observations.'),
('certification.impartiality.review','certification','impartiality_review','Record impartiality review.'),
('certification.decision.make','certification','decision_make','Make independent certification decisions.'),
('certification.credential.issue','certification','credential_issue','Issue approved credentials.'),
('certification.credential.revoke','certification','credential_revoke','Revoke credentials through controlled workflow.'),
('content.item.create','content','item_create','Create content drafts.'),
('content.version.edit','content','version_edit','Create and edit content versions.'),
('content.clinical.review','content','clinical_review','Record clinical content review.'),
('content.editorial.review','content','editorial_review','Record editorial content review.'),
('content.publish','content','publish','Publish approved content.'),
('quality.documents.manage','quality','documents_manage','Manage controlled documents.'),
('quality.audit.manage','quality','audit_manage','Plan and record audits.'),
('quality.findings.manage','quality','findings_manage','Manage findings and corrective actions.'),
('quality.complaints.manage','quality','complaints_manage','Manage complaints and appeals.'),
('quality.reports.read','quality','reports_read','Read authorized quality reports.'),
('partner.portal.read','partner','portal_read','Read own institution portal.'),
('partner.learners.manage','partner','learners_manage','Manage learners in own partner cohort.')
on conflict (permission_key) do update set domain=excluded.domain, action=excluded.action, description=excluded.description;

-- Minimum permission bundles. High-risk privileges remain separately controlled.
with mapping(role_key, permission_key) as (values
('super_admin','platform.settings.manage'),
('super_admin','access.roles.request'),
('super_admin','access.roles.approve'),
('super_admin','access.roles.approve_privileged'),
('super_admin','access.roles.revoke'),
('academy_admin','access.roles.request'),
('academy_admin','access.roles.approve'),
('academy_admin','admissions.application.read'),
('academy_admin','institutions.read'),
('academy_admin','learning.catalogue.read'),
('academy_admin','quality.reports.read'),
('admissions_officer','admissions.application.read'),
('admissions_officer','admissions.application.review'),
('admissions_officer','admissions.application.decide'),
('admissions_officer','admissions.documents.review'),
('admissions_officer','institutions.read'),
('finance_officer','finance.fees.manage'),
('finance_officer','finance.invoices.read'),
('finance_officer','finance.invoices.issue'),
('finance_officer','finance.payments.reconcile'),
('finance_officer','finance.refunds.request'),
('applicant','admissions.application.read'),
('learner','learning.catalogue.read'),
('learner','learning.enrolments.read'),
('learner','learning.progress.read'),
('learner','assessment.attempts.start_own'),
('learner','assessment.attempts.submit_own'),
('instructor','learning.catalogue.read'),
('instructor','learning.courses.manage'),
('instructor','learning.enrolments.read'),
('instructor','learning.progress.read'),
('instructor','learning.progress.record'),
('content_author','content.item.create'),
('content_author','content.version.edit'),
('clinical_reviewer','content.clinical.review'),
('editorial_reviewer','content.editorial.review'),
('content_publisher','content.publish'),
('assessor','certification.application.read'),
('assessor','certification.evidence.read'),
('assessor','certification.assessment.record'),
('eligibility_reviewer','certification.application.read'),
('eligibility_reviewer','certification.eligibility.review'),
('certification_decision_maker','certification.application.read'),
('certification_decision_maker','certification.evidence.read'),
('certification_decision_maker','certification.decision.make'),
('certification_decision_maker','certification.credential.issue'),
('impartiality_officer','certification.impartiality.review'),
('quality_officer','quality.documents.manage'),
('quality_officer','quality.audit.manage'),
('quality_officer','quality.findings.manage'),
('quality_officer','quality.complaints.manage'),
('quality_officer','quality.reports.read'),
('partner_manager','partner.portal.read'),
('partner_manager','partner.learners.manage'),
('partner_manager','institutions.read')
)
insert into clinova_private.role_permissions(role_id,permission_id)
select r.id,p.id from mapping m join clinova_private.roles r using(role_key)
join clinova_private.permissions p using(permission_key)
on conflict do nothing;

create or replace function clinova_private.has_permission(
  p_permission_key text,
  p_scope_type text default 'global',
  p_scope_id uuid default null
) returns boolean
language sql stable security definer
set search_path = pg_catalog
as $$
  select
    auth.uid() is not null
    and p_permission_key is not null
    and p_scope_type in ('global','institution','programme','cohort','course','scheme','case')
    and ((p_scope_type = 'global' and p_scope_id is null)
      or (p_scope_type <> 'global' and p_scope_id is not null))
    and exists (
      select 1
      from clinova_private.user_role_assignments a
      join clinova_private.role_permissions rp on rp.role_id = a.role_id
      join clinova_private.permissions p on p.id = rp.permission_id
      where a.user_id = auth.uid()
        and p.permission_key = p_permission_key
        and a.revoked_at is null
        and a.valid_from <= statement_timestamp()
        and (a.valid_until is null or a.valid_until > statement_timestamp())
        and (
          (a.scope_type = 'global' and a.scope_id is null)
          or (a.scope_type = p_scope_type and a.scope_id = p_scope_id)
        )
    );
$$;

alter function clinova_private.reject_governance_event_mutation() owner to postgres;
alter function clinova_private.has_permission(text,text,uuid) owner to postgres;

-- Role changes are request/approval operations. API callers never write the
-- assignment, request, or event tables directly.
create or replace function clinova_private.request_role_change(
  p_target_user_id uuid,
  p_role_key text,
  p_scope_type text,
  p_scope_id uuid,
  p_request_action text,
  p_reason text,
  p_idempotency_key text
) returns uuid
language plpgsql security definer
set search_path = pg_catalog
as $
declare
  v_actor uuid := auth.uid();
  v_role_id uuid;
  v_request_id uuid;
begin
  if v_actor is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if not clinova_private.has_permission('access.roles.request','global',null) then
    raise exception 'Not authorized to request role changes' using errcode='42501';
  end if;
  if p_target_user_id is null or p_target_user_id = v_actor then
    raise exception 'Self-assignment requests are not permitted' using errcode='42501';
  end if;
  if p_request_action is null or p_request_action not in ('grant','revoke') then
    raise exception 'Invalid role change action' using errcode='22023';
  end if;
  if p_scope_type is null or p_scope_type not in ('global','institution','programme','cohort','course','scheme','case')
     or ((p_scope_type='global') <> (p_scope_id is null)) then
    raise exception 'Invalid scope' using errcode='22023';
  end if;
  if p_reason is null or length(btrim(p_reason)) not between 10 and 2000
     or p_idempotency_key is null or length(btrim(p_idempotency_key)) not between 8 and 200 then
    raise exception 'Reason and idempotency key are required' using errcode='22023';
  end if;
  if not exists (select 1 from auth.users u where u.id=p_target_user_id) then
    raise exception 'Target user does not exist' using errcode='23503';
  end if;
  select r.id into v_role_id
  from clinova_private.roles r
  where r.role_key=p_role_key and r.is_assignable;
  if v_role_id is null then raise exception 'Role is missing or not assignable' using errcode='22023'; end if;

  select q.id into v_request_id
  from clinova_private.role_change_requests q
  where q.idempotency_key=p_idempotency_key;
  if v_request_id is not null then
    if not exists (
      select 1 from clinova_private.role_change_requests q
      where q.id=v_request_id and q.requested_by=v_actor
        and q.target_user_id=p_target_user_id and q.role_id=v_role_id
        and q.scope_type=p_scope_type and q.scope_id is not distinct from p_scope_id
        and q.request_action=p_request_action and q.reason=p_reason
    ) then raise exception 'Idempotency key already used for a different request' using errcode='23505'; end if;
    return v_request_id;
  end if;

  insert into clinova_private.role_change_requests(
    target_user_id,role_id,scope_type,scope_id,request_action,requested_by,reason,idempotency_key
  ) values (
    p_target_user_id,v_role_id,p_scope_type,p_scope_id,p_request_action,v_actor,p_reason,p_idempotency_key
  ) returning id into v_request_id;

  insert into clinova_private.role_assignment_events(
    request_id,actor_user_id,target_user_id,role_key,scope_type,scope_id,event_type,reason
  ) values (
    v_request_id,v_actor,p_target_user_id,p_role_key,p_scope_type,p_scope_id,'requested',p_reason
  );
  return v_request_id;
end;
$;

create or replace function clinova_private.approve_role_change(p_request_id uuid)
returns uuid
language plpgsql security definer
set search_path = pg_catalog
as $
declare
  v_actor uuid := auth.uid();
  v_request clinova_private.role_change_requests%rowtype;
  v_role clinova_private.roles%rowtype;
  v_assignment_id uuid;
begin
  if v_actor is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select q.* into v_request
  from clinova_private.role_change_requests q
  where q.id=p_request_id
  for update;
  if not found then raise exception 'Role change request not found' using errcode='P0002'; end if;
  if v_request.status <> 'pending' or v_request.expires_at <= statement_timestamp() then
    raise exception 'Request is no longer pending' using errcode='55000';
  end if;
  if v_request.requested_by=v_actor or v_request.target_user_id=v_actor then
    raise exception 'Requester or target cannot approve this request' using errcode='42501';
  end if;
  select r.* into v_role from clinova_private.roles r where r.id=v_request.role_id;
  if v_role.is_privileged then
    if not clinova_private.has_permission('access.roles.approve_privileged','global',null) then
      raise exception 'Privileged role approval permission required' using errcode='42501';
    end if;
  elsif not clinova_private.has_permission('access.roles.approve','global',null) then
    raise exception 'Role approval permission required' using errcode='42501';
  end if;

  -- Serialize grant/revoke decisions for the same target-role-scope tuple.
  perform pg_advisory_xact_lock(hashtextextended(
    v_request.target_user_id::text || ':' || v_request.role_id::text || ':' ||
    v_request.scope_type || ':' || coalesce(v_request.scope_id::text,'global'), 0
  ));

  if v_request.request_action='grant' then
    if exists (
      select 1 from clinova_private.user_role_assignments a
      where a.user_id=v_request.target_user_id and a.role_id=v_request.role_id
        and a.scope_type=v_request.scope_type and a.scope_id is not distinct from v_request.scope_id
        and a.revoked_at is null and (a.valid_until is null or a.valid_until > statement_timestamp())
    ) then raise exception 'An active matching assignment already exists' using errcode='23505'; end if;

    insert into clinova_private.user_role_assignments(
      user_id,role_id,scope_type,scope_id,valid_from,grant_reason,created_by
    ) values (
      v_request.target_user_id,v_request.role_id,v_request.scope_type,v_request.scope_id,
      statement_timestamp(),v_request.reason,v_actor
    ) returning id into v_assignment_id;
  else
    update clinova_private.user_role_assignments a
    set revoked_at=statement_timestamp(),revoked_by=v_actor
    where a.user_id=v_request.target_user_id and a.role_id=v_request.role_id
      and a.scope_type=v_request.scope_type and a.scope_id is not distinct from v_request.scope_id
      and a.revoked_at is null and (a.valid_until is null or a.valid_until > statement_timestamp())
    returning a.id into v_assignment_id;
    if v_assignment_id is null then raise exception 'No active matching assignment to revoke' using errcode='P0002'; end if;
  end if;

  update clinova_private.role_change_requests
  set status='approved',approved_by=v_actor,approved_at=statement_timestamp(),
      applied_assignment_id=v_assignment_id
  where id=p_request_id;

  insert into clinova_private.role_assignment_events(
    request_id,assignment_id,actor_user_id,target_user_id,role_key,scope_type,scope_id,event_type,reason
  ) values (
    p_request_id,v_assignment_id,v_actor,v_request.target_user_id,v_role.role_key,
    v_request.scope_type,v_request.scope_id,
    case when v_request.request_action='grant' then 'granted' else 'revoked' end,
    v_request.reason
  );
  return v_assignment_id;
end;
$;

alter function clinova_private.request_role_change(uuid,text,text,uuid,text,text,text) owner to postgres;
alter function clinova_private.approve_role_change(uuid) owner to postgres;
revoke all on function clinova_private.request_role_change(uuid,text,text,uuid,text,text,text) from public, anon, authenticated;
revoke all on function clinova_private.approve_role_change(uuid) from public, anon, authenticated;

create or replace function public.request_clinova_role_change(
  p_target_user_id uuid,p_role_key text,p_scope_type text,p_scope_id uuid,
  p_request_action text,p_reason text,p_idempotency_key text
) returns uuid
language sql security definer
set search_path = pg_catalog
as $
  select clinova_private.request_role_change(
    p_target_user_id,p_role_key,p_scope_type,p_scope_id,p_request_action,p_reason,p_idempotency_key
  );
$;

create or replace function public.approve_clinova_role_change(p_request_id uuid)
returns uuid
language sql security definer
set search_path = pg_catalog
as $
  select clinova_private.approve_role_change(p_request_id);
$;

alter function public.request_clinova_role_change(uuid,text,text,uuid,text,text,text) owner to postgres;
alter function public.approve_clinova_role_change(uuid) owner to postgres;
revoke all on function public.request_clinova_role_change(uuid,text,text,uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.approve_clinova_role_change(uuid) from public, anon, authenticated;
grant execute on function public.request_clinova_role_change(uuid,text,text,uuid,text,text,text) to authenticated;
grant execute on function public.approve_clinova_role_change(uuid) to authenticated;

-- Exposed boolean-only boundary. SECURITY DEFINER is required because API
-- roles must not receive USAGE on the private schema. Function owner is postgres.
create or replace function public.has_clinova_permission(
  p_permission_key text,
  p_scope_type text default 'global',
  p_scope_id uuid default null
) returns boolean
language sql stable security definer
set search_path = pg_catalog
as $$
  select clinova_private.has_permission(p_permission_key, p_scope_type, p_scope_id);
$$;

alter function public.has_clinova_permission(text,text,uuid) owner to postgres;
revoke all on function public.has_clinova_permission(text,text,uuid) from public, anon, authenticated;
grant execute on function public.has_clinova_permission(text,text,uuid) to authenticated;
revoke all on function clinova_private.has_permission(text,text,uuid) from public, anon, authenticated;



-- Clinova admissions, institutional partnership and finance domain foundation.
-- SOURCE-ONLY FEATURE-BRANCH MIGRATION. NOT APPROVED FOR PRODUCTION APPLICATION.
-- Requires the role/authorization foundation migration and Supabase auth.users.
-- No programme, course, fee, partner, or accreditation offering is seeded here.
-- All relations remain in clinova_private with no API-role table privileges.


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
  updated_at timestamptz not null default now(),
  check (status='draft' or submitted_at is not null)
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
  review_rationale text,
  check (review_status='pending' or (reviewed_by is not null and reviewed_at is not null))
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
  check (ended_at is null or ended_at >= joined_at),
  check (membership_status='active' or ended_at is not null)
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
  check (transaction_status not in ('authorized','captured','refunded','partially_refunded') or verified_at is not null)
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
  check (refund_status not in ('approved','processing','completed') or (approved_by is not null and approved_at is not null)),
  check (refund_status <> 'completed' or completed_at is not null)
);

create table if not exists clinova_private.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  signature_verified boolean not null,
  idempotency_key text not null unique,
  received_at timestamptz not null default now(),
  unique (provider,provider_event_id)
);

create table if not exists clinova_private.payment_webhook_processing_events (
  id uuid primary key default gen_random_uuid(),
  webhook_event_id uuid not null references clinova_private.payment_webhook_events(id) on delete restrict,
  processing_status text not null check (processing_status in ('processed','ignored','failed')),
  result_reference text,
  reason text,
  processed_at timestamptz not null default now()
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
  clinova_private.payment_webhook_processing_events,
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
alter table clinova_private.payment_webhook_processing_events enable row level security;
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

create trigger payment_webhook_processing_events_append_only
before update or delete on clinova_private.payment_webhook_processing_events
for each row execute function clinova_private.reject_governance_event_mutation();

create trigger finance_events_append_only
before update or delete on clinova_private.finance_events
for each row execute function clinova_private.reject_governance_event_mutation();



-- Clinova assessment, professional competency certification and quality domains.
-- SOURCE-ONLY FEATURE-BRANCH MIGRATION. NOT APPROVED FOR PRODUCTION APPLICATION.
-- Requires role, admissions/institution/finance foundations and existing public
-- content_items, course_enrollments, and Supabase auth.users.
-- CPD completion certificates and professional competency credentials are separate.


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


-- Basic post-creation inventory inside the transaction.
do $validation$
declare v_missing text[];
begin
  select array_agg(x.table_name order by x.table_name) into v_missing
  from (values
    ('roles'),('permissions'),('role_permissions'),('user_role_assignments'),
    ('role_change_requests'),('role_assignment_events'),('admin_bootstrap_events'),
    ('academic_programmes'),('programme_versions'),('intakes'),('applications'),
    ('application_documents'),('application_reviews'),('application_decisions'),
    ('institutions'),('institution_contacts'),('institution_agreements'),
    ('institution_memberships'),('cohorts'),('partner_reviews'),
    ('fee_schedules'),('fee_schedule_items'),('invoices'),('invoice_lines'),
    ('payment_transactions'),('payment_allocations'),('refunds'),
    ('assessment_definitions'),('assessment_items'),('assessment_options'),
    ('assessment_attempts'),('assessment_responses'),('assessment_marks'),
    ('assessment_results'),('assessment_moderation'),('completion_decisions'),
    ('certification_schemes'),('certification_scheme_versions'),('certification_applications'),
    ('certification_evidence'),('certification_decisions'),('professional_credentials'),
    ('controlled_documents'),('internal_audits'),('audit_findings'),
    ('corrective_actions'),('complaints_and_appeals'),('quality_risks'),
    ('quality_events'),('operational_report_snapshots')
  ) expected(table_name)
  where not exists (
    select 1 from information_schema.tables t
    where t.table_schema='clinova_private' and t.table_name=expected.table_name
  );
  if v_missing is not null then
    raise exception 'Clinova setup validation failed; missing tables: %', array_to_string(v_missing, ', ');
  end if;
end;
$validation$;
commit;

-- Post-commit verification result.
select 'clinova_private' as schema_name, count(*) as created_table_count
from information_schema.tables
where table_schema='clinova_private' and table_type='BASE TABLE';
