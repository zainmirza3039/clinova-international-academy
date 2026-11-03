import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

vi.mock('@/lib/siteConfig', () => ({ siteOrigin: 'https://www.clinovainternationalacademy.co.uk' }));

function SeoTestPage({ noindex = false }: { noindex?: boolean }) {
  useSEO({ title: 'Fallback page title', description: 'Fallback page description', noindex });
  return <main>SEO test page</main>;
}

function renderPath(path: string, noindex = false) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="*" element={<SeoTestPage noindex={noindex} />} /></Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  document.head.innerHTML = '';
});

describe('runtime route SEO', () => {
  it('sets canonical, Open Graph, Twitter and approved structured data for an eligible route', async () => {
    renderPath('/contact');
    await waitFor(() => expect(document.title).toBe('Contact Clinova International Academy'));
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://www.clinovainternationalacademy.co.uk/contact');
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://www.clinovainternationalacademy.co.uk/contact');
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
    expect(document.querySelector('#structured-data')?.textContent).toContain('"@type":"ContactPage"');
  });

  it('indexes the owner-approved Accessibility Statement without changing its approved source text', async () => {
    renderPath('/accessibility-statement');
    await waitFor(() => expect(document.title).toBe('Accessibility Statement | Clinova International Academy'));
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://www.clinovainternationalacademy.co.uk/accessibility-statement');
  });

  it('keeps unlisted and private routes noindex with no canonical or JSON-LD', async () => {
    renderPath('/about');
    await waitFor(() => expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow'));
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('#structured-data')).toBeNull();

    cleanup();
    document.head.innerHTML = '';
    renderPath('/admin/users');
    await waitFor(() => expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow'));
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('#structured-data')).toBeNull();
  });

  it('honors an explicit noindex override even for an allowlisted route', async () => {
    renderPath('/contact', true);
    await waitFor(() => expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow'));
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('#structured-data')).toBeNull();
  });
});
