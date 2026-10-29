// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function CrashingPage(): never {
  throw new Error('intentional render failure for accessibility test');
}

describe('error-boundary accessibility', () => {
  it('keeps the main landmark unique and announces a render failure', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const suppressExpectedError = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener('error', suppressExpectedError);
    try {
      const { container } = render(
        <main id="main-content">
          <ErrorBoundary>
            <CrashingPage />
          </ErrorBoundary>
        </main>,
      );

      expect(container.querySelectorAll('main')).toHaveLength(1);
      expect(container.querySelector('section[aria-labelledby="error-title"]')).not.toBeNull();
      expect(screen.getByRole('heading', { name: 'This page could not be loaded' })).toBeTruthy();
      expect(screen.getByRole('alert').textContent).toContain('Please reload to try again.');
    } finally {
      window.removeEventListener('error', suppressExpectedError);
    }
  });
});
