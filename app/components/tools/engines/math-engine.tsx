"use client";
import React, { useState } from 'react';
import { Calculator, ArrowRight, RefreshCw } from 'lucide-react';

interface MathEngineProps {
  toolId: string;
}

export const MathEngine = ({ toolId }: MathEngineProps) => {
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const v1 = parseFloat(val1);
    const v2 = parseFloat(val2);
    if (isNaN(v1)) return;

    let res = "";
    switch (toolId) {
      case 'unit-convert': 
        res = `${v1} m = ${(v1 * 3.28084).toFixed(3)} ft`; 
        break;
      case 'smart-bmi': 
        if (isNaN(v2)) { res = "Enter Height"; break; }
        const bmi = (v1 / (v2/100 * v2/100)).toFixed(1);
        res = `BMI: ${bmi}`;
        break;
      default:
         res = "Result: " + (v1 * 2);
    }
    setResult(res);
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
       <div className="space-y-6">
          <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
               {toolId === 'smart-bmi' ? 'Weight (kg)' : 'Value'}
             </label>
             <input type="number" value={val1} onChange={e=>setVal1(e.target.value)} className="w-full text-2xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
          </div>

          {toolId === 'smart-bmi' && (
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Height (cm)</label>
               <input type="number" value={val2} onChange={e=>setVal2(e.target.value)} className="w-full text-2xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
            </div>
          )}

          <button onClick={calculate} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
             <Calculator size={18}/> Calculate
          </button>

          {result && (
             <div className="mt-6 p-4 bg-[#638c80]/10 dark:bg-emerald-900/20 border border-[#638c80]/20 dark:border-emerald-800 rounded-xl text-center animate-in zoom-in">
                <span className="text-xs font-bold text-[#4a6b61] uppercase">Result</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{result}</div>
             </div>
          )}
       </div>
    </div>
  );
};
