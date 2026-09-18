"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioSlice {
  name: string;
  value: number;
  color: string;
  [key: string]: unknown;
}

export default function PfPortfolioPie({ data, fmtL }: { data: PortfolioSlice[]; fmtL: (n: number) => string }) {
  return (
    <ResponsiveContainer width={120} height={120}>
      <PieChart>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(v: number) => [fmtL(v)]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
