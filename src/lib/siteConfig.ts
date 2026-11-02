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
// Persistence stays unavailable until a separately approved backend contract and hosted validation exist.
export const learnerDataEnabled = false;
// Legacy self-study enrollment is intentionally disabled regardless of hosted environment variables.
export const selfStudyLearningEnabled = false;
// New operational services stay disabled until authoritative content, policy and backend controls are separately approved.
export const cpdEnrollmentEnabled = false;
export const certificationWorkflowEnabled = false;
export const assessmentServiceEnabled = false;
export const credentialIssuanceEnabled = false;
export const verificationEnabled = false;
export const credentialVerificationEnabled = false;
// Public submissions remain unavailable until privacy, abuse and server-side controls are approved.
export const enquiriesEnabled = false;
export const enquiryUnavailable = 'Online submissions are currently unavailable. No information has been sent. Please use the published postal address for written correspondence.';
export const siteSettings = {
  academyName: 'Clinova International Academy',
  contactEmail: '', // Awaiting academy confirmation; do not invent an address.
  contentStatus: 'Healthcare education and professional certification development. No course, application, assessment, credential or accreditation service is currently open.',
};
