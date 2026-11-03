-- Clinova learning platform core schema.
create or replace function public.has_clinova_role(p_role text)
returns boolean language sql stable set search_path = pg_catalog as $$
  select coalesce((auth.jwt() -> 'app_metadata' -> 'clinova_roles') ? p_role, false)
    or (p_role = 'content_admin' and auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (full_name is null or char_length(btrim(full_name)) between 1 and 160),
  professional_title text check (professional_title is null or char_length(professional_title) <= 160),
  institution text check (institution is null or char_length(institution) <= 200),
  country text check (country is null or char_length(country) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.instructor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_name text not null check (char_length(btrim(public_name)) between 1 and 160),
  professional_title text not null check (char_length(btrim(professional_title)) between 1 and 160),
  biography text check (biography is null or char_length(biography) <= 5000),
  credentials jsonb not null default '[]'::jsonb check (jsonb_typeof(credentials) = 'array' and jsonb_array_length(credentials) <= 30),
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected')),
  is_public boolean not null default false,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.course_instructor_assignments (
  id uuid primary key default gen_random_uuid(),
  course_item_id uuid not null references public.content_items(id) on delete restrict,
  instructor_id uuid not null references auth.users(id) on delete restrict,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  assignment_status text not null default 'active' check (assignment_status in ('active','ended')),
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  unique (course_item_id, instructor_id),
  check (ended_at is null or assignment_status = 'ended')
);
create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_item_id uuid not null references public.content_items(id) on delete restrict,
  student_id uuid not null references auth.users(id) on delete restrict,
  enrollment_status text not null default 'applied' check (enrollment_status in ('applied','active','completed','cancelled')),
  applied_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  completed_at timestamptz,
  unique (course_item_id, student_id)
);
create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_item_id uuid not null references public.content_items(id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  summary text check (summary is null or char_length(summary) <= 1000),
  content_markdown text check (content_markdown is null or char_length(content_markdown) <= 50000),
  resource_path text check (resource_path is null or char_length(resource_path) <= 500),
  sequence_number integer not null check (sequence_number > 0),
  is_published boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_item_id, sequence_number),
  unique (course_item_id, id)
);
create table if not exists public.course_live_sessions (
  id uuid primary key default gen_random_uuid(),
  course_item_id uuid not null references public.content_items(id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_url text check (meeting_url is null or char_length(meeting_url) <= 2000),
  session_status text not null default 'scheduled' check (session_status in ('scheduled','cancelled','completed')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create table if not exists public.course_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.course_enrollments(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete restrict,
  student_id uuid not null references auth.users(id) on delete restrict,
  progress_status text not null default 'started' check (progress_status in ('started','completed')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (enrollment_id, lesson_id),
  check ((progress_status = 'completed') = (completed_at is not null))
);
create table if not exists public.course_certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.course_enrollments(id) on delete restrict,
  course_item_id uuid not null references public.content_items(id) on delete restrict,
  student_id uuid not null references auth.users(id) on delete restrict,
  certificate_number text not null unique check (char_length(btrim(certificate_number)) between 4 and 80),
  verification_code uuid not null unique default gen_random_uuid(),
  issued_by uuid not null references auth.users(id) on delete restrict,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revocation_reason text check (revocation_reason is null or char_length(revocation_reason) <= 2000),
  check ((revoked_at is null) or (revocation_reason is not null and char_length(btrim(revocation_reason)) >= 10))
);

create index if not exists course_enrollments_student_idx on public.course_enrollments(student_id, applied_at desc);
create index if not exists course_enrollments_course_status_idx on public.course_enrollments(course_item_id, enrollment_status);
create index if not exists course_assignments_instructor_idx on public.course_instructor_assignments(instructor_id, assignment_status);
create index if not exists course_lessons_course_order_idx on public.course_lessons(course_item_id, sequence_number);
create index if not exists course_sessions_course_start_idx on public.course_live_sessions(course_item_id, starts_at);
create index if not exists course_progress_student_idx on public.course_lesson_progress(student_id, updated_at desc);
create index if not exists course_certificates_student_idx on public.course_certificates(student_id, issued_at desc);

alter table public.profiles enable row level security;
alter table public.instructor_profiles enable row level security;
alter table public.course_instructor_assignments enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_live_sessions enable row level security;
alter table public.course_lesson_progress enable row level security;
alter table public.course_certificates enable row level security;

create policy profiles_select_self_or_admin on public.profiles for select to authenticated using ((select auth.uid()) = user_id or public.has_clinova_role('content_admin'));
create policy profiles_insert_self on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profiles_update_self on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy instructor_profiles_select_owner_admin on public.instructor_profiles for select to authenticated using ((select auth.uid()) = user_id or public.has_clinova_role('content_admin'));
create policy instructor_profiles_admin_insert on public.instructor_profiles for insert to authenticated with check (public.has_clinova_role('content_admin'));
create policy instructor_profiles_admin_update on public.instructor_profiles for update to authenticated using (public.has_clinova_role('content_admin')) with check (public.has_clinova_role('content_admin'));

create policy course_assignments_select_participants on public.course_instructor_assignments for select to authenticated using (instructor_id = (select auth.uid()) or public.has_clinova_role('content_admin'));
create policy course_assignments_admin_insert on public.course_instructor_assignments for insert to authenticated with check (public.has_clinova_role('content_admin') and assigned_by = (select auth.uid()));
create policy course_assignments_admin_update on public.course_instructor_assignments for update to authenticated using (public.has_clinova_role('content_admin')) with check (public.has_clinova_role('content_admin'));

create policy course_enrollments_select_participants on public.course_enrollments for select to authenticated using (
  student_id = (select auth.uid()) or public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_instructor_assignments a where a.course_item_id = course_enrollments.course_item_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active')
);
create policy course_enrollments_student_apply on public.course_enrollments for insert to authenticated with check (
  student_id = (select auth.uid()) and enrollment_status = 'applied'
  and exists (select 1 from public.content_items i join public.content_versions v on v.content_item_id = i.id and v.kind = i.kind
    where i.id = course_enrollments.course_item_id and i.kind = 'cpd_course' and v.workflow_status = 'published' and v.published_at <= now())
);
create policy course_enrollments_admin_update on public.course_enrollments for update to authenticated using (public.has_clinova_role('content_admin')) with check (public.has_clinova_role('content_admin'));

create policy course_lessons_select_enrolled_or_assigned on public.course_lessons for select to authenticated using (
  public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_instructor_assignments a where a.course_item_id = course_lessons.course_item_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active')
  or (is_published and exists (select 1 from public.course_enrollments e where e.course_item_id = course_lessons.course_item_id and e.student_id = (select auth.uid()) and e.enrollment_status in ('active','completed')))
);
create policy course_lessons_instructor_insert on public.course_lessons for insert to authenticated with check (
  created_by = (select auth.uid()) and (public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_instructor_assignments a where a.course_item_id = course_lessons.course_item_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active'))
);
create policy course_lessons_instructor_update on public.course_lessons for update to authenticated using (
  public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_instructor_assignments a where a.course_item_id = course_lessons.course_item_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active')
) with check (
  public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_instructor_assignments a where a.course_item_id = course_lessons.course_item_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active')
);
create policy course_lessons_instructor_delete on public.course_lessons for delete to authenticated using (
  public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_instructor_assignments a where a.course_item_id = course_lessons.course_item_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active')
);

create policy course_sessions_select_participants on public.course_live_sessions for select to authenticated using (
  public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_instructor_assignments a where a.course_item_id = course_live_sessions.course_item_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active')
  or exists (select 1 from public.course_enrollments e where e.course_item_id = course_live_sessions.course_item_id and e.student_id = (select auth.uid()) and e.enrollment_status in ('active','completed'))
);
create policy course_sessions_instructor_insert on public.course_live_sessions for insert to authenticated with check (
  created_by = (select auth.uid()) and (public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_instructor_assignments a where a.course_item_id = course_live_sessions.course_item_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active'))
);
create policy course_sessions_instructor_update on public.course_live_sessions for update to authenticated using (
  public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_instructor_assignments a where a.course_item_id = course_live_sessions.course_item_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active')
) with check (
  public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_instructor_assignments a where a.course_item_id = course_live_sessions.course_item_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active')
);

create policy course_progress_select_participants on public.course_lesson_progress for select to authenticated using (
  student_id = (select auth.uid()) or public.has_clinova_role('content_admin')
  or exists (select 1 from public.course_enrollments e join public.course_instructor_assignments a on a.course_item_id = e.course_item_id
    where e.id = course_lesson_progress.enrollment_id and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active')
);
create policy course_progress_student_insert on public.course_lesson_progress for insert to authenticated with check (
  student_id = (select auth.uid())
  and exists (select 1 from public.course_enrollments e join public.course_lessons l on l.id = course_lesson_progress.lesson_id and l.course_item_id = e.course_item_id
    where e.id = course_lesson_progress.enrollment_id and e.student_id = (select auth.uid()) and e.enrollment_status = 'active' and l.is_published)
);
create policy course_progress_student_update on public.course_lesson_progress for update to authenticated using (student_id = (select auth.uid())) with check (
  student_id = (select auth.uid())
  and exists (select 1 from public.course_enrollments e join public.course_lessons l on l.id = course_lesson_progress.lesson_id and l.course_item_id = e.course_item_id
    where e.id = course_lesson_progress.enrollment_id and e.student_id = (select auth.uid()) and e.enrollment_status = 'active' and l.is_published)
);

create policy course_certificates_select_owner_admin on public.course_certificates for select to authenticated using (student_id = (select auth.uid()) or public.has_clinova_role('content_admin'));
create policy course_certificates_admin_insert on public.course_certificates for insert to authenticated with check (
  public.has_clinova_role('content_admin') and issued_by = (select auth.uid())
  and exists (select 1 from public.course_enrollments e where e.id = enrollment_id and e.student_id = course_certificates.student_id and e.course_item_id = course_certificates.course_item_id and e.enrollment_status = 'completed')
);
create policy course_certificates_admin_update on public.course_certificates for update to authenticated using (public.has_clinova_role('content_admin')) with check (public.has_clinova_role('content_admin'));

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.instructor_profiles to authenticated;
grant select, insert, update on public.course_instructor_assignments to authenticated;
grant select, insert, update, delete on public.course_enrollments to authenticated;
grant select, insert, update, delete on public.course_lessons to authenticated;
grant select, insert, update on public.course_live_sessions to authenticated;
grant select, insert, update on public.course_lesson_progress to authenticated;
grant select, insert, update on public.course_certificates to authenticated;

create or replace function public.issue_cpd_certificate(p_enrollment_id uuid, p_certificate_number text)
returns table (certificate_id uuid, verification_code uuid)
language plpgsql security definer set search_path = pg_catalog as $$
declare v_student uuid; v_course uuid; v_certificate_id uuid; v_code uuid;
begin
  if auth.uid() is null or not public.has_clinova_role('content_admin') then raise exception 'administrator role required' using errcode = '42501'; end if;
  if char_length(btrim(p_certificate_number)) not between 4 and 80 then raise exception 'valid certificate number required'; end if;
  select student_id, course_item_id into v_student, v_course from public.course_enrollments where id = p_enrollment_id and enrollment_status = 'completed' for update;
  if not found then raise exception 'completed enrolment not found'; end if;
  insert into public.course_certificates(enrollment_id, course_item_id, student_id, certificate_number, issued_by)
  values (p_enrollment_id, v_course, v_student, btrim(p_certificate_number), auth.uid())
  returning id, course_certificates.verification_code into v_certificate_id, v_code;
  return query select v_certificate_id, v_code;
end; $$;
create or replace function public.verify_cpd_certificate(p_verification_code uuid)
returns table (certificate_number text, learner_name text, course_title text, issued_at timestamptz, certificate_status text)
language sql stable security definer set search_path = pg_catalog as $$
  select c.certificate_number, coalesce(nullif(p.full_name, ''), 'Name withheld'),
    coalesce(v.snapshot ->> 'title', 'Clinova CPD programme'), c.issued_at,
    case when c.revoked_at is null then 'valid' else 'revoked' end
  from public.course_certificates c
  join public.profiles p on p.user_id = c.student_id
  join public.content_items i on i.id = c.course_item_id and i.kind = 'cpd_course'
  join lateral (select cv.snapshot from public.content_versions cv where cv.content_item_id = i.id and cv.workflow_status in ('published','archived') order by cv.version_number desc limit 1) v on true
  where p_verification_code is not null and c.verification_code = p_verification_code limit 1;
$$;
revoke all on function public.issue_cpd_certificate(uuid, text) from public, anon;
grant execute on function public.issue_cpd_certificate(uuid, text) to authenticated;
revoke all on function public.verify_cpd_certificate(uuid) from public;
grant execute on function public.verify_cpd_certificate(uuid) to anon, authenticated;
