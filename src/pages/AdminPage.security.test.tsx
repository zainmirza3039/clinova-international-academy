import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/auth/authContext', () => ({
  useAuth: () => ({
    enabled: false,
    status: 'disabled',
    session: null,
    emailVerified: false,
    error: null,
  }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => { throw new Error('Disabled admin must not query private records.'); }),
    rpc: vi.fn(() => { throw new Error('Disabled admin must not invoke privileged functions.'); }),
  },
}));

import AdminPage from '@/pages/AdminPage';

afterEach(() => {
  cleanup();
  document.head.innerHTML = '';
  vi.clearAllMocks();
});

describe('admin fail-closed boundary', () => {
  it('renders the disabled state when authentication is not approved', () => {
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Administration is not enabled' })).toBeTruthy();
    expect(screen.getByText(/no sign-in is offered/i)).toBeTruthy();
  });
});
