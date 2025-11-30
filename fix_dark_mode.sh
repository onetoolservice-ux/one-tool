#!/bin/bash

echo "í¼‘ Perfecting Dark Mode & Backgrounds..."

# =========================================================
# 1. TUNE THEME ENGINE (Remove the "White Fog")
# =========================================================
echo "í¾¨ Tuning Background Gradients..."
cat > app/components/layout/ThemeEngine.tsx << 'TS_END'
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeEngine() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    
    // DEFAULT (Home Page) - Tuned for Dark Mode
    // Using a lower opacity (0.08) prevents the "milky" look
    let accentColor = "99 102 241"; // Indigo
    let bgGradient = "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 70%)";

    // Category Specific (Keep these as they are "Perfect")
    if (pathname.includes("/finance")) {
      accentColor = "16 185 129"; // Emerald
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.1), transparent 60%)";
    } else if (pathname.includes("/developer")) {
      accentColor = "59 130 246"; // Blue
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1), transparent 60%)";
    } else if (pathname.includes("/health")) {
      accentColor = "244 63 94"; // Rose
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.1), transparent 60%)";
    } else if (pathname.includes("/documents")) {
      accentColor = "245 158 11"; // Amber
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.08), transparent 60%)";
    } else if (pathname.includes("/ai")) {
      accentColor = "139 92 246"; // Violet
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1), transparent 60%)";
    }

    root.style.setProperty("--primary-rgb", accentColor);
    document.body.style.backgroundImage = bgGradient;
    document.body.style.backgroundAttachment = "fixed";
    
  }, [pathname]);

  return null;
}
TS_END

# =========================================================
# 2. DEEPEN GLOBAL COLORS
# =========================================================
echo "í¶¤ Setting Deep Dark Backgrounds..."
cat > app/globals.css << 'CSS_END'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light Mode - Clean & Bright */
    --bg-app: 248 250 252;      /* Slate-50 */
    --bg-card: 255 255 255;     /* White */
    --bg-input: 255 255 255;    /* White */
    
    --text-main: 15 23 42;      /* Slate-900 */
    --text-muted: 100 116 139;  /* Slate-500 */
    
    --border-color: 226 232 240; /* Slate-200 */
  }

  .dark {
    /* Dark Mode - Deep & High Contrast */
    --bg-app: 2 6 23;           /* Slate-950 (Pitch Black/Blue) */
    --bg-card: 15 23 42;        /* Slate-900 */
    --bg-input: 30 41 59;       /* Slate-800 */
    
    --text-main: 248 250 252;   /* Slate-50 */
    --text-muted: 148 163 184;  /* Slate-400 */
    
    --border-color: 30 41 59;   /* Slate-800 */
  }
}

body {
  background-color: rgb(var(--bg-app));
  color: rgb(var(--text-main));
  font-family: var(--font-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.3s ease, color 0.3s ease;
  
  /* Ensure background covers entire viewport height */
  min-height: 100vh;
}

/* Input Polish */
input, select, textarea {
  background-color: rgb(var(--bg-input));
  color: rgb(var(--text-main));
  border: 1px solid rgb(var(--border-color));
  border-radius: 0.75rem; /* Rounded-xl look */
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
}

input:focus, select:focus, textarea:focus {
  border-color: rgb(var(--text-muted)); 
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); /* Indigo glow */
}

/* Custom Scrollbar for that "App" feel */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: rgb(var(--border-color)); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background-color: rgb(var(--text-muted)); }
CSS_END

# =========================================================
# 3. ENSURE HOME PAGE HAS NO BG OVERRIDE
# =========================================================
echo "í¿  Verifying Home Page Container..."
# Just re-saving the home page to ensure it uses 'w-full' and no extra bg classes
cat > app/page.tsx << 'TS_END'
"use client";
import ToolTile from "@/app/shared/ToolTile";
import { ALL_TOOLS, Tool } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import { useHistory } from "@/app/utils/hooks/useHistory";
import { History } from "lucide-react";
import LiveClock from "@/app/components/dashboard/LiveClock";
import SmartWidgets from "@/app/components/dashboard/SmartWidgets";
import SystemMonitor from "@/app/components/dashboard/SystemMonitor";

export default function Home() {
  const { searchQuery } = useUI();
  const { recentIds } = useHistory();

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

  const recentTools = recentIds.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean) as Tool[];
  const order = ["Finance", "Developer", "Documents", "Health", "Productivity", "Design"];

  return (
    <div className="p-6 md:p-10 w-full space-y-12 animate-in fade-in duration-700">
      
      {/* Top Section: Clock & Stats */}
      {!searchQuery && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
                <LiveClock />
            </div>
            <div className="xl:col-span-1">
                <SystemMonitor />
            </div>
        </div>
      )}
      
      {/* Mission Control */}
      {!searchQuery && <SmartWidgets />}

      {/* RECENT APPS */}
      {!searchQuery && recentTools.length > 0 && (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <History size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Jump Back In</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {recentTools.map(tool => (
                    <ToolTile key={'recent-'+tool.id} {...tool} />
                ))}
            </div>
        </div>
      )}

      {/* TOOL GRIDS */}
      <div className="space-y-20 pb-20">
        {searchQuery ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filtered.map(tool => <ToolTile key={tool.id} {...tool} />)}
             </div>
        ) : (
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

echo "âœ… Dark Mode Fixed. The 'White Fog' is gone."
