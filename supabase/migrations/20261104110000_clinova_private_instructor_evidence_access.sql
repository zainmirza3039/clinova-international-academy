-- Keep instructor verification evidence and reviewer notes private from ordinary authenticated users.
-- The public faculty directory retains access only to non-sensitive columns.
revoke select on table public.instructor_profiles from authenticated;
grant select (
  user_id,
  public_name,
  professional_title,
  biography,
  credentials,
  verification_status,
  is_public
) on table public.instructor_profiles to authenticated;

-- Administrators retrieve private verification fields through this role-gated function.
create or replace function public.get_admin_instructor_profiles()
returns table (
  user_id uuid,
  public_name text,
  professional_title text,
  biography text,
  credentials jsonb,
  verification_evidence jsonb,
  verification_rationale text,
  verification_status text,
  is_public boolean
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    ip.user_id,
    ip.public_name,
    ip.professional_title,
    ip.biography,
    ip.credentials,
    ip.verification_evidence,
    ip.verification_rationale,
    ip.verification_status,
    ip.is_public
  from public.instructor_profiles ip
  where auth.uid() is not null
    and public.has_clinova_role('content_admin')
  order by ip.created_at desc
  limit 100;
$$;

revoke all on function public.get_admin_instructor_profiles() from public, anon;
grant execute on function public.get_admin_instructor_profiles() to authenticated;
