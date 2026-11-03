// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
describe('explicit publication gate', () => {
  it.each([
    ['', 'true', false],
    ['https://www.clinovainternationalacademy.co.uk', 'false', false],
    ['https://www.clinovainternationalacademy.co.uk', 'true', true],
    ['https://www.clinovainternationalacademy.co.uk/', 'true', true],
    ['https://clinovainternationalacademy.co.uk', 'true', false],
    ['https://academy.example', 'true', false],
    ['https://branch.vercel.app', 'true', false],
    ['https://branch.manus.computer', 'true', false],
    ['https://user:password@www.clinovainternationalacademy.co.uk', 'true', false],
    ['https://www.clinovainternationalacademy.co.uk/?preview=1', 'true', false],
    ['https://www.clinovainternationalacademy.co.uk/path', 'true', false],
  ])('validates origin %s with indexing=%s', async (origin, indexing, valid) => {
    vi.stubEnv('VITE_SITE_URL', origin); vi.stubEnv('VITE_INDEXING_ENABLED', indexing);
    vi.resetModules();
    const { siteOrigin } = await import('@/lib/siteConfig');
    expect(Boolean(siteOrigin)).toBe(valid);
  });
  it('keeps enquiry persistence disabled even when runtime variables request it', async () => {
    vi.stubEnv('VITE_ENQUIRIES_ENABLED', 'true');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://ssxpmcbqfdggfsoqbxac.supabase.co'); vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-key');
    vi.resetModules();
    const { enquiriesEnabled } = await import('@/lib/siteConfig');
    expect(enquiriesEnabled).toBe(false);
  });
  it.each([['https://branch.vercel.app', 'true', false], ['https://www.clinovainternationalacademy.co.uk', 'false', false], ['https://www.clinovainternationalacademy.co.uk', 'true', true], ['https://clinovainternationalacademy.co.uk', 'true', false]])('build SEO uses the same release safeguards: %s indexing=%s', (origin, indexing, valid) => {
    const dir = mkdtempSync(join(tmpdir(), 'clinova-seo-'));
    try {
      mkdirSync(join(dir, 'dist')); mkdirSync(join(dir, 'src/data'), { recursive: true });
      writeFileSync(join(dir, 'dist/index.html'), '<meta name="robots" content="noindex, nofollow">');
      for (const name of ['departments', 'programmes', 'cpdCourses']) writeFileSync(join(dir, `src/data/${name}.ts`), "export const data = [{slug: 'test-fixture'}];");
      execFileSync(process.execPath, [resolve('scripts/generate-seo.mjs')], { cwd: dir, env: { ...process.env, VERCEL_ENV: '', VITE_SITE_URL: origin, VITE_INDEXING_ENABLED: indexing } });
      const sitemap = readFileSync(join(dir, 'dist/sitemap.xml'), 'utf8');
      const robots = readFileSync(join(dir, 'dist/robots.txt'), 'utf8');
      expect(sitemap.includes('<loc>')).toBe(valid);
      expect(sitemap).not.toMatch(/vercel\.app|\/student|\/sign-in|\/sign-up|\/reset-password|\/admin/);
      if (valid) expect(robots).toContain('Disallow: /student');
      else expect(robots).toBe('User-agent: *\nDisallow: /\n');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
