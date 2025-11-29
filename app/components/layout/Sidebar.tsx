"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Wallet, FileText, Heart, Zap, Palette, 
  Terminal, Settings, Menu, X, ChevronRight, LayoutGrid,
  ShieldCheck
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

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const isHome = pathname === "/";

  if (!mounted) return <div className="min-h-screen bg-background dark:bg-surface dark:bg-slate-950">{children}</div>;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface dark:bg-slate-800 dark:bg-surface/90 backdrop-blur-md border-b border-line dark:border-slate-700 dark:border-slate-800 z-50 flex items-center px-4 justify-between">
        <Link href="/" className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[rgb(117,163,163)] flex items-center justify-center text-white text-xs">OT</div>
          One Tool
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted dark:text-muted/70 dark:text-muted/70">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar - Fixes Open Space at bottom */}
      {!isHome && (
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface dark:bg-slate-800 dark:bg-surface border-r border-line dark:border-slate-700 dark:border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Brand/Fixed Top */}
          <div className="h-16 flex items-center px-6 border-b border-slate-50 flex-shrink-0">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[rgb(117,163,163)] text-white flex items-center justify-center font-bold text-sm  ">OT</div>
              <span className="font-bold text-main dark:text-slate-100 dark:text-slate-200 text-lg tracking-tight">One Tool</span>
            </Link>
          </div>

          {/* Nav (Scrollable) */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <p className="px-2 text-xs font-bold text-muted/70 uppercase tracking-wider mb-2">Tools</p>
            {MENU.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive ? "bg-teal-50 text-teal-700" : "text-muted dark:text-muted/70 dark:text-muted/70 hover:bg-background dark:bg-surface dark:bg-slate-950 hover:text-main dark:text-slate-50 dark:text-slate-100"
                  }`}
                >
                  <span className={isActive ? "text-teal-600 dark:text-teal-400" : "text-muted/70"}>{item.icon}</span>
                  {item.title}
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-50"/>}
                </Link>
              )
            })}
          </div>

          {/* System Footer (Pinned to bottom, using previously wasted space) */}
          <div className="p-4 border-t border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 bg-surface dark:bg-slate-800 dark:bg-surface flex-shrink-0">
            <p className="px-2 text-xs font-bold text-muted/70 uppercase tracking-wider mb-2">System</p>
            <Link href="/ai" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted dark:text-muted/70 dark:text-muted/70 hover:bg-background dark:bg-surface dark:bg-slate-950 hover:text-main dark:text-slate-50 dark:text-slate-100 transition-colors">
               <ShieldCheck size={18}/> AI & Privacy
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted dark:text-muted/70 dark:text-muted/70 hover:bg-background dark:bg-surface dark:bg-slate-950 hover:text-main dark:text-slate-50 dark:text-slate-100 transition-colors">
               <Settings size={18}/> Settings
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 min-w-0 ${!isHome ? 'lg:pt-0 pt-16' : ''}`}>
        {isHome ? children : (
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
