-- Local-only authorization checks. Executed only by test-disposable-postgres.sh.
\set ON_ERROR_STOP on

insert into auth.users(id) values
 ('00000000-0000-0000-0000-0000000000a1'),
 ('00000000-0000-0000-0000-0000000000a2');

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
do $$
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
do $$
begin
 if public.has_clinova_permission('learning.courses.manage','course','40000000-0000-0000-0000-000000000000') then
   raise exception 'unassigned user inherited another user permission';
 end if;
end $$;
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

do $
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
end $;

-- Anonymous callers cannot execute the authenticated-only wrapper.
do $$
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
