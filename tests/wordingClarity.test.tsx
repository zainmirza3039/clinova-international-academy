import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProgrammeCard from '@/components/ProgrammeCard';
import CPDCard from '@/components/CPDCard';
import ProgrammeDetailPage from '@/pages/ProgrammeDetailPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';
import ApplicationPage from '@/pages/ApplicationPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
import LearningResourcesPage from '@/pages/LearningResourcesPage';
import { programmes } from '@/data/programmes';
import { cpdCourses } from '@/data/cpdCourses';
import { siteSettings } from '@/lib/siteConfig';

vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(cleanup);

describe('concise wording with truthful availability disclosures', () => {
  it('keeps one clear site-wide availability statement without a preview label', () => {
    expect(siteSettings.contentStatus).toContain('proposed and unconfirmed');
    expect(siteSettings.contentStatus).toContain('Applications, sign-in, student services and administration are not live');
    expect(siteSettings.contentStatus).not.toMatch(/draft|preview/i);
  });
  it.each([
    ['programme', <ProgrammeCard programme={programmes[0]} />],
    ['CPD', <CPDCard course={cpdCourses[0]} />],
  ])('uses one proposed badge and a neutral outline action on each %s card', (_, element) => {
    const { container } = render(<MemoryRouter>{element}</MemoryRouter>);
    expect(screen.getAllByText('Proposed')).toHaveLength(1);
    expect(screen.getByText('View outline')).toBeTruthy();
    expect(screen.getByText(/Details unconfirmed:/)).toBeTruthy();
    expect(container.textContent).not.toMatch(/draft|preview/i);
  });
  it.each([
    ['/programmes', programmes[0].slug, <ProgrammeDetailPage />, 'Programme Not Found'],
    ['/cpd-courses', cpdCourses[0].slug, <CPDCourseDetailPage />, 'CPD Course Not Found'],
  ])('does not expose unapproved catalogue details at %s', (base, slug, element, heading) => {
    render(<MemoryRouter initialEntries={[`${base}/${slug}`]}><Routes><Route path={`${base}/:slug`} element={element} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: heading })).toBeTruthy();
    expect(screen.queryByText('Proposed catalogue entry.')).toBeNull();
    expect(screen.queryByRole('button', { name: /^(enrol(?: now)?|buy(?: now)?|complete(?: lesson)?|save(?: progress)?)$/i })).toBeNull();
  });
  it.each([ResourcesPage, LearningResourcesPage])('keeps qualified review status without repeated draft titles', Page => {
    const { container } = render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByText(/Educational material awaiting qualified review/)).toBeTruthy();
    for (const heading of container.querySelectorAll('h1,h2,h3')) expect(heading.textContent).not.toMatch(/draft|preview/i);
    expect(screen.getByRole('status').textContent).not.toMatch(/draft|preview/i);
  });
  it('uses application planning language while keeping submission disabled and local-only', () => {
    const { container } = render(<MemoryRouter><ApplicationPage /></MemoryRouter>);
    expect(container.textContent).not.toMatch(/preview/i);
    expect(screen.getByText(/not a live application service/)).toBeTruthy();
    expect(screen.getByText(/does not submit, save or transmit/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Submission is not available' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
