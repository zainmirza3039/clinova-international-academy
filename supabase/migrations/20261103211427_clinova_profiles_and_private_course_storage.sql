-- Auto-create learner profiles and provision private teaching resources.
create or replace function public.handle_new_clinova_user()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.profiles(user_id, full_name)
  values (new.id, nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 160), ''))
  on conflict (user_id) do nothing;
  return new;
end; $$;
revoke all on function public.handle_new_clinova_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_clinova_profile on auth.users;
create trigger on_auth_user_created_clinova_profile after insert on auth.users
for each row execute function public.handle_new_clinova_user();

create policy profiles_select_assigned_instructor_learners on public.profiles for select to authenticated using (
  exists (select 1 from public.course_enrollments e join public.course_instructor_assignments a on a.course_item_id = e.course_item_id
    where e.student_id = profiles.user_id and e.enrollment_status in ('active','completed')
      and a.instructor_id = (select auth.uid()) and a.assignment_status = 'active')
);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('course-resources','course-resources',false,104857600,array[
  'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg','image/png','image/webp','video/mp4'
])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy course_resources_select_authorized on storage.objects for select to authenticated using (
  bucket_id='course-resources' and (
    public.has_clinova_role('content_admin')
    or exists (select 1 from public.course_instructor_assignments a where a.course_item_id::text=(storage.foldername(name))[1] and a.instructor_id=(select auth.uid()) and a.assignment_status='active')
    or exists (select 1 from public.course_enrollments e where e.course_item_id::text=(storage.foldername(name))[1] and e.student_id=(select auth.uid()) and e.enrollment_status in ('active','completed'))
  )
);
create policy course_resources_instructor_insert on storage.objects for insert to authenticated with check (
  bucket_id='course-resources' and (
    public.has_clinova_role('content_admin')
    or exists (select 1 from public.course_instructor_assignments a where a.course_item_id::text=(storage.foldername(name))[1] and a.instructor_id=(select auth.uid()) and a.assignment_status='active')
  )
);
create policy course_resources_instructor_update on storage.objects for update to authenticated using (
  bucket_id='course-resources' and (
    public.has_clinova_role('content_admin')
    or exists (select 1 from public.course_instructor_assignments a where a.course_item_id::text=(storage.foldername(name))[1] and a.instructor_id=(select auth.uid()) and a.assignment_status='active')
  )
) with check (
  bucket_id='course-resources' and (
    public.has_clinova_role('content_admin')
    or exists (select 1 from public.course_instructor_assignments a where a.course_item_id::text=(storage.foldername(name))[1] and a.instructor_id=(select auth.uid()) and a.assignment_status='active')
  )
);
create policy course_resources_instructor_delete on storage.objects for delete to authenticated using (
  bucket_id='course-resources' and (
    public.has_clinova_role('content_admin')
    or exists (select 1 from public.course_instructor_assignments a where a.course_item_id::text=(storage.foldername(name))[1] and a.instructor_id=(select auth.uid()) and a.assignment_status='active')
  )
);
