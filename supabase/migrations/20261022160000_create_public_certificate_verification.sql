/*
  Public certificate verification records.

  This migration intentionally creates no sample rows. Certificates must be
  issued by an authorized server-side/admin workflow before they are public.
*/
CREATE TABLE IF NOT EXISTS public.public_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text NOT NULL UNIQUE CHECK (certificate_id = upper(trim(certificate_id)) AND char_length(certificate_id) BETWEEN 8 AND 80),
  holder_name text NOT NULL CHECK (char_length(holder_name) BETWEEN 1 AND 160),
  course_title text NOT NULL CHECK (char_length(course_title) BETWEEN 1 AND 240),
  issue_date date NOT NULL,
  cpd_hours numeric(6,2) CHECK (cpd_hours IS NULL OR cpd_hours >= 0),
  status text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'revoked', 'expired')),
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.public_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can verify explicitly published certificates" ON public.public_certificates;
CREATE POLICY "Public can verify explicitly published certificates"
  ON public.public_certificates
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Public cannot create certificates" ON public.public_certificates;
CREATE POLICY "Public cannot create certificates"
  ON public.public_certificates
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "Public cannot modify certificates" ON public.public_certificates;
CREATE POLICY "Public cannot modify certificates"
  ON public.public_certificates
  FOR UPDATE TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Public cannot delete certificates" ON public.public_certificates;
CREATE POLICY "Public cannot delete certificates"
  ON public.public_certificates
  FOR DELETE TO anon, authenticated
  USING (false);
