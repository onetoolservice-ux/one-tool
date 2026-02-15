"use client";
import React, { useState, useMemo } from 'react';

interface Category { label: string; range: string; color: string; bg: string; bar: string }
const CATEGORIES: Category[] = [
  { label:'Severely Underweight', range:'< 16',      color:'text-blue-700', bg:'bg-blue-50 dark:bg-blue-900/20',   bar:'bg-blue-400' },
  { label:'Underweight',          range:'16 – 18.4', color:'text-sky-600',  bg:'bg-sky-50  dark:bg-sky-900/20',    bar:'bg-sky-400'  },
  { label:'Normal Weight',        range:'18.5 – 24.9',color:'text-emerald-600',bg:'bg-emerald-50 dark:bg-emerald-900/20', bar:'bg-emerald-500' },
  { label:'Overweight',           range:'25 – 29.9', color:'text-amber-600',bg:'bg-amber-50 dark:bg-amber-900/20', bar:'bg-amber-400' },
  { label:'Obese Class I',        range:'30 – 34.9', color:'text-orange-600',bg:'bg-orange-50 dark:bg-orange-900/20',bar:'bg-orange-500'},
  { label:'Obese Class II',       range:'35 – 39.9', color:'text-rose-600',  bg:'bg-rose-50  dark:bg-rose-900/20',  bar:'bg-rose-500'  },
  { label:'Obese Class III',      range:'≥ 40',       color:'text-red-700',  bg:'bg-red-50   dark:bg-red-900/20',   bar:'bg-red-600'   },
];

function getBMICategory(bmi: number): Category {
  if (bmi < 16)   return CATEGORIES[0];
  if (bmi < 18.5) return CATEGORIES[1];
  if (bmi < 25)   return CATEGORIES[2];
  if (bmi < 30)   return CATEGORIES[3];
  if (bmi < 35)   return CATEGORIES[4];
  if (bmi < 40)   return CATEGORIES[5];
  return CATEGORIES[6];
}

// Harris-Benedict BMR
function calcBMR(weightKg: number, heightCm: number, age: number, sex: 'male' | 'female') {
  if (sex === 'male')   return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
}

const ACTIVITY: { label: string; factor: number }[] = [
  { label:'Sedentary (little/no exercise)',  factor:1.2  },
  { label:'Lightly active (1–3 days/wk)',    factor:1.375},
  { label:'Moderately active (3–5 days/wk)', factor:1.55 },
  { label:'Very active (6–7 days/wk)',        factor:1.725},
  { label:'Super active (physical job)',      factor:1.9  },
];

export const SmartBMI = () => {
  const [height, setHeight]   = useState(175);
  const [weight, setWeight]   = useState(70);
  const [age, setAge]         = useState(25);
  const [sex, setSex]         = useState<'male'|'female'>('male');
  const [actIdx, setActIdx]   = useState(1);

  const bmi     = useMemo(() => weight / Math.pow(height / 100, 2), [weight, height]);
  const cat     = useMemo(() => getBMICategory(bmi), [bmi]);
  const bmiPct  = useMemo(() => Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100)), [bmi]);

  // Ideal weight range (BMI 18.5–24.9)
  const hm = height / 100;
  const idealLow  = Math.round(18.5 * hm * hm);
  const idealHigh = Math.round(24.9 * hm * hm);

  const bmr  = useMemo(() => calcBMR(weight, height, age, sex), [weight, height, age, sex]);
  const tdee = useMemo(() => bmr * ACTIVITY[actIdx].factor, [bmr, actIdx]);

  const inp = 'w-full h-9 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white font-bold text-center';

  return (
    <div className="max-w-2xl mx-auto p-5 space-y-4">
      {/* Inputs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">Height (cm)</label>
            <input type="range" min={120} max={220} value={height} onChange={e=>setHeight(+e.target.value)} className="w-full accent-teal-500 mb-1" />
            <p className="text-center font-black text-lg text-slate-800 dark:text-white">{height} cm</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">Weight (kg)</label>
            <input type="range" min={30} max={200} value={weight} onChange={e=>setWeight(+e.target.value)} className="w-full accent-teal-500 mb-1" />
            <p className="text-center font-black text-lg text-slate-800 dark:text-white">{weight} kg</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Age</label>
            <input type="number" min={10} max={100} value={age} onChange={e=>setAge(+e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sex</label>
            <div className="flex gap-1 h-9">
              {(['male','female'] as const).map(s => (
                <button key={s} onClick={() => setSex(s)}
                  className={`flex-1 rounded-xl text-xs font-bold border transition-all capitalize ${sex === s ? 'bg-teal-500 text-white border-teal-500' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Activity</label>
            <select value={actIdx} onChange={e => setActIdx(+e.target.value)}
              className="w-full h-9 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-700 dark:text-white">
              {ACTIVITY.map((a, i) => <option key={i} value={i}>{a.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* BMI Result */}
      <div className={`rounded-2xl p-5 border ${cat.bg} flex items-center gap-5`}>
        <div className="text-center flex-shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase">BMI</p>
          <p className={`text-5xl font-black ${cat.color}`}>{bmi.toFixed(1)}</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 ${cat.color}`}>{cat.label}</span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="relative h-4 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
            <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${cat.bar}`} style={{ width: `${bmiPct}%` }} />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400">
            <span>15</span><span>18.5</span><span>25</span><span>30</span><span>35</span><span>40</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            Healthy range for your height: <span className="font-black text-emerald-600">{idealLow}–{idealHigh} kg</span>
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'BMR', val:`${Math.round(bmr)} kcal/day`, sub:'Calories at rest', color:'text-blue-600' },
          { label:'TDEE', val:`${Math.round(tdee)} kcal/day`, sub:'Total daily energy', color:'text-purple-600' },
          { label:'Weight to lose', val: bmi > 24.9 ? `${Math.round(weight - idealHigh)} kg` : bmi < 18.5 ? `Gain ${Math.round(idealLow - weight)} kg` : 'At ideal weight ✓', sub:'To reach healthy BMI', color: bmi >= 18.5 && bmi <= 24.9 ? 'text-emerald-600' : 'text-amber-600' },
        ].map(m => (
          <div key={m.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">{m.label}</p>
            <p className={`text-base font-black ${m.color} mt-1 leading-tight`}>{m.val}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Category table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">Category</th>
              <th className="text-center px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">BMI Range</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(c => (
              <tr key={c.label} className={`border-t border-slate-100 dark:border-slate-800 ${c.label === cat.label ? c.bg : ''}`}>
                <td className={`px-4 py-2 text-xs font-bold ${c.label === cat.label ? c.color : 'text-slate-600 dark:text-slate-400'}`}>
                  {c.label === cat.label ? '▶ ' : ''}{c.label}
                </td>
                <td className="px-4 py-2 text-xs text-center text-slate-500 font-mono">{c.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[9px] text-slate-400 text-center">BMI is a screening tool, not a diagnostic measure. Consult a healthcare provider for personalized advice.</p>
    </div>
  );
};
