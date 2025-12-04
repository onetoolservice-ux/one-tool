#!/bin/bash

echo "âœ¨ Applying 'Vibrant Enterprise' Polish..."

# 1. ADD CUSTOM SCROLLBAR (Global CSS)
# This makes the scrollbar look thin and modern (Dark/Light compatible)
cat > app/globals.css << 'CSS_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-start-rgb));
}

/* CUSTOM SCROLLBAR */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1; /* Slate-300 */
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; /* Slate-400 */
  border: 2px solid transparent;
  background-clip: content-box;
}

.dark ::-webkit-scrollbar-thumb {
  background: #334155; /* Slate-700 */
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #475569; /* Slate-600 */
}

/* UTILS */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
CSS_EOF

# 2. CREATE PROFESSIONAL FOOTER
mkdir -p app/components/layout
cat > app/components/layout/Footer.tsx << 'FOOTER_EOF'
import Link from "next/link";
import { Github, Twitter, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-sm mt-auto">
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">One Tool Enterprise</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed">
              The privacy-first utility suite for professionals. No data collection, no servers, just pure client-side tools. Built for speed and security.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/tools/finance" className="hover:text-indigo-600 transition">Finance Tools</Link></li>
              <li><Link href="/tools/developer" className="hover:text-indigo-600 transition">Developer Tools</Link></li>
              <li><Link href="/tools/documents" className="hover:text-indigo-600 transition">PDF & Docs</Link></li>
              <li><Link href="/tools/health" className="hover:text-indigo-600 transition">Health Suite</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/privacy" className="hover:text-indigo-600 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-600 transition">Terms of Service</Link></li>
              <li><a href="mailto:support@onetool.co" className="hover:text-indigo-600 transition">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            Â© {currentYear} One Tool Enterprise. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
              <Github size={20} />
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
FOOTER_EOF

# 3. UPDATE HOME PAGE (With Vibrant "Aurora" Backgrounds)
# We are enhancing the background divs to be more colorful and positioned better.
cat > app/page.tsx << 'HOME_EOF'
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, Search, Clock, Layers, Star, ChevronRight } from "lucide-react";
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
    const loadFavs = () => {
      const saved = localStorage.getItem("onetool-favorites");
      if(saved) setFavorites(JSON.parse(saved));
    };
    loadFavs();
    window.addEventListener("storage", loadFavs);
    return () => window.removeEventListener("storage", loadFavs);
  }, []);

  const structuredTools = useMemo(() => {
    const cats = ["Finance", "Documents", "Developer", "Health", "Design", "Converters", "AI"];
    
    return cats.map(catName => {
      const toolsInCat = ALL_TOOLS.filter(t => t.category === catName);
      if (toolsInCat.length === 0) return null;

      const subcats: Record<string, typeof ALL_TOOLS> = {};
      toolsInCat.forEach(tool => {
        const sub = tool.subcategory || "General";
        if (!subcats[sub]) subcats[sub] = [];
        subcats[sub].push(tool);
      });

      return { name: catName, subcategories: subcats };
    }).filter(Boolean);
  }, []);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const query = searchQuery || "";
      const name = tool.name || "";
      const desc = tool.desc || "";
      const matchesSearch = name.toLowerCase().includes(query.toLowerCase()) || 
                            desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const favoriteTools = ALL_TOOLS.filter(t => favorites.includes(t.id));

  if (!isClient) return <div className="min-h-screen bg-slate-50 dark:bg-[#020617]" />;

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-[#0B1120] relative overflow-hidden">
      
      {/* í¾¨ ENTERPRISE AURORA BACKGROUND (The "Green Shadow" Enhanced) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-50 pointer-events-none">
        {/* Top Left: Blue/Indigo Glow */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        
        {/* Top Right: Emerald/Green Glow (The one you liked) */}
        <div className="absolute top-[-10%] -right-[10%] w-[60vw] h-[60vw] bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-[100px]" />
        
        {/* Bottom Center: Rose/Purple Glow (Subtle warmth) */}
        <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="w-full px-6 space-y-10 pt-8 pb-24 max-w-[1600px] mx-auto relative z-10">
        
        {/* HERO SECTION */}
        <div className="space-y-8">
           <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                 One Tool <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">Enterprise</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                 Privacy-first utility suite. No login. Local storage.
              </p>
           </div>
           
           <CommandMenu />
           <SmartWidgets />
        </div>
        
        {/* RECENTLY USED */}
        {activeCategory === "All" && !searchQuery && recentTools.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
                  <Clock size={16} className="text-indigo-600 dark:text-indigo-400"/>
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Recent Activity</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {recentTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* FAVORITES */}
        {activeCategory === "All" && !searchQuery && favorites.length > 0 && (
          <section>
              <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-amber-500 fill-amber-500"/>
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Starred Tools</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favoriteTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* MAIN CATEGORIES */}
        {!searchQuery && activeCategory === "All" ? (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-16">
             {structuredTools.map((cat: any) => (
               <div key={cat.name} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {cat.name}
                     </h2>
                     <Link href={`/tools/${cat.name.toLowerCase()}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 group">
                        View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                     </Link>
                  </div>
                  
                  <div className="space-y-8">
                    {Object.entries(cat.subcategories).map(([subName, tools]: [string, any]) => (
                       <div key={subName}>
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 pl-1 flex items-center gap-2">
                            {subName}
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50"></div>
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {tools.map((tool: any) => (
                              <ToolTile key={tool.id} tool={tool} />
                            ))}
                          </div>
                       </div>
                    ))}
                  </div>
               </div>
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {filteredTools.map((tool) => <ToolTile key={tool.id} tool={tool} />)}
             {filteredTools.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500">
                   No tools found. Try a different keyword.
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
HOME_EOF

# 4. INJECT FOOTER INTO LAYOUT
LAYOUT_FILE="app/layout.tsx"
if ! grep -q "Footer" "$LAYOUT_FILE"; then
  sed -i '1i import Footer from "@/app/components/layout/Footer";' "$LAYOUT_FILE"
  # Insert Footer before closing body
  sed -i '/<\/body>/i \        <Footer />' "$LAYOUT_FILE"
fi

echo "âœ… Vibrant Enterprise Polish Applied."
echo "í±‰ Restart 'npm run dev' to see the new colors and footer!"
