-- Tighten assessment choice shape so arbitrary JSON cannot enter published questions.
-- Correct answers stay in app_private; choices contain only stable IDs and display labels.
BEGIN;

CREATE OR REPLACE FUNCTION app_private.assessment_choices_are_valid(p_choices jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $function$
DECLARE
  v_choice jsonb;
  v_id text;
  v_ids text[] := ARRAY[]::text[];
BEGIN
  IF pg_catalog.jsonb_typeof(p_choices) IS DISTINCT FROM 'array' THEN
    RETURN false;
  END IF;
  IF pg_catalog.jsonb_array_length(p_choices) NOT BETWEEN 2 AND 100 THEN
    RETURN false;
  END IF;

  FOR v_choice IN
    SELECT choice.value
    FROM pg_catalog.jsonb_array_elements(p_choices) AS choice(value)
  LOOP
    IF pg_catalog.jsonb_typeof(v_choice) IS DISTINCT FROM 'object'
       OR NOT (v_choice ? 'id')
       OR NOT (v_choice ? 'label')
       OR pg_catalog.jsonb_typeof(v_choice -> 'id') IS DISTINCT FROM 'string'
       OR pg_catalog.char_length(pg_catalog.btrim(v_choice ->> 'id')) NOT BETWEEN 1 AND 100
       OR pg_catalog.jsonb_typeof(v_choice -> 'label') IS DISTINCT FROM 'string'
       OR pg_catalog.char_length(pg_catalog.btrim(v_choice ->> 'label')) NOT BETWEEN 1 AND 500
       OR (v_choice - 'id' - 'label') <> '{}'::jsonb THEN
      RETURN false;
    END IF;

    v_id := v_choice ->> 'id';
    IF v_id = ANY (v_ids) THEN
      RETURN false;
    END IF;
    v_ids := pg_catalog.array_append(v_ids, v_id);
  END LOOP;

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION app_private.assessment_choices_are_valid(jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.assessment_choices_are_valid(jsonb)
  TO service_role;

ALTER TABLE public.learning_assessment_questions
  DROP CONSTRAINT IF EXISTS learning_assessment_questions_check;

ALTER TABLE public.learning_assessment_questions
  ADD CONSTRAINT learning_assessment_questions_choices_shape_check
  CHECK (
    (
      question_type IN ('single_choice', 'multiple_choice')
      AND app_private.assessment_choices_are_valid(choices)
    )
    OR
    (
      question_type IN ('true_false', 'short_answer')
      AND (choices IS NULL OR choices = 'null'::jsonb)
    )
  );

COMMIT;
