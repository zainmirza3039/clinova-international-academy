-- Clinova relational authorization foundation.
-- SOURCE-ONLY FEATURE-BRANCH MIGRATION. NOT APPROVED FOR PRODUCTION APPLICATION.
-- Depends on Supabase auth.uid() and auth.users.
-- This migration deliberately does not alter existing policies, grants,
-- app_metadata role helper, or the existing private-schema ACL. Those changes
-- require a separately tested compatibility migration.

begin;

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

commit;
