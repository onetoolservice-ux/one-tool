#!/bin/bash

echo "í·¹ Removing Redundant Home Search & Greeting..."

cat > app/page.tsx << 'TS_END'
"use client";
import ToolTile from "@/app/shared/ToolTile";
import { ALL_TOOLS, Tool } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";

export default function Home() {
  // We still use the global search query from the Navbar
  const { searchQuery } = useUI();

  const filtered = ALL_TOOLS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filtered.reduce((acc, tool) => {
    const cat = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  const order = ["Finance", "Developer", "Documents", "Health", "Productivity", "Design"];

  return (
    <div className="p-6 md:p-10 max-w-[1800px] mx-auto animate-in fade-in duration-500">
      
      {/* No Hero or Local Search anymore - just the tools */}
      
      <div className="space-y-16 pt-4">
        {searchQuery ? (
             // Search Results View
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filtered.map(tool => <ToolTile key={tool.id} {...tool} />)}
                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        <p className="text-lg">No tools found for "{searchQuery}"</p>
                    </div>
                )}
             </div>
        ) : (
            // Categorized View
            order.map((cat, i) => grouped[cat] && (
                <div key={cat} className="space-y-6" style={{animationDelay: `${i * 50}ms`}}>
                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {cat}
                        </h2>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-full">{grouped[cat].length}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {grouped[cat].map(tool => <ToolTile key={tool.id} {...tool} />)}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
TS_END

echo "âœ… Home Page Simplified (Grid Only)."
