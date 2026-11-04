-- The database, not just the public button, must enforce each programme's enrolment switch.
drop policy if exists course_enrollments_student_apply on public.course_enrollments;
create policy course_enrollments_student_apply on public.course_enrollments
for insert to authenticated
with check (
  student_id = (select auth.uid())
  and enrollment_status = 'applied'
  and exists (
    select 1
    from public.content_items i
    join public.content_versions v
      on v.content_item_id = i.id
     and v.kind = i.kind
    where i.id = course_enrollments.course_item_id
      and i.kind = 'cpd_course'
      and v.workflow_status = 'published'
      and v.published_at is not null
      and v.published_at <= now()
      and v.snapshot ->> 'enrollmentOpen' = 'true'
  )
);
