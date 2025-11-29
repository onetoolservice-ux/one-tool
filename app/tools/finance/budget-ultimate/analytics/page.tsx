"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type ExpenseData = {
  name: string;
  value: number;
}[];

type Props = {
  expenseData: ExpenseData;
};

// Added more colors to support a larger range of categories
const COLORS = ["#0ea5e9", "#f97316", "#a78bfa", "#10b981", "#ef4444", "#8b5cf6"];

export default function AnalyticsPanel({ expenseData = [] }: Props) {
  // Add this safety check immediately inside the function
  if (!expenseData) return null;
  return (
    <div className="bg-surface dark:bg-slate-800 dark:bg-surface border rounded p-4">
      <div className="font-semibold mb-3">Expense Analytics</div>
      <div style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="value" data={expenseData} outerRadius={90} label>
              {expenseData.map((entry, i) => (
                <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}