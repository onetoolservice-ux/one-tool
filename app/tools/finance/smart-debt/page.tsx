"use client";
import React, { useState } from "react";
import { useSmartDebt } from "./hooks/useSmartDebt";
import { DebtKPI } from "./components/DebtKPI";
import { DebtInputs } from "./components/DebtInputs";
import { DebtTable } from "./components/DebtTable";
import { DebtCharts } from "./components/DebtCharts";
import { ShieldCheck, List, PieChart } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartDebtPro() {
  const { debts, addDebt, removeDebt, extraPayment, setExtraPayment, strategy, setStrategy, timeline, summary, reset, isLoaded } = useSmartDebt();
  const [activeTab, setActiveTab] = useState('list');
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false); // New Collapse State

  if (!isLoaded) return <div className="p-10 text-center text-muted">Loading Debt Engine...</div>;

  // Calculate the correct sticky offset for the tabs
  const tabOffset = isConfigCollapsed ? 60 : 115; // Navbar (60px) + KPI (55px)

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background overflow-hidden font-sans">
      <Toast />
      
      {/* Header - Z-50 */}
      <div className="bg-surface/80 backdrop-blur-md border-b border-line px-6 py-3 flex items-center gap-3 shadow-sm shrink-0 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-md"><ShieldCheck size={22} /></div>
        <div><h1 className="text-lg font-extrabold text-main">Smart Debt</h1><p className="text-xs text-muted font-bold uppercase">Liability Payoff</p></div>
      </div>
      
      {/* Main Area (Scrollable) */}
      <div className="flex-1 overflow-auto relative">
         <div className="min-w-[800px]">
            
            {/* KPI Ribbon - Z-40 */}
            <DebtKPI summary={summary} /> 
            
            {/* Input Filter Bar - Z-30 */}
            <DebtInputs 
              extraPayment={extraPayment} setExtraPayment={setExtraPayment} 
              strategy={strategy} setStrategy={setStrategy} 
              onAdd={addDebt} onReset={reset} 
              isCollapsed={isConfigCollapsed} toggleCollapse={() => setIsConfigCollapsed(!isConfigCollapsed)} 
            />

            {/* Tabs - Z-10, Dynamic Offset */}
<div
  className="flex px-6 bg-surface border-b border-line sticky z-10"
  style={{ top: `${tabOffset}px` }}
>

                <button onClick={() => setActiveTab('list')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'list' ? 'border-indigo-600 text-indigo-800' : 'border-transparent text-muted'}`}><List size={16} /> List</button>
                <button onClick={() => setActiveTab('chart')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'chart' ? 'border-indigo-600 text-indigo-800' : 'border-transparent text-muted'}`}><PieChart size={16} /> Projection</button>
            </div>
            
            {/* Content */}
            <div className="w-full h-full pb-20 bg-background">
                {activeTab === 'list' ? <DebtTable debts={debts} onDelete={removeDebt} /> : <DebtCharts timeline={timeline} />}
            </div>
         </div>
      </div>
    </div>
  );
}
