#!/bin/bash

echo "íº€ Applying Enterprise UI to all pages..."

# 1. Update Category Page (app/tools/[category]/page.tsx)
# This fixes the "reading 'category'" error by correctly passing the tool prop.
cat > app/tools/\[category\]/page.tsx << 'CAT_EOF'
"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { LayoutGrid } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import ToolTile from "@/app/shared/ToolTile"; // Use the new component

const capitalize = (s: string) => {
  if (!s) return "";
  try {
    const decoded = decodeURIComponent(s);
    return decoded.charAt(0).toUpperCase() + decoded.slice(1);
  } catch (e) {
    return s;
  }
};

type Params = Promise<{ category: string }>;

export default function CategoryPage({ params }: { params: Params }) {
  const resolvedParams = use(params);
  const category = resolvedParams?.category;

  const categoryTools = useMemo(() => {
    if (!category) return [];
    // Handle "all" category if needed, otherwise filter strictly
    const decodedCat = decodeURIComponent(category).toLowerCase();
    if (decodedCat === 'all') return ALL_TOOLS;
    return ALL_TOOLS.filter(t => t.category.toLowerCase() === decodedCat);
  }, [category]);

  if (!category) return null;

  if (categoryTools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
          <LayoutGrid className="text-slate-400" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Category Not Found</h2>
        <Link href="/" className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 min-h-screen">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white capitalize">{capitalize(category)}</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {capitalize(category)} <span className="text-slate-400 dark:text-slate-600">Tools</span>
        </h1>
      </div>

      {/* Grid using the new ToolTile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoryTools.map((tool) => (
          // CORRECT USAGE: Passing the 'tool' object as a prop named 'tool'
          <ToolTile key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
CAT_EOF

# 2. Update Home Page (app/page.tsx)
# Applies the new ToolTile to the main dashboard for a consistent look.
cat > app/page.tsx << 'HOME_EOF'
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, LayoutGrid, Star } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import CommandMenu from "@/app/components/layout/CommandMenu";
import SmartWidgets from "@/app/components/dashboard/SmartWidgets";
import ToolTile from "@/app/shared/ToolTile";

export default function Home() {
  const { searchQuery, activeCategory } = useUI();
  const [isClient, setIsClient] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => { 
    setIsClient(true);
    const saved = localStorage.getItem("onetool-favorites");
    if(saved) setFavorites(JSON.parse(saved));
  }, []);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const query = searchQuery || "";
      const matchesSearch = tool.name.toLowerCase().includes(query.toLowerCase()) || 
                            tool.desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const favoriteTools = ALL_TOOLS.filter(t => favorites.includes(t.id));

  if (!isClient) return <div className="min-h-screen" />;

  return (
    <div className="w-full px-6 space-y-10 pt-4 pb-20 max-w-[1600px] mx-auto">
      <CommandMenu />
      <SmartWidgets />
      
      {/* FAVORITES SECTION */}
      {activeCategory === "All" && !searchQuery && favorites.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
                <Star size={18} className="text-amber-400 fill-amber-400"/>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Favorites</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {favoriteTools.map(tool => (
                    <ToolTile key={tool.id} tool={tool} />
                ))}
            </div>
            <div className="h-[1px] bg-slate-200 dark:bg-slate-800 w-full mt-10"></div>
        </section>
      )}

      {/* MAIN GRID */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
          <LayoutGrid size={18} className="text-slate-400 dark:text-slate-500"/>
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {activeCategory === "All" ? "All Tools" : `${activeCategory} Tools`}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <ToolTile key={tool.id} tool={tool} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
              <Sparkles className="mx-auto mb-3 opacity-30" size={32}/>
              <p>No tools found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
HOME_EOF

echo "âœ… UI Upgrade Applied successfully."
echo "í±‰ Run 'npm run dev' to see the new Enterprise UI!"
