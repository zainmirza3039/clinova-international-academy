import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import { afterEach, describe, expect, it } from 'vitest';
import { educationalArticles } from '@/data/educationalArticles';
import { cpdCourses } from '@/data/cpdCourses';
import { programmes } from '@/data/programmes';
import seoManifest from '@/data/seoRouteManifest.json';

const repoRoot = process.cwd();
const generator = resolve(repoRoot, 'scripts/generate-seo.mjs');
const canonicalOrigin = 'https://www.clinovainternationalacademy.co.uk';
const temporaryDirectories: string[] = [];
const shell = `<!doctype html><html lang="en-GB"><head><title>Base title</title><meta name="description" content="Base description"><meta name="robots" content="noindex, nofollow"><meta property="og:title" content="Base title"><meta property="og:description" content="Base description"><meta property="og:image" content="/clinova-logo.png"><meta name="twitter:image" content="/clinova-logo.png"></head><body><div id="root"></div></body></html>`;

function runGenerator(siteUrl?: string, indexingEnabled = 'true', vercelEnvironment?: string) {
  const cwd = mkdtempSync(join(tmpdir(), 'clinova-seo-'));
  temporaryDirectories.push(cwd);
  mkdirSync(join(cwd, 'dist'), { recursive: true });
  writeFileSync(join(cwd, 'dist', 'index.html'), shell);
  const env = { ...process.env, VITE_INDEXING_ENABLED: indexingEnabled };
  if (siteUrl === undefined) delete env.VITE_SITE_URL; else env.VITE_SITE_URL = siteUrl;
  if (vercelEnvironment === undefined) delete env.VERCEL_ENV; else env.VERCEL_ENV = vercelEnvironment;
  const result = spawnSync(process.execPath, [generator], { cwd, env, encoding: 'utf8' });
  if (result.status !== 0) throw new Error('SEO generator failed: ' + (result.stderr || result.stdout));
  const routeHtml = (path: string) => readFileSync(join(cwd, 'dist', ...(path === '/' ? ['index.html'] : [...path.split('/').filter(Boolean), 'index.html'])), 'utf8');
  return {
    sitemap: readFileSync(join(cwd, 'dist', 'sitemap.xml'), 'utf8'),
    robots: readFileSync(join(cwd, 'dist', 'robots.txt'), 'utf8'),
    html: readFileSync(join(cwd, 'dist', 'index.html'), 'utf8'),
    guardScript: readFileSync(join(cwd, 'dist', 'seo-early.js'), 'utf8'),
    routeHtml,
    stdout: result.stdout,
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
  document.head.innerHTML = '';
});

describe('build-time SEO publication safeguards', () => {
  it('generates only the verified public allowlist on the confirmed canonical host', () => {
    const output = runGenerator(canonicalOrigin, 'true', 'production');
    const locations = [...output.sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
    expect(locations).toEqual([
      `${canonicalOrigin}/`,
      `${canonicalOrigin}/contact`,
      `${canonicalOrigin}/accessibility-statement`,
      `${canonicalOrigin}/external-linking-policy`,
    ]);
    expect(output.robots).toContain('User-agent: *');
    expect(output.robots).toContain('Allow: /');
    expect(output.robots).toContain('Disallow: /admin');
    expect(output.robots).toContain('Disallow: /sign-in');
    expect(output.robots).toContain('Disallow: /student');
    expect(output.robots).toContain('Disallow: /verify');
    expect(output.robots).toContain(`Sitemap: ${canonicalOrigin}/sitemap.xml`);
    expect(output.robots).not.toMatch(/^Disallow: \/$/m);

    expect(output.html).toContain('<meta name="robots" content="index, follow" />');
    expect(output.html).toContain(`<link rel="canonical" href="${canonicalOrigin}/" />`);
    expect(output.html).toContain('og:url');
    expect(output.html).toContain('twitter:card');
    expect(output.html).toContain('application/ld+json');
    expect(output.html).toContain('"@type":"WebSite"');
    expect(output.html).toContain('"legalName":"Clinova International Academy Ltd"');
    expect(output.html).not.toContain('EducationalOrganization');

    const contact = output.routeHtml('/contact');
    expect(contact).toContain(`<link rel="canonical" href="${canonicalOrigin}/contact" />`);
    expect(contact).toContain('"@type":"ContactPage"');
    expect(contact).not.toContain('registeredOfficeAddress');

    const accessibility = output.routeHtml('/accessibility-statement');
    expect(accessibility).toContain('content="Accessibility information for MyUniHub, including current capabilities, known gaps, and contact details."');
    expect(accessibility).toContain('content="index, follow"');
    expect(accessibility).toContain(`<link rel="canonical" href="${canonicalOrigin}/accessibility-statement" />`);

    const policy = output.routeHtml('/external-linking-policy');
    expect(policy).toContain('"@type":"WebPage"');
    expect(policy).toContain(`<link rel="canonical" href="${canonicalOrigin}/external-linking-policy" />`);

    const admin = output.routeHtml('/admin');
    expect(admin).toContain('content="noindex, nofollow"');
    expect(admin).not.toContain('rel="canonical"');
    expect(admin).not.toContain('id="structured-data"');
    expect(output.routeHtml('/programmes')).toContain('content="noindex, nofollow"');
    expect(() => output.routeHtml(`/programmes/${programmes[0].slug}`)).toThrow();
    expect(() => output.routeHtml(`/cpd-courses/${cpdCourses.find(course => course.id === 'c13')!.slug}`)).toThrow();
    expect(output.routeHtml('/accessibility-statement')).not.toContain('noindex, nofollow');

    expect(output.sitemap).not.toMatch(/\/(?:programmes|cpd-courses|resources|learning-resources|assessment|verify)(?:\/|<)/);
    expect(output.sitemap).not.toContain('example.com');
    for (const { slug } of educationalArticles) {
      expect(output.sitemap).not.toContain(`/resources/${slug}`);
      expect(output.routeHtml(`/resources/${slug}`)).toContain('content="noindex, nofollow"');
    }
    expect(output.stdout).toContain('4 allowlisted public routes');
    expect(output.stdout).not.toContain('published programmes');
  });

  it.each([
    ['indexing disabled', canonicalOrigin, 'false', undefined],
    ['non-canonical apex host', 'https://clinovainternationalacademy.co.uk', 'true', 'production'],
    ['placeholder host', 'https://clinova-preview.vercel.app/', 'true', 'production'],
    ['unrelated host', 'https://example.com/', 'true', 'production'],
    ['query string', `${canonicalOrigin}/?preview=1`, 'true', 'production'],
    ['non-HTTPS origin', 'http://www.clinovainternationalacademy.co.uk/', 'true', 'production'],
    ['preview deployment', canonicalOrigin, 'true', 'preview'],
    ['development deployment', canonicalOrigin, 'true', 'development'],
  ])('keeps indexing disabled for %s', (_case, siteUrl, enabled, vercelEnvironment) => {
    const output = runGenerator(siteUrl, enabled, vercelEnvironment);
    expect(output.sitemap).not.toContain('<loc>');
    expect(output.robots).toBe('User-agent: *\nDisallow: /\n');
    expect(output.html).toContain('content="noindex, nofollow"');
    expect(output.html).not.toContain('rel="canonical"');
    expect(output.html).not.toContain('id="structured-data"');
  });

  it('keeps indexing disabled when no site URL is configured', () => {
    const output = runGenerator(undefined, 'true', 'production');
    expect(output.sitemap).not.toContain('<loc>');
    expect(output.robots).toContain('Disallow: /');
    expect(output.html).toContain('content="noindex, nofollow"');
  });

  it('marks unknown SPA fallback and private paths noindex before hydration', () => {
    const output = runGenerator(canonicalOrigin, 'true', 'production');
    const rootMetadata = `<meta name="description" content="Homepage description"><meta name="robots" content="index, follow"><meta property="og:title" content="Homepage"><meta property="og:description" content="Homepage description"><meta property="og:url" content="${canonicalOrigin}/"><meta property="og:image" content="${canonicalOrigin}/clinova-logo.png"><meta name="twitter:image" content="${canonicalOrigin}/clinova-logo.png"><link rel="canonical" href="${canonicalOrigin}/"><script id="structured-data" type="application/ld+json">{"@type":"WebSite"}</script>`;

    document.head.innerHTML = rootMetadata;
    runInNewContext(output.guardScript, { window: { location: { pathname: '/not-a-known-route' } }, document });
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).toBeNull();
    expect(document.querySelector('#structured-data')).toBeNull();

    document.head.innerHTML = rootMetadata;
    runInNewContext(output.guardScript, { window: { location: { pathname: '/admin/users' } }, document });
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();

    document.head.innerHTML = rootMetadata;
    runInNewContext(output.guardScript, { window: { location: { pathname: `/cpd-courses/${cpdCourses.find(course => course.id === 'c13')!.slug}` } }, document });
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();

    document.head.innerHTML = rootMetadata;
    document.title = 'Homepage';
    runInNewContext(output.guardScript, { window: { location: { pathname: '/contact/' } }, document });
    expect(document.title).toBe('Contact Clinova International Academy');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Owner-confirmed legal identity details and registered virtual office information for Clinova International Academy Ltd.');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${canonicalOrigin}/contact`);
    expect(document.querySelector('#structured-data')?.textContent).toContain('"@type":"ContactPage"');
  });

  it('uses only the routes in the shared allowlist', () => {
    expect(seoManifest.indexableRoutes.map(route => route.path)).toEqual([
      '/', '/contact', '/accessibility-statement', '/external-linking-policy',
    ]);
  });
});
