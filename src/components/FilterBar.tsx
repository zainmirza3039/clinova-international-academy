interface FilterBarProps {
  filters: string[];
  active: string;
  onChange: (value: string) => void;
}

export default function FilterBar({ filters, active, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            active === filter
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-navy-600 border border-navy-200 hover:border-navy-300 hover:bg-navy-50'
          }`}
          aria-pressed={active === filter}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
