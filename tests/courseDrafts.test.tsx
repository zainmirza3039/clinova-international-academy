import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { courseDrafts } from '@/data/courseDrafts';
import { programmes } from '@/data/programmes';
import { cpdCourses } from '@/data/cpdCourses';
import ProgrammeCard from '@/components/ProgrammeCard';
import CPDCard from '@/components/CPDCard';
import ProgrammeDetailPage from '@/pages/ProgrammeDetailPage';

vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(() => cleanup());

describe('proposed course drafts', () => {
  it('contains two stable-slug drafts with three modules and two substantive lessons each', () => {
    for (const slug of ['certificate-in-musculoskeletal-assessment', 'certificate-in-clinical-pain-management']) {
      const draft = courseDrafts[slug];
      expect(draft.status).toBe('draft');
      expect(draft.modules).toHaveLength(3);
      expect(draft.modules.every((module) => module.lessons)).toBe(true);
      expect(draft.modules.every((module) => module.lessons).valueOf()).toBe(true);
      draft.modules.forEach((module) => {
        expect(module.lessons).toHaveLength(2);
        module.lessons.forEach((lesson) => expect(lesson.text.split(/\s+/).length).toBeGreaterThanOrEqual(100));
        expect(module.reflectiveActivity.length).toBeGreaterThan(40);
      });
      expect(draft.relatedArticles.length).toBeGreaterThanOrEqual(3);
      expect(draft.evidence.some((source) => /nice|who|hcpc/i.test(source.organisation))).toBe(true);
    }
  });

  it('marks every catalogue entry as draft and does not show fake offers, hours or certificates', () => {
    expect(programmes.every((item) => item.publicationStatus === 'draft' && item.status === 'Draft')).toBe(true);
    expect(cpdCourses.every((item) => item.publicationStatus === 'draft')).toBe(true);
    const programmeCard = render(<MemoryRouter><ProgrammeCard programme={programmes[0]} /></MemoryRouter>);
    expect(programmeCard.getByText('Proposed')).toBeTruthy();
    expect(programmeCard.container.textContent).not.toMatch(/\d+ CPD|weeks|Certificate of Completion|Enrol/i);
    cleanup();
    const cpdCard = render(<MemoryRouter><CPDCard course={cpdCourses[0]} /></MemoryRouter>);
    expect(cpdCard.getByText('Proposed')).toBeTruthy();
    expect(cpdCard.container.textContent).not.toMatch(/\d+ CPD|weeks|Certificate|Enrol/i);
  });

  it('renders lesson content inside collapsed details with no learner completion controls', () => {
    render(<MemoryRouter initialEntries={['/programmes/certificate-in-musculoskeletal-assessment']}><Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByText('Proposed catalogue entry.')).toBeTruthy();
    expect(screen.getAllByText(/Reflective activity:/i)).toHaveLength(3);
    expect(document.querySelectorAll('details[open]')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /complete|save/i })).toBeNull();
    expect(document.body.textContent).not.toMatch(/digital Certificate|you will receive|\b40 CPD hours\b/);
  });
});
