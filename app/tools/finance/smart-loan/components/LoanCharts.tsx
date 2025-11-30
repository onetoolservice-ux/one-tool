import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MonthlyPayment, LoanSummary } from "../hooks/useLoanCalculator";

// ✅ Updated Interface to include 'summary'
interface Props {
  data: MonthlyPayment[];
  summary: LoanSummary; 
}

export function LoanCharts({ data, summary }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance History */}
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-5 rounded-2xl border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-main dark:text-slate-100 dark:text-slate-200 mb-4 text-sm">Principal Paydown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interest vs Principal */}
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-5 rounded-2xl border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
           <div className="relative w-48 h-48 rounded-full border-[16px] border-blue-100 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[16px] border-blue-600 dark:border-blue-500 border-l-transparent border-b-transparent rotate-45"></div>
              <div>
                <div className="text-3xl font-black text-main dark:text-slate-100 dark:text-slate-200">{Math.round((summary.totalInterest / summary.totalPayment) * 100)}%</div>
                <div className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Interest</div>
              </div>
           </div>
           <div className="mt-6 flex gap-6 text-sm">
              <div>
                <div className="font-bold text-blue-600 dark:text-blue-400">Interest</div>
                <div className="text-main dark:text-slate-100 dark:text-slate-200">₹{summary.totalInterest.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-bold text-slate-400">Principal</div>
                <div className="text-main dark:text-slate-100 dark:text-slate-200">₹{(summary.totalPayment - summary.totalInterest).toLocaleString()}</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
