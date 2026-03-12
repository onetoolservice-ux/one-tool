'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// ═══════════════════════════════════════════════════════════════════════════════
// TAX COMPLIANCE CALENDAR — Indian tax deadlines FY 2025-26 / AY 2026-27
// ═══════════════════════════════════════════════════════════════════════════════

// Current date: March 11, 2026
const TODAY = new Date(2026, 2, 11); // month is 0-indexed

type DeadlineType = 'income-tax' | 'tds' | 'gst' | 'other';
type DeadlineStatus = 'past' | 'due-soon' | 'upcoming' | 'overdue';

interface Deadline {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: DeadlineType;
  fy?: string;
}

const DEADLINES: Deadline[] = [
  {
    id: '1',
    date: new Date(2025, 3, 15), // Apr 15 2025
    title: 'TDS Payment — Q4 (Jan–Mar)',
    description: 'Last date to deposit TDS deducted in March quarter (FY 2024-25). Challan ITNS-281.',
    type: 'tds',
    fy: 'FY 2024-25',
  },
  {
    id: '2',
    date: new Date(2025, 4, 31), // May 31 2025
    title: 'TDS Return Filing — Q4 (24Q / 26Q)',
    description: 'Quarterly TDS returns for Q4 of FY 2024-25. Form 24Q (salary) and 26Q (non-salary).',
    type: 'tds',
    fy: 'FY 2024-25',
  },
  {
    id: '3',
    date: new Date(2025, 5, 15), // Jun 15 2025
    title: 'Advance Tax — 1st Instalment (15%)',
    description: '15% of estimated annual tax liability must be paid as advance tax for FY 2025-26.',
    type: 'income-tax',
    fy: 'FY 2025-26',
  },
  {
    id: '4',
    date: new Date(2025, 5, 15), // Jun 15 2025
    title: 'TDS Payment — Q1 (Apr–Jun)',
    description: 'Last date to deposit TDS deducted in April and May quarters.',
    type: 'tds',
    fy: 'FY 2025-26',
  },
  {
    id: '5',
    date: new Date(2025, 5, 30), // Jun 30 2025
    title: 'GSTR-9 Annual Return (FY 2024-25)',
    description: 'GST annual return for FY 2024-25. Applicable to registered taxpayers with turnover above threshold.',
    type: 'gst',
    fy: 'FY 2024-25',
  },
  {
    id: '6',
    date: new Date(2025, 6, 31), // Jul 31 2025
    title: 'ITR Filing Deadline — Non-Audit (AY 2025-26)',
    description: 'Last date for individuals and entities not requiring audit to file Income Tax Return for AY 2025-26.',
    type: 'income-tax',
    fy: 'AY 2025-26',
  },
  {
    id: '7',
    date: new Date(2025, 6, 31), // Jul 31 2025
    title: 'TDS Return Filing — Q1 (24Q / 26Q)',
    description: 'Quarterly TDS return for Q1 of FY 2025-26 (Apr–Jun). Form 24Q and 26Q.',
    type: 'tds',
    fy: 'FY 2025-26',
  },
  {
    id: '8',
    date: new Date(2025, 8, 15), // Sep 15 2025
    title: 'Advance Tax — 2nd Instalment (45% cumulative)',
    description: 'Cumulative advance tax of 45% of estimated annual liability for FY 2025-26.',
    type: 'income-tax',
    fy: 'FY 2025-26',
  },
  {
    id: '9',
    date: new Date(2025, 8, 30), // Sep 30 2025
    title: 'ITR Filing — Audit Cases (AY 2025-26)',
    description: 'Extended deadline for individuals and entities requiring tax audit under Section 44AB.',
    type: 'income-tax',
    fy: 'AY 2025-26',
  },
  {
    id: '10',
    date: new Date(2025, 9, 31), // Oct 31 2025
    title: 'TDS Return Filing — Q2 (24Q / 26Q)',
    description: 'Quarterly TDS return for Q2 of FY 2025-26 (Jul–Sep). Form 24Q and 26Q.',
    type: 'tds',
    fy: 'FY 2025-26',
  },
  {
    id: '11',
    date: new Date(2025, 11, 15), // Dec 15 2025
    title: 'Advance Tax — 3rd Instalment (75% cumulative)',
    description: 'Cumulative advance tax of 75% of estimated annual liability for FY 2025-26.',
    type: 'income-tax',
    fy: 'FY 2025-26',
  },
  {
    id: '12',
    date: new Date(2025, 11, 31), // Dec 31 2025
    title: 'Belated / Revised ITR Deadline (AY 2025-26)',
    description: 'Last date to file belated return (if missed Jul 31) or revise already filed ITR for AY 2025-26.',
    type: 'income-tax',
    fy: 'AY 2025-26',
  },
  {
    id: '13',
    date: new Date(2026, 0, 31), // Jan 31 2026
    title: 'TDS Return Filing — Q3 (24Q / 26Q)',
    description: 'Quarterly TDS return for Q3 of FY 2025-26 (Oct–Dec). Form 24Q and 26Q.',
    type: 'tds',
    fy: 'FY 2025-26',
  },
  {
    id: '14',
    date: new Date(2026, 2, 15), // Mar 15 2026
    title: 'Advance Tax — 4th Instalment (100%)',
    description: 'Final advance tax instalment — 100% of estimated annual tax liability for FY 2025-26.',
    type: 'income-tax',
    fy: 'FY 2025-26',
  },
  {
    id: '15',
    date: new Date(2026, 2, 31), // Mar 31 2026
    title: 'Tax-Saving Investments Deadline (80C / 80D / NPS)',
    description: 'Last date to make tax-saving investments for FY 2025-26 under Section 80C, 80D, 80CCD(1B), etc.',
    type: 'other',
    fy: 'FY 2025-26',
  },
];

function getStatus(date: Date): DeadlineStatus {
  const diffMs = date.getTime() - TODAY.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 30) return 'due-soon';
  return 'upcoming';
}

function isPast(date: Date): boolean {
  return date < TODAY;
}

const TYPE_LABELS: Record<DeadlineType, string> = {
  'income-tax': 'Income Tax',
  tds: 'TDS',
  gst: 'GST',
  other: 'Other',
};

const TYPE_COLORS: Record<DeadlineType, string> = {
  'income-tax': 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800',
  tds: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-800',
  gst: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800',
  other: 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600',
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type FilterTab = 'all' | DeadlineType;

export function TaxCalendar() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = useMemo(() => {
    const sorted = [...DEADLINES].sort((a, b) => a.date.getTime() - b.date.getTime());
    if (activeTab === 'all') return sorted;
    return sorted.filter((d) => d.type === activeTab);
  }, [activeTab]);

  const upcomingCount = useMemo(
    () =>
      DEADLINES.filter((d) => {
        const s = isPast(d.date) ? 'past' : getStatus(d.date);
        return s !== 'past';
      }).length,
    []
  );

  const dueSoonCount = useMemo(
    () => DEADLINES.filter((d) => !isPast(d.date) && getStatus(d.date) === 'due-soon').length,
    []
  );

  const overdueCount = useMemo(
    () => DEADLINES.filter((d) => !isPast(d.date) && getStatus(d.date) === 'overdue').length,
    []
  );

  const kpis = [
    { label: 'Upcoming', value: `${upcomingCount}`, color: 'warning' as const },
    { label: 'Due Soon', value: `${dueSoonCount}`, color: 'error' as const },
    { label: 'Overdue', value: `${overdueCount}`, color: 'error' as const },
    { label: 'Total Deadlines', value: `${DEADLINES.length}`, color: 'neutral' as const },
  ];

  // Group by month-year
  const grouped = useMemo(() => {
    const groups: Record<string, Deadline[]> = {};
    for (const d of filtered) {
      const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'income-tax', label: 'Income Tax' },
    { key: 'tds', label: 'TDS' },
    { key: 'gst', label: 'GST' },
    { key: 'other', label: 'Other' },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Tax Compliance Calendar"
        subtitle="Never miss an income tax, TDS, or GST deadline — FY 2025-26 / AY 2026-27"
        kpis={kpis}
      />

      <div className="p-4 space-y-4">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <CheckCircle2 size={13} className="text-slate-400" />
            <span>Past / Completed</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <AlertCircle size={13} />
            <span>Due within 30 days</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <XCircle size={13} />
            <span>Overdue</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Calendar size={13} />
            <span>Upcoming</span>
          </div>
        </div>

        {/* Timeline grouped by month */}
        {grouped.map(([key, items]) => {
          const [year, monthIdx] = key.split('-').map(Number);
          const monthLabel = `${months[monthIdx]} ${year}`;
          return (
            <div key={key}>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Clock size={12} />
                {monthLabel}
              </p>
              <div className="space-y-2">
                {items.map((deadline) => {
                  const past = isPast(deadline.date);
                  const status: DeadlineStatus = past ? 'past' : getStatus(deadline.date);

                  const statusIcon = {
                    past: <CheckCircle2 size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />,
                    'due-soon': <AlertCircle size={15} className="text-amber-500 shrink-0" />,
                    overdue: <XCircle size={15} className="text-red-500 shrink-0" />,
                    upcoming: <Calendar size={15} className="text-blue-500 shrink-0" />,
                  }[status];

                  const borderColor = {
                    past: 'border-slate-200 dark:border-slate-700',
                    'due-soon': 'border-amber-300 dark:border-amber-700',
                    overdue: 'border-red-300 dark:border-red-700',
                    upcoming: 'border-slate-200 dark:border-slate-700',
                  }[status];

                  const bgColor = {
                    past: 'bg-white dark:bg-slate-900',
                    'due-soon': 'bg-amber-50/50 dark:bg-amber-900/10',
                    overdue: 'bg-red-50/50 dark:bg-red-900/10',
                    upcoming: 'bg-white dark:bg-slate-900',
                  }[status];

                  const statusLabel = {
                    past: 'Past',
                    'due-soon': 'Due Soon',
                    overdue: 'Overdue',
                    upcoming: 'Upcoming',
                  }[status];

                  const statusBadge = {
                    past: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                    'due-soon': 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
                    overdue: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                    upcoming: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
                  }[status];

                  const day = deadline.date.getDate();
                  const mon = months[deadline.date.getMonth()].slice(0, 3);

                  return (
                    <div
                      key={deadline.id}
                      className={`rounded-xl border ${borderColor} ${bgColor} p-4 flex items-start gap-3 transition-colors`}
                    >
                      {/* Date block */}
                      <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">{mon}</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{day}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {statusIcon}
                          <p className={`text-sm font-bold leading-tight ${past ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {deadline.title}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{deadline.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${TYPE_COLORS[deadline.type]}`}>
                            {TYPE_LABELS[deadline.type]}
                          </span>
                          {deadline.fy && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {deadline.fy}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${statusBadge}`}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
            No deadlines found for the selected filter.
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Disclaimer</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Dates shown are based on standard statutory provisions and are indicative only. The Income Tax Department and GSTN frequently extend deadlines via official notifications and circulars. Always verify due dates on the official Income Tax Portal (incometax.gov.in), GSTN Portal (gst.gov.in), or TRACES (tdscpc.gov.in) before making payments or filing returns. Penalties, interest (u/s 234A, 234B, 234C), and late fees may apply on non-compliance. Consult a qualified tax professional for guidance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
