#!/bin/bash

echo "âœ¨ Starting Final Polish..."

# =========================================================
# 1. FIX TYPES (lodash.debounce)
# =========================================================
echo "í´§ Creating type declaration for lodash.debounce..."
mkdir -p app/types
cat > app/types/declarations.d.ts << 'END_TYPES'
declare module 'lodash.debounce';
END_TYPES

# =========================================================
# 2. FIX TESTS (Update paths to new Smart Tools)
# =========================================================
echo "í´§ Fixing Test Imports..."

cat > __tests__/DebtPlanner.test.tsx << 'END_TEST'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
// Updated to point to the new Smart Debt tool
import DebtPlanner from '@/app/tools/finance/smart-debt/page'

describe('DebtPlanner', () => {
  it('renders without crashing', () => {
    render(<DebtPlanner />)
    const heading = screen.getByText(/Smart Debt/i)
    expect(heading).toBeInTheDocument()
  })
})
END_TEST

cat > __tests__/LoanCalculator.test.tsx << 'END_TEST'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
// Updated to point to the new Smart Loan tool
import LoanCalculator from '@/app/tools/finance/smart-loan/page'

describe('LoanCalculator', () => {
  it('renders without crashing', () => {
    render(<LoanCalculator />)
    const heading = screen.getByText(/Smart Loan/i)
    expect(heading).toBeInTheDocument()
  })
})
END_TEST

# =========================================================
# 3. FIX SMART LOAN HOOK (Add isLoaded)
# =========================================================
echo "í´§ Fixing useLoanCalculator hook..."
cat > app/tools/finance/smart-loan/hooks/useLoanCalculator.ts << 'END_HOOK'
import { useState, useEffect, useMemo } from "react";

export function useLoanCalculator() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const reset = () => {
    setAmount(500000);
    setRate(8.5);
    setYears(5);
    setStartDate(new Date().toISOString().slice(0, 10));
  };

  const { summary, schedule } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = years * 12;
    
    let monthlyEMI = 0;
    let totalPayment = 0;
    let totalInterest = 0;
    const scheduleData = [];

    if (amount > 0 && rate > 0 && years > 0) {
      monthlyEMI = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      totalPayment = monthlyEMI * n;
      totalInterest = totalPayment - amount;

      let balance = amount;
      let currentDate = new Date(startDate);

      for (let i = 1; i <= n; i++) {
        const interestPart = balance * r;
        const principalPart = monthlyEMI - interestPart;
        balance -= principalPart;
        if (balance < 0) balance = 0;

        scheduleData.push({
          month: i,
          date: currentDate.toLocaleDateString(),
          payment: monthlyEMI,
          principal: principalPart,
          interest: interestPart,
          balance: balance
        });
        
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Payoff date estimation
    const payoffDate = new Date(startDate);
    payoffDate.setMonth(payoffDate.getMonth() + n);

    return {
      summary: {
        monthlyEMI: Math.round(monthlyEMI),
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(totalPayment),
        payoffDate: payoffDate.toDateString()
      },
      schedule: scheduleData
    };
  }, [amount, rate, years, startDate]);

  return {
    amount, setAmount,
    rate, setRate,
    years, setYears,
    startDate, setStartDate,
    summary,
    schedule,
    reset,
    isLoaded // Now correctly exported
  };
}
END_HOOK

# =========================================================
# 4. FIX SMART LOAN PAGE (Prop Mismatch)
# =========================================================
echo "í´§ Fixing Smart Loan Page props..."
cat > app/tools/finance/smart-loan/page.tsx << 'END_PAGE'
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
                {/* FIXED: Passing 'schedule' to 'data' prop as expected by components */}
                {activeTab === 'schedule' ? <AmortizationTable data={schedule} /> : <LoanCharts data={schedule} summary={summary} />}
            </div>
         </div>
      </div>
    </div>
  );
}
END_PAGE

echo "âœ… Repairs Complete. Running build check..."
npx tsc --noEmit
