export function hasClinovaAdminRole(appMetadata: unknown): boolean {
  if (!appMetadata || typeof appMetadata !== 'object') return false;
  const metadata = appMetadata as { role?: unknown; clinova_roles?: unknown };
  if (metadata.role === 'admin') return true;
  return Array.isArray(metadata.clinova_roles) && metadata.clinova_roles.includes('content_admin');
}
