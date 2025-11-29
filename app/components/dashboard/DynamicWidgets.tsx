"use client";
import dynamic from 'next/dynamic';

const SmartWidgets = dynamic(() => import('./SmartWidgets'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
      <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
      <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
      <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
      <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
    </div>
  ),
});

export default SmartWidgets;
