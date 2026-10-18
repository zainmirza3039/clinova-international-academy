import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { FAQ } from '@/data/types';

export default function FAQAccordion({ items }: { items: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-navy-100 overflow-hidden transition-shadow duration-200 hover:shadow-sm"
          >
            <button
              className="w-full flex items-center justify-between gap-4 p-5 text-left"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              id={`faq-trigger-${item.id}`}
              aria-expanded={isOpen}
              aria-controls={`faq-content-${item.id}`}
            >
              <span className="font-heading font-semibold text-navy-900 text-base">{item.question}</span>
              <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-navy-50 text-navy-600">
                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            <div
              id={`faq-content-${item.id}`}
              role="region"
              aria-labelledby={`faq-trigger-${item.id}`}
              hidden={!isOpen}
              className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
              <div className="px-5 pb-5 text-sm text-navy-600 leading-relaxed">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
