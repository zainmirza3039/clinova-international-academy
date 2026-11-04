-- Publish only administrator-verified instructor credentials in the public faculty directory.
grant select (user_id,public_name,professional_title,biography,credentials)
on public.instructor_profiles to anon, authenticated;

create or replace view public.verified_instructors
with (security_invoker=true)
as
select user_id,public_name,professional_title,biography,credentials
from public.instructor_profiles
where is_public=true and verification_status='verified';

grant select on public.verified_instructors to anon, authenticated;
