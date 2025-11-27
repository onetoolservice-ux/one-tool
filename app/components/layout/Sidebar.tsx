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
  { title: "Dashboard", href: "/tools", icon: <LayoutGrid size={18}/> },
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

  // Prevent Hydration Mismatch Error
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide sidebar on landing page (Optional, but keeps Home clean)
  const isHome = pathname === "/";

  if (!mounted) return <div className="min-h-screen bg-slate-50">{children}</div>;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center px-4 justify-between">
        <Link href="/" className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[rgb(117,163,163)] flex items-center justify-center text-white text-xs">OT</div>
          OneToolkit
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar - Light Theme (Apple Style) */}
      {!isHome && (
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-50">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[rgb(117,163,163)] text-white flex items-center justify-center font-bold text-sm shadow-sm">OT</div>
              <span className="font-bold text-slate-800 text-lg tracking-tight">OneToolkit</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tools</p>
            {MENU.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-teal-50 text-teal-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={isActive ? "text-teal-600" : "text-slate-400"}>{item.icon}</span>
                  {item.title}
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-50"/>}
                </Link>
              )
            })}
            
            <div className="my-6 h-px bg-slate-100 mx-2"></div>
            
            <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">System</p>
            <Link href="/ai" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
               <ShieldCheck size={18}/> AI & Privacy
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
               <Settings size={18}/> Settings
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 min-w-0 ${!isHome ? 'lg:pt-0 pt-16' : ''}`}>
        {isHome ? children : (
          <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
