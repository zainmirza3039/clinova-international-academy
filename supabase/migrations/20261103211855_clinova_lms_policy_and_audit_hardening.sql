-- Consolidate learner profile access, add indexes, role audit, and verified faculty view.
drop policy if exists profiles_select_self_or_admin on public.profiles;
drop policy if exists profiles_select_assigned_instructor_learners on public.profiles;
create policy profiles_select_authorized on public.profiles for select to authenticated using (
  user_id=(select auth.uid()) or public.has_clinova_role('content_admin')
  or exists (
    select 1 from public.course_enrollments e
    join public.course_instructor_assignments a on a.course_item_id=e.course_item_id
    where e.student_id=profiles.user_id and e.enrollment_status in ('active','completed')
      and a.instructor_id=(select auth.uid()) and a.assignment_status='active'
  )
);

create index if not exists course_certificates_course_item_idx on public.course_certificates(course_item_id);
create index if not exists course_certificates_issued_by_idx on public.course_certificates(issued_by);
create index if not exists course_enrollments_reviewed_by_idx on public.course_enrollments(reviewed_by);
create index if not exists course_assignments_assigned_by_idx on public.course_instructor_assignments(assigned_by);
create index if not exists course_progress_lesson_idx on public.course_lesson_progress(lesson_id);
create index if not exists course_lessons_created_by_idx on public.course_lessons(created_by);
create index if not exists course_sessions_created_by_idx on public.course_live_sessions(created_by);
create index if not exists instructor_profiles_reviewed_by_idx on public.instructor_profiles(reviewed_by);

create table if not exists public.admin_role_audit_events (
  id bigint generated always as identity primary key,
  target_user_id uuid not null references auth.users(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  role_name text not null check (role_name in ('instructor','faculty','content_author','clinical_reviewer','editorial_reviewer','content_publisher','content_admin')),
  action text not null check (action in ('granted','revoked')),
  occurred_at timestamptz not null default now()
);
alter table public.admin_role_audit_events enable row level security;
create policy admin_role_audit_events_read on public.admin_role_audit_events for select to authenticated using (public.has_clinova_role('content_admin'));
grant select on public.admin_role_audit_events to authenticated;

create policy instructor_profiles_select_public_verified on public.instructor_profiles
for select to anon, authenticated using (is_public=true and verification_status='verified');
grant select (user_id,public_name,professional_title,biography) on public.instructor_profiles to anon, authenticated;
create or replace view public.verified_instructors with (security_invoker=true) as
select user_id,public_name,professional_title,biography from public.instructor_profiles
where is_public=true and verification_status='verified';
grant select on public.verified_instructors to anon, authenticated;
