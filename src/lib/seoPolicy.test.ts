import { describe, expect, it } from 'vitest';
import { getIndexableSeoRoute, isPrivateSeoPath, normalizeSeoPath } from '@/lib/seoPolicy';

describe('Clinova SEO route allowlist', () => {
  it('normalizes trailing slashes and query-free paths', () => {
    expect(normalizeSeoPath('/contact/?source=footer')).toBe('/contact');
    expect(normalizeSeoPath('/')).toBe('/');
  });

  it('keeps only the explicitly approved public routes indexable', () => {
    expect(getIndexableSeoRoute('/')).toBeDefined();
    expect(getIndexableSeoRoute('/contact')).toBeDefined();
    expect(getIndexableSeoRoute('/accessibility-statement')).toBeDefined();
    expect(getIndexableSeoRoute('/external-linking-policy')).toBeDefined();
    expect(getIndexableSeoRoute('/programmes')).toBeUndefined();
    expect(getIndexableSeoRoute('/programmes/example')).toBeUndefined();
    expect(getIndexableSeoRoute('/apply')).toBeUndefined();
  });

  it('blocks private route descendants from indexing', () => {
    expect(isPrivateSeoPath('/admin')).toBe(true);
    expect(isPrivateSeoPath('/admin/users')).toBe(true);
    expect(isPrivateSeoPath('/student/courses')).toBe(true);
    expect(isPrivateSeoPath('/contact')).toBe(false);
  });
});
