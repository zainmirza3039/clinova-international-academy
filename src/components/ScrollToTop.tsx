import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const pathnameChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;
    if (hash) {
      let frameId: number | undefined;
      const observer = new MutationObserver(() => {
        const target = document.getElementById(hash.slice(1));
        if (!target) return;
        observer.disconnect();
        window.clearTimeout(timeoutId);
        frameId = window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      });
      const timeoutId = window.setTimeout(() => observer.disconnect(), 5000);
      const target = document.getElementById(hash.slice(1));
      if (target) {
        observer.disconnect();
        window.clearTimeout(timeoutId);
        frameId = window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        return () => {
          if (frameId !== undefined) window.cancelAnimationFrame(frameId);
        };
      }
      observer.observe(document.getElementById('main-content') ?? document.body, { childList: true, subtree: true });
      return () => {
        observer?.disconnect();
        window.clearTimeout(timeoutId);
        if (frameId !== undefined) window.cancelAnimationFrame(frameId);
      };
    }
    window.scrollTo(0, 0);
    if (pathnameChanged) document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return null;
}
