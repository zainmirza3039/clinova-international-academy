import { describe, expect, it } from 'vitest';
import { cookiePolicy, privacyPolicy, refundPolicy, termsAndConditions } from '@/data/legalContent';

const drafts = [privacyPolicy, termsAndConditions, cookiePolicy, refundPolicy];

describe('legal draft safety', () => {
  it('clearly marks every legal artifact as unapproved', () => {
    for (const draft of drafts) {
      expect(draft.description).toMatch(/DRAFT/i);
      expect(draft.sections[0]?.content).toMatch(/not approved|not a published/i);
    }
  });

  it('does not invent a refund window, eligibility threshold, or processing promise', () => {
    const copy = JSON.stringify(refundPolicy);
    expect(copy).not.toMatch(/14 days|25%|14 working days|within \d+ days/i);
    expect(copy).toMatch(/no refund policy is currently approved/i);
  });

  it('does not assert unverified privacy or cookie practices as facts', () => {
    const copy = JSON.stringify(privacyPolicy);
    expect(copy).not.toMatch(/we do not sell|stored securely|you have the right to access|we use cookies/i);
    expect(JSON.stringify(cookiePolicy)).not.toMatch(/we use essential cookies|we use analytics cookies/i);
  });

  it('does not imply contract acceptance, issued awards, or accreditation', () => {
    const copy = JSON.stringify(termsAndConditions);
    expect(copy).not.toMatch(/you accept and agree to be bound|certificates of completion are issued/i);
    expect(copy).toMatch(/no certificate, qualification, CPD credit, accreditation/i);
  });
});
