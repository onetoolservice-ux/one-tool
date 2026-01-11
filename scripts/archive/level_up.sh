#!/bin/bash

echo "íº€ Applying Enterprise UI & Dynamic Themes..."

# =========================================================
# 1. INSTALL DEPENDENCIES (Confetti)
# =========================================================
echo "í³¦ Installing visual dependencies..."
if [ -f "yarn.lock" ]; then
    yarn add canvas-confetti clsx tailwind-merge
    yarn add -D @types/canvas-confetti
else
    npm install canvas-confetti clsx tailwind-merge
    npm install --save-dev @types/canvas-confetti
fi

# =========================================================
# 2. CREATE DYNAMIC THEME ENGINE
# =========================================================
echo "í¾¨ Creating Dynamic Theme Engine..."
mkdir -p app/components/layout
cat > app/components/layout/ThemeEngine.tsx << 'TS_END'
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeEngine() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    
    // Reset to defaults
    let accentColor = "79 70 229"; // Default Indigo
    let bgGradient = "radial-gradient(at 50% 0%, rgba(79, 70, 229, 0.05) 0%, transparent 70%)";

    if (pathname.includes("/finance")) {
      accentColor = "16 185 129"; // Emerald
      bgGradient = "radial-gradient(at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)";
    } else if (pathname.includes("/developer")) {
      accentColor = "59 130 246"; // Blue
      bgGradient = "radial-gradient(at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)";
    } else if (pathname.includes("/health")) {
      accentColor = "244 63 94"; // Rose
      bgGradient = "radial-gradient(at 50% 0%, rgba(244, 63, 94, 0.08) 0%, transparent 70%)";
    } else if (pathname.includes("/documents")) {
      accentColor = "245 158 11"; // Amber
      bgGradient = "radial-gradient(at 50% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 70%)";
    }

    // Apply CSS Variables dynamically
    root.style.setProperty("--primary-rgb", accentColor);
    document.body.style.backgroundImage = bgGradient;
    
  }, [pathname]);

  return null; // This component renders nothing, just handles logic
}
TS_END

# =========================================================
# 3. UPDATE LAYOUT (Inject Theme Engine)
# =========================================================
echo "í´Œ Injecting Theme Engine into Layout..."
# We need to make sure ThemeEngine is used in the main layout
cat > app/layout.tsx << 'TS_END'
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./shared/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import ThemeEngine from "./components/layout/ThemeEngine"; // New
import { UIProvider } from "./lib/ui-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "One Tool | Digital Command Center",
  description: "The all-in-one suite for productivity, finance, and health.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans bg-background text-main antialiased selection:bg-indigo-500/20`}>
        <UIProvider>
          <ThemeEngine /> 
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full relative">
              <Navbar />
              <main className="flex-1 overflow-auto bg-transparent relative z-0">
                {children}
              </main>
            </div>
          </div>
        </UIProvider>
      </body>
    </html>
  );
}
TS_END

# =========================================================
# 4. UPDATE TOOL TILES (Colorful Enterprise Cards)
# =========================================================
echo "í³ Upgrading Tool Cards..."
cat > app/shared/ToolTile.tsx << 'TS_END'
"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ToolTileProps {
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  category?: "finance" | "developer" | "documents" | "health" | "ai";
  isNew?: boolean;
}

export default function ToolTile({ title, desc, icon: Icon, href, category = "finance", isNew }: ToolTileProps) {
  
  // Enterprise Color Mapping
  const colors = {
    finance: "group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/10 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    developer: "group-hover:border-blue-500/50 group-hover:shadow-blue-500/10 text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    documents: "group-hover:border-amber-500/50 group-hover:shadow-amber-500/10 text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
    health: "group-hover:border-rose-500/50 group-hover:shadow-rose-500/10 text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400",
    ai: "group-hover:border-violet-500/50 group-hover:shadow-violet-500/10 text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400",
  };

  const accentClass = colors[category] || colors.finance;

  return (
    <Link href={href} className="group relative block">
      <div className={`
        relative h-full p-5 rounded-2xl bg-surface dark:bg-slate-800/50 border border-line dark:border-slate-700 
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl ${accentClass.split(' ')[0]} ${accentClass.split(' ')[1]}
      `}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${accentClass.split(' ').slice(2).join(' ')} transition-colors`}>
            <Icon size={24} />
          </div>
          {isNew && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-800">
              New
            </span>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="font-bold text-main dark:text-slate-100 mb-1 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-xs text-muted dark:text-muted/80 line-clamp-2 leading-relaxed">{desc}</p>
        </div>

        {/* Hover Action */}
        <div className="absolute bottom-5 right-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight size={18} className="text-muted dark:text-slate-400" />
        </div>
      </div>
    </Link>
  );
}
TS_END

# =========================================================
# 5. RESTORE SUCCESS CELEBRATION (Fixed Encoding)
# =========================================================
echo "í¾‰ Restoring Confetti Utility..."
mkdir -p app/utils
cat > app/utils/confetti.ts << 'TS_END'
import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};
TS_END

# =========================================================
# 6. FIX MODAL BACKGROUNDS (Make them pop)
# =========================================================
echo "í»  Fixing Modal Styles (Smart Budget)..."
cat > app/tools/finance/smart-budget/components/QuickEntry.tsx << 'TS_END'
"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Transaction } from "../types";
import { showToast } from "@/app/shared/Toast";
import Button from "@/app/shared/ui/Button";
import { fireConfetti } from "@/app/utils/confetti";

interface QuickEntryProps {
  onAdd: (t: Omit<Transaction, "id">) => void;
  mode: 'Personal' | 'Enterprise';
}

export function QuickEntry({ onAdd, mode }: QuickEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    desc: "",
    amount: "",
    type: "Expense",
    category: mode === 'Personal' ? "Food" : "Operations"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.desc || !form.amount) {
      showToast("Please fill all fields", "error");
      return;
    }
    
    onAdd({
      date: form.date,
      desc: form.desc,
      amount: Number(form.amount),
      type: form.type as any,
      category: form.category,
      status: "Posted"
    });

    setForm({ ...form, desc: "", amount: "" });
    setIsOpen(false);
    showToast("Transaction Added", "success");
    fireConfetti();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
        <Plus size={16} /> Add New
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          
          {/* Modal Content - High Contrast Background */}
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Entry</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option>Income</option>
                    <option>Expense</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" placeholder="What was this for?" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} autoFocus />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {mode === 'Personal' ? (
                        <><option>Food</option><option>Transport</option><option>Utilities</option><option>Entertainment</option><option>Health</option><option>Salary</option><option>Investment</option></>
                    ) : (
                        <><option>Operations</option><option>Marketing</option><option>Payroll</option><option>Software</option><option>Office</option><option>Sales</option><option>Revenue</option></>
                    )}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                  <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" className="w-full py-3 text-sm shadow-lg shadow-indigo-500/20">Save Transaction</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
TS_END

echo "âœ… Level Up Complete! Run 'npm run build' to see the magic."
