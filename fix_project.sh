# Create the visual fix script
cat > fix_visuals.sh << 'EOF'
#!/bin/bash

echo "🎨 Applying UI/UX Polish..."

# 1. UPDATE GLOBAL CSS (Better Dark Mode Contrast)
echo "💅 Polishing Globals..."
cat > app/globals.css << 'CSS_END'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-app: 244 244 245;
    --bg-card: 255 255 255;
    --bg-input: 250 250 250;
    --text-main: 24 24 27;
    --text-muted: 82 82 91;
    --border-color: 228 228 231;
  }
  .dark {
    --bg-app: 9 9 11;
    --bg-card: 24 24 27;
    --bg-input: 39 39 42;
    --text-main: 250 250 250;
    --text-muted: 161 161 170; /* Brighter gray for readability */
    --border-color: 63 63 70;
  }
}

body {
  @apply bg-[rgb(var(--bg-app))] text-[rgb(var(--text-main))] antialiased transition-colors duration-300;
  background-image: radial-gradient(at 50% 10%, rgb(var(--bg-card) / 0.1) 0%, transparent 70%);
}

/* Better Input Styling */
input, select, textarea {
  @apply bg-[rgb(var(--bg-input))] text-[rgb(var(--text-main))] border border-[rgb(var(--border-color))] rounded-lg px-4 py-2 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500;
}
CSS_END

# 2. FIX BUTTON COMPONENT (Remove Teal, Fix Hover)
echo "🔘 Fixing Button Component..."
cat > app/shared/ui/Button.tsx << 'BTN_END'
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  isLoading?: boolean;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  disabled,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:pointer-events-none disabled:cursor-not-allowed";
  
  const variants = {
    // Fixed: Uses Tailwind colors instead of hardcoded RGB
    primary: "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 shadow-md hover:shadow-lg",
    secondary: "bg-surface dark:bg-slate-800 border border-line dark:border-slate-700 text-main hover:bg-slate-50 dark:hover:bg-slate-700",
    ghost: "bg-transparent text-muted hover:text-main hover:bg-slate-100 dark:hover:bg-slate-800",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
          Processing...
        </>
      ) : children}
    </button>
  );
}
BTN_END

# 3. FIX PAGE LAYOUT (Spacing & Mobile Scroll)
echo "📱 Fixing Smart Budget Layout..."
cat > app/tools/finance/smart-budget/page.tsx << 'PAGE_END'
"use client";

import React, { useState } from "react";
import { useSmartBudget } from "./hooks/useSmartBudget";
import { FilterBar } from "./components/FilterBar";
import { KPIRibbon } from "./components/KPIRibbon";
import { TransactionTable } from "./components/TransactionTable";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { QuickEntry } from "./components/QuickEntry";
import Button from "@/app/shared/ui/Button";

import { Trash2, RotateCcw, List, PieChart, User, Briefcase } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartBudgetPro() {
  const { filteredData, filters, setFilters, categories, kpi, addTransaction, deleteTransaction, clearAllData, resetToSample, getGroupedData, isLoaded, mode, toggleMode, exportCSV } = useSmartBudget();
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");

  if (!isLoaded) return <div className="flex h-screen items-center justify-center text-muted animate-pulse">Initializing Financial Engine...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background overflow-hidden font-sans">
      <Toast />
      
      {/* HEADER: Fixed Layout & Spacing */}
      <div className="bg-surface/80 backdrop-blur-md border-b border-line px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white shadow-sm transition-colors duration-500 ${mode === 'Personal' ? 'bg-emerald-500' : 'bg-violet-600'}`}>
            {mode === 'Personal' ? <User size={22} /> : <Briefcase size={22} />}
          </div>
          <div>
            {/* FIX: Added space between title and mode */}
            <h1 className="text-lg font-extrabold text-main tracking-tight leading-none flex items-center gap-2">
              Smart Budget <span className={`transition-colors duration-500 ${mode === 'Personal' ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'}`}>{mode}</span>
            </h1>
            <p className="text-[10px] md:text-xs text-muted font-bold uppercase tracking-widest mt-0.5">
              {mode === 'Personal' ? 'Personal Expense Tracker' : 'Enterprise G/L Report'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
           <Button 
             variant="secondary"
             onClick={toggleMode}
             className="text-xs font-bold uppercase tracking-wide whitespace-nowrap px-3 py-1.5 h-9"
           >
             Switch to {mode === 'Personal' ? 'Enterprise' : 'Personal'}
           </Button>

          {/* FIX: Proper Ghost Buttons with padding */}
          <Button variant="ghost" onClick={resetToSample} className="w-9 h-9 p-0" title="Reset Sample Data">
             <RotateCcw size={18} />
          </Button>
          <Button variant="ghost" onClick={clearAllData} className="w-9 h-9 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Clear All Data">
             <Trash2 size={18} />
          </Button>
          <div className="h-6 w-[1px] bg-line mx-1"></div>
          <QuickEntry onAdd={addTransaction} mode={mode} />
        </div>
      </div>

      {/* MAIN CONTENT: Responsive Container */}
      <div className="flex-1 overflow-auto relative scroll-smooth">
        {/* FIX: Removed min-w-[1000px] from here to prevent page scroll */}
        <div className="w-full max-w-[1400px] mx-auto"> 
            
            <KPIRibbon kpi={kpi} />
            <FilterBar filters={filters} setFilters={setFilters} categories={categories} onExport={exportCSV} mode={mode} />
            
            <div className="flex px-6 bg-surface/50 backdrop-blur-sm border-b border-line sticky top-0 z-10 gap-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('list')}
                    className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'list' ? (mode === 'Personal' ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'border-violet-600 text-violet-700 dark:text-violet-400') : 'border-transparent text-muted hover:text-main'}`}
                >
                    <List size={16} /> {mode === 'Personal' ? 'Transactions' : 'Document List'} ({filteredData.length})
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'analytics' ? (mode === 'Personal' ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'border-violet-600 text-violet-700 dark:text-violet-400') : 'border-transparent text-muted hover:text-main'}`}
                >
                    <PieChart size={16} /> Analysis
                </button>
            </div>

            <div className="p-0 pb-20">
                {/* Table container will handle its own scrolling */}
                {activeTab === 'list' ? (
                    <div className="min-w-[800px] md:min-w-0"> 
                        <TransactionTable data={filteredData} onDelete={deleteTransaction} mode={mode} />
                    </div>
                ) : (
                    <AnalyticsDashboard getGroupedData={getGroupedData} />
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
PAGE_END

echo "✅ Visual Fixes Applied!"
EOF
chmod +x fix_visuals.sh && ./fix_visuals.sh