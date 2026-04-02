interface FilterTabsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterTabs<T extends string>({ options, value, onChange, className = "" }: FilterTabsProps<T>) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            value === option
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
