import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

export default function NotFoundPage() {
  useSEO({
    title: 'Page Not Found',
    description: 'The page you are looking for may have moved or no longer exists.',
    noindex: true,
  });

  return (
    <section className="min-h-screen flex items-center justify-center bg-navy-50 pt-20">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="font-heading text-7xl md:text-9xl font-extrabold text-navy-200 mb-4">404</div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-navy-900 mb-3">Page Not Found</h1>
        <p className="text-navy-500 leading-relaxed mb-8">
          The page you're looking for may have moved or no longer exists. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            to="/programmes"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-navy-800 font-semibold rounded-lg border border-navy-200 hover:border-navy-300 transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Programmes
          </Link>
        </div>
      </div>
    </section>
  );
}
