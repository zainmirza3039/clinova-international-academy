import { describe, expect, it } from 'vitest';
import {
  canonicalOrigin,
  createSeoStructuredData,
  getIndexableSeoRoute,
  isPrivateSeoPath,
  normalizeSeoPath,
} from '@/lib/seoPolicy';
import { ownerListedProgrammes } from '@/data/programmeCatalogueBrowse';

describe('Clinova SEO publication policy', () => {
  it('allows only the approved exact public routes', () => {
    expect(getIndexableSeoRoute('/')).toBeDefined();
    expect(getIndexableSeoRoute('/contact')).toBeDefined();
    expect(getIndexableSeoRoute('/accessibility-statement')).toBeDefined();
    expect(getIndexableSeoRoute('/external-linking-policy')).toBeDefined();
    expect(getIndexableSeoRoute('/about')).toBeUndefined();
    expect(getIndexableSeoRoute('/events')).toBeUndefined();
    expect(getIndexableSeoRoute('/programmes')).toBeUndefined();
    for (const programme of ownerListedProgrammes) {
      expect(getIndexableSeoRoute(`/programmes/${programme.slug}`)).toBeUndefined();
      expect(getIndexableSeoRoute(`/courses/${programme.slug}`)).toBeUndefined();
    }
    expect(getIndexableSeoRoute('/cpd-courses/example')).toBeUndefined();
    expect(getIndexableSeoRoute('/resources/rehabilitation')).toBeUndefined();
    expect(getIndexableSeoRoute('/certification/verify')).toBeUndefined();
  });

  it('normalizes route paths without accepting query or fragment variants as separate pages', () => {
    expect(normalizeSeoPath('/contact/')).toBe('/contact');
    expect(normalizeSeoPath('/contact?ref=1')).toBe('/contact');
    expect(normalizeSeoPath('/contact/#details')).toBe('/contact');
    expect(getIndexableSeoRoute('/contact/')).toEqual(getIndexableSeoRoute('/contact'));
  });

  it('recognizes private path prefixes for robots and runtime suppression', () => {
    expect(isPrivateSeoPath('/admin')).toBe(true);
    expect(isPrivateSeoPath('/admin/users')).toBe(true);
    expect(isPrivateSeoPath('/sign-in')).toBe(true);
    expect(isPrivateSeoPath('/student/records')).toBe(true);
    expect(isPrivateSeoPath('/verify')).toBe(true);
    expect(isPrivateSeoPath('/contact')).toBe(false);
  });

  it('builds only conservative identity and page schema from owner-confirmed facts', () => {
    const home = createSeoStructuredData(getIndexableSeoRoute('/')!);
    expect(home['@type']).toBe('WebSite');
    expect(home.url).toBe(`${canonicalOrigin}/`);
    const publisher = home.publisher as Record<string, unknown>;
    expect(publisher['@type']).toBe('Organization');
    expect(publisher.legalName).toBe('Clinova International Academy Ltd');
    expect(publisher.identifier).toEqual({
      '@type': 'PropertyValue',
      propertyID: 'UK company number',
      value: '16048192',
    });
    expect(publisher).not.toHaveProperty('address');
    expect(publisher).not.toHaveProperty('telephone');

    const contact = createSeoStructuredData(getIndexableSeoRoute('/contact')!);
    expect(contact['@type']).toBe('ContactPage');
    expect(contact.mainEntity).toBeDefined();

    const accessibility = createSeoStructuredData(getIndexableSeoRoute('/accessibility-statement')!);
    expect(accessibility['@type']).toBe('WebPage');
    expect(JSON.stringify(accessibility)).not.toMatch(/Course|Event|Person|accreditation|certificate/i);
  });
});
