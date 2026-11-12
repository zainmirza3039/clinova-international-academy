-- Local-only disposable test bootstrap. Never run against a hosted Supabase database.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY);

CREATE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

CREATE FUNCTION auth.jwt() RETURNS jsonb
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;

GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid(), auth.jwt() TO anon, authenticated;

-- Minimal local-only stubs for existing production relations referenced by
-- the new assessment migration. The hosted project already owns these tables.
CREATE TABLE public.content_items (
  id uuid PRIMARY KEY,
  kind text NOT NULL
);

CREATE TABLE public.course_enrollments (
  id uuid PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES auth.users(id)
);
