\set ON_ERROR_STOP on
\echo 'Preparing local Supabase-like roles and auth stubs'
CREATE FUNCTION pg_temp.assert_true(condition boolean, message text) RETURNS void
LANGUAGE plpgsql AS $$ BEGIN
  IF condition IS DISTINCT FROM true THEN RAISE EXCEPTION 'Assertion failed: %', message; END IF;
END $$;

CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE
AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON auth.users TO service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;

\echo 'Applying migration under test'
\i supabase/migrations/20261022090000_create_learning_foundation.sql
\i supabase/migrations/20261023010000_create_assessment_engine.sql

\echo 'Loading local-only fixtures as service_role'
SET ROLE service_role;
INSERT INTO auth.users(id) VALUES
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002');
INSERT INTO public.learning_courses(id, slug, title, summary, publication_status) VALUES
  ('10000000-0000-0000-0000-000000000001', 'published-course', 'Published Course', 'Visible catalog course', 'published'),
  ('10000000-0000-0000-0000-000000000002', 'draft-course', 'Draft Course', 'Private draft course', 'draft'),
  ('10000000-0000-0000-0000-000000000003', 'other-published-course', 'Other Course', 'A second published course', 'published');
INSERT INTO public.learning_modules(id, course_id, title, position) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Published Module', 1),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Draft Module', 1),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Other Module', 1);
INSERT INTO public.learning_lessons(id, course_id, module_id, title, body_markdown, position, publication_status) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Published Lesson', 'lesson', 1, 'published'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Draft Lesson', 'draft', 2, 'draft'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Draft Course Lesson', 'draft', 1, 'published'),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Other Lesson', 'other', 1, 'published');
INSERT INTO public.student_profiles(user_id, display_name) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Bob');
INSERT INTO public.student_enrolments(user_id, course_id, status) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'active'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'active');
RESET ROLE;

\echo 'Testing anonymous catalog and private-table denial'
SET ROLE anon;
SELECT pg_temp.assert_true((SELECT count(*) = 2 FROM public.learning_courses), 'published_catalog_only');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.learning_courses WHERE publication_status = 'draft'), 'draft_course_hidden');
DO $$ BEGIN
  BEGIN PERFORM count(*) FROM public.student_profiles; RAISE EXCEPTION 'anonymous profile read unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.set_my_lesson_completion('30000000-0000-0000-0000-000000000001', true); RAISE EXCEPTION 'anonymous RPC unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

\echo 'Testing Alice self access, published/enrolled visibility, and RPC semantics'
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
INSERT INTO public.student_profiles(user_id, display_name) VALUES (auth.uid(), 'Alice');
UPDATE public.student_profiles SET display_name = 'Alice Updated' WHERE user_id = auth.uid();
SELECT pg_temp.assert_true((SELECT count(*) = 1 AND min(display_name) = 'Alice Updated' FROM public.student_profiles), 'alice_sees_own_profile');
DO $$ BEGIN
  BEGIN INSERT INTO public.student_profiles(user_id, display_name) VALUES ('00000000-0000-0000-0000-000000000002', 'Imposter'); RAISE EXCEPTION 'cross-user profile creation unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.student_profiles SET user_id = '00000000-0000-0000-0000-000000000002' WHERE user_id = auth.uid(); RAISE EXCEPTION 'profile ownership write unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.student_profiles SET created_at = '2000-01-01' WHERE user_id = auth.uid(); RAISE EXCEPTION 'profile timestamp write unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.student_enrolments), 'alice_sees_own_enrolment');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.learning_modules), 'enrolled_published_module');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.learning_lessons), 'enrolled_published_lesson');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.learning_lessons WHERE id = '30000000-0000-0000-0000-000000000002'), 'draft_lesson_hidden');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.learning_lessons WHERE id = '30000000-0000-0000-0000-000000000004'), 'other_course_lesson_hidden');

-- A learner cannot enrol, write assessments/certificates, or write progress directly.
DO $$ BEGIN
  BEGIN INSERT INTO public.student_enrolments(user_id, course_id) VALUES (auth.uid(), '10000000-0000-0000-0000-000000000003'); RAISE EXCEPTION 'self-enrolment unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.student_assessment_records(user_id, course_id, assessment_title, outcome) VALUES (auth.uid(), '10000000-0000-0000-0000-000000000001', 'Fake', 'passed'); RAISE EXCEPTION 'assessment write unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.student_certificates(user_id, course_id, certificate_reference) VALUES (auth.uid(), '10000000-0000-0000-0000-000000000001', 'alice-fake-certificate'); RAISE EXCEPTION 'certificate write unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.lesson_progress(user_id, course_id, lesson_id, completed_at) VALUES ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '2000-01-01'); RAISE EXCEPTION 'direct progress write unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;

SELECT public.set_my_lesson_completion('30000000-0000-0000-0000-000000000001', true);
SELECT pg_temp.assert_true((SELECT count(*) = 1 AND bool_and(user_id = auth.uid()) AND min(completed_at) > '2020-01-01'::timestamptz FROM public.lesson_progress), 'progress_created_by_rpc');
SELECT public.set_my_lesson_completion('30000000-0000-0000-0000-000000000001', true);
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.lesson_progress), 'rpc_is_idempotent');
SELECT public.set_my_lesson_completion('30000000-0000-0000-0000-000000000001', false);
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.lesson_progress), 'rpc_undo');
DO $$ BEGIN
  BEGIN PERFORM public.set_my_lesson_completion('30000000-0000-0000-0000-000000000002', true); RAISE EXCEPTION 'draft lesson completion unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.set_my_lesson_completion('30000000-0000-0000-0000-000000000003', true); RAISE EXCEPTION 'draft course completion unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.set_my_lesson_completion('30000000-0000-0000-0000-000000000004', true); RAISE EXCEPTION 'cross-course unenrolled lesson unexpectedly completed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.set_my_lesson_completion('30000000-0000-0000-0000-000000000001', NULL); RAISE EXCEPTION 'NULL completion unexpectedly accepted';
  EXCEPTION WHEN check_violation OR invalid_parameter_value THEN NULL; END;
END $$;

SELECT set_config('request.jwt.claim.sub', NULL, false);
DO $$ BEGIN
  BEGIN PERFORM public.set_my_lesson_completion('30000000-0000-0000-0000-000000000001', true); RAISE EXCEPTION 'ownerless JWT unexpectedly accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;

-- Frontend-shaped reads: explicit columns, owner scoping, stable pagination, and
-- course/module/publication filters. All additional rows are synthetic and local.
SET ROLE service_role;
INSERT INTO public.student_enrolments(user_id, course_id, status)
VALUES ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'active');
INSERT INTO public.learning_courses(slug, title, summary, publication_status)
SELECT format('alice-page-course-%s', lpad(g::text, 2, '0')), format('Alice page course %s', g), 'Synthetic pagination fixture', 'published'
FROM generate_series(1, 11) AS s(g);
INSERT INTO public.student_enrolments(user_id, course_id, status)
SELECT '00000000-0000-0000-0000-000000000001', c.id, 'active'
FROM public.learning_courses c
WHERE c.slug LIKE 'alice-page-course-%';
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
SELECT public.set_my_lesson_completion('30000000-0000-0000-0000-000000000001', true);
SELECT pg_temp.assert_true((SELECT count(*) = 1 AND bool_and(user_id = auth.uid()) AND min(display_name) = 'Alice Updated'
  FROM public.student_profiles), 'frontend_own_profile_projection');
SELECT pg_temp.assert_true((SELECT count(*) = 13 AND bool_and(user_id = auth.uid())
  FROM public.student_enrolments), 'frontend_own_enrolment_projection');
SELECT pg_temp.assert_true((WITH own_course_ids AS (
    SELECT course_id FROM public.student_enrolments WHERE user_id = auth.uid() ORDER BY enrolled_at, id LIMIT 10
  ) SELECT count(*) = 10 AND bool_and(public.learning_courses.publication_status = 'published')
  FROM public.learning_courses JOIN own_course_ids ON own_course_ids.course_id = public.learning_courses.id),
  'frontend_published_courses_by_current_10_enrolment_ids');
SELECT pg_temp.assert_true((WITH own_course_ids AS (
    SELECT course_id FROM public.student_enrolments WHERE user_id = auth.uid() ORDER BY enrolled_at, id OFFSET 10 LIMIT 10
  ) SELECT count(*) = 3 FROM public.learning_courses JOIN own_course_ids ON own_course_ids.course_id = public.learning_courses.id),
  'frontend_enrolment_course_pagination_page_2');
SELECT pg_temp.assert_true((SELECT count(*) = 1 AND bool_and(m.course_id = '10000000-0000-0000-0000-000000000003'::uuid)
  FROM public.learning_modules m WHERE m.course_id = '10000000-0000-0000-0000-000000000003'),
  'frontend_module_course_filter');
SELECT pg_temp.assert_true((SELECT count(*) = 1 AND bool_and(l.course_id = '10000000-0000-0000-0000-000000000003'::uuid)
  FROM public.learning_lessons l JOIN public.learning_modules m ON m.id = l.module_id AND m.course_id = l.course_id
  WHERE l.course_id = '10000000-0000-0000-0000-000000000003' AND l.module_id = '20000000-0000-0000-0000-000000000003'
    AND l.publication_status = 'published'), 'frontend_lesson_course_module_published_filter');
SELECT pg_temp.assert_true((SELECT count(*) = 1 AND bool_and(user_id = auth.uid()) AND bool_and(course_id = '10000000-0000-0000-0000-000000000001'::uuid)
  FROM public.lesson_progress WHERE user_id = auth.uid() AND course_id = '10000000-0000-0000-0000-000000000001'),
  'frontend_own_progress_filtered_course');

-- Cross-user reads/writes are denied, including profile ownership update.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
SELECT pg_temp.assert_true((SELECT count(*) = 1 AND min(display_name) = 'Bob' FROM public.student_profiles), 'bob_sees_only_own_profile');
DO $$ BEGIN
  UPDATE public.student_profiles SET display_name = 'Hacked' WHERE user_id = '00000000-0000-0000-0000-000000000001';
  IF FOUND THEN RAISE EXCEPTION 'cross-user profile update unexpectedly succeeded'; END IF;
END $$;
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.student_profiles WHERE user_id = '00000000-0000-0000-0000-000000000001'), 'cross_user_profile_hidden');
RESET ROLE;

\echo 'Testing withdrawn and completed enrolment gates'
SET ROLE service_role;
UPDATE public.student_enrolments SET status = 'withdrawn' WHERE user_id = '00000000-0000-0000-0000-000000000001';
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.learning_lessons), 'withdrawn_cannot_read_lessons');
DO $$ BEGIN
  BEGIN PERFORM public.set_my_lesson_completion('30000000-0000-0000-0000-000000000001', true); RAISE EXCEPTION 'withdrawn progress write unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SET ROLE service_role;
UPDATE public.student_enrolments SET status = 'completed' WHERE user_id = '00000000-0000-0000-0000-000000000001';
RESET ROLE;
SET ROLE authenticated;
SELECT pg_temp.assert_true((SELECT count(*) = 2 FROM public.learning_lessons), 'completed_can_read_lessons');
DO $$ BEGIN
  BEGIN PERFORM public.set_my_lesson_completion('30000000-0000-0000-0000-000000000001', true); RAISE EXCEPTION 'completed progress write unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SET ROLE service_role;
UPDATE public.student_enrolments SET status = 'active' WHERE user_id = '00000000-0000-0000-0000-000000000001';
RESET ROLE;

\echo 'Testing certificate consistency and cross-course module FK as service_role'
SET ROLE service_role;
DO $$ BEGIN
  BEGIN
    INSERT INTO public.learning_lessons(course_id, module_id, title, body_markdown, position)
    VALUES ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'Bad FK', 'bad', 9);
    RAISE EXCEPTION 'cross-course module FK unexpectedly accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.student_certificates(user_id, course_id, certificate_reference, status, revoked_at)
    VALUES ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'issued-with-revocation', 'issued', now());
    RAISE EXCEPTION 'issued certificate with revoked_at unexpectedly accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
INSERT INTO public.student_certificates(user_id, course_id, certificate_reference, status, revoked_at)
VALUES ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'revoked-certificate-0001', 'revoked', now());
SELECT status = 'revoked' AND revoked_at IS NOT NULL AS revoked_certificate_consistent
FROM public.student_certificates WHERE certificate_reference = 'revoked-certificate-0001';
RESET ROLE;

\echo 'Testing private records remain owner-only after service-managed writes'
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
SELECT pg_temp.assert_true((SELECT count(*) = 1 AND bool_and(status = 'revoked') FROM public.student_certificates), 'owner_reads_certificate');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.student_certificates), 'other_user_cannot_read_certificate');
RESET ROLE;

\echo 'Testing service_role management/read access'
SET ROLE service_role;
INSERT INTO public.learning_courses(slug, title, summary) VALUES ('service-managed-course', 'Service Managed', 'Service role can manage records');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.learning_courses WHERE slug = 'draft-course'), 'service_role_can_read_all_courses');
UPDATE public.learning_courses SET summary = 'Service role updated' WHERE slug = 'service-managed-course';
SELECT pg_temp.assert_true((SELECT summary = 'Service role updated' FROM public.learning_courses WHERE slug = 'service-managed-course'), 'service_role_can_manage');
RESET ROLE;


\echo 'Testing assessment visibility, private answer keys, and server-only writes'
SET ROLE service_role;
INSERT INTO public.learning_assessments(id, course_id, title, publication_status, max_attempts)
VALUES ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Clinical Knowledge Check', 'published', 3);
INSERT INTO public.learning_assessment_questions(id, assessment_id, course_id, prompt, question_type, choices, points, position)
VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Choose the best answer', 'single_choice', '[{"id":"a","label":"Option A"},{"id":"b","label":"Option B"}]'::jsonb, 1, 1),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Explain your reasoning', 'short_answer', NULL, 2, 2);
INSERT INTO app_private.assessment_answer_keys(question_id, correct_answer, explanation)
VALUES ('50000000-0000-0000-0000-000000000001', '"b"'::jsonb, 'Illustrative local-only answer key');
INSERT INTO public.learning_assessment_attempts(id, user_id, course_id, assessment_id, attempt_number, status, submitted_at)
VALUES ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, 'submitted', now());
INSERT INTO public.learning_assessment_responses(attempt_id, assessment_id, question_id, answer)
VALUES ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '"a"'::jsonb);
RESET ROLE;

SET ROLE anon;
DO $ BEGIN
  BEGIN PERFORM count(*) FROM public.learning_assessments; RAISE EXCEPTION 'anonymous assessment read unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM count(*) FROM app_private.assessment_answer_keys; RAISE EXCEPTION 'anonymous answer-key read unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $;
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.learning_assessments), 'enrolled_learner_reads_published_assessment');
SELECT pg_temp.assert_true((SELECT count(*) = 2 FROM public.learning_assessment_questions), 'enrolled_learner_reads_questions');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.learning_assessment_attempts), 'learner_cannot_read_other_attempt');
DO $ BEGIN
  BEGIN PERFORM count(*) FROM app_private.assessment_answer_keys; RAISE EXCEPTION 'learner answer-key read unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.learning_assessment_attempts(user_id, course_id, assessment_id, attempt_number)
    VALUES (auth.uid(), '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1);
    RAISE EXCEPTION 'learner self-created attempt unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.learning_assessment_attempts), 'learner_reads_own_attempt');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.learning_assessment_responses), 'learner_reads_own_response');
RESET ROLE;

\echo 'Testing auth.users cascade cleanup and restrictive enrollment deletion'
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
SELECT public.set_my_lesson_completion('30000000-0000-0000-0000-000000000001', true);
RESET ROLE;
SET ROLE service_role;
INSERT INTO public.student_assessment_records(user_id, course_id, assessment_title, outcome)
VALUES ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Local assessment', 'passed');
INSERT INTO public.student_certificates(user_id, course_id, certificate_reference)
VALUES ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'issued-certificate-0001');
DO $$ BEGIN
  BEGIN DELETE FROM public.student_enrolments WHERE user_id = '00000000-0000-0000-0000-000000000001'; RAISE EXCEPTION 'enrolment with awards unexpectedly deleted';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;
END $$;
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.student_profiles WHERE user_id = '00000000-0000-0000-0000-000000000001'), 'deleted_user_profile');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.student_enrolments WHERE user_id = '00000000-0000-0000-0000-000000000001'), 'deleted_user_enrolment');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.lesson_progress WHERE user_id = '00000000-0000-0000-0000-000000000001'), 'deleted_user_progress');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.student_assessment_records WHERE user_id = '00000000-0000-0000-0000-000000000001'), 'deleted_user_assessments');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.student_certificates WHERE user_id = '00000000-0000-0000-0000-000000000001'), 'deleted_user_certificates');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000002'), 'other_user_retained');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.student_enrolments WHERE user_id = '00000000-0000-0000-0000-000000000002'), 'other_user_enrolment_retained');
RESET ROLE;

\echo 'All learning foundation assertions completed'
