"use client";
import Link from "next/link";
import { getTheme } from "@/app/lib/theme-config";
import { Star } from "lucide-react";
import React, { useState, useEffect } from "react";
import { safeLocalStorage } from "@/app/lib/utils/storage";
import { getIconComponent, type IconName } from "@/app/lib/utils/icon-mapper";

const TOOL_ICON_BG: Record<string, string> = {
  // Business OS
  'biz-dashboard':    'bg-gradient-to-br from-blue-600 to-indigo-600',
  'biz-daybook':      'bg-gradient-to-br from-emerald-500 to-teal-600',
  'biz-parties':      'bg-gradient-to-br from-violet-500 to-purple-600',
  'biz-invoices':     'bg-gradient-to-br from-amber-500 to-orange-500',
  'biz-products':     'bg-gradient-to-br from-cyan-500 to-blue-500',
  'biz-inventory':    'bg-gradient-to-br from-teal-500 to-emerald-500',
  'biz-stock-entry':  'bg-gradient-to-br from-sky-500 to-cyan-500',
  'biz-reports':      'bg-gradient-to-br from-indigo-500 to-blue-600',
  'biz-outstanding':  'bg-gradient-to-br from-rose-500 to-red-600',
  'biz-purchases':    'bg-gradient-to-br from-purple-500 to-violet-600',
  'biz-quotations':   'bg-gradient-to-br from-sky-400 to-blue-500',
  'biz-staff':        'bg-gradient-to-br from-pink-500 to-rose-500',
  'biz-gst':          'bg-gradient-to-br from-green-500 to-emerald-600',
  'biz-cashflow':     'bg-gradient-to-br from-lime-500 to-green-500',
  'biz-loans':        'bg-gradient-to-br from-red-500 to-rose-600',
  // Personal Finance
  'pf-statement-manager':  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'pf-financial-position': 'bg-gradient-to-br from-emerald-500 to-teal-500',
  'pf-cash-flow':          'bg-gradient-to-br from-teal-500 to-cyan-500',
  'pf-tx-explorer':        'bg-gradient-to-br from-violet-500 to-purple-600',
  'pf-expenditure':        'bg-gradient-to-br from-rose-500 to-pink-500',
  'pf-expenses':           'bg-gradient-to-br from-red-500 to-rose-600',
  'pf-commitments':        'bg-gradient-to-br from-amber-500 to-orange-500',
  'pf-recurring':          'bg-gradient-to-br from-cyan-500 to-sky-500',
  'pf-top-merchants':      'bg-gradient-to-br from-orange-500 to-amber-600',
  'pf-big-spends':         'bg-gradient-to-br from-red-600 to-orange-500',
  'pf-rules':              'bg-gradient-to-br from-slate-600 to-slate-800',
  'pf-income-sources':     'bg-gradient-to-br from-green-500 to-emerald-600',
  'pf-behavior':           'bg-gradient-to-br from-purple-500 to-violet-600',
  'pf-savings-trend':      'bg-gradient-to-br from-lime-500 to-green-500',
  'pf-month-compare':      'bg-gradient-to-br from-sky-500 to-blue-600',
  'pf-heatmap':            'bg-gradient-to-br from-fuchsia-500 to-pink-500',
  'pf-subscriptions':      'bg-gradient-to-br from-indigo-500 to-blue-500',
  'pf-labels':             'bg-gradient-to-br from-pink-500 to-rose-500',
  'pf-liability':          'bg-gradient-to-br from-yellow-500 to-amber-600',
  'pf-ai-analyst':         'bg-gradient-to-br from-violet-600 to-fuchsia-500',
  // CRM
  'crm-people':       'bg-gradient-to-br from-violet-500 to-purple-600',
  'biz-crm-pipeline': 'bg-gradient-to-br from-indigo-500 to-blue-600',
};

export default function ToolTile({ tool }: { tool: any }) {
  const theme = getTheme(tool.category);
  const href = tool.href || `/tools/${tool.category}/${tool.id}`;
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const favs = safeLocalStorage.getItem<string[]>("onetool-favorites", []);
    setIsFav((favs || []).includes(tool.id));
  }, [tool.id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    const favs = safeLocalStorage.getItem<string[]>("onetool-favorites", []) || [];
    const newFavs = favs.includes(tool.id) 
      ? favs.filter((id: string) => id !== tool.id) 
      : [...favs, tool.id];
    
    if (safeLocalStorage.setItem("onetool-favorites", newFavs)) {
      setIsFav(!isFav);
      window.dispatchEvent(new Event("storage"));
    }
  };

  // Handle icon formats: string key, component function, or already-instantiated React element
  const isElementIcon = React.isValidElement(tool.icon);
  const IconComponent = typeof tool.icon === 'string'
    ? getIconComponent(tool.icon as IconName)
    : (typeof tool.icon === 'function' ? (tool.icon as React.ComponentType<any>) : undefined);

  return (
    <Link href={href} className="group relative block h-full" aria-label={`Open ${tool.name} tool`}>
      <article className={`relative h-full p-5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl ${theme.shadow}`}>
        <div className="flex items-start justify-between mb-5">
          <div className={`w-14 h-14 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-2xl text-white shadow-md transform group-hover:scale-110 transition-transform duration-300 ${TOOL_ICON_BG[tool.id] ?? theme.iconBg}`}>
            {isElementIcon
              ? React.cloneElement(tool.icon as React.ReactElement<any>, { size: 20 } as any)
              : (IconComponent ? <IconComponent size={20} /> : null)}
          </div>
          <div className="flex items-center gap-2">
             {tool.status === "New" && <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 border border-slate-200 text-slate-500">New</span>}
             <button onClick={toggleFav} className={`p-1.5 rounded-lg transition-colors hover:bg-slate-100 ${isFav ? 'text-amber-400' : 'text-slate-300 hover:text-slate-500'}`}><Star size={18} fill={isFav ? "currentColor" : "none"} /></button>
          </div>
        </div>
        <div className="space-y-2 flex-grow">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-slate-700 transition-colors">{tool.name}</h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2">{tool.desc}</p>
        </div>
        <div className={`absolute bottom-0 left-8 right-8 h-1 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${theme.gradient}`} />
      </article>
    </Link>
  );
}
