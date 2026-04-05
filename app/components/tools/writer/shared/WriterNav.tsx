'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PenLine, BarChart3, LayoutDashboard, Lightbulb,
  Download, Sparkles, FileText, ChevronRight
} from 'lucide-react';
import {
  loadWriterStore, onWriterStoreUpdate, getActiveDocument, getWordCount, WriterStore
} from '../writer-store';

const NAV_ITEMS = [
  { id: 'writer-ideas', label: 'Ideas', href: '/tools/writer/writer-ideas', icon: Lightbulb },
  { id: 'writer-planner', label: 'Planner', href: '/tools/writer/writer-planner', icon: LayoutDashboard },
  { id: 'writer-studio', label: 'Studio', href: '/tools/writer/writer-studio', icon: PenLine },
  { id: 'writer-analyzer', label: 'Analyzer', href: '/tools/writer/writer-analyzer', icon: BarChart3 },
  { id: 'writer-headline', label: 'Headlines', href: '/tools/writer/writer-headline', icon: Sparkles },
  { id: 'writer-export', label: 'Export', href: '/tools/writer/writer-export', icon: Download },
];

export default function WriterNav() {
  const pathname = usePathname();
  const [store, setStore] = useState<WriterStore | null>(null);

  useEffect(() => {
    setStore(loadWriterStore());
    return onWriterStoreUpdate(() => setStore(loadWriterStore()));
  }, []);

  const activeDoc = store ? getActiveDocument(store) : null;
  const wordCount = activeDoc ? getWordCount(activeDoc.content) : 0;

  return (
    <div className="w-full bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
      {/* Active doc bar */}
      <div className="px-4 py-2 flex items-center gap-2 text-xs border-b border-amber-100 dark:border-amber-900">
        <FileText size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-amber-700 dark:text-amber-300 font-medium truncate max-w-[200px]">
          {activeDoc ? activeDoc.title : 'No document selected'}
        </span>
        {activeDoc && (
          <>
            <ChevronRight size={10} className="text-amber-400 shrink-0" />
            <span className="text-amber-600 dark:text-amber-400">
              {wordCount.toLocaleString()} words
            </span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium capitalize
              bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
              {activeDoc.status}
            </span>
          </>
        )}
        <div className="ml-auto text-amber-500 dark:text-amber-500 font-semibold tracking-wide">
          Writer's OS
        </div>
      </div>

      {/* Tool navigation */}
      <div className="flex overflow-x-auto scrollbar-hide">
        {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
          const isActive = pathname?.includes(id);
          return (
            <Link
              key={id}
              href={href}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${isActive
                  ? 'border-amber-500 text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/40'
                  : 'border-transparent text-amber-600/70 dark:text-amber-400/60 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
