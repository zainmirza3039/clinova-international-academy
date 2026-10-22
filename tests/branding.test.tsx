import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import BrandLogo from '@/components/BrandLogo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useSEO } from '@/hooks/useSEO';

const config = vi.hoisted(() => ({ siteOrigin: 'https://academy.example' as string | undefined }));
vi.mock('@/lib/siteConfig', () => config);
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollPosition: () => false }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; config.siteOrigin = 'https://academy.example'; vi.restoreAllMocks(); });

function SEOProbe({ image }: { image?: string }) {
  useSEO({ title: 'Brand test', description: 'Brand metadata test', ogImage: image });
  return null;
}

describe('owner-supplied Clinova branding', () => {
  it.each([
    ['color', '/brand/clinova-logo.png', '1247', '335'],
    ['white', '/brand/clinova-logo-white.png', '362', '105'],
    ['mark', '/brand/clinova-mark.png', '260', '264'],
  ] as const)('renders the %s variant with accessible name and intrinsic dimensions', (variant, src, width, height) => {
    render(<BrandLogo variant={variant} />);
    const image = screen.getByRole('img', { name: 'Clinova International Academy' });
    expect(image.getAttribute('src')).toBe(src);
    expect(image.getAttribute('width')).toBe(width);
    expect(image.getAttribute('height')).toBe(height);
    expect(existsSync(resolve('public', src.slice(1)))).toBe(true);
  });

  it('uses color branding in shared desktop/mobile navigation and reversed branding in the dark footer', () => {
    render(<MemoryRouter><Header /><Footer /></MemoryRouter>);
    const images = screen.getAllByRole('img', { name: 'Clinova International Academy' });
    expect(images.map(image => image.getAttribute('src'))).toEqual(['/brand/clinova-logo.png', '/brand/clinova-logo-white.png']);
    expect(images.every(image => image.closest('a')?.getAttribute('href') === '/')).toBe(true);
  });

  it('keeps the supplied branding on the error fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function BrokenPage(): never { throw new Error('Test-only render failure'); }
    render(<ErrorBoundary><BrokenPage /></ErrorBoundary>);
    expect(screen.getByRole('heading', { name: 'This page could not be loaded' })).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('src')).toBe('/brand/clinova-logo.png');
  });

  it('uses the brand social image by default with an approved origin', () => {
    render(<MemoryRouter><SEOProbe /></MemoryRouter>);
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://academy.example/brand/clinova-social.png');
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe('https://academy.example/brand/clinova-social.png');
  });

  it('preserves a course-specific image and resets to branding after route metadata changes', () => {
    const { rerender } = render(<MemoryRouter><SEOProbe image="https://images.example/course.jpg" /></MemoryRouter>);
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://images.example/course.jpg');
    rerender(<MemoryRouter><SEOProbe /></MemoryRouter>);
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://academy.example/brand/clinova-social.png');
  });

  it('retains preview safeguards alongside branding', () => {
    config.siteOrigin = undefined;
    render(<MemoryRouter><SEOProbe /></MemoryRouter>);
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('/brand/clinova-social.png');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('ships every icon, manifest and social image referenced by the initial HTML', () => {
    const html = readFileSync(resolve('index.html'), 'utf8');
    const paths = [...html.matchAll(/(?:href|content)="(\/(?:brand\/[^" ]+|site\.webmanifest))"/g)].map(match => match[1]);
    expect(paths).toContain('/brand/clinova-icon-32.png');
    expect(paths).toContain('/brand/clinova-icon-180.png');
    expect(paths).toContain('/brand/clinova-social.png');
    expect(paths).toContain('/site.webmanifest');
    for (const path of paths) expect(existsSync(resolve('public', path.slice(1)))).toBe(true);
    const manifest = JSON.parse(readFileSync(resolve('public/site.webmanifest'), 'utf8'));
    expect(manifest.name).toBe('Clinova International Academy');
    expect(manifest.icons).toHaveLength(2);
    for (const icon of manifest.icons) expect(existsSync(resolve('public', icon.src.slice(1)))).toBe(true);
    expect(html).not.toContain('/clinova-logo.svg');
  });
});
