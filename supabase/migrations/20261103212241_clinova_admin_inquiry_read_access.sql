-- Restrict inbound enquiry and newsletter reads to authorized academy administrators.
create policy contact_submissions_admin_read on public.contact_submissions
for select to authenticated using (public.has_clinova_role('content_admin'));
grant select on public.contact_submissions to authenticated;

create policy partnership_inquiries_admin_read on public.partnership_inquiries
for select to authenticated using (public.has_clinova_role('content_admin'));
grant select on public.partnership_inquiries to authenticated;

create policy newsletter_subscriptions_admin_read on public.newsletter_subscriptions
for select to authenticated using (public.has_clinova_role('content_admin'));
grant select on public.newsletter_subscriptions to authenticated;
