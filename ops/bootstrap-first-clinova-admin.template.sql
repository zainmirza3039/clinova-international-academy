-- OPERATOR-ONLY TEMPLATE — DO NOT RUN WITH PLACEHOLDER VALUES.
-- Execute only after the role-authorisation migration has passed local tests
-- and the academy has approved the named target, operator and independent approver.
-- Use a trusted direct administrative PostgreSQL session, never a browser RPC.
-- This file is not wired to the application and is not a public endpoint.
\set ON_ERROR_STOP on

-- Replace each value with verified Auth UUIDs and auditable references.
\set target_user_id 'REPLACE_WITH_VERIFIED_TARGET_AUTH_UUID'
\set operator_user_id 'REPLACE_WITH_OPERATOR_AUTH_UUID'
\set approver_user_id 'REPLACE_WITH_INDEPENDENT_APPROVER_AUTH_UUID'
\set operator_reference 'REPLACE_WITH_CHANGE_TICKET_OR_OPERATOR_REFERENCE'
\set approval_reference 'REPLACE_WITH_APPROVAL_RECORD_REFERENCE'
\set bootstrap_reason 'Approved initial Clinova super administrator provisioning'

begin;

select (
  :'target_user_id' <> 'REPLACE_WITH_VERIFIED_TARGET_AUTH_UUID'
  and :'operator_user_id' <> 'REPLACE_WITH_OPERATOR_AUTH_UUID'
  and :'approver_user_id' <> 'REPLACE_WITH_INDEPENDENT_APPROVER_AUTH_UUID'
  and :'target_user_id' <> :'operator_user_id'
  and :'target_user_id' <> :'approver_user_id'
  and :'operator_user_id' <> :'approver_user_id'
  and exists (select 1 from auth.users where id=:'target_user_id'::uuid)
  and exists (select 1 from auth.users where id=:'operator_user_id'::uuid)
  and exists (select 1 from auth.users where id=:'approver_user_id'::uuid)
  and not exists (select 1 from clinova_private.admin_bootstrap_events)
  and not exists (
    select 1
    from clinova_private.user_role_assignments a
    join clinova_private.roles r on r.id=a.role_id
    where r.role_key='super_admin' and a.scope_type='global'
      and a.scope_id is null and a.revoked_at is null
      and a.valid_from <= statement_timestamp()
      and (a.valid_until is null or a.valid_until > statement_timestamp())
  )
) as bootstrap_allowed \gset

\if :bootstrap_allowed
  insert into clinova_private.user_role_assignments(
    user_id,role_id,scope_type,scope_id,valid_from,grant_reason,created_by
  )
  select
    :'target_user_id'::uuid,r.id,'global',null,statement_timestamp(),
    :'bootstrap_reason',:'operator_user_id'::uuid
  from clinova_private.roles r
  where r.role_key='super_admin' and r.is_assignable;

  insert into clinova_private.admin_bootstrap_events(
    target_user_id,role_key,operator_reference,approval_reference,reason
  ) values (
    :'target_user_id'::uuid,'super_admin',
    :'operator_reference',:'approval_reference',:'bootstrap_reason'
  );

  insert into clinova_private.role_assignment_events(
    actor_user_id,target_user_id,role_key,scope_type,scope_id,event_type,reason
  ) values (
    :'operator_user_id'::uuid,:'target_user_id'::uuid,'super_admin',
    'global',null,'granted',
    :'bootstrap_reason' || ' | independent approval: ' || :'approver_user_id'
  );

  commit;
  \echo 'Initial administrator bootstrap committed. Verify MFA and privileged access independently.'
\else
  rollback;
  \echo 'BOOTSTRAP ABORTED: placeholder values, identity verification, dual-control or one-time preconditions failed.'
  \quit 1
\endif
