import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  createSeoStructuredData,
  getIndexableSeoRoute,
  isPrivateSeoPath,
  normalizeSeoPath,
  seoManifest,
} from '@/lib/seoPolicy';
import { siteOrigin } from '@/lib/siteConfig';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
  noindex?: boolean;
}

function ensureMeta(selector: string, attribute: string, value: string): HTMLMetaElement {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  return element;
}

function setCanonical(url?: string): void {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!url) {
    existing?.remove();
    return;
  }
  const link = existing ?? document.createElement('link');
  link.setAttribute('rel', 'canonical');
  link.href = url;
  if (!existing) document.head.appendChild(link);
}

export function useSEO({ title, description, canonical, noindex = false }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const currentPath = normalizeSeoPath(location.pathname);
    const requestedPath = canonical?.startsWith('/') ? normalizeSeoPath(canonical) : currentPath;
    const route = getIndexableSeoRoute(requestedPath);
    const sameRoute = requestedPath === currentPath;
    const indexable = Boolean(siteOrigin && route && sameRoute && !noindex && !isPrivateSeoPath(currentPath));
    const pageTitle = indexable && route ? route.title : (title.includes('Clinova') ? title : `${title} | ${seoManifest.brandName}`);
    const pageDescription = indexable && route ? route.description : description;
    const canonicalUrl = indexable && siteOrigin && route ? `${siteOrigin}${route.path}` : undefined;

    document.title = pageTitle;
    ensureMeta('meta[name="description"]', 'name', 'description').content = pageDescription;
    ensureMeta('meta[name="robots"]', 'name', 'robots').content = indexable ? 'index, follow' : 'noindex, nofollow';
    ensureMeta('meta[property="og:title"]', 'property', 'og:title').content = pageTitle;
    ensureMeta('meta[property="og:description"]', 'property', 'og:description').content = pageDescription;
    ensureMeta('meta[property="og:type"]', 'property', 'og:type').content = 'website';
    ensureMeta('meta[property="og:site_name"]', 'property', 'og:site_name').content = seoManifest.brandName;
    ensureMeta('meta[property="og:locale"]', 'property', 'og:locale').content = 'en_GB';
    ensureMeta('meta[name="twitter:title"]', 'name', 'twitter:title').content = pageTitle;
    ensureMeta('meta[name="twitter:description"]', 'name', 'twitter:description').content = pageDescription;

    document.head.querySelector('meta[property="og:url"]')?.remove();
    document.head.querySelector('meta[property="og:image"]')?.remove();
    document.head.querySelector('meta[property="og:image:alt"]')?.remove();
    document.head.querySelector('meta[property="og:image:width"]')?.remove();
    document.head.querySelector('meta[property="og:image:height"]')?.remove();
    document.head.querySelector('meta[name="twitter:image"]')?.remove();
    document.head.querySelector('meta[name="twitter:image:alt"]')?.remove();
    document.head.querySelector('meta[name="twitter:card"]')?.remove();
    setCanonical(canonicalUrl);

    const existingStructuredData = document.head.querySelector('#structured-data');
    existingStructuredData?.remove();
    if (indexable && route && siteOrigin) {
      const imageUrl = `${siteOrigin}${seoManifest.logoPath}`;
      ensureMeta('meta[property="og:url"]', 'property', 'og:url').content = canonicalUrl!;
      ensureMeta('meta[property="og:image"]', 'property', 'og:image').content = imageUrl;
      ensureMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt').content = seoManifest.logoAlt;
      ensureMeta('meta[property="og:image:width"]', 'property', 'og:image:width').content = '1276';
      ensureMeta('meta[property="og:image:height"]', 'property', 'og:image:height').content = '365';
      ensureMeta('meta[name="twitter:image"]', 'name', 'twitter:image').content = imageUrl;
      ensureMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt').content = seoManifest.logoAlt;
      ensureMeta('meta[name="twitter:card"]', 'name', 'twitter:card').content = 'summary_large_image';
      const script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(createSeoStructuredData(route, siteOrigin));
      document.head.appendChild(script);
    }
  }, [title, description, canonical, noindex, location.pathname]);
}
