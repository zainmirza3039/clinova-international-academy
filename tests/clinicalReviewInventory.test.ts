// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { programmes } from '@/data/programmes';
import { cpdCourses } from '@/data/cpdCourses';
import { educationalArticles } from '@/data/educationalArticles';

const inventory = readFileSync('docs/CLINOVA-CLINICAL-REVIEW-INVENTORY.md', 'utf8');
const articleSourceFiles = [
  'src/data/articles/assessment-and-pain.json',
  'src/data/articles/rehabilitation.json',
  'src/data/articles/clinical-practice.json',
];
const articleSourceBySlug = new Map<string, string>();
for (const sourceFile of articleSourceFiles) {
  const records = JSON.parse(readFileSync(sourceFile, 'utf8')) as Array<{ slug: string }>;
  for (const record of records) {
    articleSourceBySlug.set(record.slug, `${sourceFile} + src/data/educationalArticles.ts`);
  }
}

type ContentRecord = { id: string; title: string; slug: string };

function canonicalJson(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function recordHash(record: unknown): string {
  return createHash('sha256').update(canonicalJson(record), 'utf8').digest('hex');
}

function expectedRow(record: ContentRecord, route: string, sourceFile: string, status: string): string[] {
  return [
    record.id,
    record.title,
    route,
    sourceFile,
    recordHash(record),
    status,
    'Owner-reported; exact version unverified',
    'Not provided in available evidence',
    'Not evidenced in available evidence',
    'Not evidenced in available evidence',
    'Requires version-specific confirmation; no record-specific sign-off supplied for this hash',
  ];
}

function rowsFor(sectionHeading: string): string[][] {
  const start = inventory.indexOf(`## ${sectionHeading}`);
  expect(start, `missing inventory section: ${sectionHeading}`).toBeGreaterThanOrEqual(0);
  const nextHeading = inventory.indexOf('\n## ', start + 1);
  const section = inventory.slice(start, nextHeading < 0 ? undefined : nextHeading);
  return section
    .split(/\r?\n/)
    .filter((line) => /^\|\s*(?:p\d+|c\d+|article-\d+)\s*\|/.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
}

describe('Clinova clinical-review identity and evidence inventory', () => {
  it('matches each source record ID, title, route, file, snapshot hash, status, and missing sign-off fields', () => {
    expect(inventory).toContain('c60569d32e2e898577f4c5cadade40ea0f4cac52');
    expect(rowsFor('Programmes (8)')).toEqual(programmes.map((record) =>
      expectedRow(record, `/programmes/${record.slug}`, 'src/data/programmes.ts', record.publicationStatus),
    ));
    expect(rowsFor('CPD courses (16)')).toEqual(cpdCourses.map((record) =>
      expectedRow(record, `/cpd-courses/${record.slug}`, 'src/data/cpdCourses.ts', record.publicationStatus),
    ));
    expect(rowsFor('Educational articles (15)')).toEqual(educationalArticles.map((record) => {
      const sourceFile = articleSourceBySlug.get(record.slug);
      expect(sourceFile, `missing source file for ${record.id}`).toBeDefined();
      return expectedRow(record, `/resources/${record.slug}`, sourceFile!, record.status);
    }));
    expect(programmes.length + cpdCourses.length + educationalArticles.length).toBe(39);
  });

  it('records owner-reported review separately from unverified exact-version and approval evidence', () => {
    expect(inventory).toContain('The academy owner reports that clinical review is complete.');
    expect(inventory).toContain('does not identify the exact reviewed content version for each record');
    expect(inventory).toContain('does **not** establish that any exact version listed below was reviewed');
    expect(inventory).toContain('not review signatures, proof of clinical approval');
    expect(inventory).toContain('Requires version-specific confirmation');
    expect(inventory).toContain('Do not change publication flags, indexing, or learner workflows on the basis of this identity register alone.');
  });
});
