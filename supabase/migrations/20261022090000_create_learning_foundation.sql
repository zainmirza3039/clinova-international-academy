-- Additive learner-data foundation. No users, course offerings or awards are seeded.
-- Review in an isolated database before applying to the positively identified Clinova project.
BEGIN;

CREATE TABLE public.student_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  display_name text NOT NULL CHECK (char_length(btrim(display_name)) BETWEEN 1 AND 160),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.learning_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  summary text NOT NULL CHECK (char_length(btrim(summary)) BETWEEN 1 AND 3000),
  publication_status text NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.learning_courses(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  position integer NOT NULL CHECK (position > 0),
  UNIQUE (course_id, position),
  UNIQUE (id, course_id)
);

CREATE TABLE public.learning_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.learning_courses(id) ON DELETE CASCADE,
  module_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  body_markdown text NOT NULL CHECK (char_length(btrim(body_markdown)) BETWEEN 1 AND 100000),
  position integer NOT NULL CHECK (position > 0),
  publication_status text NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  FOREIGN KEY (module_id, course_id) REFERENCES public.learning_modules(id, course_id) ON DELETE CASCADE,
  UNIQUE (module_id, position),
  UNIQUE (id, course_id)
);

CREATE TABLE public.student_enrolments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES public.learning_courses(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- A learner's completion marker is a study aid, not an assessment pass or award.
CREATE TABLE public.lesson_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES public.learning_courses(id),
  lesson_id uuid NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (lesson_id, course_id) REFERENCES public.learning_lessons(id, course_id)
);

CREATE TABLE public.student_assessment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL,
  assessment_title text NOT NULL CHECK (char_length(btrim(assessment_title)) BETWEEN 1 AND 200),
  outcome text NOT NULL CHECK (outcome IN ('submitted', 'passed', 'not_passed')),
  feedback text CHECK (feedback IS NULL OR char_length(feedback) <= 5000),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id, course_id) REFERENCES public.student_enrolments(user_id, course_id)
);

-- Private award records only. Public verification requires a separately reviewed,
-- rate-limited server endpoint with an explicit disclosure/consent contract.
CREATE TABLE public.student_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL,
  certificate_reference text NOT NULL UNIQUE CHECK (char_length(btrim(certificate_reference)) BETWEEN 16 AND 160),
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'revoked')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  FOREIGN KEY (user_id, course_id) REFERENCES public.student_enrolments(user_id, course_id),
  CHECK ((status = 'issued' AND revoked_at IS NULL) OR (status = 'revoked' AND revoked_at IS NOT NULL))
);

CREATE INDEX student_enrolments_course_idx ON public.student_enrolments(course_id);
CREATE INDEX lesson_progress_course_idx ON public.lesson_progress(course_id);
CREATE INDEX assessment_owner_idx ON public.student_assessment_records(user_id, course_id);
CREATE INDEX certificate_owner_idx ON public.student_certificates(user_id, course_id);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrolments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assessment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;

-- Override possible Supabase default privileges explicitly, including PUBLIC.
REVOKE ALL ON public.student_profiles, public.learning_courses, public.learning_modules,
  public.learning_lessons, public.student_enrolments, public.lesson_progress,
  public.student_assessment_records, public.student_certificates FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.learning_courses TO anon, authenticated;
GRANT SELECT ON public.student_profiles, public.learning_modules, public.learning_lessons,
  public.student_enrolments, public.lesson_progress, public.student_assessment_records,
  public.student_certificates TO authenticated;
GRANT INSERT (user_id, display_name), UPDATE (display_name) ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_profiles, public.learning_courses, public.learning_modules,
  public.learning_lessons, public.student_enrolments, public.lesson_progress,
  public.student_assessment_records, public.student_certificates TO service_role;

CREATE POLICY profiles_read_self ON public.student_profiles FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY profiles_create_self ON public.student_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY profiles_update_self ON public.student_profiles FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY courses_read_published ON public.learning_courses FOR SELECT TO anon, authenticated
  USING (publication_status = 'published');
CREATE POLICY enrolments_read_self ON public.student_enrolments FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY modules_read_enrolled ON public.learning_modules FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.learning_courses c WHERE c.id = course_id AND c.publication_status = 'published')
    AND EXISTS (SELECT 1 FROM public.student_enrolments e WHERE e.course_id = learning_modules.course_id
      AND e.user_id = (SELECT auth.uid()) AND e.status IN ('active', 'completed')));
CREATE POLICY lessons_read_enrolled ON public.learning_lessons FOR SELECT TO authenticated
  USING (publication_status = 'published'
    AND EXISTS (SELECT 1 FROM public.learning_courses c WHERE c.id = course_id AND c.publication_status = 'published')
    AND EXISTS (SELECT 1 FROM public.student_enrolments e WHERE e.course_id = learning_lessons.course_id
      AND e.user_id = (SELECT auth.uid()) AND e.status IN ('active', 'completed')));
CREATE POLICY progress_read_self ON public.lesson_progress FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY assessments_read_self ON public.student_assessment_records FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY certificates_read_self ON public.student_certificates FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Narrow RPC owns all progress writes: caller cannot choose an owner or timestamp.
-- SECURITY DEFINER is needed because direct progress INSERT/DELETE remain revoked.
CREATE FUNCTION public.set_my_lesson_completion(p_lesson_id uuid, p_completed boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_course_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF p_completed IS NULL THEN
    RAISE EXCEPTION 'Completion state is required' USING ERRCODE = '22023';
  END IF;
  -- Hold a row lock to serialize changes against concurrent withdrawal.
  SELECT l.course_id INTO v_course_id
  FROM public.learning_lessons l
  JOIN public.learning_courses c ON c.id = l.course_id
  JOIN public.student_enrolments e ON e.course_id = l.course_id AND e.user_id = v_user_id
  WHERE l.id = p_lesson_id AND l.publication_status = 'published'
    AND c.publication_status = 'published' AND e.status = 'active'
  FOR SHARE OF e, l, c;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lesson is not available for this enrolment' USING ERRCODE = '42501';
  END IF;
  IF p_completed THEN
    INSERT INTO public.lesson_progress (user_id, course_id, lesson_id)
    VALUES (v_user_id, v_course_id, p_lesson_id)
    ON CONFLICT (user_id, lesson_id) DO NOTHING;
  ELSE
    DELETE FROM public.lesson_progress WHERE user_id = v_user_id AND lesson_id = p_lesson_id;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.set_my_lesson_completion(uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_my_lesson_completion(uuid, boolean) TO authenticated;

COMMIT;
