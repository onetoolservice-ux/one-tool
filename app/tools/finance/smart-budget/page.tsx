"use client";

import React, { useState } from "react";
import { useSmartBudget } from "./hooks/useSmartBudget";
import { FilterBar } from "./components/FilterBar";
import { KPIRibbon } from "./components/KPIRibbon";
import { TransactionTable } from "./components/TransactionTable";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { QuickEntry } from "./components/QuickEntry";

import { Trash2, RotateCcw, List, PieChart, User, Briefcase } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartBudgetPro() {
  const { filteredData, filters, setFilters, categories, kpi, addTransaction, deleteTransaction, clearAllData, resetToSample, getGroupedData, isLoaded, mode, toggleMode, exportCSV } = useSmartBudget();
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");
  const [showGuide, setShowGuide] = useState(false);

  if (!isLoaded) return <div className="flex h-screen items-center justify-center text-muted/70 animate-pulse">Initializing Financial Engine...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]/30 overflow-hidden font-sans">
      <Toast />
       
      
      {/* HEADER: Sticky & Aligned (px-6) */}
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-slate-200/50 dark:shadow-none shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white   transition-colors duration-500 ${mode === 'Personal' ? 'bg-emerald-500' : 'bg-violet-600'}`}>
            {mode === 'Personal' ? <User size={22} /> : <Briefcase size={22} />}
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-main dark:text-slate-100 dark:text-slate-200 tracking-tight leading-none">
              Smart Budget <span className={`transition-colors duration-500 ${mode === 'Personal' ? 'text-emerald-500' : 'text-violet-600 dark:text-violet-400'}`}>{mode}</span>
            </h1>
            <p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted font-bold uppercase tracking-widest mt-0.5">
              {mode === 'Personal' ? 'Personal Expense Tracker' : 'Enterprise G/L Report'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={toggleMode}
             className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide tracking-wide border rounded hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617] transition flex items-center gap-2 mr-2"
           >
             Switch to {mode === 'Personal' ? 'Enterprise' : 'Personal'}
           </button>

          <button onClick={resetToSample} className="p-2 text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-blue-600 dark:text-blue-400 border border-transparent hover:border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 rounded transition" title="Reset Sample Data">
             <RotateCcw size={16} />
          </button>
          <button onClick={clearAllData} className="p-2 text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-rose-600 dark:text-rose-400 border border-transparent hover:border-rose-200 rounded transition" title="Clear All Data">
             <Trash2 size={16} />
          </button>
          <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
          <QuickEntry onAdd={addTransaction} mode={mode}  />
        </div>
      </div>

      {/* SCROLLABLE AREA */}
      <div className="flex-1 overflow-auto relative">
        <div className="min-w-[1000px]"> {/* Ensure min width for table scrolling */}
            
            <KPIRibbon kpi={kpi} />
            <FilterBar filters={filters} setFilters={setFilters} categories={categories} onExport={exportCSV} mode={mode} />
            
            {/* TABS: Aligned px-6 */}
            <div className="flex px-6 bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b sticky top-[125px] z-10">
                <button 
                    onClick={() => setActiveTab('list')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'list' ? (mode === 'Personal' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/10' : 'border-violet-600 text-violet-800 bg-violet-50/10') : 'border-transparent text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-main dark:text-slate-100 dark:text-slate-200'}`}
                >
                    <List size={16} /> {mode === 'Personal' ? 'Transactions' : 'Document List'} ({filteredData.length})
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'analytics' ? (mode === 'Personal' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/10' : 'border-violet-600 text-violet-800 bg-violet-50/10') : 'border-transparent text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-main dark:text-slate-100 dark:text-slate-200'}`}
                >
                    <PieChart size={16} /> Analysis
                </button>
            </div>

            {/* CONTENT: Edge-to-Edge */}
            <div className="w-full h-full pb-20 bg-surface dark:bg-slate-800 dark:bg-surface">
                {activeTab === 'list' ? (
                    <TransactionTable data={filteredData} onDelete={deleteTransaction} mode={mode} />
                ) : (
                    <AnalyticsDashboard getGroupedData={getGroupedData} />
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
