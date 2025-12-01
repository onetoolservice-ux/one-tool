"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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

  const filteredTools = ALL_TOOLS.filter(tool => {
    // SAFETY CHECK: Ensure tool exists
    if (!tool) return false;

    // Handle 'name' vs 'title' inconsistency safely
    const name = tool.name || (tool as any).title || "";
    const desc = tool.desc || "";
    
    // Safe lowercase check
    const safeName = typeof name === 'string' ? name.toLowerCase() : "";
    const safeDesc = typeof desc === 'string' ? desc.toLowerCase() : "";
    const safeQuery = query.toLowerCase();

    return safeName.includes(safeQuery) || safeDesc.includes(safeQuery);
  });

  const handleSelect = (toolId: string, href: string) => {
    if (!href) return; // Safety check
    addRecent(toolId);
    setOpen(false);
    router.push(href);
  };

  // Helper to render icon safely
  const renderIcon = (icon: any) => {
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function') {
       const IconComp = icon;
       return <IconComp size={20} />;
    }
    return null;
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
                  onClick={() => handleSelect(tool.id, tool.href || "")}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                >
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 group-hover:text-indigo-500 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                    {renderIcon(tool.icon)}
                  </div>
                  <div className="flex-1">
                     <div className="font-medium">{tool.name || (tool as any).title || "Unnamed Tool"}</div>
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
