"use client";
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6", "#f43f5e"];

type GroupOption = 'category' | 'glAccount' | 'costCenter';

export function AnalyticsDashboard({ getGroupedData }: { getGroupedData: (t: GroupOption) => any[] }) {
  const [groupBy, setGroupBy] = useState<GroupOption>('category');
  const data = getGroupedData(groupBy);

  return (
    <div className="p-6 space-y-6">
      
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase mr-2">Analyze By:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setGroupBy('category')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide tracking-wide rounded-md transition ${groupBy === 'category' ? 'bg-surface dark:bg-slate-800 dark:bg-surface   text-violet-700' : 'text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-main dark:text-slate-300'}`}
            >
                Category
            </button>
            <button 
                onClick={() => setGroupBy('glAccount')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide tracking-wide rounded-md transition ${groupBy === 'glAccount' ? 'bg-surface dark:bg-slate-800 dark:bg-surface   text-violet-700' : 'text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-main dark:text-slate-300'}`}
            >
                GL Account
            </button>
            <button 
                onClick={() => setGroupBy('costCenter')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide tracking-wide rounded-md transition ${groupBy === 'costCenter' ? 'bg-surface dark:bg-slate-800 dark:bg-surface   text-violet-700' : 'text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-main dark:text-slate-300'}`}
            >
                Cost Center
            </button>
            </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-20 bg-background dark:bg-surface dark:bg-slate-950 rounded-xl border border-dashed text-muted/70">
            No expense data available for the selected view.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart 1: Donut Distribution */}
          <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-xl border   flex flex-col items-center">
            <h4 className="text-sm font-bold text-main dark:text-slate-100 dark:text-slate-200 uppercase tracking-wide mb-6 w-full text-center">Cost Distribution</h4>
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={80} outerRadius={120} paddingAngle={4} strokeWidth={2} stroke="#fff">
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => `₹${val.toLocaleString()}`} 
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Bar Comparison */}
          <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-xl border  ">
            <h4 className="text-sm font-bold text-main dark:text-slate-100 dark:text-slate-200 uppercase tracking-wide mb-6 text-center">Variance Analysis</h4>
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => `₹${val.toLocaleString()}`} 
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
