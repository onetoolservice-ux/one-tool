'use client';

import React, { useState } from 'react';
import { HelpCircle, X, ChevronRight, CheckCircle2, Lightbulb, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GuideStep {
  title: string;
  body: string;
  tip?: string;
}

interface ToolGuideConfig {
  title: string;
  subtitle: string;
  steps: GuideStep[];
  notes?: string[];
}

// ─── Guide Content per tool ───────────────────────────────────────────────────
const GUIDES: Record<string, ToolGuideConfig> = {
  managetransaction: {
    title: 'Manage Monthly Transactions',
    subtitle: 'Import once, analyze everywhere.',
    steps: [
      {
        title: 'Export from your bank',
        body: 'Log into your net banking or UPI app and download your statement as CSV or Excel. Most Indian banks (HDFC, SBI, ICICI, Axis, Kotak) support this.',
        tip: 'Look for "Download Statement" or "Transaction History" → select CSV/Excel format.',
      },
      {
        title: 'Upload your file',
        body: 'Click "Upload File" and select the downloaded CSV or Excel. The tool auto-detects columns — date, amount, description — for any bank format.',
        tip: 'If columns are wrong, use the column-mapper that appears after upload to manually assign them.',
      },
      {
        title: 'Review & clean',
        body: 'Check the preview table. Remove duplicate rows or fix any date format issues. You can delete individual rows by clicking the × on each row.',
      },
      {
        title: 'Save for analysis',
        body: 'Click "Save Transactions". Your data is stored locally in your browser — never uploaded to any server. Switch to Expense Tracker or Income Tracker to start analyzing.',
        tip: 'Data persists across sessions. You can add new months by uploading again — duplicates are auto-skipped.',
      },
    ],
    notes: [
      'All data stays on your device (browser localStorage).',
      'Supports HDFC, SBI, ICICI, Axis, Kotak, Paytm, PhonePe exports.',
      'Max file size: 10 MB. For large exports, split by month.',
    ],
  },

  expenses: {
    title: 'Expense Tracker',
    subtitle: 'Understand where your money goes.',
    steps: [
      {
        title: 'Load your transactions first',
        body: 'The Expense Tracker works with data you\'ve imported in "Manage Monthly Transactions". If you haven\'t uploaded a bank statement yet, do that first.',
      },
      {
        title: 'Pick a month',
        body: 'Use the month selector at the top to choose which month to analyze. The chart and table update instantly.',
      },
      {
        title: 'Explore by category',
        body: 'Switch the "Analyze by" dropdown to group expenses by Category, Merchant, Day of Week, or any custom column in your data.',
        tip: 'Click any bar in the chart to drill down and see individual transactions for that group.',
      },
      {
        title: 'Filter & sort',
        body: 'Use the Filters panel to narrow by amount range, date, or keyword. Sort by Amount or Count to find your biggest spends.',
      },
      {
        title: 'Export your report',
        body: 'Hit "Export CSV" to download the filtered view, or use "Copy" to paste a summary into a spreadsheet.',
      },
    ],
    notes: [
      'Debit transactions are shown here. Credits appear in Income Tracker.',
      'Categories are auto-detected from transaction descriptions.',
    ],
  },

  credits: {
    title: 'Income Tracker',
    subtitle: 'Track all incoming credits and sources.',
    steps: [
      {
        title: 'Load your transactions',
        body: 'Make sure you\'ve imported your bank statement in "Manage Monthly Transactions" first.',
      },
      {
        title: 'Select a month',
        body: 'Pick the month from the selector. Only credit/income transactions are shown here.',
      },
      {
        title: 'Analyze income sources',
        body: 'Use "Analyze by" to group by Source, Day, or custom column. Useful to see salary vs freelance vs other credits.',
        tip: 'The top bar shows Total Income, Avg per transaction, and count for the selected period.',
      },
      {
        title: 'Compare months',
        body: 'Switch between months to compare income growth. Look at the trend line to spot patterns.',
      },
    ],
    notes: [
      'Only credit/incoming transactions are shown. Debits are in Expense Tracker.',
    ],
  },

  analyticsreport: {
    title: 'Analytics Report',
    subtitle: 'Build shareable reports from your transaction data.',
    steps: [
      {
        title: 'Upload or use existing data',
        body: 'Upload a CSV directly here, or if you\'ve already loaded transactions via Manage Monthly Transactions, they\'re auto-available.',
      },
      {
        title: 'Choose chart types',
        body: 'Drag metric cards onto the canvas. Pick from Bar, Line, Pie, KPI cards. Each card can be configured independently.',
      },
      {
        title: 'Configure each widget',
        body: 'Click any widget to open its settings — choose which column to aggregate, pick grouping, set time range.',
        tip: 'Use "Group By: Month" on a line chart for trend analysis.',
      },
      {
        title: 'Export or share',
        body: 'Click "Export PDF" to download the report, or "Share Link" to generate a shareable URL (data stays local, only layout is shared).',
      },
    ],
    notes: [
      'Reports auto-save to your browser. Reload the page to restore.',
    ],
  },

  'self-serve-analytics': {
    title: 'Self-Serve Analytics',
    subtitle: 'Paste any CSV and instantly get charts.',
    steps: [
      {
        title: 'Paste or upload CSV',
        body: 'Either paste CSV data directly into the text box, or click "Upload" to select a file. Up to 50,000 rows supported.',
      },
      {
        title: 'Auto-detect columns',
        body: 'The tool scans your headers and suggests chart types. Numeric columns become metrics; text/date columns become dimensions.',
      },
      {
        title: 'Build your chart',
        body: 'Pick X-axis (dimension) and Y-axis (metric) from the dropdowns. Choose chart type: Bar, Line, Scatter, Pie.',
        tip: 'For time-series data, set X-axis to your date column and enable "Group by Month".',
      },
      {
        title: 'Apply filters',
        body: 'Use the filter bar to slice data — filter by column value, date range, or numeric threshold.',
      },
      {
        title: 'Export',
        body: 'Download as PNG (chart image) or CSV (filtered data). Charts can also be copied to clipboard.',
      },
    ],
    notes: [
      'Data is processed entirely in your browser — never sent to a server.',
      'Best results with clean headers in row 1 of your CSV.',
    ],
  },

  'invoice-generator': {
    title: 'Pro Invoice Studio',
    subtitle: 'Create GST-compliant invoices in minutes.',
    steps: [
      {
        title: 'Fill in business details',
        body: 'Enter your business name, address, GSTIN, and contact. These are saved and auto-filled next time.',
      },
      {
        title: 'Add client details',
        body: 'Enter the client\'s name, billing address, and GSTIN (if registered). Required for GST B2B invoices.',
      },
      {
        title: 'Add line items',
        body: 'Click "Add Item" for each product or service. Enter description, HSN/SAC code, quantity, rate. GST is auto-calculated.',
        tip: 'Set GST rate (0%, 5%, 12%, 18%, 28%) per item. IGST is auto-applied for inter-state invoices.',
      },
      {
        title: 'Review totals',
        body: 'Check the summary — subtotal, CGST+SGST or IGST, TDS (if applicable), and grand total are shown.',
      },
      {
        title: 'Download PDF',
        body: 'Click "Download PDF" for a print-ready invoice. Use "Save Draft" to come back and edit later.',
        tip: 'Invoice numbers are auto-incremented. You can change the format in Settings.',
      },
    ],
    notes: [
      'Drafts saved to browser — clear browser data to delete.',
      'Supports GST composition scheme, reverse charge, and export invoices.',
    ],
  },

  'smart-budget': {
    title: 'Budget Planner Pro',
    subtitle: 'Plan income, expenses, and savings goals.',
    steps: [
      {
        title: 'Set your income',
        body: 'Enter your monthly take-home salary and any other income sources (freelance, rent, etc.).',
      },
      {
        title: 'Add expense categories',
        body: 'Click "Add Category" for each expense type — Housing, Food, Transport, etc. Enter your planned budget per category.',
        tip: 'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings as a starting template.',
      },
      {
        title: 'Track actuals',
        body: 'Each month, enter your actual spend per category. The tool shows budget vs actual as a progress bar.',
      },
      {
        title: 'Set savings goals',
        body: 'In the Goals tab, add a target (vacation fund, emergency fund). Set amount and timeline — the tool shows required monthly savings.',
      },
    ],
    notes: [
      'All data is local. Export to CSV for your own records.',
    ],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
interface ToolGuideProps {
  toolId: string;
}

export function ToolGuide({ toolId }: ToolGuideProps) {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const guide = GUIDES[toolId];
  if (!guide) return null; // No guide for this tool — render nothing

  const step = guide.steps[activeStep];

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => { setOpen(true); setActiveStep(0); }}
        title="How to use this tool"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-2 border-white/20 dark:border-slate-900/20"
      >
        <HelpCircle size={22} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-end sm:justify-end"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* Panel */}
          <div className="w-full sm:w-[420px] h-[90vh] sm:h-[calc(100vh-32px)] sm:m-4 bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-300">

            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle size={16} className="text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Guide</span>
                </div>
                <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">{guide.title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{guide.subtitle}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 mt-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step progress */}
            <div className="flex items-center gap-1.5 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              {guide.steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${i === activeStep ? 'bg-blue-500' : i < activeStep ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${activeStep < guide.steps.length - 1 ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {activeStep + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{step.title}</h3>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-9">
                {step.body}
              </p>

              {step.tip && (
                <div className="ml-9 flex gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3">
                  <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{step.tip}</p>
                </div>
              )}

              {/* All steps overview */}
              <div className="ml-9 mt-2 space-y-1.5">
                {guide.steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${i === activeStep ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
                  >
                    {i < activeStep
                      ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      : <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${i === activeStep ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-600'}`} />
                    }
                    <span className={`text-xs font-medium ${i === activeStep ? 'text-blue-600 dark:text-blue-400' : i < activeStep ? 'text-emerald-600 dark:text-emerald-400 line-through opacity-60' : 'text-slate-600 dark:text-slate-400'}`}>
                      {s.title}
                    </span>
                    {i === activeStep && <ChevronRight size={12} className="text-blue-400 ml-auto" />}
                  </button>
                ))}
              </div>

              {/* Notes */}
              {guide.notes && (
                <div className="ml-9 mt-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Good to know</span>
                  </div>
                  {guide.notes.map((note, i) => (
                    <p key={i} className="text-xs text-slate-500 dark:text-slate-400 flex gap-2">
                      <span className="text-slate-300 dark:text-slate-600 flex-shrink-0">·</span>
                      {note}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
              <button
                onClick={() => setActiveStep(s => Math.max(0, s - 1))}
                disabled={activeStep === 0}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ← Back
              </button>
              <span className="text-xs text-slate-400">{activeStep + 1} of {guide.steps.length}</span>
              {activeStep < guide.steps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(s => s + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                >
                  Got it ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
