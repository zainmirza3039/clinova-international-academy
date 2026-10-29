-- Reconcile the checked-in migration history with the already-applied
-- 20261022162916_harden_public_enquiry_table_privileges migration.
-- This mirrors the verified live privilege state: public roles can INSERT only.
REVOKE ALL PRIVILEGES ON TABLE
  public.contact_submissions,
  public.partnership_inquiries,
  public.newsletter_subscriptions
FROM PUBLIC, anon, authenticated;

GRANT INSERT ON TABLE
  public.contact_submissions,
  public.partnership_inquiries,
  public.newsletter_subscriptions
TO anon, authenticated;
