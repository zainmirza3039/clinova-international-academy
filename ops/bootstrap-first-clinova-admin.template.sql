-- OPERATOR-ONLY TEMPLATE — DO NOT RUN WITH PLACEHOLDER VALUES.
-- Bootstrap TWO distinct initial super-admins so dual-control can operate from day one.
-- Execute only after local security tests pass and both target identities are verified.
-- Requires an independent operator and approver. Never expose as an application RPC.
\set ON_ERROR_STOP on

-- Replace values with verified Auth UUIDs and auditable references.
\set first_admin_user_id 'REPLACE_WITH_FIRST_ADMIN_AUTH_UUID'
\set second_admin_user_id 'REPLACE_WITH_SECOND_ADMIN_AUTH_UUID'
\set operator_user_id 'REPLACE_WITH_OPERATOR_AUTH_UUID'
\set approver_user_id 'REPLACE_WITH_INDEPENDENT_APPROVER_AUTH_UUID'
\set operator_reference 'REPLACE_WITH_CHANGE_TICKET_OR_OPERATOR_REFERENCE'
\set approval_reference 'REPLACE_WITH_APPROVAL_RECORD_REFERENCE'
\set bootstrap_reason 'Approved initial Clinova dual-administrator provisioning'

begin;

select (
  :'first_admin_user_id' <> 'REPLACE_WITH_FIRST_ADMIN_AUTH_UUID'
  and :'second_admin_user_id' <> 'REPLACE_WITH_SECOND_ADMIN_AUTH_UUID'
  and :'operator_user_id' <> 'REPLACE_WITH_OPERATOR_AUTH_UUID'
  and :'approver_user_id' <> 'REPLACE_WITH_INDEPENDENT_APPROVER_AUTH_UUID'
  and :'first_admin_user_id' <> :'second_admin_user_id'
  and :'first_admin_user_id' <> :'operator_user_id'
  and :'first_admin_user_id' <> :'approver_user_id'
  and :'second_admin_user_id' <> :'operator_user_id'
  and :'second_admin_user_id' <> :'approver_user_id'
  and :'operator_user_id' <> :'approver_user_id'
  and exists (select 1 from auth.users where id=:'first_admin_user_id'::uuid)
  and exists (select 1 from auth.users where id=:'second_admin_user_id'::uuid)
  and exists (select 1 from auth.users where id=:'operator_user_id'::uuid)
  and exists (select 1 from auth.users where id=:'approver_user_id'::uuid)
  and exists (select 1 from clinova_private.roles where role_key='super_admin' and is_assignable)
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
  select target.id,r.id,'global',null,statement_timestamp(),
    :'bootstrap_reason',:'operator_user_id'::uuid
  from auth.users target
  cross join clinova_private.roles r
  where target.id in (:'first_admin_user_id'::uuid,:'second_admin_user_id'::uuid)
    and r.role_key='super_admin' and r.is_assignable;

  insert into clinova_private.admin_bootstrap_events(
    target_user_id,role_key,operator_reference,approval_reference,reason
  ) values
  (:'first_admin_user_id'::uuid,'super_admin',:'operator_reference' || '-first',
   :'approval_reference',:'bootstrap_reason'),
  (:'second_admin_user_id'::uuid,'super_admin',:'operator_reference' || '-second',
   :'approval_reference',:'bootstrap_reason');

  insert into clinova_private.role_assignment_events(
    actor_user_id,target_user_id,role_key,scope_type,scope_id,event_type,reason
  ) values
  (:'operator_user_id'::uuid,:'first_admin_user_id'::uuid,'super_admin',
   'global',null,'granted',:'bootstrap_reason' || ' | independent approver: ' || :'approver_user_id'),
  (:'operator_user_id'::uuid,:'second_admin_user_id'::uuid,'super_admin',
   'global',null,'granted',:'bootstrap_reason' || ' | independent approver: ' || :'approver_user_id');

  commit;
  \echo 'Two initial super-admin assignments committed. Verify MFA and access independently for both accounts.'
\else
  rollback;
  \echo 'BOOTSTRAP ABORTED: placeholder values, identity verification, dual-control or one-time preconditions failed.'
  \quit 1
\endif
