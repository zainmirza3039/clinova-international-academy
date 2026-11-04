-- Require verified instructors and currently published CPD courses for active teaching assignments.
create or replace function public.validate_course_instructor_assignment()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.assignment_status = 'active' then
    if not exists (
      select 1 from public.instructor_profiles ip
      where ip.user_id = new.instructor_id
        and ip.verification_status = 'verified'
        and ip.is_public = true
    ) then
      raise exception 'only a verified and publicly approved instructor may be assigned' using errcode = '23514';
    end if;
    if not exists (
      select 1 from public.content_items i
      join public.content_versions v on v.content_item_id = i.id and v.kind = i.kind
      where i.id = new.course_item_id
        and i.kind = 'cpd_course'
        and v.workflow_status = 'published'
        and v.published_at is not null
        and v.published_at <= now()
    ) then
      raise exception 'only a currently published CPD programme may receive an instructor assignment' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.validate_course_instructor_assignment() from public, anon, authenticated;
drop trigger if exists validate_course_instructor_assignment on public.course_instructor_assignments;
create trigger validate_course_instructor_assignment
before insert or update on public.course_instructor_assignments
for each row execute function public.validate_course_instructor_assignment();
