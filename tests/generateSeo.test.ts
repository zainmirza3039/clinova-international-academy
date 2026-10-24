import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const generator = resolve(repoRoot, 'scripts/generate-seo.mjs');
const temporaryDirectories: string[] = [];

function runGenerator(siteUrl?: string, indexingEnabled = 'true', vercelEnvironment?: string) {
  const cwd = mkdtempSync(join(tmpdir(), 'clinova-seo-'));
  temporaryDirectories.push(cwd);
  mkdirSync(join(cwd, 'dist'), { recursive: true });
  writeFileSync(join(cwd, 'dist', 'index.html'), '<meta name="robots" content="noindex, nofollow">');
  const env = { ...process.env, VITE_INDEXING_ENABLED: indexingEnabled };
  if (siteUrl === undefined) delete env.VITE_SITE_URL;
  else env.VITE_SITE_URL = siteUrl;
  if (vercelEnvironment === undefined) delete env.VERCEL_ENV;
  else env.VERCEL_ENV = vercelEnvironment;

  const result = spawnSync(process.execPath, [generator], { cwd, env, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error('SEO generator failed: ' + (result.stderr || result.stdout));
  }
  return {
    sitemap: readFileSync(join(cwd, 'dist', 'sitemap.xml'), 'utf8'),
    robots: readFileSync(join(cwd, 'dist', 'robots.txt'), 'utf8'),
    html: readFileSync(join(cwd, 'dist', 'index.html'), 'utf8'),
    stdout: result.stdout,
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('build-time SEO publication safeguards', () => {
  it('includes fixed public pages and only published courses and reviewed articles', () => {
    const output = runGenerator('https://www.clinovainternationalacademy.co.uk/');
    expect(output.sitemap).toContain('<loc>https://www.clinovainternationalacademy.co.uk/</loc>');
    expect(output.sitemap).toContain('<loc>https://www.clinovainternationalacademy.co.uk/cpd-courses</loc>');
    expect(output.sitemap).not.toContain('/programmes</loc>');
    expect(output.sitemap).not.toContain('/departments/');

    const publishedCourses = [
      'clinical-assessment-of-low-back-pain',
      'introduction-to-sports-rehabilitation',
      'pain-management-fundamentals',
      'motor-control-relearning-in-neurorehabilitation',
      'musculoskeletal-assessment-and-clinical-reasoning',
      'knee-osteoarthritis-rehabilitation',
      'stroke-rehabilitation-functional-goals',
      'balance-training-fall-prevention',
    ];
    for (const slug of publishedCourses) {
      expect(output.sitemap).toContain('<loc>https://www.clinovainternationalacademy.co.uk/cpd-courses/' + slug + '</loc>');
    }

    const reviewedArticles = [
      'low-back-pain-rehabilitation',
      'knee-osteoarthritis-rehabilitation',
      'stroke-rehabilitation-functional-goals',
      'balance-training-fall-prevention',
      'evidence-based-practice-physiotherapy',
    ];
    for (const slug of reviewedArticles) {
      expect(output.sitemap).toContain('<loc>https://www.clinovainternationalacademy.co.uk/resources/' + slug + '</loc>');
    }

    expect(output.sitemap).not.toContain('/cpd-courses/clinical-communication-skills</loc>');
    expect(output.sitemap).not.toContain('/resources/shoulder-pain-assessment-rehabilitation</loc>');
    for (const route of ['/admin', '/student', '/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/verify']) {
      expect(output.sitemap).not.toContain(route);
    }
    expect(output.robots).toContain('Sitemap: https://www.clinovainternationalacademy.co.uk/sitemap.xml');
    expect(output.robots).toContain('Disallow: /admin');
    expect(output.robots).toContain('Disallow: /student');
    expect(output.robots).toContain('Disallow: /verify');
    expect(output.html).toContain('content="index, follow"');
    expect(output.stdout).toContain('8 published courses, 5 reviewed articles');
  });

  it.each([
    ['indexing disabled', 'https://www.clinovainternationalacademy.co.uk/', 'false'],
    ['Vercel preview host', 'https://clinova-preview.vercel.app/', 'true'],
    ['URL with query string', 'https://www.clinovainternationalacademy.co.uk/?preview=1', 'true'],
    ['non-HTTPS origin', 'http://www.clinovainternationalacademy.co.uk/', 'true'],
  ])('keeps public indexing disabled for %s', (_case, siteUrl, enabled) => {
    const output = runGenerator(siteUrl, enabled);
    expect(output.sitemap).not.toContain('<loc>');
    expect(output.robots).toContain('Disallow: /');
    expect(output.robots).not.toContain('Sitemap:');
    expect(output.html).toContain('content="noindex, nofollow"');
  });

  it('keeps Vercel preview deployments noindexed even when the production origin is configured', () => {
    const output = runGenerator('https://www.clinovainternationalacademy.co.uk/', 'true', 'preview');
    expect(output.sitemap).not.toContain('<loc>');
    expect(output.robots).toContain('Disallow: /');
    expect(output.robots).not.toContain('Sitemap:');
    expect(output.html).toContain('content="noindex, nofollow"');
  });

  it('keeps indexing disabled when no site URL is configured', () => {
    const output = runGenerator(undefined, 'true');
    expect(output.sitemap).not.toContain('<loc>');
    expect(output.robots).toContain('Disallow: /');
    expect(output.html).toContain('content="noindex, nofollow"');
  });
});
