import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatResourceDate, isValidIsoDate } from '@/lib/resourceDate';
import NewsCard from '@/components/NewsCard';
import { ResourcesPage, ResourceDetailPage } from '@/pages/ResourcesPage';
import OnlineLearningPage from '@/pages/OnlineLearningPage';
import { newsItems } from '@/data/resourceDrafts';

vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(() => cleanup());

describe('resource publication dates', () => {
  it.each(['Draft — publication date awaiting academy confirmation', '', 'invalid', '2026-02-30', '2025-02-29', '2026-13-01', '2026-00-01', '2026-01-00', '2026-01-01Tbad', '2026-01-01T24:00:00Z'])('preserves non-date or invalid text: %s', value => {
    expect(isValidIsoDate(value)).toBe(false);
    expect(formatResourceDate(value)).toBe(value);
  });
  it.each(['2024-02-29', '2026-10-22', '2026-10-22T23:30:00-05:00'])('accepts actual ISO dates: %s', value => {
    expect(isValidIsoDate(value)).toBe(true);
  });
  it('formats calendar labels without timezone drift', () => {
    expect(formatResourceDate('2026-10-22')).toBe('22 October 2026');
    expect(formatResourceDate('2026-10-22T23:30:00-05:00')).toBe('22 October 2026');
  });
  it('renders draft text instead of Invalid Date on cards', () => {
    const { container } = render(<MemoryRouter><NewsCard item={newsItems[0]} /></MemoryRouter>);
    expect(screen.getByText(newsItems[0].date)).toBeTruthy();
    expect(container.textContent).not.toContain('Invalid Date');
    expect(container.querySelector('time')).toBeNull();
  });
  it('uses semantic time only for valid dates', () => {
    const { container } = render(<MemoryRouter><NewsCard item={{ ...newsItems[0], date: '2026-10-22' }} /></MemoryRouter>);
    expect(container.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-22');
    expect(screen.getByText('22 October 2026')).toBeTruthy();
  });
  it('does not expose publication dates for unapproved article details', () => {
    render(<MemoryRouter initialEntries={[`/resources/${newsItems[0].slug}`]}><Routes><Route path="/resources/:slug" element={<ResourceDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Article Not Found' })).toBeTruthy();
    expect(document.body.textContent).not.toContain(newsItems[0].date);
    expect(document.body.textContent).not.toContain('Invalid Date');
  });
});

describe('honest and accessible public states', () => {
  it('announces the empty public library without exposing draft filters', () => {
    render(<MemoryRouter><ResourcesPage /></MemoryRouter>);
    expect(screen.getByRole('status').textContent).toContain('0 articles');
    expect(screen.getByText('Articles are being prepared for publication.')).toBeTruthy();
    expect(screen.queryByLabelText('Search resources')).toBeNull();
    expect(screen.queryByRole('button', { name: /Assessment|Rehabilitation|Clinical Education/ })).toBeNull();
  });
  it('does not present fictional learner totals or progress as real records', () => {
    const { container } = render(<MemoryRouter><OnlineLearningPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'An Illustrative Dashboard Concept' })).toBeTruthy();
    expect(screen.getAllByText('Progress unavailable')).toHaveLength(3);
    expect(screen.getAllByText('Illustrative only')).toHaveLength(3);
    expect(container.textContent).not.toMatch(/75%|100%|30%|Completed|In Progress/);
    expect(screen.queryByText('45')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Proposed Video Lessons' })).toBeTruthy();
  });
});
