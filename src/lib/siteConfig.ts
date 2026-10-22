// Public build-time configuration only. Never put private credentials in VITE_* values.
const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim();
export const siteOrigin = (() => {
  if (!configuredOrigin || import.meta.env.VITE_INDEXING_ENABLED !== 'true') return undefined;
  try {
    const url = new URL(configuredOrigin);
    const previewHost = /(^|\.)(vercel\.app|manus\.computer|localhost|test|invalid)$/.test(url.hostname);
    return url.protocol === 'https:' && url.pathname === '/' && !url.username && !url.password && !url.search && !url.hash && !previewHost ? url.origin : undefined;
  } catch { return undefined; }
})();
export const learnerDataEnabled = import.meta.env.VITE_LEARNER_DATA_ENABLED === 'true'
  && import.meta.env.VITE_SUPABASE_URL === 'https://ssxpmcbqfdggfsoqbxac.supabase.co'
  && Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
export const enquiriesEnabled = import.meta.env.VITE_ENQUIRIES_ENABLED === 'true'
  && import.meta.env.VITE_SUPABASE_URL === 'https://ssxpmcbqfdggfsoqbxac.supabase.co'
  && Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
export const enquiryUnavailable = 'Submissions are not available in this preview. Database access and the enquiry schema must be verified before this form can accept information. Nothing has been sent.';
export const siteSettings = {
  academyName: 'Clinova International Academy',
  contactEmail: '', // Awaiting academy confirmation; do not invent an address.
  contentStatus: 'Explore healthcare learning resources and subject areas. Course availability, recognition and learner services are stated only where confirmed.',
};
