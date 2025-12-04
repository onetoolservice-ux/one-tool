"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useRecentTools } from "@/app/hooks/useRecentTools";
import { useSmartClipboard } from "@/app/hooks/useSmartClipboard";
import * as Icons from "lucide-react";

export default function GlobalCommand() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const { addRecent } = useRecentTools();
  const { suggestion, analyzeClipboard, executeSuggestion } = useSmartClipboard();

  // Toggle on Ctrl+K or Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => {
           if (!open) analyzeClipboard(); // Check clipboard when opening
           return !open;
        });
      }
      if (e.key === "/" && !open) {
        e.preventDefault();
        setOpen(true);
        analyzeClipboard();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [analyzeClipboard]);

  const filteredTools = ALL_TOOLS.filter(tool => {
    if (!tool) return false;
    const name = tool.name || (tool as any).title || "";
    const desc = tool.desc || "";
    const safeQuery = query.toLowerCase();
    return name.toLowerCase().includes(safeQuery) || desc.toLowerCase().includes(safeQuery);
  });

  const handleSelect = (toolId: string, href: string) => {
    if (!href) return;
    addRecent(toolId);
    setOpen(false);
    router.push(href);
  };

  const handleSmartClick = () => {
    executeSuggestion();
    setOpen(false);
  };

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
      <div className="absolute inset-0" onClick={() => setOpen(false)} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
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

        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
          
          {/* ✨ SMART SUGGESTION (The Magic Part) */}
          {suggestion && !query && (
            <div className="mb-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                 <Sparkles size={12}/> Smart Suggestion
              </div>
              <button
                onClick={handleSmartClick}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 hover:border-indigo-300 transition-all group"
              >
                <div className="p-2 bg-white dark:bg-indigo-900 rounded-md text-indigo-600 shadow-sm">
                   {/* Dynamic Icon Render */}
                   {(() => {
                      const Icon = (Icons as any)[suggestion.icon] || Sparkles;
                      return <Icon size={20} />;
                   })()}
                </div>
                <div className="flex-1">
                   <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     {suggestion.action}
                     <span className="text-[10px] bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-1.5 rounded-full">DETECTED</span>
                   </div>
                   <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-mono mt-0.5">
                     "{suggestion.data.substring(0, 40)}..."
                   </div>
                </div>
                <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>
          )}

          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No results found.</div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tools</div>
              {filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool.id, tool.href || "")}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-500 group-hover:text-indigo-500 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                    {renderIcon(tool.icon)}
                  </div>
                  <div className="flex-1">
                     <div className="font-medium">{tool.name || (tool as any).title || "Unnamed Tool"}</div>
                     <div className="text-xs text-slate-400 line-clamp-1">{tool.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/50 px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
           <span><strong>ProTip:</strong> Copy text before opening to see magic.</span>
           <span>One Tool Enterprise</span>
        </div>
      </div>
    </div>
  );
}
