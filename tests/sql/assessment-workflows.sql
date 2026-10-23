\set ON_ERROR_STOP on
\echo 'Applying authenticated assessment workflow migration'
\i supabase/migrations/20261023030000_add_assessment_attempt_workflows.sql

\echo 'Testing owner-bound attempt creation and full-payload submission'
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);

SELECT attempt_id AS alice_attempt_1, attempt_number AS alice_attempt_number_1
FROM public.start_my_assessment_attempt('40000000-0000-0000-0000-000000000001')
\gset
SELECT pg_temp.assert_true(:'alice_attempt_number_1'::integer = 1, 'first_attempt_number');

SELECT public.submit_my_assessment_attempt(
  :'alice_attempt_1'::uuid,
  '[{"question_id":"50000000-0000-0000-0000-000000000001","answer":"b"},{"question_id":"50000000-0000-0000-0000-000000000002","answer":"My clinical reasoning"}]'::jsonb
);
SELECT pg_temp.assert_true((
  SELECT status = 'submitted' AND submitted_at IS NOT NULL
    AND score_percent IS NULL AND passed IS NULL AND graded_at IS NULL
  FROM public.learning_assessment_attempts WHERE id = :'alice_attempt_1'::uuid
), 'submission_is_not_a_grade_or_pass');
SELECT pg_temp.assert_true((
  SELECT count(*) = 2 FROM public.learning_assessment_responses
  WHERE attempt_id = :'alice_attempt_1'::uuid
), 'all_responses_saved_after_valid_submission');

DO $repeat_submit$
BEGIN
  BEGIN
    PERFORM public.submit_my_assessment_attempt(
      :'alice_attempt_1'::uuid,
      '[{"question_id":"50000000-0000-0000-0000-000000000001","answer":"b"},{"question_id":"50000000-0000-0000-0000-000000000002","answer":"Another answer"}]'::jsonb
    );
    RAISE EXCEPTION 'resubmitting a submitted attempt unexpectedly succeeded';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
END
$repeat_submit$;

SELECT attempt_id AS alice_attempt_2, attempt_number AS alice_attempt_number_2
FROM public.start_my_assessment_attempt('40000000-0000-0000-0000-000000000001')
\gset
SELECT attempt_id AS alice_attempt_3, attempt_number AS alice_attempt_number_3
FROM public.start_my_assessment_attempt('40000000-0000-0000-0000-000000000001')
\gset
SELECT pg_temp.assert_true(:'alice_attempt_number_2'::integer = 2, 'second_attempt_number');
SELECT pg_temp.assert_true(:'alice_attempt_number_3'::integer = 3, 'third_attempt_number');

DO $attempt_limit$
BEGIN
  BEGIN
    PERFORM * FROM public.start_my_assessment_attempt('40000000-0000-0000-0000-000000000001');
    RAISE EXCEPTION 'attempt limit was not enforced';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
END
$attempt_limit$;

DO $invalid_payload$
DECLARE
  v_attempt_id uuid;
BEGIN
  SELECT id INTO v_attempt_id
  FROM public.learning_assessment_attempts
  WHERE user_id = auth.uid()
    AND assessment_id = '40000000-0000-0000-0000-000000000001'
    AND attempt_number = 3;
  BEGIN
    PERFORM public.submit_my_assessment_attempt(
      v_attempt_id,
      '[{"question_id":"50000000-0000-0000-0000-000000000001","answer":"not-a-valid-choice"},{"question_id":"50000000-0000-0000-0000-000000000002","answer":"My reasoning"}]'::jsonb
    );
    RAISE EXCEPTION 'invalid choice was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  IF (SELECT count(*) FROM public.learning_assessment_responses WHERE attempt_id = v_attempt_id) <> 0 THEN
    RAISE EXCEPTION 'invalid payload wrote partial response rows';
  END IF;
  IF (SELECT status FROM public.learning_assessment_attempts WHERE id = v_attempt_id) <> 'in_progress' THEN
    RAISE EXCEPTION 'invalid payload changed the attempt state';
  END IF;
END
$invalid_payload$;

DO $cross_user_attempt$
BEGIN
  BEGIN
    PERFORM public.submit_my_assessment_attempt(
      (SELECT id FROM public.learning_assessment_attempts
       WHERE user_id = '00000000-0000-0000-0000-000000000002'
         AND assessment_id = '40000000-0000-0000-0000-000000000001'
       LIMIT 1),
      '[{"question_id":"50000000-0000-0000-0000-000000000001","answer":"b"},{"question_id":"50000000-0000-0000-0000-000000000002","answer":"Answer"}]'::jsonb
    );
    RAISE EXCEPTION 'cross-user attempt submission unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END
$cross_user_attempt$;

RESET ROLE;

\echo 'Testing anonymous roles cannot start assessment attempts'
SET ROLE anon;
DO $anonymous_attempt$
BEGIN
  BEGIN
    PERFORM * FROM public.start_my_assessment_attempt('40000000-0000-0000-0000-000000000001');
    RAISE EXCEPTION 'anonymous attempt creation unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END
$anonymous_attempt$;
RESET ROLE;

\echo 'Assessment workflow assertions completed'
