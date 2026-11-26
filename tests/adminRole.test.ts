import { describe, expect, it } from 'vitest';
import { hasClinovaAdminRole } from '@/auth/roleUtils';

describe('Clinova administrator claim recognition', () => {
  it('accepts the legacy trusted admin role claim', () => {
    expect(hasClinovaAdminRole({ role: 'admin' })).toBe(true);
  });
  it('accepts the server-issued Clinova content_admin role', () => {
    expect(hasClinovaAdminRole({ clinova_roles: ['instructor', 'content_admin'] })).toBe(true);
  });
  it('does not grant access to learner or unrelated role claims', () => {
    expect(hasClinovaAdminRole({ role: 'student', clinova_roles: ['instructor'] })).toBe(false);
    expect(hasClinovaAdminRole({ role: 'content_admin' })).toBe(false);
    expect(hasClinovaAdminRole(null)).toBe(false);
    expect(hasClinovaAdminRole('admin')).toBe(false);
  });
});
