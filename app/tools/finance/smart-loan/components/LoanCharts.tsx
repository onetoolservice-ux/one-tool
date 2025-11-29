"use client";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MonthlyPayment } from "../hooks/useLoanCalculator";

export function LoanCharts({ data }: { data: MonthlyPayment[] }) {
  const chartData = data.filter((_, i) => i % 6 === 0);
  return (
    <div className="p-6 h-[400px]">
        <h4 className="text-sm font-bold text-main dark:text-slate-100 dark:text-slate-200 uppercase tracking-wide mb-4">Balance Projection</h4>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs><linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="date" tick={{fontSize:10}} interval={12} />
                <YAxis tickFormatter={(val) => `${val/1000}k`} tick={{fontSize:10}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
                <Area type="monotone" dataKey="closingBalance" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBal)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
}
