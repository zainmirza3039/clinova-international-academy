import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1.5">
            {item.to && !isLast ? (
              <Link to={item.to} className="text-navy-500 hover:text-clinical-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-navy-800 font-medium' : 'text-navy-500'} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-navy-300" />}
          </div>
        );
      })}
    </nav>
  );
}
