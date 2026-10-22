import { readFileSync, writeFileSync } from 'node:fs';
import { loadEnv } from 'vite';

const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
let origin;
try {
  const u = new URL(env.VITE_SITE_URL);
  const previewHost = /(^|\\.)(vercel\\.app|manus\\.computer|localhost|test|invalid)$/.test(u.hostname);
  if (env.VITE_INDEXING_ENABLED === 'true' && u.protocol === 'https:' && u.pathname === '/' && !u.username && !u.password && !u.search && !u.hash && !previewHost) origin = u.origin;
} catch { /* Preview builds remain unindexed. */ }

const fixed = ['/', '/about', '/departments', '/programmes', '/cpd-courses', '/online-learning', '/training-partners', '/resources', '/contact', '/admissions', '/events', '/faculty', '/faqs', '/privacy-policy', '/terms-and-conditions', '/cookie-policy', '/refund-policy'];

// Department pages are public category pages. Course detail URLs must be explicitly published.
const departmentSource = readFileSync('src/data/departments.ts', 'utf8');
for (const match of departmentSource.matchAll(/slug:\\s*['"]([^'"]+)['"]/g)) {
  fixed.push(`/departments/${match[1]}`);
}

for (const [file, prefix] of [['programmes', 'programmes'], ['cpdCourses', 'cpd-courses']]) {
  const source = readFileSync(`src/data/${file}.ts`, 'utf8');
  const entries = source.split(/\\n(?=  \\{)/).filter(entry => /^  \\{\\n/.test(entry));
  for (const entry of entries) {
    if (!/publicationStatus:\\s*['"]published['"]/.test(entry)) continue;
    const match = entry.match(/^\\s*slug:\\s*['"]([^'"]+)['"]/m);
    if (match) fixed.push(`/${prefix}/${match[1]}`);
  }
}

const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n${origin ? [...new Set(fixed)].map(path => `  <url><loc>${escape(origin + path)}</loc></url>`).join('\\n') : ''}\\n</urlset>\\n`);
writeFileSync('dist/robots.txt', origin ? `User-agent: *\\nDisallow: /admin\\nDisallow: /apply\\nDisallow: /application\\nDisallow: /sign-in\\nDisallow: /sign-up\\nDisallow: /forgot-password\\nDisallow: /reset-password\\nDisallow: /student\\nSitemap: ${origin}/sitemap.xml\\n` : 'User-agent: *\\nDisallow: /\\n');
// Update server-delivered robots metadata as well as runtime route metadata.
if (origin) {
  const file = 'dist/index.html';
  writeFileSync(file, readFileSync(file, 'utf8').replace('content="noindex, nofollow"', 'content="index, follow"'));
}
console.log(origin ? 'SEO assets generated for configured origin.' : 'Preview SEO safeguards generated: noindex, no public sitemap entries.');
