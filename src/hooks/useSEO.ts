import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteOrigin } from '@/lib/siteConfig';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
}

export function useSEO({ title, description, canonical, ogImage, structuredData }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title.includes('Clinova') ? title : `${title} | Clinova International Academy`;
    document.title = fullTitle;

    const ensureMeta = (selector: string, attr: string, attrValue: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
      }
      return el;
    };

    ensureMeta('meta[name="description"]', 'name', 'description').content = description;
    ensureMeta('meta[property="og:title"]', 'property', 'og:title').content = fullTitle;
    ensureMeta('meta[property="og:description"]', 'property', 'og:description').content = description;
    ensureMeta('meta[property="og:type"]', 'property', 'og:type').content = 'website';
    ensureMeta('meta[property="og:url"]', 'property', 'og:url').content =
      siteOrigin ? `${siteOrigin}${canonical ?? location.pathname}` : '';
    const privateRoute = /^\/(admin|apply|application)(\/|$)/.test(location.pathname);
    ensureMeta('meta[name="robots"]', 'name', 'robots').content =
      !siteOrigin || privateRoute ? 'noindex, nofollow' : 'index, follow';
    document.head.querySelector('meta[property="og:image"]')?.remove();
    if (ogImage) {
      ensureMeta('meta[property="og:image"]', 'property', 'og:image').content = ogImage;
    }
    ensureMeta('meta[name="twitter:title"]', 'name', 'twitter:title').content = fullTitle;
    ensureMeta('meta[name="twitter:description"]', 'name', 'twitter:description').content = description;

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    if (siteOrigin && !privateRoute) link.href = `${siteOrigin}${canonical ?? location.pathname}`;
    else link.remove();

    const existingScript = document.head.querySelector('#structured-data');
    if (existingScript) existingScript.remove();
    if (structuredData && siteOrigin && !privateRoute) {
      const script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, canonical, ogImage, structuredData, location.pathname]);
}
