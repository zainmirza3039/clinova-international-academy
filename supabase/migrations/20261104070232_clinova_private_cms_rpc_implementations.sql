-- Relocate privileged CMS/CPD RPC implementations to the non-exposed schema.
-- Keep stable public RPC names as SECURITY INVOKER wrappers for the frontend.
grant usage on schema clinova_private to authenticated;

do $migration$
declare
  r record;
  private_definition text;
  wrapper_body text;
  wrapper_definition text;
  call_arguments text;
  argument_types text;
begin
  for r in
    select p.oid,p.proname,p.pronargs,p.proargtypes,p.proretset
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.prosecdef=true
      and p.proname in (
        'archive_content_version',
        'create_content_item',
        'create_content_version',
        'issue_cpd_certificate',
        'publish_content_version',
        'record_content_review',
        'submit_content_for_review',
        'withdraw_content_version'
      )
  loop
    private_definition := replace(pg_get_functiondef(r.oid),'FUNCTION public.','FUNCTION clinova_private.');
    execute private_definition;

    select string_agg('$'||g.n,',' order by g.n)
      into call_arguments
    from generate_series(1,r.pronargs) as g(n);
    argument_types := oidvectortypes(r.proargtypes);

    if r.proretset then
      wrapper_body := 'select * from clinova_private.'||quote_ident(r.proname)||'('||call_arguments||')';
    else
      wrapper_body := 'select clinova_private.'||quote_ident(r.proname)||'('||call_arguments||')';
    end if;

    select format(
      'create or replace function public.%I(%s) returns %s language sql security invoker set search_path = pg_catalog as %L',
      r.proname,
      pg_get_function_identity_arguments(r.oid),
      pg_get_function_result(r.oid),
      wrapper_body
    ) into wrapper_definition;
    execute wrapper_definition;

    execute format('revoke all on function clinova_private.%I(%s) from public, anon',r.proname,argument_types);
    execute format('grant execute on function clinova_private.%I(%s) to authenticated',r.proname,argument_types);
    execute format('revoke all on function public.%I(%s) from public, anon, authenticated',r.proname,argument_types);
    execute format('grant execute on function public.%I(%s) to authenticated',r.proname,argument_types);
  end loop;
end;
$migration$;
