export function safeReturnTarget(target: string | null | undefined) {
  if (!target || target.includes('\\') || target.startsWith('//') || !target.startsWith('/')) return '/student';
  try {
    const parsed = new URL(target, 'https://safe.invalid');
    const decodedPath = decodeURIComponent(parsed.pathname);
    const allowedRoute = /^\/(?:student|admin)(?:\/|$)/.test(parsed.pathname)
      || /^\/cpd-courses\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(parsed.pathname);
    if (parsed.origin !== 'https://safe.invalid' || !allowedRoute || decodedPath.includes('\\') || decodedPath.split('/').includes('..')) return '/student';
    return target;
  } catch { return '/student'; }
}
