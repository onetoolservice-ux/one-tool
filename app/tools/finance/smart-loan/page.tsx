"use client";
import React, { useState } from "react";
import { useLoanCalculator } from "./hooks/useLoanCalculator";
import { LoanKPI } from "./components/LoanKPI";
import { LoanInputs } from "./components/LoanInputs";
import { AmortizationTable } from "./components/AmortizationTable";
import { LoanCharts } from "./components/LoanCharts";
import { Calculator, List, PieChart } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartLoanPro() {
  const { 
    amount, setAmount, 
    rate, setRate, 
    years, setYears, 
    startDate, setStartDate, 
    summary, schedule, reset, isLoaded 
  } = useLoanCalculator();
  
  const [activeTab, setActiveTab] = useState('schedule');

  if (!isLoaded) return <div className="p-10 text-center text-muted">Loading Loan Engine...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background overflow-hidden font-sans">
      <Toast />
      <div className="bg-surface/80 backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 shadow-sm shrink-0 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-blue-600 text-white shadow-md"><Calculator size={22} /></div>
        <div><h1 className="text-lg font-extrabold text-main">Smart Loan</h1><p className="text-xs text-muted font-bold uppercase">Amortization Engine</p></div>
      </div>
      <div className="flex-1 overflow-auto relative">
         <div className="min-w-[800px]">
            <LoanKPI summary={summary} /> 
            <LoanInputs 
              amount={amount} setAmount={setAmount} 
              rate={rate} setRate={setRate} 
              years={years} setYears={setYears} 
              startDate={startDate} setStartDate={setStartDate} 
              onReset={reset} 
            />
            <div className="flex px-6 bg-surface border-b sticky top-[60px] z-10">
                <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'schedule' ? 'border-blue-600 text-blue-800' : 'border-transparent text-muted'}`}><List size={16} /> Schedule</button>
                <button onClick={() => setActiveTab('charts')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'charts' ? 'border-blue-600 text-blue-800' : 'border-transparent text-muted'}`}><PieChart size={16} /> Projection</button>
            </div>
            <div className="w-full h-full pb-20 bg-background">
                {/* FIX: Changed prop name from 'schedule' to 'data' to match component definition */}
                {activeTab === 'schedule' ? <AmortizationTable data={schedule} /> : <LoanCharts data={schedule} summary={summary} />}
            </div>
         </div>
      </div>
    </div>
  );
}
