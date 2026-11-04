-- Give authorized administrators read-only access to append-only audit history.
drop policy if exists content_audit_events_admin_read on public.content_audit_events;
create policy content_audit_events_admin_read on public.content_audit_events for select to authenticated using (public.has_clinova_role('content_admin'));
grant select on public.content_audit_events to authenticated;
drop policy if exists admin_role_audit_events_read on public.admin_role_audit_events;
create policy admin_role_audit_events_read on public.admin_role_audit_events for select to authenticated using (public.has_clinova_role('content_admin'));
grant select on public.admin_role_audit_events to authenticated;
revoke insert, update, delete, truncate, references, trigger on public.content_audit_events from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.admin_role_audit_events from anon, authenticated;
