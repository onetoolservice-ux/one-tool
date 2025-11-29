"use client";
import { useState, useMemo } from "react";
import { showToast } from "@/app/shared/Toast";

export interface MonthlyPayment { month: number; date: string; openingBalance: number; emi: number; principalComponent: number; interestComponent: number; closingBalance: number; }
export interface LoanSummary { monthlyEMI: number; totalInterest: number; totalPayment: number; payoffDate: string; }

export function useLoanCalculator() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const { schedule, summary } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = years * 12;
    let emi = rate > 0 ? (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : amount / n;
    
    const schedule: MonthlyPayment[] = [];
    let balance = amount;
    let totalInterest = 0;
    let currentDate = new Date(startDate);

    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const principal = emi - interest;
      const closing = balance - principal;
      totalInterest += interest;
      
      schedule.push({
        month: i,
        date: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        openingBalance: balance,
        emi: emi,
        principalComponent: principal,
        interestComponent: interest,
        closingBalance: closing > 0 ? closing : 0
      });
      balance = closing;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return {
      schedule,
      summary: {
        monthlyEMI: Math.round(emi),
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(amount + totalInterest),
        payoffDate: schedule.length > 0 ? schedule[schedule.length - 1].date : '-'
      }
    };
  }, [amount, rate, years, startDate]);

  const reset = () => {
    setAmount(500000);
    setRate(8.5);
    setYears(5);
    showToast("Calculator Reset");
  };

  return { amount, setAmount, rate, setRate, years, setYears, startDate, setStartDate, schedule, summary, reset };
}
