-- Assessment data model proposal for Clinova's gated learner platform.
-- Apply only in an approved non-production environment after the base learning migration.
-- No questions, answer keys, attempts, staff roles, or learner records are seeded.
-- Attempts RESTRICT enrolment deletion: the owner must approve a retention/anonymisation
-- policy before account deletion is enabled.
BEGIN;

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA app_private TO service_role;

CREATE TABLE public.learning_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.learning_courses(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  instructions text CHECK (instructions IS NULL OR char_length(instructions) <= 5000),
  passing_score_percent numeric(5,2) NOT NULL DEFAULT 70
    CHECK (passing_score_percent >= 0 AND passing_score_percent <= 100),
  max_attempts integer NOT NULL DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 50),
  publication_status text NOT NULL DEFAULT 'draft'
    CHECK (publication_status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, course_id)
);

CREATE TABLE public.learning_assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  course_id uuid NOT NULL,
  prompt text NOT NULL CHECK (char_length(btrim(prompt)) BETWEEN 1 AND 10000),
  question_type text NOT NULL
    CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false', 'short_answer')),
  choices jsonb,
  points numeric(8,2) NOT NULL DEFAULT 1 CHECK (points > 0 AND points <= 1000),
  position integer NOT NULL CHECK (position > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (assessment_id, course_id)
    REFERENCES public.learning_assessments(id, course_id) ON DELETE RESTRICT,
  UNIQUE (assessment_id, position),
  UNIQUE (id, assessment_id),
  CHECK (
    (question_type IN ('single_choice', 'multiple_choice')
      AND jsonb_typeof(choices) = 'array' AND jsonb_array_length(choices) BETWEEN 2 AND 100)
    OR
    (question_type IN ('true_false', 'short_answer')
      AND (choices IS NULL OR choices = 'null'::jsonb))
  )
);

-- Correct answers and grading explanations never live in the exposed public schema.
CREATE TABLE app_private.assessment_answer_keys (
  question_id uuid PRIMARY KEY
    REFERENCES public.learning_assessment_questions(id) ON DELETE RESTRICT,
  correct_answer jsonb NOT NULL,
  explanation text CHECK (explanation IS NULL OR char_length(explanation) <= 5000),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.learning_assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  assessment_id uuid NOT NULL,
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted', 'graded', 'voided')),
  score_percent numeric(5,2) CHECK (score_percent IS NULL OR score_percent BETWEEN 0 AND 100),
  passed boolean,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  graded_at timestamptz,
  FOREIGN KEY (user_id, course_id)
    REFERENCES public.student_enrolments(user_id, course_id) ON DELETE RESTRICT,
  FOREIGN KEY (assessment_id, course_id)
    REFERENCES public.learning_assessments(id, course_id) ON DELETE RESTRICT,
  UNIQUE (user_id, assessment_id, attempt_number),
  UNIQUE (id, assessment_id),
  CHECK (
    (status = 'in_progress' AND submitted_at IS NULL AND graded_at IS NULL
      AND score_percent IS NULL AND passed IS NULL)
    OR
    (status = 'submitted' AND submitted_at IS NOT NULL AND graded_at IS NULL
      AND score_percent IS NULL AND passed IS NULL)
    OR
    (status = 'graded' AND submitted_at IS NOT NULL AND graded_at IS NOT NULL
      AND score_percent IS NOT NULL AND passed IS NOT NULL)
    OR status = 'voided'
  )
);

CREATE TABLE public.learning_assessment_responses (
  attempt_id uuid NOT NULL,
  assessment_id uuid NOT NULL,
  question_id uuid NOT NULL,
  answer jsonb NOT NULL,
  points_awarded numeric(8,2) CHECK (points_awarded IS NULL OR points_awarded >= 0),
  feedback text CHECK (feedback IS NULL OR char_length(feedback) <= 5000),
  answered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (attempt_id, question_id),
  FOREIGN KEY (attempt_id, assessment_id)
    REFERENCES public.learning_assessment_attempts(id, assessment_id) ON DELETE RESTRICT,
  FOREIGN KEY (question_id, assessment_id)
    REFERENCES public.learning_assessment_questions(id, assessment_id) ON DELETE RESTRICT
);

-- Trusted server-side role assignments; never writable/readable from the browser.
CREATE TABLE app_private.academy_staff_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  role text NOT NULL CHECK (role IN (
    'academy_admin', 'content_manager', 'enrolment_manager',
    'assessor', 'certificate_manager', 'enquiry_manager'
  )),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE app_private.academy_audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (char_length(btrim(event_type)) BETWEEN 1 AND 120),
  target_type text NOT NULL CHECK (char_length(btrim(target_type)) BETWEEN 1 AND 120),
  target_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(details) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX learning_assessments_course_status_idx
  ON public.learning_assessments(course_id, publication_status);
CREATE INDEX learning_assessment_questions_order_idx
  ON public.learning_assessment_questions(assessment_id, position);
CREATE INDEX learning_assessment_attempts_owner_idx
  ON public.learning_assessment_attempts(user_id, assessment_id, started_at DESC);
CREATE INDEX learning_assessment_responses_question_idx
  ON public.learning_assessment_responses(question_id);
CREATE INDEX academy_audit_events_created_idx
  ON app_private.academy_audit_events(created_at DESC);

ALTER TABLE public.learning_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_private.assessment_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_private.academy_staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_private.academy_audit_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.learning_assessments, public.learning_assessment_questions,
  public.learning_assessment_attempts, public.learning_assessment_responses
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.learning_assessments, public.learning_assessment_questions,
  public.learning_assessment_attempts, public.learning_assessment_responses TO authenticated;
GRANT ALL ON public.learning_assessments, public.learning_assessment_questions,
  public.learning_assessment_attempts, public.learning_assessment_responses TO service_role;
REVOKE ALL ON ALL TABLES IN SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA app_private TO service_role;
GRANT USAGE, SELECT ON SEQUENCE app_private.academy_audit_events_id_seq TO service_role;

CREATE POLICY assessments_read_enrolled_published
  ON public.learning_assessments FOR SELECT TO authenticated
  USING (
    publication_status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.learning_courses c
      WHERE c.id = learning_assessments.course_id AND c.publication_status = 'published'
    )
    AND EXISTS (
      SELECT 1 FROM public.student_enrolments e
      WHERE e.course_id = learning_assessments.course_id
        AND e.user_id = (SELECT auth.uid()) AND e.status IN ('active', 'completed')
    )
  );

CREATE POLICY assessment_questions_read_enrolled_published
  ON public.learning_assessment_questions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_assessments a
      JOIN public.learning_courses c ON c.id = a.course_id
      WHERE a.id = learning_assessment_questions.assessment_id
        AND a.course_id = learning_assessment_questions.course_id
        AND a.publication_status = 'published'
        AND c.publication_status = 'published'
    )
    AND EXISTS (
      SELECT 1 FROM public.student_enrolments e
      WHERE e.course_id = learning_assessment_questions.course_id
        AND e.user_id = (SELECT auth.uid()) AND e.status IN ('active', 'completed')
    )
  );

CREATE POLICY assessment_attempts_read_self
  ON public.learning_assessment_attempts FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY assessment_responses_read_self
  ON public.learning_assessment_responses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_assessment_attempts a
      WHERE a.id = learning_assessment_responses.attempt_id
        AND a.user_id = (SELECT auth.uid())
    )
  );

COMMIT;
