"use client";

import React, { useState } from "react";
import { useSmartBudget } from "./hooks/useSmartBudget";
import { FilterBar } from "./components/FilterBar";
import { KPIRibbon } from "./components/KPIRibbon";
import { TransactionTable } from "./components/TransactionTable";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { QuickEntry } from "./components/QuickEntry";
import { Download, Trash2, RotateCcw } from "lucide-react";

export default function SmartBudgetPro() {
  const { 
    filteredData, 
    filters, 
    setFilters, 
    categories, 
    kpi, 
    addTransaction, 
    deleteTransaction, 
    clearAllData,
    resetToSample,
    getGroupedData,
    isLoaded
  } = useSmartBudget();

  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Smart Budget</h1>
          <p className="text-sm text-slate-500">Financial Planning & Analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetToSample} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
             <RotateCcw size={14} /> Sample Data
          </button>
          <div className="h-4 w-[1px] bg-slate-300 mx-2"></div>
          <button onClick={clearAllData} className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 px-3 py-1.5 border border-rose-100 rounded hover:bg-rose-50 transition">
             <Trash2 size={14} /> Clear All
          </button>
          <QuickEntry onAdd={addTransaction} />
        </div>
      </div>

      {/* Filter & KPI Section (Sticky-ish feel) */}
      <div className="bg-white shadow-sm mb-6">
        <KPIRibbon kpi={kpi} />
        <FilterBar filters={filters} setFilters={setFilters} categories={categories} />
        
        {/* Tabs */}
        <div className="flex px-6 border-t">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Transactions ({filteredData.length})
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Analytics & Charts
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white border rounded-xl shadow-sm min-h-[500px]">
          {activeTab === 'list' ? (
            <TransactionTable data={filteredData} onDelete={deleteTransaction} />
          ) : (
            <AnalyticsDashboard getGroupedData={getGroupedData} />
          )}
        </div>
        
        <div className="mt-4 text-center text-xs text-slate-400">
          Showing {filteredData.length} records • All data is stored locally on your device.
        </div>
      </div>
    </div>
  );
}
