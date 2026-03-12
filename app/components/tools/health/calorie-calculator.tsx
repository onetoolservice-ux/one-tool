"use client";
import React, { useState, useMemo } from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-green-400 transition-colors w-full';
const sliderCls = 'w-full h-2 rounded-lg appearance-none cursor-pointer accent-green-500';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'lose_fast' | 'lose' | 'maintain' | 'gain' | 'gain_fast';

const ACTIVITY: Record<ActivityLevel, { label: string; multiplier: number; desc: string }> = {
  sedentary: { label: 'Sedentary', multiplier: 1.2, desc: 'Little or no exercise, desk job' },
  light: { label: 'Lightly Active', multiplier: 1.375, desc: 'Light exercise 1–3 days/week' },
  moderate: { label: 'Moderately Active', multiplier: 1.55, desc: 'Moderate exercise 3–5 days/week' },
  active: { label: 'Very Active', multiplier: 1.725, desc: 'Hard exercise 6–7 days/week' },
  very_active: { label: 'Extra Active', multiplier: 1.9, desc: 'Very hard exercise + physical job' },
};

const GOALS: Record<Goal, { label: string; calorieDiff: number; color: string; desc: string }> = {
  lose_fast: { label: 'Lose Fast (1 kg/week)', calorieDiff: -1100, color: '#ef4444', desc: 'Aggressive deficit — not recommended long-term' },
  lose: { label: 'Lose (0.5 kg/week)', calorieDiff: -550, color: '#f97316', desc: 'Sustainable weight loss' },
  maintain: { label: 'Maintain Weight', calorieDiff: 0, color: '#10b981', desc: 'Maintain current weight' },
  gain: { label: 'Gain (0.5 kg/week)', calorieDiff: 550, color: '#3b82f6', desc: 'Lean muscle building' },
  gain_fast: { label: 'Gain Fast (1 kg/week)', calorieDiff: 1100, color: '#8b5cf6', desc: 'Bulk phase' },
};

export const CalorieCalculator = () => {
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<Gender>('male');
  const [weight, setWeight] = useState(70); // kg
  const [height, setHeight] = useState(170); // cm
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');

  const result = useMemo(() => {
    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * ACTIVITY[activity].multiplier;
    const targetCalories = tdee + GOALS[goal].calorieDiff;

    // BMI
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const bmiCategory =
      bmi < 18.5 ? 'Underweight' :
      bmi < 25 ? 'Normal weight' :
      bmi < 30 ? 'Overweight' : 'Obese';

    // Ideal weight (Miller formula)
    const idealWeight = gender === 'male'
      ? 56.2 + 1.41 * (height - 152.4) / 2.54
      : 53.1 + 1.36 * (height - 152.4) / 2.54;

    // Macros (standard: 30P / 35C / 35F for maintenance)
    const protein = Math.round(weight * 1.6); // g/day
    const fat = Math.round((targetCalories * 0.30) / 9); // g/day
    const carbs = Math.round((targetCalories - protein * 4 - fat * 9) / 4); // g/day

    const macroData = [
      { name: 'Protein', grams: protein, cals: protein * 4, color: '#3b82f6' },
      { name: 'Carbs', grams: carbs, cals: Math.max(0, carbs * 4), color: '#f59e0b' },
      { name: 'Fat', grams: fat, cals: fat * 9, color: '#f97316' },
    ];

    // Weekly / monthly calorie budget
    const weeklyCals = targetCalories * 7;
    const weightChangePerWeek = GOALS[goal].calorieDiff / 7700; // 7700 kcal ≈ 1 kg

    return { bmr, tdee, targetCalories, bmi, bmiCategory, idealWeight, protein, fat, carbs, macroData, weeklyCals, weightChangePerWeek };
  }, [age, gender, weight, height, activity, goal]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Calorie & Macro Calculator"
        subtitle={`BMR: ${Math.round(result.bmr)} kcal · TDEE: ${Math.round(result.tdee)} kcal`}
        kpis={[
          { label: 'Daily Target', value: `${Math.round(result.targetCalories)} kcal`, color: 'primary', subtitle: GOALS[goal].label },
          { label: 'BMI', value: result.bmi.toFixed(1), color: result.bmi >= 18.5 && result.bmi < 25 ? 'success' : 'warning', subtitle: result.bmiCategory },
          { label: 'Ideal Weight', value: `${result.idealWeight.toFixed(1)} kg`, color: 'neutral', subtitle: 'Miller formula' },
          { label: 'Weekly Calories', value: `${Math.round(result.weeklyCals).toLocaleString('en-IN')} kcal`, color: 'neutral', subtitle: `${result.weightChangePerWeek > 0 ? '+' : ''}${result.weightChangePerWeek.toFixed(2)} kg/week` },
        ]}
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inputs */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Your Details</h2>

            {/* Gender */}
            <div className="space-y-1">
              <label className={labelCls}>Gender</label>
              <div className="flex gap-2">
                {(['male', 'female'] as Gender[]).map(g => (
                  <button key={g} onClick={() => setGender(g)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${gender === g
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Age</label>
                <span className="text-sm font-bold text-green-500">{age} yrs</span>
              </div>
              <input type="range" className={sliderCls} min={10} max={80} step={1} value={age} onChange={e => setAge(+e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Weight</label>
                <span className="text-sm font-bold text-green-500">{weight} kg</span>
              </div>
              <input type="range" className={sliderCls} min={30} max={150} step={0.5} value={weight} onChange={e => setWeight(+e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Height</label>
                <span className="text-sm font-bold text-green-500">{height} cm</span>
              </div>
              <input type="range" className={sliderCls} min={140} max={210} step={1} value={height} onChange={e => setHeight(+e.target.value)} />
            </div>

            {/* Activity */}
            <div className="space-y-1">
              <label className={labelCls}>Activity Level</label>
              <select className={inputCls} value={activity} onChange={e => setActivity(e.target.value as ActivityLevel)}>
                {(Object.entries(ACTIVITY) as [ActivityLevel, typeof ACTIVITY.sedentary][]).map(([key, v]) => (
                  <option key={key} value={key}>{v.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400">{ACTIVITY[activity].desc}</p>
            </div>

            {/* Goal */}
            <div className="space-y-1">
              <label className={labelCls}>Goal</label>
              <div className="space-y-1">
                {(Object.entries(GOALS) as [Goal, typeof GOALS.maintain][]).map(([key, v]) => (
                  <button key={key} onClick={() => setGoal(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${goal === key
                      ? 'text-white border-transparent'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-green-300'}`}
                    style={goal === key ? { backgroundColor: v.color, borderColor: v.color } : {}}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Calorie Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xs text-slate-500 mb-1">BMR</div>
                <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{Math.round(result.bmr)}</div>
                <div className="text-xs text-slate-400">kcal/day</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xs text-slate-500 mb-1">TDEE</div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{Math.round(result.tdee)}</div>
                <div className="text-xs text-slate-400">kcal/day</div>
              </div>
              <div className="rounded-xl p-4 text-center text-white"
                style={{ backgroundColor: GOALS[goal].color }}>
                <div className="text-xs opacity-80 mb-1">Your Target</div>
                <div className="text-xl font-bold">{Math.round(result.targetCalories)}</div>
                <div className="text-xs opacity-80">kcal/day</div>
              </div>
            </div>

            {/* Macro Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Recommended Daily Macros</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {result.macroData.map(m => (
                  <div key={m.name} className="text-center rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">{m.name}</div>
                    <div className="text-2xl font-bold" style={{ color: m.color }}>{m.grams}g</div>
                    <div className="text-xs text-slate-400">{m.cals} kcal</div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={result.macroData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" kcal" />
                  <Tooltip formatter={(v: number) => [`${v} kcal`]} />
                  <Bar dataKey="cals" radius={[4, 4, 0, 0]}>
                    {result.macroData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* BMI & Insight */}
            <div className={`rounded-xl p-4 border ${result.bmi >= 18.5 && result.bmi < 25 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'} flex gap-3`}>
              {result.bmi >= 18.5 && result.bmi < 25
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                : <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Your BMI is <strong>{result.bmi.toFixed(1)}</strong> ({result.bmiCategory}).
                Ideal weight for your height: <strong>{result.idealWeight.toFixed(1)} kg</strong>.
                {result.weightChangePerWeek !== 0 && ` At your target calories, you'll ${result.weightChangePerWeek > 0 ? 'gain' : 'lose'} ~${Math.abs(result.weightChangePerWeek).toFixed(2)} kg/week.`}
              </p>
            </div>

            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                These are estimates using the Mifflin-St Jeor equation. Individual metabolism varies. Consult a registered dietitian before making significant dietary changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
