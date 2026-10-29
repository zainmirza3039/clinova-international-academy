import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputRoot = process.cwd();
const env = { ...loadEnv('production', sourceRoot, 'VITE_'), ...process.env };
let origin;

try {
  const u = new URL(env.VITE_SITE_URL);
  const previewHost = /(^|\.)(vercel\.app|manus\.computer|localhost|test|invalid)$/.test(u.hostname);
  if (
    env.VITE_INDEXING_ENABLED === 'true' &&
    env.VERCEL_ENV !== 'preview' &&
    env.VERCEL_ENV !== 'development' &&
    u.protocol === 'https:' &&
    u.pathname === '/' &&
    !u.username &&
    !u.password &&
    !u.search &&
    !u.hash &&
    !previewHost
  ) origin = u.origin;
} catch {
  // Preview builds remain unindexed when no valid production origin is configured.
}

const fixedPublicRoutes = [
  '/', '/about', '/departments', '/programmes', '/cpd-courses', '/online-learning',
  '/training-partners', '/resources', '/contact', '/admissions',
  '/events', '/faculty', '/faqs', '/privacy-policy',
  '/terms-and-conditions', '/cookie-policy', '/refund-policy',
];

function readPublishedSlugs(file, statusField) {
  const source = readFileSync(join(sourceRoot, file), 'utf8');
  const entries = source.split(/\n(?=  \{\n)/).filter(entry => /^  \{\n/.test(entry));
  return entries.flatMap(entry => {
    if (!new RegExp(statusField + ':\\s*[\'"]published[\'"]').test(entry)) return [];
    const match = entry.match(/^\s*slug:\s*[\'"]([^\'"]+)[\'"]/m);
    return match ? [match[1]] : [];
  });
}

function readPublishedJsonSlugs(files, slugField, statusField = 'status') {
  return files.flatMap(file => {
    const entries = JSON.parse(readFileSync(join(sourceRoot, file), 'utf8'));
    return entries
      .filter(entry => entry[statusField] === 'published')
      .map(entry => entry[slugField]);
  });
}

const courseSlugs = readPublishedSlugs('src/data/cpdCourses.ts', 'publicationStatus');
const programmeSlugs = readPublishedSlugs('src/data/programmes.ts', 'publicationStatus');
const articleSlugs = readPublishedJsonSlugs([
  'src/data/articles/assessment-and-pain.json',
  'src/data/articles/rehabilitation.json',
  'src/data/articles/clinical-practice.json',
], 'slug');
const dynamicPublicRoutes = [
  ...programmeSlugs.map(slug => '/programmes/' + slug),
  ...courseSlugs.map(slug => '/cpd-courses/' + slug),
  ...articleSlugs.map(slug => '/resources/' + slug),
];
const routes = [...new Set([...fixedPublicRoutes, ...dynamicPublicRoutes])];
const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  (origin ? routes.map(path => '  <url><loc>' + escapeXml(origin + path) + '</loc></url>').join('\n') : '') +
  '\n</urlset>\n';

writeFileSync(resolve(outputRoot, 'dist/sitemap.xml'), sitemap);
writeFileSync(
  resolve(outputRoot, 'dist/robots.txt'),
  origin
    ? [
        'User-agent: *',
        'Disallow: /admin',
        'Disallow: /apply',
        'Disallow: /application',
        'Disallow: /sign-in',
        'Disallow: /sign-up',
        'Disallow: /forgot-password',
        'Disallow: /reset-password',
        'Disallow: /student',
        'Disallow: /verify',
        'Sitemap: ' + origin + '/sitemap.xml',
        '',
      ].join('\n')
    : 'User-agent: *\nDisallow: /\n',
);

const htmlFile = resolve(outputRoot, 'dist/index.html');
if (origin) {
  const html = readFileSync(htmlFile, 'utf8');
  writeFileSync(htmlFile, html.replace('content="noindex, nofollow"', 'content="index, follow"'));
}

console.log(origin
  ? 'SEO assets generated for configured origin (' + programmeSlugs.length + ' published programmes, ' + courseSlugs.length + ' published courses, ' + articleSlugs.length + ' published articles).'
  : 'Preview SEO safeguards generated: noindex, no public sitemap entries.');
