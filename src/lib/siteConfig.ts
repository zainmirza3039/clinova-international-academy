// Public build-time configuration only. Never put private credentials in VITE_* values.
const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim();
export const siteOrigin = (() => {
  if (!configuredOrigin) return undefined;
  try {
    const url = new URL(configuredOrigin);
    return url.protocol === 'https:' && url.pathname === '/' ? url.origin : undefined;
  } catch { return undefined; }
})();
export const enquiriesEnabled = import.meta.env.VITE_ENQUIRIES_ENABLED === 'true'
  && Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
export const enquiryUnavailable = 'Submissions are not available in this preview. Database access and the enquiry schema must be verified before this form can accept information. Nothing has been sent.';
export const siteSettings = {
  academyName: 'Clinova International Academy',
  contactEmail: '', // Awaiting academy confirmation; do not invent an address.
  contentStatus: 'Preview: programme details and academy policies await confirmation. Applications and administration are not live.',
};
