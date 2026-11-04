-- Require documented evidence and a reviewer rationale before publishing instructor credentials.
alter table public.instructor_profiles
  add column if not exists verification_evidence jsonb not null default '[]'::jsonb,
  add column if not exists verification_rationale text;

alter table public.instructor_profiles
  drop constraint if exists instructor_profiles_verification_evidence_check,
  add constraint instructor_profiles_verification_evidence_check
    check (jsonb_typeof(verification_evidence)='array' and jsonb_array_length(verification_evidence)<=30),
  drop constraint if exists instructor_profiles_verification_rationale_check,
  add constraint instructor_profiles_verification_rationale_check
    check (verification_rationale is null or char_length(verification_rationale)<=2000);

create or replace function public.enforce_instructor_profile_verification_evidence()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.verification_status='verified' then
    if jsonb_typeof(new.verification_evidence) is distinct from 'array'
      or jsonb_array_length(new.verification_evidence)<1
      or char_length(btrim(coalesce(new.verification_rationale,''))) not between 10 and 2000
      or jsonb_array_length(new.credentials)<1
      or new.reviewed_by is null
      or new.reviewed_at is null
    then
      raise exception 'verified instructor publication requires credentials, evidence references and a reviewer rationale' using errcode='23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_instructor_profile_verification_evidence() from public,anon,authenticated;
drop trigger if exists enforce_instructor_profile_verification_evidence on public.instructor_profiles;
create trigger enforce_instructor_profile_verification_evidence
before insert or update on public.instructor_profiles
for each row execute function public.enforce_instructor_profile_verification_evidence();
