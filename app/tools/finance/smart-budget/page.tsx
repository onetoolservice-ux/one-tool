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
      
      {/* HEADER */}
      <div className="bg-surface/80 backdrop-blur-md border-b border-line px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white shadow-sm transition-colors duration-500 ${mode === 'Personal' ? 'bg-emerald-500' : 'bg-violet-600'}`}>
            {mode === 'Personal' ? <User size={22} /> : <Briefcase size={22} />}
          </div>
          <div>
            {/* FIXED: Added gap-2 to separate "Smart Budget" and the Mode Badge */}
            <h1 className="text-lg font-extrabold text-main tracking-tight leading-none flex items-center gap-2">
              Smart Budget <span className={`transition-colors duration-500 ${mode === 'Personal' ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'}`}>{mode}</span>
            </h1>
            <p className="text-[10px] md:text-xs text-muted font-bold uppercase tracking-widest mt-0.5">
              {mode === 'Personal' ? 'Personal Expense Tracker' : 'Enterprise G/L Report'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button 
             variant="secondary"
             onClick={toggleMode}
             className="text-xs font-bold uppercase tracking-wide whitespace-nowrap px-3 py-1.5 h-9"
           >
             Switch to {mode === 'Personal' ? 'Enterprise' : 'Personal'}
           </Button>

          {/* Fixed: Buttons have explicit width/height/padding for touch targets */}
          <Button variant="ghost" onClick={resetToSample} className="w-9 h-9 p-0 text-muted hover:text-blue-600" title="Reset Sample Data">
             <RotateCcw size={18} />
          </Button>
          <Button variant="ghost" onClick={clearAllData} className="w-9 h-9 p-0 text-muted hover:text-rose-600" title="Clear All Data">
             <Trash2 size={18} />
          </Button>
          <div className="h-6 w-[1px] bg-line mx-1"></div>
          <QuickEntry onAdd={addTransaction} mode={mode} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto relative scroll-smooth">
        <div className="w-full max-w-[1600px] mx-auto"> 
            <KPIRibbon kpi={kpi} />
            <FilterBar filters={filters} setFilters={setFilters} categories={categories} onExport={exportCSV} mode={mode} />
            
            <div className="flex px-6 bg-surface/50 backdrop-blur-sm border-b border-line sticky top-0 z-10 gap-6">
                <button 
                    onClick={() => setActiveTab('list')}
                    className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'list' ? (mode === 'Personal' ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'border-violet-600 text-violet-700 dark:text-violet-400') : 'border-transparent text-muted hover:text-main'}`}
                >
                    <List size={16} /> {mode === 'Personal' ? 'Transactions' : 'Document List'} ({filteredData.length})
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'analytics' ? (mode === 'Personal' ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'border-violet-600 text-violet-700 dark:text-violet-400') : 'border-transparent text-muted hover:text-main'}`}
                >
                    <PieChart size={16} /> Analysis
                </button>
            </div>

            <div className="p-0 pb-20">
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
