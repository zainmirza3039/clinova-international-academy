-- Safe authenticated assessment start/submit workflows.
-- Grading, free-text marking, staff operations and awards remain separate trusted workflows.
-- Apply only after the learner foundation and assessment schema in an approved non-production DB.
BEGIN;

CREATE OR REPLACE FUNCTION public.start_my_assessment_attempt(p_assessment_id uuid)
RETURNS TABLE (attempt_id uuid, attempt_number integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_course_id uuid;
  v_max_attempts integer;
  v_active_attempt_count bigint;
  v_next_attempt_number integer;
  v_attempt_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF p_assessment_id IS NULL THEN
    RAISE EXCEPTION 'Assessment is required' USING ERRCODE = '22023';
  END IF;

  -- Serialize attempt creation per assessment so concurrent starts cannot exceed the limit.
  SELECT a.course_id, a.max_attempts
    INTO v_course_id, v_max_attempts
  FROM public.learning_assessments AS a
  JOIN public.learning_courses AS c
    ON c.id = a.course_id AND c.publication_status = 'published'
  WHERE a.id = p_assessment_id AND a.publication_status = 'published'
  FOR UPDATE OF a;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment is not available' USING ERRCODE = '42501';
  END IF;

  PERFORM 1
  FROM public.student_enrolments AS e
  WHERE e.user_id = v_user_id
    AND e.course_id = v_course_id
    AND e.status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment is not available' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) FILTER (WHERE a.status <> 'voided'),
         coalesce(max(a.attempt_number), 0) + 1
    INTO v_active_attempt_count, v_next_attempt_number
  FROM public.learning_assessment_attempts AS a
  WHERE a.user_id = v_user_id AND a.assessment_id = p_assessment_id;

  IF v_active_attempt_count >= v_max_attempts THEN
    RAISE EXCEPTION 'Assessment attempt limit reached' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.learning_assessment_attempts
    (user_id, course_id, assessment_id, attempt_number)
  VALUES
    (v_user_id, v_course_id, p_assessment_id, v_next_attempt_number)
  RETURNING id INTO v_attempt_id;

  RETURN QUERY SELECT v_attempt_id, v_next_attempt_number;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_my_assessment_attempt(
  p_attempt_id uuid,
  p_responses jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_assessment_id uuid;
  v_course_id uuid;
  v_status text;
  v_question_count bigint;
  v_response_count integer;
  v_response jsonb;
  v_question_id uuid;
  v_question_id_text text;
  v_question_type text;
  v_choices jsonb;
  v_answer jsonb;
  v_item jsonb;
  v_choice_id text;
  v_selected_ids text[] := ARRAY[]::text[];
  v_question_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF p_attempt_id IS NULL THEN
    RAISE EXCEPTION 'Assessment attempt is required' USING ERRCODE = '22023';
  END IF;
  IF pg_catalog.jsonb_typeof(p_responses) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Responses must be an array' USING ERRCODE = '22023';
  END IF;

  SELECT a.assessment_id, a.course_id, a.status
    INTO v_assessment_id, v_course_id, v_status
  FROM public.learning_assessment_attempts AS a
  WHERE a.id = p_attempt_id AND a.user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment attempt is unavailable' USING ERRCODE = '42501';
  END IF;
  IF v_status <> 'in_progress' THEN
    RAISE EXCEPTION 'Assessment attempt has already been submitted' USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO v_question_count
  FROM public.learning_assessment_questions AS q
  WHERE q.assessment_id = v_assessment_id AND q.course_id = v_course_id;

  v_response_count := pg_catalog.jsonb_array_length(p_responses);
  IF v_question_count = 0 OR v_response_count <> v_question_count THEN
    RAISE EXCEPTION 'Submit one response for every assessment question' USING ERRCODE = '22023';
  END IF;

  -- Validate the complete payload before writing any response rows.
  FOR v_response IN
    SELECT item.value
    FROM pg_catalog.jsonb_array_elements(p_responses) AS item(value)
  LOOP
    IF pg_catalog.jsonb_typeof(v_response) IS DISTINCT FROM 'object'
       OR pg_catalog.jsonb_object_length(v_response) <> 2
       OR NOT (v_response ? 'question_id')
       OR NOT (v_response ? 'answer')
       OR pg_catalog.jsonb_typeof(v_response -> 'question_id') IS DISTINCT FROM 'string' THEN
      RAISE EXCEPTION 'Each response must contain only question_id and answer' USING ERRCODE = '22023';
    END IF;

    v_question_id_text := v_response ->> 'question_id';
    IF v_question_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      RAISE EXCEPTION 'Invalid question ID' USING ERRCODE = '22023';
    END IF;
    v_question_id := v_question_id_text::uuid;
    IF v_question_id = ANY(v_question_ids) THEN
      RAISE EXCEPTION 'Duplicate question response' USING ERRCODE = '22023';
    END IF;
    v_question_ids := pg_catalog.array_append(v_question_ids, v_question_id);

    SELECT q.question_type, q.choices
      INTO v_question_type, v_choices
    FROM public.learning_assessment_questions AS q
    WHERE q.id = v_question_id
      AND q.assessment_id = v_assessment_id
      AND q.course_id = v_course_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Response contains a question outside this assessment' USING ERRCODE = '22023';
    END IF;

    v_answer := v_response -> 'answer';
    IF v_question_type = 'single_choice' THEN
      IF pg_catalog.jsonb_typeof(v_answer) IS DISTINCT FROM 'string'
         OR NOT EXISTS (
           SELECT 1
           FROM pg_catalog.jsonb_array_elements(v_choices) AS choice(value)
           WHERE choice.value ->> 'id' = (v_answer #>> '{}')
         ) THEN
        RAISE EXCEPTION 'Invalid single-choice answer' USING ERRCODE = '22023';
      END IF;
    ELSIF v_question_type = 'multiple_choice' THEN
      IF pg_catalog.jsonb_typeof(v_answer) IS DISTINCT FROM 'array'
         OR pg_catalog.jsonb_array_length(v_answer) < 1 THEN
        RAISE EXCEPTION 'Invalid multiple-choice answer' USING ERRCODE = '22023';
      END IF;
      v_selected_ids := ARRAY[]::text[];
      FOR v_item IN
        SELECT selected.value
        FROM pg_catalog.jsonb_array_elements(v_answer) AS selected(value)
      LOOP
        IF pg_catalog.jsonb_typeof(v_item) IS DISTINCT FROM 'string' THEN
          RAISE EXCEPTION 'Invalid multiple-choice option ID' USING ERRCODE = '22023';
        END IF;
        v_choice_id := v_item #>> '{}';
        IF v_choice_id = ANY(v_selected_ids)
           OR NOT EXISTS (
             SELECT 1
             FROM pg_catalog.jsonb_array_elements(v_choices) AS choice(value)
             WHERE choice.value ->> 'id' = v_choice_id
           ) THEN
          RAISE EXCEPTION 'Invalid or duplicate multiple-choice option' USING ERRCODE = '22023';
        END IF;
        v_selected_ids := pg_catalog.array_append(v_selected_ids, v_choice_id);
      END LOOP;
    ELSIF v_question_type = 'true_false' THEN
      IF pg_catalog.jsonb_typeof(v_answer) IS DISTINCT FROM 'boolean' THEN
        RAISE EXCEPTION 'Invalid true/false answer' USING ERRCODE = '22023';
      END IF;
    ELSIF v_question_type = 'short_answer' THEN
      IF pg_catalog.jsonb_typeof(v_answer) IS DISTINCT FROM 'string'
         OR pg_catalog.char_length(pg_catalog.btrim(v_answer #>> '{}')) NOT BETWEEN 1 AND 10000 THEN
        RAISE EXCEPTION 'Invalid short answer' USING ERRCODE = '22023';
      END IF;
    ELSE
      RAISE EXCEPTION 'Unsupported assessment question type' USING ERRCODE = '22023';
    END IF;
  END LOOP;

  FOR v_response IN
    SELECT item.value
    FROM pg_catalog.jsonb_array_elements(p_responses) AS item(value)
  LOOP
    INSERT INTO public.learning_assessment_responses
      (attempt_id, assessment_id, question_id, answer)
    VALUES (
      p_attempt_id,
      v_assessment_id,
      (v_response ->> 'question_id')::uuid,
      v_response -> 'answer'
    );
  END LOOP;

  -- Submission is not a pass or a grade. A trusted grading/marking workflow must
  -- evaluate the private answer keys and any free-text responses separately.
  UPDATE public.learning_assessment_attempts
  SET status = 'submitted', submitted_at = pg_catalog.now()
  WHERE id = p_attempt_id AND user_id = v_user_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.start_my_assessment_attempt(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.submit_my_assessment_attempt(uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_my_assessment_attempt(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_my_assessment_attempt(uuid, jsonb) TO authenticated;

COMMIT;
