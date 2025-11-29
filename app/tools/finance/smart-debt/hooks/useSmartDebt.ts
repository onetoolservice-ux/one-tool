"use client";
import { useState, useMemo, useEffect } from "react";
import { showToast } from "@/app/shared/Toast";

export interface Debt { id: string; name: string; balance: number; rate: number; minPayment: number; }
export type Strategy = 'Avalanche' | 'Snowball';

const STORAGE_KEY = "smart-debt-data-v1";
const SAMPLE: Debt[] = [
  { id: "1", name: "Credit Card (Visa)", balance: 50000, rate: 18.5, minPayment: 1500 },
  { id: "2", name: "Personal Loan", balance: 120000, rate: 11.0, minPayment: 3200 },
  { id: "3", name: "Car Loan", balance: 350000, rate: 8.5, minPayment: 6500 },
];

export function useSmartDebt() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [extraPayment, setExtraPayment] = useState(5000);
  const [strategy, setStrategy] = useState<Strategy>('Avalanche');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved) { try { setDebts(JSON.parse(saved)); } catch { setDebts(SAMPLE); } }
    else { setDebts(SAMPLE); }
    setIsLoaded(true);
  }, []);

  useEffect(() => { if(isLoaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(debts)); }, [debts, isLoaded]);

  const addDebt = (d: any) => { setDebts([...debts, { ...d, id: crypto.randomUUID() }]); showToast("Liability Added"); };
  const removeDebt = (id: string) => { setDebts(debts.filter(d => d.id !== id)); showToast("Liability Removed"); };
  const reset = () => { setDebts(SAMPLE); showToast("Restored Sample"); };

  // --- SORTING LOGIC FOR TABLE ---
  const sortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
        if (strategy === 'Avalanche') return b.rate - a.rate; // High Rate First
        return a.balance - b.balance; // Low Balance First
    });
  }, [debts, strategy]);

  // --- PAYOFF ENGINE ---
  const { timeline, summary } = useMemo(() => {
    if (debts.length === 0) return { timeline: [], summary: { totalInterest: 0, payoffDate: '-', totalDebt: 0, months: 0, totalMonthly: 0 } };

    // Clone for simulation
    let currentDebts = debts.map(d => ({ ...d }));
    let timeline = [];
    let totalInterestPaid = 0;
    let month = 0;
    let currentDate = new Date();

    const sortForSim = (ds: typeof currentDebts) => {
      return ds.sort((a, b) => {
        if (a.balance <= 0) return 1; 
        if (b.balance <= 0) return -1;
        return strategy === 'Avalanche' ? b.rate - a.rate : a.balance - b.balance;
      });
    };

    while (currentDebts.some(d => d.balance > 0) && month < 360) {
      month++;
      currentDate.setMonth(currentDate.getMonth() + 1);
      
      let monthlyBudget = extraPayment + currentDebts.reduce((sum, d) => sum + d.minPayment, 0);
      let monthInterest = 0;
      let monthPrincipal = 0;

      // 1. Minimums & Interest
      currentDebts.forEach(d => {
        if (d.balance > 0) {
          const interest = d.balance * (d.rate / 12 / 100);
          d.balance += interest;
          totalInterestPaid += interest;
          monthInterest += interest;

          const pay = Math.min(d.balance, d.minPayment);
          d.balance -= pay;
          monthlyBudget -= pay;
          monthPrincipal += pay;
        }
      });

      // 2. Extra Payment (Boost)
      sortForSim(currentDebts); // Sort to find priority debt
      
      for (let d of currentDebts) {
        if (monthlyBudget <= 0) break;
        if (d.balance > 0) {
          const pay = Math.min(d.balance, monthlyBudget);
          d.balance -= pay;
          monthlyBudget -= pay;
          monthPrincipal += pay;
        }
      }

      timeline.push({
        month,
        date: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalBalance: Math.max(0, currentDebts.reduce((sum, d) => sum + d.balance, 0)),
        paidInterest: monthInterest,
        paidPrincipal: monthPrincipal
      });
    }

    return {
      timeline,
      summary: {
        totalDebt: debts.reduce((sum, d) => sum + d.balance, 0),
        totalInterest: Math.round(totalInterestPaid),
        payoffDate: timeline.length > 0 ? timeline[timeline.length - 1].date : 'Never',
        months: month,
        totalMonthly: debts.reduce((s,d)=>s+d.minPayment,0) + extraPayment
      }
    };
  }, [debts, extraPayment, strategy]);

  return { debts: sortedDebts, addDebt, removeDebt, extraPayment, setExtraPayment, strategy, setStrategy, timeline, summary, reset, isLoaded };
}
