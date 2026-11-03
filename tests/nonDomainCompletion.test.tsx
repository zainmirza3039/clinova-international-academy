import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatResourceDate, isValidIsoDate } from '@/lib/resourceDate';
import NewsCard from '@/components/NewsCard';
import { ResourcesPage, ResourceDetailPage } from '@/pages/ResourcesPage';
import OnlineLearningPage from '@/pages/OnlineLearningPage';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import { newsItems, newsCategories } from '@/data/testimonials';
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(() => cleanup());

describe('resource publication dates', () => {
  it.each(['Draft — publication date awaiting academy confirmation', '', 'invalid', '2026-02-30', '2025-02-29', '2026-13-01', '2026-00-01', '2026-01-00', '2026-01-01Tbad', '2026-01-01T24:00:00Z'])('preserves non-date or invalid text: %s', value => { expect(isValidIsoDate(value)).toBe(false); expect(formatResourceDate(value)).toBe(value); });
  it.each(['2024-02-29', '2026-10-22', '2026-10-22T23:30:00-05:00'])('accepts actual ISO dates: %s', value => { expect(isValidIsoDate(value)).toBe(true); });
  it('formats calendar labels without timezone drift', () => { expect(formatResourceDate('2026-10-22')).toBe('22 October 2026'); expect(formatResourceDate('2026-10-22T23:30:00-05:00')).toBe('22 October 2026'); });
  it('omits unconfirmed publication dates on cards', () => { const { container } = render(<MemoryRouter><NewsCard item={newsItems[0]} /></MemoryRouter>); expect(newsItems[0].date).toBe(''); expect(container.textContent).not.toMatch(/draft|Invalid Date/i); expect(container.querySelector('time')).toBeNull(); });
  it('uses semantic time only for valid dates', () => { const { container } = render(<MemoryRouter><NewsCard item={{ ...newsItems[0], date: '2026-10-22' }} /></MemoryRouter>); expect(container.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-22'); expect(screen.getByText('22 October 2026')).toBeTruthy(); });
  it('shows article metadata without inventing a publication date', () => { render(<MemoryRouter initialEntries={[`/resources/${newsItems[0].slug}`]}><Routes><Route path="/resources/:slug" element={<ResourceDetailPage />} /></Routes></MemoryRouter>); expect(screen.getByText('Educational article · Source links provided for further reading')).toBeTruthy(); expect(document.body.textContent).not.toMatch(/draft|Invalid Date/i); });
});

describe('honest and accessible public states', () => {
  it('exposes selected categories and announces article search results', () => {
    render(<MemoryRouter><ResourcesPage /></MemoryRouter>); const category = screen.getByRole('button', { name: newsCategories[0] });
    expect(category.getAttribute('aria-pressed')).toBe('false'); fireEvent.click(category); expect(category.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'All' }).getAttribute('aria-pressed')).toBe('false'); fireEvent.change(screen.getByLabelText('Search resources'), { target: { value: 'no-such-article' } });
    expect(screen.getByRole('status').textContent).toContain('0 educational articles'); expect(screen.getByText('No articles match your search.')).toBeTruthy();
  });
  it('redirects the old online-learning route without showing fictional progress or course details', () => {
    const { container } = render(<MemoryRouter initialEntries={['/online-learning']}><Routes><Route path="/online-learning" element={<OnlineLearningPage />} /><Route path="/cpd-courses" element={<CPDCoursesPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'No CPD course enrollment is available' })).toBeTruthy();
    expect(container.textContent).not.toMatch(/75%|100%|30%|Completed|In Progress|self-study/i);
    expect(screen.getByLabelText('Search proposed topics')).toBeTruthy();
    expect(container.querySelector('form,input[type="email"],input[type="password"],input[type="file"],textarea,button[type="submit"]')).toBeNull();
  });
});
