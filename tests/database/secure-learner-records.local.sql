-- Local-only security/lifecycle checks for the existing migration.
-- Uses synthetic identities and must only run in the disposable test cluster.
\set ON_ERROR_STOP on

INSERT INTO auth.users (id) VALUES
  ('00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000a2');

INSERT INTO public.student_profiles (user_id, full_name) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'Synthetic Student A'),
  ('00000000-0000-0000-0000-0000000000a2', 'Synthetic Student B');

INSERT INTO public.student_enrollments (id, student_id, programme_slug, programme_title, status) VALUES
  ('10000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a1', 'local-test-a', 'Local Test A', 'active'),
  ('10000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a2', 'local-test-b', 'Local Test B', 'completed');

INSERT INTO public.student_learning_progress (id, student_id, enrollment_id, progress_percent, completed_lessons, total_lessons) VALUES
  ('20000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-0000000000a1', 30, 3, 10),
  ('20000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a2', '10000000-0000-0000-0000-0000000000a2', 100, 10, 10);

INSERT INTO public.student_certificates (id, student_id, enrollment_id, certificate_number, programme_title, status, revoked_at) VALUES
  ('30000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-0000000000a1', 'LOCAL-ISSUED-A', 'Local Test A', 'issued', NULL),
  ('30000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-0000000000a1', 'LOCAL-REVOKED-A', 'Local Test A', 'revoked', now()),
  ('30000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a2', '10000000-0000-0000-0000-0000000000a2', 'LOCAL-ISSUED-B', 'Local Test B', 'issued', NULL);

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","app_metadata":{},"user_metadata":{}}', true);
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.student_profiles;
  IF n <> 1 THEN RAISE EXCEPTION 'learner profile read was not limited to own row: %', n; END IF;
  SELECT count(*) INTO n FROM public.student_enrollments;
  IF n <> 1 THEN RAISE EXCEPTION 'learner enrollment read was not limited to own row: %', n; END IF;
  SELECT count(*) INTO n FROM public.student_learning_progress;
  IF n <> 1 THEN RAISE EXCEPTION 'learner progress read was not limited to own row: %', n; END IF;
  SELECT count(*) INTO n FROM public.student_certificates;
  IF n <> 1 THEN RAISE EXCEPTION 'learner must see only own issued certificate: %', n; END IF;
  IF EXISTS (SELECT 1 FROM public.student_certificates WHERE certificate_number <> 'LOCAL-ISSUED-A') THEN
    RAISE EXCEPTION 'learner can see a revoked or another student certificate';
  END IF;
  UPDATE public.student_profiles SET full_name = 'Tampered by A' WHERE user_id = '00000000-0000-0000-0000-0000000000a2';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'learner updated another profile'; END IF;
  BEGIN
    INSERT INTO public.student_profiles (user_id, full_name) VALUES ('00000000-0000-0000-0000-0000000000a2', 'Forged Profile');
    RAISE EXCEPTION 'learner inserted another profile';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO public.student_enrollments (student_id, programme_slug, programme_title)
      VALUES ('00000000-0000-0000-0000-0000000000a1', 'forged', 'Forged enrollment');
    RAISE EXCEPTION 'learner inserted an enrollment';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO public.student_learning_progress (student_id, enrollment_id, progress_percent, completed_lessons, total_lessons)
      VALUES ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-0000000000a1', 50, 5, 10);
    RAISE EXCEPTION 'learner inserted progress';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
COMMIT;

-- A user-editable metadata role must not grant cross-student access.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a2', true);
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","user_metadata":{"role":"admin"}}', true);
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.student_enrollments;
  IF n <> 1 THEN RAISE EXCEPTION 'user_metadata role spoof expanded enrollment access: %', n; END IF;
  SELECT count(*) INTO n FROM public.student_certificates;
  IF n <> 1 THEN RAISE EXCEPTION 'user_metadata role spoof expanded certificate access: %', n; END IF;
END $$;
COMMIT;

-- The existing trusted app_metadata admin claim can read all rows in this local simulation.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a2', true);
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","app_metadata":{"role":"admin"}}', true);
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.student_profiles;
  IF n <> 2 THEN RAISE EXCEPTION 'trusted admin cannot read all profiles: %', n; END IF;
  SELECT count(*) INTO n FROM public.student_enrollments;
  IF n <> 2 THEN RAISE EXCEPTION 'trusted admin cannot read all enrollments: %', n; END IF;
  SELECT count(*) INTO n FROM public.student_certificates;
  IF n <> 3 THEN RAISE EXCEPTION 'trusted admin cannot read all certificate lifecycle states: %', n; END IF;
END $$;
COMMIT;

-- Anonymous access has neither grants nor an RLS path.
DO $$
BEGIN
  IF has_table_privilege('anon', 'public.student_profiles', 'SELECT') THEN RAISE EXCEPTION 'anon unexpectedly has profile SELECT'; END IF;
  IF has_table_privilege('anon', 'public.student_enrollments', 'SELECT') THEN RAISE EXCEPTION 'anon unexpectedly has enrollment SELECT'; END IF;
  IF has_table_privilege('anon', 'public.student_certificates', 'SELECT') THEN RAISE EXCEPTION 'anon unexpectedly has certificate SELECT'; END IF;
END $$;

-- The certificate state/withdrawal timestamp consistency constraints are enforced.
DO $$
BEGIN
  BEGIN
    INSERT INTO public.student_certificates (student_id, enrollment_id, certificate_number, programme_title, status, revoked_at)
      VALUES ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-0000000000a1', 'LOCAL-INVALID-REVOKED', 'Local Test A', 'revoked', NULL);
    RAISE EXCEPTION 'revoked certificate without revoked_at was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO public.student_certificates (student_id, enrollment_id, certificate_number, programme_title, status, revoked_at)
      VALUES ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-0000000000a1', 'LOCAL-INVALID-ISSUED', 'Local Test A', 'issued', now());
    RAISE EXCEPTION 'issued certificate with revoked_at was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;

\echo 'PASS: local learner row security, trusted-role boundary, anonymous denial and certificate lifecycle constraints'
