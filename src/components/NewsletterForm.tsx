import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsletterForm() {
  return (
    <section className="newsletter-panel bg-navy-50 border border-navy-100 p-8 md:p-10">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 shrink-0 bg-teal-600 text-white flex items-center justify-center">
          <BookOpen className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="max-w-2xl">
          <h2 className="font-heading text-xl md:text-2xl font-bold text-navy-900">Continue exploring the learning library</h2>
          <p className="mt-3 text-sm text-navy-600 leading-relaxed">
            Browse educational articles and study guides, or review the contact information if you need to ask about a specific topic.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/resources" className="inline-flex items-center gap-2 bg-clinical-600 px-5 py-3 text-sm font-semibold text-white hover:bg-clinical-700">
              Browse resources<ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 border border-navy-200 bg-white px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-100">
              Contact information<ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
