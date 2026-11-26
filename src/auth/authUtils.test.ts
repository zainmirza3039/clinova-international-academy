import { describe, expect, it } from 'vitest';
import { safeReturnTarget } from '@/auth/authUtils';

describe('learner authentication redirect boundary', () => {
  it('accepts safe same-site application paths', () => {
    expect(safeReturnTarget('/student')).toBe('/student');
    expect(safeReturnTarget('/student/courses?tab=current')).toBe('/student/courses?tab=current');
  });

  it('rejects absolute, protocol-relative and auth-loop redirect targets', () => {
    expect(safeReturnTarget('https://attacker.example')).toBe('/student');
    expect(safeReturnTarget('//attacker.example/path')).toBe('/student');
    expect(safeReturnTarget('/sign-in')).toBe('/student');
  });
});
