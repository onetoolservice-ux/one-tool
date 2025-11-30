"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Wallet, FileText, Heart, Zap, Palette, 
  Terminal, Settings, LayoutGrid, ShieldCheck
} from "lucide-react";

const MENU = [
  { title: "Dashboard", href: "/", icon: <LayoutGrid size={18}/> },
  { title: "Finance", href: "/tools/finance", icon: <Wallet size={18}/> },
  { title: "Documents", href: "/tools/documents", icon: <FileText size={18}/> },
  { title: "Health", href: "/tools/health", icon: <Heart size={18}/> },
  { title: "Productivity", href: "/tools/productivity", icon: <Zap size={18}/> },
  { title: "Design", href: "/tools/design", icon: <Palette size={18}/> },
  { title: "Developer", href: "/tools/developer", icon: <Terminal size={18}/> },
];

// Sidebar now accepts no children and only renders the navigation part
export default function Sidebar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Renders the fixed sidebar for desktop views only (lg:flex)
  if (isHome) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-64px)] fixed top-16 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 shrink-0">
      
      {/* Nav Links (Scrollable) */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Apps</p>
        {MENU.map((item) => {
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname.startsWith(item.href);
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }
              `}
            >
              {item.icon}
              {item.title}
            </Link>
          )
        })}
      </div>

      {/* Footer System Links */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0 space-y-1">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
           <Settings size={18}/> Settings
        </Link>
      </div>
    </aside>
  );
}
