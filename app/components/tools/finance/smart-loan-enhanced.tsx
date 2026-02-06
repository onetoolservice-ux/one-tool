"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, TrendingDown, TrendingUp, DollarSign, Calendar, Percent, Info, Download, Save, GitCompare, AlertCircle, Home, Car, GraduationCap, User, Building } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Input, Button } from '@/app/components/shared';
import { formatCurrency } from '@/app/lib/utils/tool-helpers';
import { saveToolData, loadToolData, exportToolData } from '@/app/lib/utils/tool-persistence';
import { showToast } from '@/app/shared/Toast';

// Preset loan types with typical rates and tenures (India-specific)
const LOAN_PRESETS = [
  { id: 'home', name: 'Home Loan', icon: Home, principal: 5000000, rate: 8.5, tenure: 20, color: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' },
  { id: 'car', name: 'Car Loan', icon: Car, principal: 800000, rate: 9.5, tenure: 5, color: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' },
  { id: 'personal', name: 'Personal', icon: User, principal: 500000, rate: 12, tenure: 5, color: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' },
  { id: 'education', name: 'Education', icon: GraduationCap, principal: 1000000, rate: 10, tenure: 7, color: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' },
] as const;

interface EMIBreakdown {
  month: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
}

interface PrepaymentScenario {
  type: 'one-time' | 'monthly' | 'yearly';
  amount: number;
  startMonth?: number;
}

interface SavedScenario {
  id: string;
  name: string;
  principal: number;
  rate: number;
  tenure: number;
  prepayments?: PrepaymentScenario[];
  createdAt: string;
}

export const SmartLoanEnhanced = () => {
  // Load saved data
  const defaultData = {
    principal: 5000000,
    rate: 8.5,
    tenure: 20,
    prepayments: [] as PrepaymentScenario[],
    savedScenarios: [] as SavedScenario[],
  };
  
  const savedData = loadToolData('smart-loan-enhanced', defaultData);
  
  const [principal, setPrincipal] = useState(savedData.principal || 5000000);
  const [rate, setRate] = useState(savedData.rate || 8.5);
  const [tenure, setTenure] = useState(savedData.tenure || 20);
  const [prepayments, setPrepayments] = useState<PrepaymentScenario[]>(savedData.prepayments || []);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(savedData.savedScenarios || []);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [compareScenario, setCompareScenario] = useState<string | null>(null);
  const [showPrepayment, setShowPrepayment] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [prepaymentType, setPrepaymentType] = useState<'one-time' | 'monthly' | 'yearly'>('one-time');
  const [prepaymentAmount, setPrepaymentAmount] = useState(0);
  const [prepaymentStartMonth, setPrepaymentStartMonth] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply loan preset
  const applyPreset = (presetId: string) => {
    const preset = LOAN_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setPrincipal(preset.principal);
      setRate(preset.rate);
      setTenure(preset.tenure);
      setPrepayments([]); // Clear prepayments when changing loan type
      setSelectedLoanType(presetId);
      showToast(`${preset.name} preset applied`, 'success');
    }
  };

  // Auto-save (only if inputs are valid)
  useEffect(() => {
    if (mounted && principal > 0 && tenure > 0 && rate >= 0) {
      saveToolData('smart-loan-enhanced', {
        principal,
        rate,
        tenure,
        prepayments,
        savedScenarios,
      });
    }
  }, [principal, rate, tenure, prepayments, savedScenarios, mounted]);

  // Calculate EMI
  const calculateEMI = (p: number, r: number, n: number): number => {
    if (p <= 0 || n <= 0 || r < 0) return 0;
    if (r === 0) return Math.round(p / (n * 12));
    
    const monthlyRate = r / 12 / 100;
    const months = n * 12;
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    
    if (denominator === 0 || !isFinite(denominator)) return 0;
    
    const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / denominator;
    return isFinite(emi) && !isNaN(emi) ? Math.round(emi) : 0;
  };

  // Generate EMI breakdown with prepayments
  const generateEMIBreakdown = useMemo((): EMIBreakdown[] => {
    const emi = calculateEMI(principal, rate, tenure);
    if (emi === 0) return [];
    
    const monthlyRate = rate / 12 / 100;
    const months = tenure * 12;
    const breakdown: EMIBreakdown[] = [];
    let balance = principal;
    let cumulativeInterest = 0;

    for (let month = 1; month <= months; month++) {
      // Apply prepayments FIRST (before interest calculation)
      let prepaymentAmount = 0;
      for (const prepayment of prepayments) {
        if (prepayment.type === 'one-time' && prepayment.startMonth === month) {
          prepaymentAmount += Math.min(prepayment.amount, balance); // Can't prepay more than balance
        } else if (prepayment.type === 'monthly' && month >= (prepayment.startMonth || 1)) {
          prepaymentAmount += Math.min(prepayment.amount, balance);
        } else if (prepayment.type === 'yearly' && month % 12 === ((prepayment.startMonth || 12) % 12) && month >= (prepayment.startMonth || 12)) {
          prepaymentAmount += Math.min(prepayment.amount, balance);
        }
      }
      
      // Reduce balance by prepayment
      balance = Math.max(0, balance - prepaymentAmount);
      
      // Calculate interest on REDUCED balance
      const interest = balance * monthlyRate;
      let principalPaid = emi - interest;
      cumulativeInterest += interest;
      
      // Apply EMI principal payment
      balance = Math.max(0, balance - principalPaid);
      
      // Total principal paid includes prepayment
      principalPaid += prepaymentAmount;
      
      breakdown.push({
        month,
        principal: Math.round(principalPaid),
        interest: Math.round(interest),
        balance: Math.round(balance),
        cumulativeInterest: Math.round(cumulativeInterest),
      });
      
      if (balance <= 0) break;
    }
    
    return breakdown;
  }, [principal, rate, tenure, prepayments]);

  const emi = calculateEMI(principal, rate, tenure);
  const breakdown = generateEMIBreakdown;
  const totalInterest = breakdown.length > 0 ? breakdown[breakdown.length - 1].cumulativeInterest : 0;
  const totalAmount = principal + totalInterest;
  const actualTenure = breakdown.length / 12;
  // Calculate interest saved: baseline interest - actual interest
  const baselineEMI = calculateEMI(principal, rate, tenure);
  const baselineTotalInterest = baselineEMI * tenure * 12 - principal;
  const interestSaved = prepayments.length > 0 ? 
    (baselineTotalInterest - totalInterest) : 0;

  // Yearly chart data
  const yearlyData = useMemo(() => {
    const data = [];
    // Add initial state (Year 0)
    data.push({
      year: `Yr 0`,
      Principal: 0,
      Interest: 0,
      Balance: principal,
    });
    
    for (let year = 1; year <= tenure; year++) {
      const monthIndex = year * 12 - 1; // Month 12, 24, 36... (0-indexed: 11, 23, 35...)
      if (monthIndex < breakdown.length) {
        const point = breakdown[monthIndex];
        data.push({
          year: `Yr ${year}`,
          Principal: principal - point.balance, // Use current principal for display
          Interest: point.cumulativeInterest,
          Balance: point.balance,
        });
      } else if (breakdown.length > 0) {
        // Loan paid off early, use last point
        const lastPoint = breakdown[breakdown.length - 1];
        data.push({
          year: `Yr ${year}`,
          Principal: principal - lastPoint.balance,
          Interest: lastPoint.cumulativeInterest,
          Balance: lastPoint.balance,
        });
      }
    }
    return data;
  }, [breakdown, tenure, principal]);

  // Save scenario
  const saveScenario = () => {
    const scenario: SavedScenario = {
      id: Date.now().toString(),
      name: `Loan Plan ${savedScenarios.length + 1}`,
      principal,
      rate,
      tenure,
      prepayments: [...prepayments],
      createdAt: new Date().toISOString(),
    };
    setSavedScenarios([...savedScenarios, scenario]);
    showToast('Scenario saved successfully', 'success');
  };

  // Load scenario
  const loadScenario = (scenarioId: string) => {
    const scenario = savedScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setPrincipal(scenario.principal);
      setRate(scenario.rate);
      setTenure(scenario.tenure);
      setPrepayments(scenario.prepayments || []);
      setSelectedScenario(scenarioId);
      showToast('Scenario loaded', 'success');
    }
  };

  // Delete scenario
  const deleteScenario = (scenarioId: string) => {
    setSavedScenarios(savedScenarios.filter(s => s.id !== scenarioId));
    if (selectedScenario === scenarioId) setSelectedScenario(null);
    if (compareScenario === scenarioId) setCompareScenario(null);
    showToast('Scenario deleted', 'success');
  };

  // Calculate scenario metrics for comparison
  const calculateScenarioMetrics = (sc: SavedScenario) => {
    const scEmi = calculateEMI(sc.principal, sc.rate, sc.tenure);
    if (scEmi === 0) return { emi: 0, totalInterest: 0, totalAmount: sc.principal, actualTenure: sc.tenure };
    
    // Calculate breakdown for scenario
    const scMonthlyRate = sc.rate / 12 / 100;
    const scMonths = sc.tenure * 12;
    let scBalance = sc.principal;
    let scCumulativeInterest = 0;
    let scMonthsPaid = 0;

    for (let month = 1; month <= scMonths; month++) {
      // Apply prepayments first
      let scPrepaymentAmount = 0;
      for (const prepayment of (sc.prepayments || [])) {
        if (prepayment.type === 'one-time' && prepayment.startMonth === month) {
          scPrepaymentAmount += Math.min(prepayment.amount, scBalance);
        } else if (prepayment.type === 'monthly' && month >= (prepayment.startMonth || 1)) {
          scPrepaymentAmount += Math.min(prepayment.amount, scBalance);
        } else if (prepayment.type === 'yearly' && month % 12 === ((prepayment.startMonth || 12) % 12) && month >= (prepayment.startMonth || 12)) {
          scPrepaymentAmount += Math.min(prepayment.amount, scBalance);
        }
      }
      
      scBalance = Math.max(0, scBalance - scPrepaymentAmount);
      const scInterest = scBalance * scMonthlyRate;
      const scPrincipalPaid = scEmi - scInterest;
      scCumulativeInterest += scInterest;
      scBalance = Math.max(0, scBalance - scPrincipalPaid);
      scMonthsPaid = month;
      
      if (scBalance <= 0) break;
    }
    
    return {
      emi: scEmi,
      totalInterest: Math.round(scCumulativeInterest),
      totalAmount: sc.principal + Math.round(scCumulativeInterest),
      actualTenure: scMonthsPaid / 12,
    };
  };

  // Add prepayment
  const addPrepayment = () => {
    if (prepaymentAmount <= 0) {
      showToast('Prepayment amount must be greater than 0', 'error');
      return;
    }
    setPrepayments([...prepayments, {
      type: prepaymentType,
      amount: prepaymentAmount,
      startMonth: prepaymentType === 'one-time' ? prepaymentStartMonth : undefined,
    }]);
    setPrepaymentAmount(0);
    setShowPrepayment(false);
    showToast('Prepayment added', 'success');
  };

  // Comparison data (already calculated above for interestSaved)
  const baselineTenure = tenure;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)] overflow-hidden p-4 bg-slate-50 dark:bg-[#0B1120]">
      {/* LEFT: CONTROLS */}
      <div className="w-full lg:w-[450px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl z-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="text-rose-500"/> Smart Loan
          </h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAssumptions(!showAssumptions)}
              icon={<Info size={14} />}
            >
              Info
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowScenarios(!showScenarios)}
              icon={<GitCompare size={14} />}
            >
              Scenarios
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={saveScenario}
              icon={<Save size={14} />}
            >
              Save
            </Button>
          </div>
        </div>

        {/* Saved Scenarios Panel */}
        {showScenarios && savedScenarios.length > 0 && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <GitCompare size={14} /> Saved Scenarios
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedScenarios.map((sc) => {
                const metrics = calculateScenarioMetrics(sc);
                return (
                  <div key={sc.id} className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-semibold">{sc.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(sc.principal)} @ {sc.rate}% / {sc.tenure}yr
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          EMI: {formatCurrency(metrics.emi)} | Interest: {formatCurrency(metrics.totalInterest)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadScenario(sc.id)}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => setCompareScenario(compareScenario === sc.id ? null : sc.id)}
                          className={`text-xs px-2 py-1 rounded ${
                            compareScenario === sc.id
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          Compare
                        </button>
                        <button
                          onClick={() => deleteScenario(sc.id)}
                          className="text-xs px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded hover:bg-rose-200 dark:hover:bg-rose-900/50"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assumptions Panel */}
        {showAssumptions && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={16} /> Assumptions & Disclaimers
            </h3>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>• Interest calculated monthly (reducing balance method)</li>
              <li>• Prepayments reduce principal immediately</li>
              <li>• EMI recalculated after prepayments (tenure reduction mode)</li>
              <li>• Does not include processing fees, insurance, or other charges</li>
              <li>• Actual bank rates may vary</li>
            </ul>
          </div>
        )}

        <div className="space-y-6 flex-1">
          {/* Quick Presets */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Quick Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {LOAN_PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedLoanType === preset.id
                        ? preset.color + ' border-2'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={selectedLoanType === preset.id ? '' : 'text-slate-500'} />
                      <span className="text-xs font-semibold">{preset.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {formatCurrency(preset.principal)} @ {preset.rate}%
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Loan Amount</label>
            <Input
              type="text"
              inputMode="numeric"
              value={principal.toString()}
              onChange={(e) => {
                const val = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                if (val > 0 && val <= 100000000) setPrincipal(val);
              }}
              leftIcon={<span className="text-slate-600 dark:text-slate-400 font-bold">₹</span>}
              className="font-bold pl-8"
            />
            <input type="range" min="100000" max="100000000" step="50000" value={Math.min(principal, 100000000)} onChange={e=>setPrincipal(+e.target.value)} className="w-full mt-3 accent-blue-600"/>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Interest Rate (%)</label>
            <Input
              type="text"
              inputMode="decimal"
              value={rate.toString()}
              onChange={(e) => {
                const val = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                if (val >= 0 && val <= 100) setRate(val);
              }}
              rightIcon={<span className="text-slate-600 dark:text-slate-400">%</span>}
              className="font-bold"
            />
            <input type="range" min="0" max="20" step="0.1" value={rate} onChange={e=>setRate(Math.max(0, Math.min(20, +e.target.value)))} className="w-full mt-3 accent-blue-600"/>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Tenure (Years)</label>
            <Input
              type="text"
              inputMode="numeric"
              value={tenure.toString()}
              onChange={(e) => {
                const val = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                if (val <= 0) {
                  showToast('Tenure must be greater than 0', 'error');
                  return;
                }
                if (val > 50) {
                  showToast('Tenure cannot exceed 50 years', 'error');
                  return;
                }
                setTenure(val);
              }}
              rightIcon={<span className="text-slate-600 dark:text-slate-400 text-sm">Years</span>}
              className="font-bold"
            />
            <input type="range" min="1" max="50" value={Math.min(tenure, 50)} onChange={e=>setTenure(Math.max(1, Math.min(50, +e.target.value)))} className="w-full mt-3 accent-blue-600"/>
          </div>

          {/* Prepayment Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Prepayments</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrepayment(!showPrepayment)}
              >
                {showPrepayment ? 'Cancel' : 'Add'}
              </Button>
            </div>
            
            {prepayments.length > 0 && (
              <div className="space-y-2 mb-3">
                {prepayments.map((pre, idx) => (
                  <div key={idx} className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded flex justify-between">
                    <span>{pre.type === 'one-time' ? 'One-time' : pre.type === 'monthly' ? 'Monthly' : 'Yearly'}: {formatCurrency(pre.amount)}</span>
                    <button onClick={() => setPrepayments(prepayments.filter((_, i) => i !== idx))} className="text-rose-500">×</button>
                  </div>
                ))}
              </div>
            )}

            {showPrepayment && (
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <select
                  value={prepaymentType}
                  onChange={(e) => setPrepaymentType(e.target.value as any)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={prepaymentAmount.toString()}
                  onChange={(e) => setPrepaymentAmount(parseFloat(e.target.value) || 0)}
                />
                {prepaymentType === 'one-time' && (
                  <Input
                    type="number"
                    placeholder="Start Month"
                    value={prepaymentStartMonth.toString()}
                    onChange={(e) => setPrepaymentStartMonth(parseInt(e.target.value) || 1)}
                  />
                )}
                <Button onClick={addPrepayment} size="sm" fullWidth>Add Prepayment</Button>
              </div>
            )}
          </div>

          {/* EMI Result Card */}
          <div className="mt-8 bg-rose-600 text-white p-6 rounded-2xl text-center shadow-lg shadow-rose-500/20">
            <p className="text-xs font-bold text-rose-100 uppercase mb-1">Monthly EMI</p>
            <h1 className="text-4xl font-black">{formatCurrency(emi)}</h1>
            {prepayments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-rose-400/30 text-xs">
                <p className="opacity-80">Interest Saved</p>
                <p className="text-lg font-bold text-emerald-200">₹ {formatCurrency(interestSaved)}</p>
                <p className="opacity-80 mt-2">Actual Tenure</p>
                <p className="text-lg font-bold">{actualTenure.toFixed(1)} years</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: VISUALS & ANALYSIS */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Interest</p>
            <p className="text-2xl font-bold text-rose-500">{formatCurrency(totalInterest)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Interest %</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{((totalInterest / totalAmount) * 100).toFixed(1)}%</p>
          </div>
          {prepayments.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Interest Saved</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(interestSaved)}</p>
            </div>
          )}
        </div>

        {/* Comparison: Prepayment vs Baseline OR Current vs Saved Scenario */}
        {(prepayments.length > 0 || compareScenario) && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-bold mb-3 text-sm">Comparison</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {compareScenario ? (
                <>
                  {/* Current Scenario */}
                  <div>
                    <p className="font-bold mb-2">Current</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">EMI: {formatCurrency(emi)}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Interest: {formatCurrency(totalInterest)}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Tenure: {actualTenure.toFixed(1)} years</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Total: {formatCurrency(totalAmount)}</p>
                  </div>
                  {/* Saved Scenario */}
                  {(() => {
                    const sc = savedScenarios.find(s => s.id === compareScenario);
                    if (!sc) return null;
                    const scMetrics = calculateScenarioMetrics(sc);
                    const interestDiff = totalInterest - scMetrics.totalInterest;
                    const tenureDiff = actualTenure - scMetrics.actualTenure;
                    return (
                      <div>
                        <p className="font-bold mb-2 text-emerald-600">{sc.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">EMI: {formatCurrency(scMetrics.emi)}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Interest: {formatCurrency(scMetrics.totalInterest)}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Tenure: {scMetrics.actualTenure.toFixed(1)} years</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Total: {formatCurrency(scMetrics.totalAmount)}</p>
                        <div className="mt-2 pt-2 border-t border-slate-300 dark:border-slate-600">
                          <p className={`text-xs font-bold ${interestDiff < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            Interest: {interestDiff >= 0 ? '+' : ''}{formatCurrency(interestDiff)}
                          </p>
                          <p className={`text-xs font-bold ${tenureDiff < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            Tenure: {tenureDiff >= 0 ? '+' : ''}{tenureDiff.toFixed(1)} years
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <>
                  {/* Baseline vs Prepayment */}
                  <div>
                    <p className="font-bold mb-2">Baseline (No Prepayment)</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">EMI: {formatCurrency(baselineEMI)}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Interest: {formatCurrency(baselineTotalInterest)}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Tenure: {baselineTenure} years</p>
                  </div>
                  <div>
                    <p className="font-bold mb-2 text-emerald-600">With Prepayment</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">EMI: {formatCurrency(emi)}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Interest: {formatCurrency(totalInterest)}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Tenure: {actualTenure.toFixed(1)} years</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1">Savings: {formatCurrency(interestSaved)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Principal vs Interest Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-[300px]">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-4">Principal vs Interest</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tick={{fontSize: 10}} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="Principal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Interest" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Balance Projection */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-[300px]">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-4">Loan Balance</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tick={{fontSize: 10}} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="Balance" stroke="#f43f5e" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EMI Breakdown Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-4">Monthly EMI Breakdown (First 12 Months)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left p-2 text-xs font-bold text-slate-600 dark:text-slate-400">Month</th>
                  <th className="text-right p-2 text-xs font-bold text-slate-600 dark:text-slate-400">Principal</th>
                  <th className="text-right p-2 text-xs font-bold text-slate-600 dark:text-slate-400">Interest</th>
                  <th className="text-right p-2 text-xs font-bold text-slate-600 dark:text-slate-400">Balance</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.slice(0, 12).map((row) => (
                  <tr key={row.month} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-2 text-slate-600 dark:text-slate-400">{row.month}</td>
                    <td className="p-2 text-right font-semibold text-blue-600">{formatCurrency(row.principal)}</td>
                    <td className="p-2 text-right font-semibold text-rose-500">{formatCurrency(row.interest)}</td>
                    <td className="p-2 text-right text-slate-700 dark:text-slate-300">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
