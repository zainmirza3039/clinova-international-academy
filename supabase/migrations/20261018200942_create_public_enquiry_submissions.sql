/*
# Create public enquiry submission tables

1. New Tables
- `contact_submissions` stores contact form messages submitted by visitors.
- `partnership_inquiries` stores training partner enquiry details submitted by visitors.
- `newsletter_subscriptions` stores newsletter email addresses submitted by visitors.
- Each table includes a generated UUID, submitted fields, and a created timestamp.

2. Security
- Row Level Security is enabled on all three tables.
- Anonymous and signed-in visitors may insert new submissions only.
- Reading, editing, and deleting submissions are denied through the browser because these records may contain personal information and there is no public administration screen.

3. Important Notes
- This migration does not alter or remove any existing tables or records.
- The public forms use the anon client only for inserts; staff access should be added through a separately authenticated administration workflow.
*/

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 80),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 200),
  enquiry_type text NOT NULL CHECK (char_length(enquiry_type) BETWEEN 1 AND 80),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partnership_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 160),
  organisation text NOT NULL CHECK (char_length(organisation) BETWEEN 1 AND 200),
  role text NOT NULL CHECK (char_length(role) BETWEEN 1 AND 160),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 80),
  country text NOT NULL CHECK (char_length(country) BETWEEN 1 AND 120),
  website text CHECK (website IS NULL OR char_length(website) <= 500),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (char_length(email) BETWEEN 3 AND 320),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Public can submit contact forms" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Contact submissions are not publicly readable" ON public.contact_submissions;
CREATE POLICY "Contact submissions are not publicly readable" ON public.contact_submissions
  FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "Contact submissions cannot be edited publicly" ON public.contact_submissions;
CREATE POLICY "Contact submissions cannot be edited publicly" ON public.contact_submissions
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Contact submissions cannot be deleted publicly" ON public.contact_submissions;
CREATE POLICY "Contact submissions cannot be deleted publicly" ON public.contact_submissions
  FOR DELETE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "Public can submit partnership enquiries" ON public.partnership_inquiries;
CREATE POLICY "Public can submit partnership enquiries" ON public.partnership_inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Partnership enquiries are not publicly readable" ON public.partnership_inquiries;
CREATE POLICY "Partnership enquiries are not publicly readable" ON public.partnership_inquiries
  FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "Partnership enquiries cannot be edited publicly" ON public.partnership_inquiries;
CREATE POLICY "Partnership enquiries cannot be edited publicly" ON public.partnership_inquiries
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Partnership enquiries cannot be deleted publicly" ON public.partnership_inquiries;
CREATE POLICY "Partnership enquiries cannot be deleted publicly" ON public.partnership_inquiries
  FOR DELETE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscriptions;
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscriptions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Newsletter subscriptions are not publicly readable" ON public.newsletter_subscriptions;
CREATE POLICY "Newsletter subscriptions are not publicly readable" ON public.newsletter_subscriptions
  FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "Newsletter subscriptions cannot be edited publicly" ON public.newsletter_subscriptions;
CREATE POLICY "Newsletter subscriptions cannot be edited publicly" ON public.newsletter_subscriptions
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Newsletter subscriptions cannot be deleted publicly" ON public.newsletter_subscriptions;
CREATE POLICY "Newsletter subscriptions cannot be deleted publicly" ON public.newsletter_subscriptions
  FOR DELETE TO anon, authenticated USING (false);