// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateFormFields } from '@/lib/formValidation';

const migration = readFileSync(new URL('../supabase/migrations/20261018200942_create_public_enquiry_submissions.sql', import.meta.url), 'utf8');

// Every length constraint used by the existing enquiry migration.
const limits = [
  ['name', 160], ['email', 320], ['phone', 80], ['subject', 200],
  ['enquiry_type', 80], ['message', 5000], ['full_name', 160],
  ['organisation', 200], ['role', 160], ['country', 120], ['website', 500],
] as const;

describe('migration-aligned validation', () => {
  it.each(limits)('accepts %s at its limit (%i), rejects one character over', (field, limit) => {
    expect(migration).toMatch(new RegExp(`char_length\\(${field}\\)[^,\\n]*${limit}`));
    const rules = { [field]: { required: true, maxLength: limit } };
    expect(validateFormFields({ [field]: 'a'.repeat(limit) }, rules).error).toBeUndefined();
    expect(validateFormFields({ [field]: 'a'.repeat(limit + 1) }, rules).error).toContain('too long');
  });

  it('trims input and uses null for blank optional fields', () => {
    expect(validateFormFields({ name: ' Test Visitor ', phone: '  ' }, {
      name: { required: true, maxLength: 160 }, phone: { maxLength: 80 },
    })).toEqual({ values: { name: 'Test Visitor', phone: null } });
  });

  it.each(['http://example.test', 'https://example.test/path?q=1'])('permits HTTP(S) website %s', (website) => {
    expect(validateFormFields({ website }, { website: { maxLength: 500, kind: 'url' } }).error).toBeUndefined();
  });

  it('rejects a missing required field', () => {
    expect(validateFormFields({}, { name: { required: true, maxLength: 160 } }).error).toContain('required');
  });
});

describe('Vercel SPA configuration', () => {
  it('serves existing files first, then falls back to the router entrypoint', () => {
    const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
    expect(config.routes[0].continue).toBe(true);
    expect(config.routes[0].headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(config.routes[0].headers["X-Frame-Options"]).toBe("DENY");
    expect(config.routes.slice(1)).toEqual([
      { handle: 'filesystem' },
      { src: '/.*', dest: '/index.html' },
    ]);
    const fallback = new RegExp(`^${config.routes[2].src}$`);
    for (const path of ['/contact', '/training-partners', '/programmes/example', '/unknown-route']) {
      expect(fallback.test(path)).toBe(true);
    }
    expect(config).not.toHaveProperty('env');
    expect(config).not.toHaveProperty('alias');
  });
});
