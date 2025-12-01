#!/bin/bash

echo "âš¡ Installing Enterprise Power Features (Command Palette & History)..."

# 1. Create the "Smart History" Hook
mkdir -p app/hooks
cat > app/hooks/useRecentTools.ts << 'HOOK_EOF'
"use client";
import { useState, useEffect } from "react";
import { ALL_TOOLS } from "@/app/lib/tools-data";

export function useRecentTools() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("onetool-recents");
      if (saved) setRecents(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const addRecent = (id: string) => {
    try {
      const current = JSON.parse(localStorage.getItem("onetool-recents") || "[]");
      // Remove if exists, then add to front (LRU cache style)
      const updated = [id, ...current.filter((x: string) => x !== id)].slice(0, 4);
      localStorage.setItem("onetool-recents", JSON.stringify(updated));
      setRecents(updated);
    } catch (e) {}
  };

  const recentTools = ALL_TOOLS.filter(t => recents.includes(t.id))
    .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));

  return { recentTools, addRecent };
}
HOOK_EOF

# 2. Create the Global Command Palette Component
# This is a sophisticated modal that handles keyboard shortcuts and search.
mkdir -p app/components/layout
cat > app/components/layout/GlobalCommand.tsx << 'CMD_EOF'
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Command, Calculator, FileText, Code, CreditCard } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useRecentTools } from "@/app/hooks/useRecentTools";

export default function GlobalCommand() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const { addRecent } = useRecentTools();

  // Toggle on Ctrl+K or Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredTools = ALL_TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(query.toLowerCase()) ||
    tool.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (toolId: string, href: string) => {
    addRecent(toolId);
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setOpen(false)} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-4">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            autoFocus
            className="flex-1 bg-transparent outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">ESC</div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No results found.</div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tools</div>
              {filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool.id, tool.href)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                >
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 group-hover:text-indigo-500 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                    {tool.icon} 
                    {/* Note: If tool.icon is a component instance, this renders fine. */}
                  </div>
                  <div className="flex-1">
                     <div className="font-medium">{tool.name}</div>
                     <div className="text-xs text-slate-400 line-clamp-1">{tool.desc}</div>
                  </div>
                  <span className="text-xs text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100">Jump to</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950/50 px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
           <span><strong>ProTip:</strong> Use arrow keys to navigate</span>
           <span>One Tool Enterprise</span>
        </div>
      </div>
    </div>
  );
}
CMD_EOF

# 3. Inject GlobalCommand into Layout
# It needs to be at the root level so it works on every page.
LAYOUT_FILE="app/layout.tsx"
if ! grep -q "GlobalCommand" "$LAYOUT_FILE"; then
  sed -i '1i import GlobalCommand from "@/app/components/layout/GlobalCommand";' "$LAYOUT_FILE"
  # Insert right after body tag start
  sed -i '/<body/a \        <GlobalCommand />' "$LAYOUT_FILE"
fi

# 4. Update Home Page to show "Recently Used"
# We are patching app/page.tsx to include the Recents section
cat > app/page.tsx << 'HOME_PAGE_EOF'
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, LayoutGrid, Star, Clock } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import CommandMenu from "@/app/components/layout/CommandMenu";
import SmartWidgets from "@/app/components/dashboard/SmartWidgets";
import ToolTile from "@/app/shared/ToolTile";
import { useRecentTools } from "@/app/hooks/useRecentTools";

export default function Home() {
  const { searchQuery, activeCategory } = useUI();
  const [isClient, setIsClient] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { recentTools } = useRecentTools();

  useEffect(() => { 
    setIsClient(true);
    const saved = localStorage.getItem("onetool-favorites");
    if(saved) setFavorites(JSON.parse(saved));
  }, []);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const query = searchQuery || "";
      // Safe check for name/desc
      const name = tool.name || "";
      const desc = tool.desc || "";
      const matchesSearch = name.toLowerCase().includes(query.toLowerCase()) || 
                            desc.toLowerCase().includes(query.toLowerCase());
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
      
      {/* RECENTLY USED (New Enterprise Feature) */}
      {activeCategory === "All" && !searchQuery && recentTools.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
                <Clock size={18} className="text-indigo-500"/>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pick up where you left off</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentTools.map(tool => (
                    <ToolTile key={tool.id} tool={tool} />
                ))}
            </div>
            <div className="h-[1px] bg-slate-200 dark:bg-slate-800 w-full mt-10"></div>
        </section>
      )}

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
            {activeCategory === "All" ? "All Tools" : \`\${activeCategory} Tools\`}
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
HOME_PAGE_EOF

echo "âœ… Enterprise Power Features Installed."
echo "í±‰ Try pressing Ctrl+K on your keyboard!"
