-- Local-only authorization checks. Executed only by test-disposable-postgres.sh.
\set ON_ERROR_STOP on

-- Synthetic users A and B are seeded by secure-learner-records.local.sql.

insert into auth.users(id) values ('00000000-0000-0000-0000-0000000000c3');

insert into clinova_private.user_role_assignments(
 user_id,role_id,scope_type,scope_id,grant_reason,created_by
)
select u.id,r.id,'global',null,'Synthetic local role approver',u.id
from auth.users u cross join clinova_private.roles r
where u.id in ('00000000-0000-0000-0000-0000000000a2','00000000-0000-0000-0000-0000000000c3')
  and r.role_key='academy_admin';

insert into clinova_private.user_role_assignments(
 user_id,role_id,scope_type,scope_id,valid_from,valid_until,grant_reason,created_by
)
select
 '00000000-0000-0000-0000-0000000000a1',
 r.id,'course','40000000-0000-0000-0000-000000000000',
 now() - interval '1 minute',null,
 'Synthetic local test instructor assignment',
 '00000000-0000-0000-0000-0000000000a2'
from clinova_private.roles r where r.role_key='instructor';

insert into clinova_private.user_role_assignments(
 user_id,role_id,scope_type,scope_id,valid_from,valid_until,grant_reason,created_by
)
select
 '00000000-0000-0000-0000-0000000000a1',
 r.id,'course','40000000-0000-0000-0000-000000000001',
 now() - interval '2 hours',now() - interval '1 hour',
 'Synthetic expired local test assignment',
 '00000000-0000-0000-0000-0000000000a2'
from clinova_private.roles r where r.role_key='instructor';

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a1","user_metadata":{"role":"super_admin"},"app_metadata":{}}',true);
do $body$$
begin
 if not public.has_clinova_permission('learning.courses.manage','course','40000000-0000-0000-0000-000000000000') then
   raise exception 'active scoped permission was not granted';
 end if;
 if public.has_clinova_permission('learning.courses.manage','course','40000000-0000-0000-0000-000000000001') then
   raise exception 'expired scoped permission remained active';
 end if;
 if public.has_clinova_permission('platform.settings.manage','global',null) then
   raise exception 'user_metadata role spoof granted platform permission';
 end if;
 if public.has_clinova_permission('learning.courses.manage','global',null) then
   raise exception 'course-scoped assignment incorrectly granted global permission';
 end if;
 if public.has_clinova_permission('unknown.permission','course','40000000-0000-0000-0000-000000000000') then
   raise exception 'unknown permission did not fail closed';
 end if;
end $$;
commit;

-- Learner B has no assignment and must not inherit A's scoped instructor rights.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a2',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a2","app_metadata":{"clinova_roles":["super_admin"]}}',true);
do $body$$
begin
 if public.has_clinova_permission('learning.courses.manage','course','40000000-0000-0000-0000-000000000000') then
   raise exception 'unassigned user inherited another user permission';
 end if;
end $$;
commit;

-- Exercise the two-person role request/approval workflow.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a2',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a2","app_metadata":{}}',true);
select public.request_clinova_role_change(
 '00000000-0000-0000-0000-0000000000a1',
 'learner','global',null,'grant',
 'Synthetic role request for local authorization test',
 'local-role-request-learner-a'
) as created_request_id \gset
commit;

select id as approval_request_id
from clinova_private.role_change_requests
where idempotency_key='local-role-request-learner-a' \gset

-- Requesters cannot target themselves for role assignment.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a2',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a2","app_metadata":{}}',true);
do $body$$
begin
 begin
   perform public.request_clinova_role_change(
     '00000000-0000-0000-0000-0000000000a2',
     'learner','global',null,'grant',
     'Synthetic self-grant denial test',
     'local-role-request-self-denied'
   );
   raise exception 'self-grant request unexpectedly succeeded';
 exception when insufficient_privilege then null;
 end;
end $$;
commit;

-- A distinct academy administrator approves the non-privileged learner role.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c3',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000c3","app_metadata":{}}',true);
select public.approve_clinova_role_change(:'approval_request_id');
commit;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a1","app_metadata":{}}',true);
do $body$
begin
 if not public.has_clinova_permission('learning.catalogue.read','global',null) then
   raise exception 'approved learner role did not become effective';
 end if;
end $body$;
commit;

-- Privileged role grants require a super-admin approver, not an academy admin.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a2',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a2","app_metadata":{}}',true);
select public.request_clinova_role_change(
 '00000000-0000-0000-0000-0000000000a1',
 'super_admin','global',null,'grant',
 'Synthetic privileged role request for approval boundary test',
 'local-role-request-superadmin-a'
);
commit;

select id as privileged_request_id
from clinova_private.role_change_requests
where idempotency_key='local-role-request-superadmin-a' \gset

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c3',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000c3","app_metadata":{}}',true);
select set_config('test.request_id', :'privileged_request_id', true);
do $body$
declare v_id uuid := current_setting('test.request_id')::uuid;
begin
 begin
   perform public.approve_clinova_role_change(v_id);
   raise exception 'academy admin approved privileged role assignment';
 exception when insufficient_privilege then null;
 end;
end $body$;
commit;

-- Provision synthetic super-admin C as the bootstrap fixture, then approve.
insert into clinova_private.user_role_assignments(
 user_id,role_id,scope_type,scope_id,grant_reason,created_by
)
select '00000000-0000-0000-0000-0000000000c3',r.id,'global',null,
 'Synthetic super-admin fixture for privileged approval test',
 '00000000-0000-0000-0000-0000000000c3'
from clinova_private.roles r where r.role_key='super_admin';

select id as privileged_request_id
from clinova_private.role_change_requests
where idempotency_key='local-role-request-superadmin-a' \gset

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c3',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000c3","app_metadata":{}}',true);
select public.approve_clinova_role_change(:'privileged_request_id');
commit;

-- Audit records cannot be modified or deleted after insertion.
insert into clinova_private.role_assignment_events(
 actor_user_id,target_user_id,role_key,scope_type,scope_id,event_type,reason
) values (
 '00000000-0000-0000-0000-0000000000a2',
 '00000000-0000-0000-0000-0000000000a1',
 'instructor','course','40000000-0000-0000-0000-000000000000',
 'granted','Synthetic immutable audit event'
);

do $body$
begin
 begin
   update clinova_private.role_assignment_events
   set reason='tampered'
   where reason='Synthetic immutable audit event';
   raise exception 'audit event update unexpectedly succeeded';
 exception when sqlstate '55000' then null;
 end;
 begin
   delete from clinova_private.role_assignment_events
   where reason='Synthetic immutable audit event';
   raise exception 'audit event delete unexpectedly succeeded';
 exception when sqlstate '55000' then null;
 end;
end $body$;

-- Anonymous callers cannot execute the authenticated-only wrapper.
do $body$$
begin
 if has_function_privilege('anon','public.has_clinova_permission(text,text,uuid)','EXECUTE') then
   raise exception 'anon unexpectedly has permission-helper EXECUTE';
 end if;
 if has_table_privilege('authenticated','clinova_private.user_role_assignments','SELECT') then
   raise exception 'authenticated unexpectedly has direct assignment-table SELECT';
 end if;
 if has_table_privilege('anon','clinova_private.roles','SELECT') then
   raise exception 'anon unexpectedly has direct roles-table SELECT';
 end if;
end $$;

\echo 'PASS: role permissions, exact scope, expiry, identity binding, metadata spoof denial and private table ACLs'
