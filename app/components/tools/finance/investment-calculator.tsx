"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, Calculator, PieChart as PieIcon, Briefcase, Landmark, DollarSign, Percent, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Input } from '@/app/components/shared';
import { formatCurrency } from '@/app/lib/utils/tool-helpers';
import { showToast } from '@/app/shared/Toast';

export const InvestmentCalculator = ({ mode }: { mode: 'sip' | 'loan' | 'net-worth' | 'retirement' }) => {
  // STATE
  const [p, setP] = useState(mode === 'loan' ? 500000 : 5000);
  const [r, setR] = useState(mode === 'loan' ? 9 : 12);
  const [t, setT] = useState(mode === 'loan' ? 20 : 10);
  const [mounted, setMounted] = useState(false);
  
  // Net Worth State
  const [assets, setAssets] = useState(1500000);
  const [liabilities, setLiabilities] = useState(400000);

  useEffect(() => setMounted(true), []);

  // CALCULATIONS & CHART DATA GENERATION
  const generateChartData = () => {
    const data = [];
    
    // Validate inputs
    if (p <= 0 || t <= 0 || r < 0 || !isFinite(p) || !isFinite(t) || !isFinite(r)) {
      return data;
    }
    
    for (let i = 0; i <= t; i++) {
      if (mode === 'sip') {
        const invested = p * 12 * i;
        const rate = r / 100;
        
        // Handle zero interest rate
        if (rate === 0 || i === 0) {
          data.push({ year: `Year ${i}`, Invested: invested, Value: invested });
          continue;
        }
        
        // FV = P × ({[1 + i]^n - 1} / i) × (1 + i)
        const monthlyRate = rate / 12;
        const periods = i * 12;
        const fv = p * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate) * (1 + monthlyRate);
        
        // Check for Infinity or NaN
        if (!isFinite(fv) || isNaN(fv)) {
          data.push({ year: `Year ${i}`, Invested: invested, Value: invested });
        } else {
          data.push({ year: `Year ${i}`, Invested: invested, Value: Math.round(fv) });
        }
      } else if (mode === 'loan') {
        // Handle zero interest
        if (r === 0) {
          const balance = Math.max(0, p - (p / t) * i);
          data.push({ year: `Year ${i}`, Balance: Math.round(balance), Interest: 0 });
          continue;
        }
        
        // Simple declining balance simulation for visual
        const monthlyRate = r / 1200;
        const periods = t * 12;
        const denominator = Math.pow(1 + monthlyRate, periods) - 1;
        
        if (denominator === 0 || !isFinite(denominator)) {
          const balance = Math.max(0, p - (p / t) * i);
          data.push({ year: `Year ${i}`, Balance: Math.round(balance), Interest: 0 });
          continue;
        }
        
        const totalPay = (p * monthlyRate * Math.pow(1 + monthlyRate, periods)) / denominator * periods;
        const interest = totalPay - p;
        const yearInt = interest / t;
        const yearPrin = p / t;
        const balance = p - (yearPrin * i);
        
        data.push({ year: `Year ${i}`, Balance: Math.max(0, Math.round(balance)), Interest: Math.round(yearInt * i) });
      }
    }
    return data;
  };

  const calculate = () => {
    if (mode === 'net-worth') return assets - liabilities;
    
    // Validate inputs
    if (p <= 0 || t <= 0 || r < 0 || !isFinite(p) || !isFinite(t) || !isFinite(r)) {
      return 0;
    }
    
    if (mode === 'loan') {
      if (r === 0) {
        return Math.round(p / (t * 12));
      }
      const monthlyRate = r / 1200;
      const periods = t * 12;
      const denominator = Math.pow(1 + monthlyRate, periods) - 1;
      
      if (denominator === 0 || !isFinite(denominator)) {
        return Math.round(p / periods);
      }
      
      const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, periods)) / denominator;
      return isFinite(emi) && !isNaN(emi) ? Math.round(emi) : 0;
    }
    
    // SIP / Retirement
    if (r === 0) {
      return Math.round(p * 12 * t);
    }
    
    const i = r / 1200;
    const n = t * 12;
    const fv = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    
    return isFinite(fv) && !isNaN(fv) ? Math.round(fv) : 0;
  };

  const finalValue = calculate();
  const chartData = generateChartData();

  const config = {
    'sip': { title: 'Smart SIP', icon: TrendingUp, labelP: 'Monthly Investment', labelR: 'Expected Return', labelT: 'Time Period', color: '#10b981' },
    'loan': { title: 'Smart Loan', icon: Calculator, labelP: 'Loan Amount', labelR: 'Interest Rate', labelT: 'Loan Tenure', color: '#f43f5e' },
    'retirement': { title: 'Smart Retirement', icon: Briefcase, labelP: 'Monthly Savings', labelR: 'Expected Growth', labelT: 'Years to Retire', color: '#8b5cf6' },
    'net-worth': { title: 'Smart Net Worth', icon: Landmark, color: '#3b82f6' }
  }[mode];

  const Icon = config.icon;

  if (mode === 'net-worth') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 border rounded-3xl shadow-sm mt-8">
         <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><Landmark className="text-blue-500"/> {config.title}</h2>
         <div className="space-y-6">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
               <label className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Total Assets</label>
               <input 
                 type="text" 
                 inputMode="numeric"
                 pattern="[0-9]*"
                 value={assets} 
                 onChange={e=>{
                   const val = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                   if (val < 0) {
                     showToast('Assets cannot be negative', 'error');
                     return;
                   }
                   if (val > 1000000000000) {
                     showToast('Amount exceeds maximum limit', 'error');
                     return;
                   }
                   setAssets(val);
                 }} 
                 className="w-full bg-transparent text-4xl font-black text-slate-900 dark:text-white outline-none mt-2"
               />
               <p className="text-xs text-blue-600/60 mt-1">Cash, Investments, Property</p>
            </div>
            <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800">
               <label className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Total Liabilities</label>
               <input 
                 type="number" 
                 value={liabilities} 
                 onChange={e=>{
                   const val = parseFloat(e.target.value) || 0;
                   if (val < 0) {
                     showToast('Liabilities cannot be negative', 'error');
                     return;
                   }
                   if (val > 1000000000000) {
                     showToast('Amount exceeds maximum limit', 'error');
                     return;
                   }
                   setLiabilities(val);
                 }} 
                 className="w-full bg-transparent text-4xl font-black text-rose-900 dark:text-white outline-none mt-2"
               />
               <p className="text-xs text-rose-600/60 mt-1">Loans, Credit Card Debt, Mortgages</p>
            </div>
            <div className="border-t pt-8 text-center">
               <p className="text-xs font-bold text-slate-400 uppercase mb-2">Your Net Worth</p>
               <h1 className="text-6xl font-bold text-slate-900 dark:text-white">₹ {(assets - liabilities).toLocaleString('en-IN')}</h1>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
       
       {/* LEFT: CONTROLS */}
       <div className="w-[400px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-xl flex-shrink-0">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
             <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
               <Icon className="text-teal-600"/> {config.title}
             </h2>
          </div>
          
          <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
             {/* Principal */}
             <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1"><DollarSign size={12}/> {config.labelP}</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={p.toString()}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                    if (val < 0) {
                      showToast(`${config.labelP} cannot be negative`, 'error');
                      return;
                    }
                    if (val === 0) {
                      showToast(`${config.labelP} must be greater than 0`, 'error');
                      return;
                    }
                    const maxVal = mode === 'loan' ? 100000000 : 1000000;
                    if (val > maxVal) {
                      showToast(`${config.labelP} exceeds maximum limit`, 'error');
                      return;
                    }
                    setP(val);
                  }}
                  className="font-bold text-right"
                />
                <input type="range" min={mode==='loan'?10000:500} max={mode==='loan'?10000000:100000} step={500} value={p} onChange={e=>setP(+e.target.value)} className="w-full accent-blue-600"/>
             </div>

             {/* Rate */}
             <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1"><Percent size={12}/> {config.labelR}</label>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  value={r.toString()}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                    if (val < 0) {
                      showToast('Rate cannot be negative', 'error');
                      return;
                    }
                    if (val > 100) {
                      showToast('Rate cannot exceed 100%', 'error');
                      return;
                    }
                    setR(val);
                  }}
                  rightIcon={<span className="text-slate-600 dark:text-slate-400 text-sm">%</span>}
                  className="font-bold"
                />
                <input type="range" min="1" max="30" step="0.1" value={r} onChange={e=>setR(+e.target.value)} className="w-full accent-blue-600"/>
             </div>

             {/* Time */}
             <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1"><Calendar size={12}/> {config.labelT}</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={t.toString()}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                    if (val < 0) {
                      showToast('Tenure cannot be negative', 'error');
                      return;
                    }
                    if (val === 0) {
                      showToast('Tenure must be greater than 0', 'error');
                      return;
                    }
                    if (val > 50) {
                      showToast('Tenure cannot exceed 50 years', 'error');
                      return;
                    }
                    setT(val);
                  }}
                  rightIcon={<span className="text-slate-600 dark:text-slate-400 text-sm">Years</span>}
                  className="font-bold"
                />
                <input type="range" min="1" max="40" value={t} onChange={e=>setT(+e.target.value)} className="w-full accent-blue-600"/>
             </div>

             {/* Result Card */}
             <div className="p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-lg mt-8 text-center">
                <p className="text-xs font-bold uppercase opacity-60 mb-1">{mode === 'loan' ? 'Monthly EMI' : 'Future Value'}</p>
                <h1 className="text-4xl font-black">{formatCurrency(finalValue)}</h1>
                {mode !== 'loan' && (
                  <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 text-xs">
                     <div><p className="opacity-60">Invested</p><p className="font-bold">{formatCurrency(p * 12 * t)}</p></div>
                     <div><p className="opacity-60">Wealth Gained</p><p className="font-bold text-emerald-400">+ {formatCurrency(finalValue - (p * 12 * t))}</p></div>
                  </div>
                )}
             </div>
          </div>
       </div>

       {/* RIGHT: CHARTS */}
       <div className="flex-1 bg-slate-50 dark:bg-black/20 p-8 flex flex-col justify-center items-center overflow-hidden">
          <div className="w-full h-[500px] bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
             <h3 className="absolute top-6 left-6 text-xs font-bold text-slate-400 uppercase">Growth Projection</h3>
             {mounted ? (
               <ResponsiveContainer width="100%" height="100%">
                  {mode === 'loan' ? (
                     <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="year" hide />
                        <YAxis hide />
                        <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                        <Legend />
                        <Bar dataKey="Balance" fill={config.color} radius={[4, 4, 0, 0]} />
                     </BarChart>
                  ) : (
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="year" tick={{fontSize: 10}} minTickGap={30} axisLine={false} tickLine={false}/>
                        <YAxis tickFormatter={(val) => `₹${val/100000}L`} tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                        <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} formatter={(v: number) => formatCurrency(v, '₹')} />
                        <Area type="monotone" dataKey="Value" stroke={config.color} strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                        <Area type="monotone" dataKey="Invested" stroke="#94a3b8" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" />
                     </AreaChart>
                  )}
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-600 dark:text-slate-400 animate-pulse">Loading Charts...</div>
             )}
          </div>
       </div>
    </div>
  );
};