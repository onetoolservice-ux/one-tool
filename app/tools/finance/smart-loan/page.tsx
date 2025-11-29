"use client";
import React, { useState } from "react";
import { useLoanCalculator } from "./hooks/useLoanCalculator";
import { LoanKPI } from "./components/LoanKPI";
import { LoanInputs } from "./components/LoanInputs";
import { SmartGuide } from "./components/SmartGuide";
import { AmortizationTable } from "./components/AmortizationTable";
import { LoanCharts } from "./components/LoanCharts";
import { List, PieChart, Calculator } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartLoan() {
  const [showGuide, setShowGuide] = useState(false);
  const { amount, setAmount, rate, setRate, years, setYears, startDate, setStartDate, schedule, summary, reset } = useLoanCalculator();
  const [activeTab, setActiveTab] = useState<'schedule' | 'charts'>('schedule');

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]/30 overflow-hidden font-sans">
      <Toast />
      <SmartGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 shadow-lg shadow-slate-200/50 dark:shadow-none shrink-0 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-blue-600 text-white  "><Calculator size={22} /></div>
        <div><h1 className="text-lg font-extrabold text-main dark:text-slate-100 dark:text-slate-200">Smart Loan</h1><p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted font-bold uppercase">Amortization Engine</p></div>
      </div>

      <div className="flex-1 overflow-auto relative">
         <div className="min-w-[800px]">
            <LoanKPI summary={summary} />
            <LoanInputs toggleGuide={() => setShowGuide(!showGuide)} amount={amount} setAmount={setAmount} rate={rate} setRate={setRate} years={years} setYears={setYears} startDate={startDate} setStartDate={setStartDate} onReset={reset} />
            <div className="flex px-6 bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b sticky top-[115px] z-10">
                <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'schedule' ? 'border-blue-600 text-blue-800 bg-blue-50/10' : 'border-transparent text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-main dark:text-slate-100 dark:text-slate-200'}`}><List size={16} /> Schedule</button>
                <button onClick={() => setActiveTab('charts')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'charts' ? 'border-blue-600 text-blue-800 bg-blue-50/10' : 'border-transparent text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-main dark:text-slate-100 dark:text-slate-200'}`}><PieChart size={16} /> Projection</button>
            </div>
            <div className="w-full h-full pb-20 bg-surface dark:bg-slate-800 dark:bg-surface">
                {activeTab === 'schedule' ? <AmortizationTable data={schedule} /> : <LoanCharts data={schedule} />}
            </div>
         </div>
      </div>
    </div>
  );
}
