-- Reduce duplicate permissive policy evaluation without changing access.
drop policy if exists "Contact submissions are not publicly readable" on public.contact_submissions;
create policy contact_submissions_anon_read_denied on public.contact_submissions
for select to anon using (false);

drop policy if exists "Partnership enquiries are not publicly readable" on public.partnership_inquiries;
create policy partnership_inquiries_anon_read_denied on public.partnership_inquiries
for select to anon using (false);

drop policy if exists "Newsletter subscriptions are not publicly readable" on public.newsletter_subscriptions;
create policy newsletter_subscriptions_anon_read_denied on public.newsletter_subscriptions
for select to anon using (false);

drop policy if exists instructor_profiles_select_owner_admin on public.instructor_profiles;
drop policy if exists instructor_profiles_select_public_verified on public.instructor_profiles;
create policy instructor_profiles_select_authorized on public.instructor_profiles
for select to anon, authenticated using (
  (is_public=true and verification_status='verified')
  or user_id=(select auth.uid())
  or public.has_clinova_role('content_admin')
);

create index if not exists admin_role_audit_events_actor_idx on public.admin_role_audit_events(actor_user_id);
create index if not exists admin_role_audit_events_target_idx on public.admin_role_audit_events(target_user_id);
