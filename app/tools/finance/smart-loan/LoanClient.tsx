"use client";

import React, { useMemo } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Calculator, Download, TrendingDown, TrendingUp, DollarSign, Calendar, Percent } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

type LoanData = {
  amount: number;
  rate: number;
  term: number; // in years
};

const COLORS = ['#3B82F6', '#F59E0B'];

export default function LoanClient() {
  const [data, setData] = useLocalStorage<LoanData>("onetool_loan_v1", {
    amount: 100000,
    rate: 5.5,
    term: 30
  });

  const { monthlyPayment, totalPayment, totalInterest, schedule, chartData } = useMemo(() => {
    const r = data.rate / 100 / 12;
    const n = data.term * 12;
    const monthly = data.amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = monthly * n;
    const totalInt = totalPay - data.amount;

    let balance = data.amount;
    const scheduleData = [];
    for (let i = 1; i <= n; i++) {
      const interestPayment = balance * r;
      const principalPayment = monthly - interestPayment;
      balance -= principalPayment;
      
      if (i % 12 === 0 || i === 1 || i === n) {
         scheduleData.push({
            month: i,
            year: Math.ceil(i / 12),
            payment: monthly,
            interest: interestPayment,
            principal: principalPayment,
            balance: balance > 0 ? balance : 0
         });
      }
    }

    const chart = [
      { name: 'Principal', value: data.amount },
      { name: 'Interest', value: totalInt }
    ];

    return { 
      monthlyPayment: monthly, 
      totalPayment: totalPay, 
      totalInterest: totalInt, 
      schedule: scheduleData,
      chartData: chart
    };
  }, [data]);

  const handleInput = (field: keyof LoanData, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setData({ ...data, [field]: num });
    }
  };

  const exportCSV = () => {
    const r = data.rate / 100 / 12;
    const n = data.term * 12;
    let balance = data.amount;
    let csv = "Month,Payment,Principal,Interest,Remaining Balance\n";
    for (let i = 1; i <= n; i++) {
      const interestPayment = balance * r;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      csv += `${i},${monthlyPayment.toFixed(2)},${principalPayment.toFixed(2)},${interestPayment.toFixed(2)},${balance.toFixed(2)}\n`;
    }
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "loan_amortization_schedule.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <ToolShell 
      title="Smart Loan Calculator" 
      description="Calculate mortgages, auto loans, and personal loans with amortization schedules."
      category="Finance"
      icon={<Calculator className="w-5 h-5 text-blue-500" />}
      actions={
        <Button variant="outline" size="sm" onClick={exportCSV} icon={<Download size={16}/>}>
          Download Schedule
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3 mb-2 text-blue-600 dark:text-blue-400">
              <Calendar size={20}/>
              <span className="font-bold text-xs uppercase tracking-wider">Monthly Pay</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {monthlyPayment ? monthlyPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '...'}
            </p>
          </Card>
          
          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center gap-3 mb-2 text-amber-600 dark:text-amber-400">
              <TrendingUp size={20}/>
              <span className="font-bold text-xs uppercase tracking-wider">Total Interest</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
               {totalInterest ? totalInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '...'}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-slate-500">
            <div className="flex items-center gap-3 mb-2 text-slate-600 dark:text-slate-400">
              <DollarSign size={20}/>
              <span className="font-bold text-xs uppercase tracking-wider">Total Cost</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
               {totalPayment ? totalPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '...'}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Loan Details</h3>
               <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Loan Amount</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><DollarSign size={18}/></span>
                      <input 
                        type="number" 
                        value={data.amount}
                        onChange={(e) => handleInput('amount', e.target.value)}
                        className="w-full pl-12 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                      />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Interest Rate (%)</label>
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Percent size={18}/></span>
                        <input 
                          type="number" 
                          value={data.rate}
                          onChange={(e) => handleInput('rate', e.target.value)}
                          className="w-full pl-12 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        />
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Term (Years)</label>
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Calendar size={18}/></span>
                        <input 
                          type="number" 
                          value={data.term}
                          onChange={(e) => handleInput('term', e.target.value)}
                          className="w-full pl-12 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        />
                     </div>
                   </div>
                 </div>
               </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                 <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Amortization Schedule (Yearly)</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-6 py-3">Year</th>
                        <th className="px-6 py-3 text-right">Principal</th>
                        <th className="px-6 py-3 text-right">Interest</th>
                        <th className="px-6 py-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row) => (
                        <tr key={row.month} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">Year {row.year}</td>
                          <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400">${row.principal.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                          <td className="px-6 py-3 text-right text-amber-600 dark:text-amber-400">${row.interest.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                          <td className="px-6 py-3 text-right font-bold text-slate-700 dark:text-slate-300">${row.balance.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </Card>
          </div>

          <Card className="p-6 flex flex-col">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <TrendingDown className="text-blue-500"/> Breakdown
             </h3>
             <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                Over <strong>{data.term} years</strong>, you will pay <strong className="text-amber-600">{totalInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong> in interest alone.
             </div>
          </Card>
        </div>
      </div>
    </ToolShell>
  );
}
