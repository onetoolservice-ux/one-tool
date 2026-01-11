"use client";
import Link from "next/link";
import { getTheme } from "@/app/lib/theme-config";
import { Star } from "lucide-react";
import React, { useState, useEffect } from "react";
import { safeLocalStorage } from "@/app/lib/utils/storage";

export default function ToolTile({ tool }: { tool: any }) {
  const theme = getTheme(tool.category);
  const href = tool.href || `/tools/${tool.category}/${tool.id}`;
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const favs = safeLocalStorage.getItem<string[]>("onetool-favorites", []);
    setIsFav(favs.includes(tool.id));
  }, [tool.id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    const favs = safeLocalStorage.getItem<string[]>("onetool-favorites", []);
    const newFavs = favs.includes(tool.id) 
      ? favs.filter((id: string) => id !== tool.id) 
      : [...favs, tool.id];
    
    if (safeLocalStorage.setItem("onetool-favorites", newFavs)) {
      setIsFav(!isFav);
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <Link href={href} className="group relative block h-full" aria-label={`Open ${tool.name} tool`}>
      <article className={`relative h-full p-5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl ${theme.shadow}`}>
        <div className="flex items-start justify-between mb-5">
          <div className={`w-14 h-14 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-2xl text-white shadow-md transform group-hover:scale-110 transition-transform duration-300 ${theme.iconBg}`}>
            {tool.icon}
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
