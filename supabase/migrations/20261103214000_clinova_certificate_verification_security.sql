-- Keep the public verification RPC as a security-invoker wrapper.
-- The narrowly scoped security-definer lookup lives in the non-exposed schema.
create or replace function clinova_private.verify_cpd_certificate(p_verification_code uuid)
returns table (
  certificate_number text,
  learner_name text,
  course_title text,
  issued_at timestamptz,
  certificate_status text
)
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select c.certificate_number,
         coalesce(nullif(p.full_name, ''), 'Name withheld') as learner_name,
         coalesce(v.snapshot ->> 'title', 'Clinova CPD programme') as course_title,
         c.issued_at,
         case when c.revoked_at is null then 'valid' else 'revoked' end as certificate_status
  from public.course_certificates c
  join public.profiles p on p.user_id = c.student_id
  join public.content_items i on i.id = c.course_item_id and i.kind = 'cpd_course'
  join lateral (
    select cv.snapshot
    from public.content_versions cv
    where cv.content_item_id = i.id
      and cv.workflow_status in ('published','archived')
    order by cv.version_number desc
    limit 1
  ) v on true
  where p_verification_code is not null
    and c.verification_code = p_verification_code
  limit 1;
$$;
revoke all on function clinova_private.verify_cpd_certificate(uuid) from public;
grant usage on schema clinova_private to anon, authenticated;
grant execute on function clinova_private.verify_cpd_certificate(uuid) to anon, authenticated;

create or replace function public.verify_cpd_certificate(p_verification_code uuid)
returns table (
  certificate_number text,
  learner_name text,
  course_title text,
  issued_at timestamptz,
  certificate_status text
)
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select * from clinova_private.verify_cpd_certificate(p_verification_code);
$$;
revoke all on function public.verify_cpd_certificate(uuid) from public;
grant execute on function public.verify_cpd_certificate(uuid) to anon, authenticated;
