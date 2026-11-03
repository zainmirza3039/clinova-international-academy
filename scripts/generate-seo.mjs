import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputRoot = process.cwd();
const env = { ...loadEnv('production', sourceRoot, 'VITE_'), ...process.env };
const manifest = JSON.parse(readFileSync(join(sourceRoot, 'src/data/seoRouteManifest.json'), 'utf8'));
const indexableRoutes = manifest.indexableRoutes;
const indexablePaths = new Set(indexableRoutes.map(route => route.path));
let origin;

try {
  const configured = new URL(env.VITE_SITE_URL);
  const cleanOrigin = configured.protocol === 'https:' &&
    configured.origin === manifest.canonicalOrigin &&
    configured.pathname === '/' &&
    !configured.username && !configured.password &&
    !configured.search && !configured.hash;
  if (
    env.VITE_INDEXING_ENABLED === 'true' &&
    env.VERCEL_ENV !== 'preview' &&
    env.VERCEL_ENV !== 'development' &&
    cleanOrigin
  ) origin = manifest.canonicalOrigin;
} catch {
  // No configured or verified canonical origin: fail closed and generate noindex output.
}

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');
const escapeXml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

function insertIntoHead(html, tag) {
  return html.includes('</head>') ? html.replace('</head>', `  ${tag}\n  </head>`) : `${tag}\n${html}`;
}

function setTitle(html, title) {
  const replacement = `<title>${escapeHtml(title)}</title>`;
  return /<title>[\s\S]*?<\/title>/i.test(html)
    ? html.replace(/<title>[\s\S]*?<\/title>/i, replacement)
    : insertIntoHead(html, replacement);
}

function setMeta(html, attribute, value, content) {
  const escapedValue = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matcher = new RegExp(`<meta\\b[^>]*\\b${attribute}=["']${escapedValue}["'][^>]*>`, 'i');
  const replacement = `<meta ${attribute}="${escapeHtml(value)}" content="${escapeHtml(content)}" />`;
  return matcher.test(html) ? html.replace(matcher, replacement) : insertIntoHead(html, replacement);
}

function setCanonical(html, url) {
  const existing = /<link\b[^>]*\brel=["']canonical["'][^>]*>/i;
  if (!url) return html.replace(existing, '');
  const tag = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  return existing.test(html) ? html.replace(existing, tag) : insertIntoHead(html, tag);
}

function structuredDataFor(route, canonical) {
  const page = {
    '@context': 'https://schema.org',
    '@type': route.structuredDataType,
    name: route.title,
    description: route.description,
    url: `${canonical}${route.path}`,
    inLanguage: 'en-GB',
  };
  const organization = {
    '@type': 'Organization',
    name: manifest.brandName,
    legalName: manifest.legalName,
    url: canonical,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'UK company number',
      value: manifest.companyNumber,
    },
    logo: {
      '@type': 'ImageObject',
      url: `${canonical}${manifest.logoPath}`,
      caption: manifest.logoAlt,
    },
  };
  if (route.structuredDataType === 'WebSite') return { ...page, publisher: organization };
  if (route.structuredDataType === 'ContactPage') return { ...page, mainEntity: organization };
  return { ...page, isPartOf: { '@type': 'WebSite', name: manifest.brandName, url: canonical } };
}

function applyHeadMetadata(html, route, canonical) {
  const indexable = Boolean(route && canonical);
  const title = route?.title ?? manifest.brandName;
  const description = route?.description ?? 'This Clinova page is not included in the search index.';
  const robots = indexable ? 'index, follow' : 'noindex, nofollow';
  let output = setTitle(html, title);
  output = setMeta(output, 'name', 'description', description);
  output = setMeta(output, 'name', 'robots', robots);
  output = setMeta(output, 'property', 'og:title', title);
  output = setMeta(output, 'property', 'og:description', description);
  output = setMeta(output, 'property', 'og:type', 'website');
  output = setMeta(output, 'property', 'og:site_name', manifest.brandName);
  output = setMeta(output, 'property', 'og:locale', 'en_GB');
  output = setMeta(output, 'name', 'twitter:title', title);
  output = setMeta(output, 'name', 'twitter:description', description);
  output = setCanonical(output, indexable ? `${canonical}${route.path}` : undefined);
  output = output.replace(/<meta\b[^>]*\bproperty=["']og:url["'][^>]*>/i, '');
  output = output.replace(/<script\b[^>]*\bid=["']structured-data["'][^>]*>[\s\S]*?<\/script>/gi, '');

  if (indexable) {
    const imageUrl = `${canonical}${manifest.logoPath}`;
    output = setMeta(output, 'property', 'og:url', `${canonical}${route.path}`);
    output = setMeta(output, 'property', 'og:image', imageUrl);
    output = setMeta(output, 'property', 'og:image:alt', manifest.logoAlt);
    output = setMeta(output, 'property', 'og:image:width', '1276');
    output = setMeta(output, 'property', 'og:image:height', '365');
    output = setMeta(output, 'name', 'twitter:image', imageUrl);
    output = setMeta(output, 'name', 'twitter:image:alt', manifest.logoAlt);
    output = setMeta(output, 'name', 'twitter:card', 'summary_large_image');
    const jsonLd = JSON.stringify(structuredDataFor(route, canonical)).replaceAll('<', '\\u003c');
    output = insertIntoHead(output, `<script id="structured-data" type="application/ld+json">${jsonLd}</script>`);
  }
  return output;
}

function safeRouteFile(path) {
  if (!path.startsWith('/') || path.includes('?') || path.includes('#')) throw new Error(`Unsafe route in SEO manifest: ${path}`);
  const segments = path.split('/').filter(Boolean);
  if (segments.some(segment => segment === '.' || segment === '..' || segment.includes('\\'))) throw new Error(`Unsafe route in SEO manifest: ${path}`);
  return segments.length ? resolve(outputRoot, 'dist', ...segments, 'index.html') : resolve(outputRoot, 'dist/index.html');
}

function writeRouteShell(path, html) {
  const outputFile = safeRouteFile(path);
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, html);
}

function readSourceSlugs(relativeFile) {
  const file = join(sourceRoot, relativeFile);
  if (!existsSync(file)) return [];
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
}

function readJsonSlugs(relativeFiles) {
  return relativeFiles.flatMap(relativeFile => {
    const file = join(sourceRoot, relativeFile);
    if (!existsSync(file)) return [];
    const data = JSON.parse(readFileSync(file, 'utf8'));
    return Array.isArray(data) ? data.flatMap(entry => typeof entry?.slug === 'string' ? [entry.slug] : []) : [];
  });
}

const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  (origin ? indexableRoutes.map(route => `  <url><loc>${escapeXml(origin + route.path)}</loc></url>`).join('\n') : '') +
  '\n</urlset>\n';
writeFileSync(resolve(outputRoot, 'dist/sitemap.xml'), sitemap);

const robots = origin
  ? [
      'User-agent: *',
      'Allow: /',
      ...manifest.robotsDisallowPaths.map(path => `Disallow: ${path}`),
      `Sitemap: ${origin}/sitemap.xml`,
      '',
    ].join('\n')
  : 'User-agent: *\nDisallow: /\n';
writeFileSync(resolve(outputRoot, 'dist/robots.txt'), robots);

const htmlFile = resolve(outputRoot, 'dist/index.html');
const baseHtml = readFileSync(htmlFile, 'utf8');
const homeRoute = indexableRoutes.find(route => route.path === '/');
writeFileSync(htmlFile, applyHeadMetadata(baseHtml, homeRoute, origin));

const guardRoutes = JSON.stringify(origin ? indexableRoutes.map(route => ({
  ...route,
  canonicalUrl: `${origin}${route.path}`,
  imageUrl: `${origin}${manifest.logoPath}`,
  structuredData: structuredDataFor(route, origin),
})) : []).replaceAll('<', '\\u003c');
const guardPrivatePrefixes = JSON.stringify(manifest.robotsDisallowPaths);
const earlyGuard = `(() => {
  const routes = new Map(${guardRoutes}.map(route => [route.path, route]));
  const privatePrefixes = ${guardPrivatePrefixes};
  const path = window.location.pathname.replace(/\\/+$/, '') || '/';
  const privatePath = privatePrefixes.some(prefix => path === prefix || path.startsWith(prefix + '/'));
  const indexingEnabled = ${JSON.stringify(Boolean(origin))};
  const route = routes.get(path);
  const setMeta = (selector, attribute, name, content) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
    return element;
  };
  const canonicalLink = url => {
    let element = document.querySelector('link[rel="canonical"]');
    if (!url) { element?.remove(); return; }
    if (!element) { element = document.createElement('link'); element.setAttribute('rel', 'canonical'); document.head.appendChild(element); }
    element.setAttribute('href', url);
  };
  const structuredData = data => {
    document.querySelector('#structured-data')?.remove();
    if (!data) return;
    const element = document.createElement('script');
    element.setAttribute('id', 'structured-data');
    element.setAttribute('type', 'application/ld+json');
    element.textContent = JSON.stringify(data);
    document.head.appendChild(element);
  };
  if (indexingEnabled && route && !privatePath) {
    document.title = route.title;
    setMeta('meta[name="description"]', 'name', 'description', route.description);
    setMeta('meta[name="robots"]', 'name', 'robots', 'index, follow');
    setMeta('meta[property="og:title"]', 'property', 'og:title', route.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', route.description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', ${JSON.stringify(manifest.brandName)});
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'en_GB');
    setMeta('meta[property="og:url"]', 'property', 'og:url', route.canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', route.imageUrl);
    setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', ${JSON.stringify(manifest.logoAlt)});
    setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1276');
    setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '365');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', route.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', route.description);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', route.imageUrl);
    setMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', ${JSON.stringify(manifest.logoAlt)});
    canonicalLink(route.canonicalUrl);
    structuredData(route.structuredData);
    return;
  }
  setMeta('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
  canonicalLink(undefined);
  for (const selector of ['meta[property="og:url"]', '#structured-data', 'meta[property="og:image"]', 'meta[name="twitter:image"]']) {
    document.querySelector(selector)?.remove();
  }
})();\n`;
writeFileSync(resolve(outputRoot, 'dist/seo-early.js'), earlyGuard);

let staticNoindexShellCount = 0;
if (origin) {
  for (const route of indexableRoutes) {
    if (route.path === '/') continue;
    writeRouteShell(route.path, applyHeadMetadata(baseHtml, route, origin));
  }

  const articleSlugs = readJsonSlugs([
    'src/data/articles/assessment-and-pain.json',
    'src/data/articles/rehabilitation.json',
    'src/data/articles/clinical-practice.json',
  ]);
  const noindexDynamicPaths = [
    ...articleSlugs.flatMap(slug => [`/resources/${encodeURIComponent(slug)}`, `/blog/${encodeURIComponent(slug)}`]),
    ...readSourceSlugs('src/data/departments.ts').map(slug => `/departments/${encodeURIComponent(slug)}`),
    ...readSourceSlugs('src/data/learningResources.ts').map(slug => `/learning-resources/${encodeURIComponent(slug)}`),
  ];
  const noindexPaths = new Set([...manifest.staticNoindexPaths, ...noindexDynamicPaths]);
  for (const path of noindexPaths) {
    if (indexablePaths.has(path) || path === '/') continue;
    writeRouteShell(path, applyHeadMetadata(baseHtml, undefined, undefined));
    staticNoindexShellCount += 1;
  }
}

console.log(origin
  ? `SEO assets generated for verified origin with ${indexableRoutes.length} allowlisted public routes and ${staticNoindexShellCount} known noindex route shells.`
  : 'SEO safeguards generated: indexing disabled, all routes noindex, and sitemap empty.');
