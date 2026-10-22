-- Secure learner records for the Clinova application.
-- This migration is source-only on the feature branch. Do not apply to production
-- until the owner approves the learner data contract and a non-production test path.
-- Admin authorization uses trusted app_metadata claims; never user_metadata.

CREATE TABLE IF NOT EXISTS public.student_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text CHECK (full_name IS NULL OR char_length(full_name) BETWEEN 1 AND 160),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  programme_slug text NOT NULL CHECK (char_length(programme_slug) BETWEEN 1 AND 160),
  programme_title text NOT NULL CHECK (char_length(programme_title) BETWEEN 1 AND 200),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'completed', 'withdrawn')),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, programme_slug),
  UNIQUE (id, student_id)
);

CREATE TABLE IF NOT EXISTS public.student_learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL,
  progress_percent smallint NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  completed_lessons integer NOT NULL DEFAULT 0 CHECK (completed_lessons >= 0),
  total_lessons integer NOT NULL DEFAULT 0 CHECK (total_lessons >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (completed_lessons <= total_lessons),
  UNIQUE (enrollment_id),
  FOREIGN KEY (enrollment_id, student_id)
    REFERENCES public.student_enrollments(id, student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.student_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  enrollment_id uuid NOT NULL,
  certificate_number text NOT NULL UNIQUE
    CHECK (char_length(certificate_number) BETWEEN 4 AND 120),
  programme_title text NOT NULL CHECK (char_length(programme_title) BETWEEN 1 AND 200),
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'revoked')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  issued_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CHECK (
    (status = 'issued' AND revoked_at IS NULL) OR
    (status = 'revoked' AND revoked_at IS NOT NULL)
  ),
  FOREIGN KEY (enrollment_id, student_id)
    REFERENCES public.student_enrollments(id, student_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS student_enrollments_student_id_idx
  ON public.student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS student_learning_progress_student_id_idx
  ON public.student_learning_progress(student_id);
CREATE INDEX IF NOT EXISTS student_learning_progress_enrollment_id_idx
  ON public.student_learning_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS student_certificates_student_id_idx
  ON public.student_certificates(student_id);
CREATE INDEX IF NOT EXISTS student_certificates_enrollment_id_idx
  ON public.student_certificates(enrollment_id);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;

-- Profiles: a learner can read/update their own profile. Admin is a trusted
-- app_metadata role assigned out-of-band by an authorized project operator.
DROP POLICY IF EXISTS "Students can read their own profile" ON public.student_profiles;
CREATE POLICY "Students can read their own profile" ON public.student_profiles
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Students can create their own profile" ON public.student_profiles;
CREATE POLICY "Students can create their own profile" ON public.student_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Students can update their own profile" ON public.student_profiles;
CREATE POLICY "Students can update their own profile" ON public.student_profiles
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (user_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Enrolments: students read only their own records; trusted admins manage them.
DROP POLICY IF EXISTS "Students can read their own enrolments" ON public.student_enrollments;
CREATE POLICY "Students can read their own enrolments" ON public.student_enrollments
  FOR SELECT TO authenticated
  USING (student_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins manage enrolments" ON public.student_enrollments;
CREATE POLICY "Admins manage enrolments" ON public.student_enrollments
  FOR ALL TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Progress: students can view their own progress; only trusted admins write it.
DROP POLICY IF EXISTS "Students can read their own progress" ON public.student_learning_progress;
CREATE POLICY "Students can read their own progress" ON public.student_learning_progress
  FOR SELECT TO authenticated
  USING (student_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins manage learner progress" ON public.student_learning_progress;
CREATE POLICY "Admins manage learner progress" ON public.student_learning_progress
  FOR ALL TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Certificates: learners only see issued certificates belonging to them.
-- Issuance, revocation and cross-student access are restricted to trusted admins.
DROP POLICY IF EXISTS "Students can read their own issued certificates" ON public.student_certificates;
CREATE POLICY "Students can read their own issued certificates" ON public.student_certificates
  FOR SELECT TO authenticated
  USING (
    (student_id = (select auth.uid()) AND status = 'issued')
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "Admins manage certificates" ON public.student_certificates;
CREATE POLICY "Admins manage certificates" ON public.student_certificates
  FOR ALL TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- No anonymous learner access. RLS and narrow grants work together.
REVOKE ALL PRIVILEGES ON TABLE
  public.student_profiles,
  public.student_enrollments,
  public.student_learning_progress,
  public.student_certificates
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT ON TABLE public.student_profiles TO authenticated;
GRANT UPDATE (full_name) ON TABLE public.student_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.student_enrollments,
  public.student_learning_progress,
  public.student_certificates
TO authenticated;
