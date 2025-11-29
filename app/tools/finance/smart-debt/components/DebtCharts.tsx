"use client";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function DebtCharts({ timeline }: { timeline: any[] }) {
  return (
    <div className="p-6 h-[400px]">
        <h4 className="text-sm font-bold text-main dark:text-slate-100 dark:text-slate-200 uppercase tracking-wide mb-4">Payoff Projection</h4>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize:10}} interval={11} />
                <YAxis tickFormatter={(val) => `${val/1000}k`} tick={{fontSize:10}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
                <Area type="monotone" dataKey="totalBalance" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorDebt)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
}
