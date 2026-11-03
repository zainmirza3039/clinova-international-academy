const defaultReturnTarget = '/student';
const allowedWorkspacePath = /^\/(?:student|candidate-dashboard|assessor-dashboard|certification-panel|faculty-dashboard|admin)(?:\/|$)/;
const allowedCoursePath = /^\/cpd-courses\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/;

export function safeReturnTarget(target: string | null | undefined) {
  if (!target || target.includes('\\') || target.startsWith('//') || !target.startsWith('/')) return defaultReturnTarget;
  try {
    const parsed = new URL(target, 'https://safe.invalid');
    const decodedPath = decodeURIComponent(parsed.pathname);
    const allowedRoute = allowedWorkspacePath.test(parsed.pathname) || allowedCoursePath.test(parsed.pathname);
    if (parsed.origin !== 'https://safe.invalid' || !allowedRoute || decodedPath.includes('\\') || decodedPath.split('/').includes('..')) return defaultReturnTarget;
    return target;
  } catch { return defaultReturnTarget; }
}
