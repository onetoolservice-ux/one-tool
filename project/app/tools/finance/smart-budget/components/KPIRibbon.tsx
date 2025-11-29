import React from "react";
import { KPI } from "../types";

export function KPIRibbon({ kpi }: { kpi: KPI }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x bg-white border-b">
      <div className="p-4">
        <div className="text-xs text-slate-500 uppercase font-semibold">Inflow</div>
        <div className="text-xl font-bold text-emerald-600">₹{kpi.income.toLocaleString()}</div>
      </div>
      <div className="p-4">
        <div className="text-xs text-slate-500 uppercase font-semibold">Outflow</div>
        <div className="text-xl font-bold text-rose-600">₹{kpi.expense.toLocaleString()}</div>
      </div>
      <div className="p-4">
        <div className="text-xs text-slate-500 uppercase font-semibold">Net Balance</div>
        <div className={`text-xl font-bold ${kpi.balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
          ₹{kpi.balance.toLocaleString()}
        </div>
      </div>
      <div className="p-4 bg-slate-50">
        <div className="text-xs text-slate-500 uppercase font-semibold">Transactions</div>
        <div className="text-xl font-bold text-slate-600">{kpi.count}</div>
      </div>
    </div>
  );
}
