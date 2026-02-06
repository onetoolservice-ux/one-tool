'use client';

import React from 'react';
import { CATEGORY_ORDER } from '@/app/lib/tools-data';

interface CategoryNavProps {
  active: string;
  onChange: (category: string) => void;
}

// Generate categories from CATEGORY_ORDER (Analytics first)
const CATEGORIES = [
  { id: 'all', label: 'All' },
  ...CATEGORY_ORDER.map(cat => ({ id: cat.toLowerCase(), label: cat }))
];

export default function CategoryNav({ active, onChange }: CategoryNavProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [showLeftShadow, setShowLeftShadow] = React.useState(false);
  const [showRightShadow, setShowRightShadow] = React.useState(false);

  // Handle overflow shadows
  const updateShadows = () => {
    const el = containerRef.current;
    if (!el) return;
    setShowLeftShadow(el.scrollLeft > 4);
    setShowRightShadow(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  React.useEffect(() => {
    updateShadows();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateShadows, { passive: true });
    window.addEventListener('resize', updateShadows);
    return () => {
      el.removeEventListener('scroll', updateShadows);
      window.removeEventListener('resize', updateShadows);
    };
  }, []);

  return (
    <div className="relative">
      {showLeftShadow && <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none bg-gradient-to-r from-black/6 dark:from-white/6 z-40" />}
      <div ref={containerRef} className="flex items-center gap-1 overflow-x-auto pb-2 px-6 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0F111A] sticky top-0 z-40 no-scrollbar">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onChange(category.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${
              active === category.id
                ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
      {showRightShadow && <div className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none bg-gradient-to-l from-black/6 dark:from-white/6 z-40" />}
    </div>
  );
}
