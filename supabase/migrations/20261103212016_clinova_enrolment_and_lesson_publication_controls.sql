-- Require explicit enrolment opening and reserve lesson publication to administrators.
drop policy if exists course_enrollments_student_apply on public.course_enrollments;
create policy course_enrollments_student_apply on public.course_enrollments for insert to authenticated with check (
  student_id=(select auth.uid()) and enrollment_status='applied'
  and exists (
    select 1 from public.content_items i
    join public.content_versions v on v.content_item_id=i.id and v.kind=i.kind
    where i.id=course_enrollments.course_item_id and i.kind='cpd_course'
      and v.workflow_status='published' and v.published_at<=now()
      and v.snapshot ->> 'enrollmentOpen'='true'
  )
);

drop policy if exists course_lessons_instructor_insert on public.course_lessons;
create policy course_lessons_instructor_insert on public.course_lessons for insert to authenticated with check (
  created_by=(select auth.uid())
  and (
    public.has_clinova_role('content_admin')
    or (is_published=false and exists (
      select 1 from public.course_instructor_assignments a
      where a.course_item_id=course_lessons.course_item_id and a.instructor_id=(select auth.uid()) and a.assignment_status='active'
    ))
  )
);

create or replace function public.prevent_non_admin_lesson_publication()
returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
  if new.is_published is distinct from old.is_published and not public.has_clinova_role('content_admin') then
    raise exception 'only a content administrator may publish or unpublish a lesson' using errcode='42501';
  end if;
  if new.created_by is distinct from old.created_by and not public.has_clinova_role('content_admin') then
    raise exception 'lesson ownership cannot be reassigned' using errcode='42501';
  end if;
  return new;
end; $$;
revoke all on function public.prevent_non_admin_lesson_publication() from public,anon,authenticated;
drop trigger if exists prevent_non_admin_lesson_publication on public.course_lessons;
create trigger prevent_non_admin_lesson_publication before update on public.course_lessons
for each row execute function public.prevent_non_admin_lesson_publication();
