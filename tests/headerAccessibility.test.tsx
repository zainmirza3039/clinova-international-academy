import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Header from '@/components/Header';

vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollPosition: () => false }));

afterEach(() => cleanup());

describe('header keyboard accessibility', () => {
  it('keeps the mobile navigation scroll panel out of the sequential Tab order', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    const panel = document.getElementById('mobile-navigation');
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('tabindex')).toBe('-1');
  });
});
