import { describe, expect, it } from 'vitest';
import { getOwnerListedProgrammeBySlug, ownerListedProgrammes } from '@/data/programmeCatalogueBrowse';

describe('proposed programme catalogue projection', () => {
  it('exposes only the eight approved title-only proposal records', () => {
    expect(ownerListedProgrammes).toHaveLength(8);
    expect(ownerListedProgrammes.every(item => item.id && item.slug && item.title)).toBe(true);
    expect(ownerListedProgrammes.every(item => !('price' in item) && !('accreditation' in item) && !('duration' in item))).toBe(true);
  });

  it('resolves a known proposal by its canonical slug', () => {
    expect(getOwnerListedProgrammeBySlug('certificate-in-musculoskeletal-assessment')?.title)
      .toBe('Certificate in Musculoskeletal Assessment');
  });

  it('does not expose unknown or draft-only programme identifiers', () => {
    expect(getOwnerListedProgrammeBySlug('unapproved-course')).toBeUndefined();
    expect(getOwnerListedProgrammeBySlug('')).toBeUndefined();
  });
});
