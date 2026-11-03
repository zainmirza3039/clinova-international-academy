import rawManifest from '@/data/seoRouteManifest.json';

type StructuredDataType = 'WebSite' | 'ContactPage' | 'WebPage';
export interface IndexableSeoRoute {
  path: string;
  title: string;
  description: string;
  structuredDataType: StructuredDataType;
}
interface SeoManifest {
  canonicalOrigin: string;
  brandName: string;
  legalName: string;
  companyNumber: string;
  logoPath: string;
  logoAlt: string;
  indexableRoutes: IndexableSeoRoute[];
  robotsDisallowPaths: string[];
  staticNoindexPaths: string[];
}

export const seoManifest = rawManifest as SeoManifest;
export const canonicalOrigin = seoManifest.canonicalOrigin;

export function normalizeSeoPath(path: string): string {
  const pathOnly = path.split(/[?#]/, 1)[0] || '/';
  if (!pathOnly.startsWith('/')) return '/';
  const normalized = pathOnly.replace(/\/+$/, '');
  return normalized || '/';
}

export function getIndexableSeoRoute(path: string): IndexableSeoRoute | undefined {
  const normalized = normalizeSeoPath(path);
  return seoManifest.indexableRoutes.find(route => route.path === normalized);
}

export function isPrivateSeoPath(path: string): boolean {
  const normalized = normalizeSeoPath(path);
  return seoManifest.robotsDisallowPaths.some(prefix =>
    normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function createSeoStructuredData(route: IndexableSeoRoute, origin = canonicalOrigin): Record<string, unknown> {
  const page = {
    '@context': 'https://schema.org',
    '@type': route.structuredDataType,
    name: route.title,
    description: route.description,
    url: `${origin}${route.path}`,
    inLanguage: 'en-GB',
  };
  const organization = {
    '@type': 'Organization',
    name: seoManifest.brandName,
    legalName: seoManifest.legalName,
    url: origin,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'UK company number',
      value: seoManifest.companyNumber,
    },
    logo: {
      '@type': 'ImageObject',
      url: `${origin}${seoManifest.logoPath}`,
      caption: seoManifest.logoAlt,
    },
  };

  if (route.structuredDataType === 'WebSite') return { ...page, publisher: organization };
  if (route.structuredDataType === 'ContactPage') return { ...page, mainEntity: organization };
  return {
    ...page,
    isPartOf: { '@type': 'WebSite', name: seoManifest.brandName, url: origin },
  };
}
