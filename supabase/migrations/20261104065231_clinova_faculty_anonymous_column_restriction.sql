-- The public directory is the only anonymous read surface for faculty data.
revoke all on table public.instructor_profiles from anon;
grant select (user_id,public_name,professional_title,biography,credentials,verification_status,is_public)
on public.instructor_profiles to anon;
