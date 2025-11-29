"use client";
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1"];

export function AnalyticsDashboard({ getGroupedData }: { getGroupedData: (t: any) => any[] }) {
  const [groupBy, setGroupBy] = useState<'category'|'date'>('category');
  const data = getGroupedData(groupBy);

  return (
    <div className="p-6 space-y-6">
      
      {/* Controls */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-slate-600">Group Expenses By:</span>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setGroupBy('category')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${groupBy === 'category' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
          >
            Category
          </button>
          <button 
            onClick={() => setGroupBy('date')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${groupBy === 'date' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
          >
            Month
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-10 text-slate-400">Not enough data to chart. Try adding expenses.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart 1: Donut Distribution */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 text-center">Distribution</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={5}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Bar Comparison */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 text-center">Comparison</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout={groupBy === 'category' ? 'vertical' : 'horizontal'}>
                  {groupBy === 'category' ? <XAxis type="number" hide /> : <XAxis dataKey="name" />}
                  {groupBy === 'category' ? <YAxis dataKey="name" type="category" width={100} style={{fontSize: 11}} /> : <YAxis />}
                  <Tooltip cursor={{fill: 'transparent'}} formatter={(val: number) => `₹${val.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
