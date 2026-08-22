'use client';

export interface TabsProps {
  tabs: ReadonlyArray<{ id: string; label: string }>;
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

/** Segmented control — the legacy table/cards view toggle. */
export function Tabs({ tabs, activeId, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex items-center gap-2 theme-bg-glass rounded-lg p-1 sm:p-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeId === tab.id ? 'accent-gradient text-white' : 'theme-text-muted'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
