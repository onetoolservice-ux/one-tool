'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle,
  MessageCircle,
  AlertTriangle,
  TrendingDown,
  Search,
  Phone,
  IndianRupee,
  CalendarClock,
  Users,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore,
  onBizStoreUpdate,
  markInvoicePaid,
  fmtCurrency,
  type BizOSStore,
  type BizInvoice,
  type BizParty,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

type Mode = 'receivables' | 'aging';
type Filter = 'all' | 'overdue' | 'week' | 'month';
type SortKey = 'amount' | 'date' | 'party';

// ── Date helpers ──────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function daysDiff(from: string, to: string): number {
  return Math.floor(
    (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function addDays(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Derived row type for Receivables table ────────────────────────────────────

interface ReceivableRow {
  invoice: BizInvoice;
  party: BizParty | undefined;
  daysOutstanding: number;
  daysUntilDue: number | null; // null if no due date
  statusLabel: 'Overdue' | 'Due Soon' | 'Pending';
}

function buildReceivableRows(store: BizOSStore, today: string): ReceivableRow[] {
  return Object.values(store.invoices)
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .map(inv => {
      const party = store.parties[inv.customerId];
      const daysOutstanding = daysDiff(inv.date, today);
      const daysUntilDue = inv.dueDate ? daysDiff(today, inv.dueDate) : null;

      let statusLabel: ReceivableRow['statusLabel'];
      if (inv.dueDate && new Date(inv.dueDate) < new Date(today)) {
        statusLabel = 'Overdue';
      } else if (daysUntilDue !== null && daysUntilDue <= 7) {
        statusLabel = 'Due Soon';
      } else {
        statusLabel = 'Pending';
      }

      return { invoice: inv, party, daysOutstanding, daysUntilDue, statusLabel };
    });
}

// ── WhatsApp URL builder ──────────────────────────────────────────────────────

function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const e164 = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`;
}

function buildSingleReminder(row: ReceivableRow): string {
  const partyName = row.party?.name ?? 'Valued Customer';
  const amount = fmtCurrency(row.invoice.total);
  const invoiceNo = row.invoice.number;
  const date = fmtDate(row.invoice.date);
  const dueText = row.invoice.dueDate
    ? ` (due: ${fmtDate(row.invoice.dueDate)})`
    : '';
  return `Dear ${partyName}, ${amount} is outstanding against Invoice ${invoiceNo} dated ${date}${dueText}. Kindly arrange payment. Thank you.`;
}

function buildBulkReminder(partyName: string, count: number, total: number): string {
  return `Dear ${partyName}, you have ${count} pending invoice${count > 1 ? 's' : ''} totalling ${fmtCurrency(total)}. Kindly clear your dues. Thank you.`;
}

// ── Aging bucket helpers ──────────────────────────────────────────────────────

interface AgingBucket {
  label: string;
  min: number;
  max: number;
  color: string;
  bg: string;
  border: string;
  textColor: string;
}

const AGING_BUCKETS: AgingBucket[] = [
  {
    label: 'Current',
    min: 0,
    max: 15,
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  {
    label: 'Due Soon',
    min: 16,
    max: 30,
    color: 'amber',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-300',
  },
  {
    label: 'Overdue',
    min: 31,
    max: 60,
    color: 'orange',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-300',
  },
  {
    label: 'Critical',
    min: 61,
    max: Infinity,
    color: 'red',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-300',
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export function BizOutstanding() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [mode, setMode] = useState<Mode>('receivables');
  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('amount');
  const [search, setSearch] = useState('');
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  const today = todayStr();
  const weekEnd = addDays(today, 7);
  const monthEnd = addDays(today, 30);

  // ── Derived data ──────────────────────────────────────────────────────────

  const allRows = useMemo<ReceivableRow[]>(() => {
    if (!store) return [];
    return buildReceivableRows(store, today);
  }, [store, today]);

  const filteredRows = useMemo(() => {
    let rows = allRows;

    // Filter by status
    if (filter === 'overdue') {
      rows = rows.filter(r => r.statusLabel === 'Overdue');
    } else if (filter === 'week') {
      rows = rows.filter(r => r.invoice.dueDate && r.invoice.dueDate <= weekEnd && r.invoice.dueDate >= today);
    } else if (filter === 'month') {
      rows = rows.filter(r => r.invoice.dueDate && r.invoice.dueDate <= monthEnd);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        r =>
          (r.party?.name ?? '').toLowerCase().includes(q) ||
          r.invoice.number.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sortKey === 'amount') {
      rows = [...rows].sort((a, b) => b.invoice.total - a.invoice.total);
    } else if (sortKey === 'date') {
      rows = [...rows].sort((a, b) => b.invoice.date.localeCompare(a.invoice.date));
    } else if (sortKey === 'party') {
      rows = [...rows].sort((a, b) =>
        (a.party?.name ?? '').localeCompare(b.party?.name ?? ''),
      );
    }

    return rows;
  }, [allRows, filter, search, sortKey, today, weekEnd, monthEnd]);

  // ── KPI calculations ──────────────────────────────────────────────────────

  const kpiData = useMemo(() => {
    const unpaidInvoices = allRows;

    const totalOutstanding = unpaidInvoices.reduce((s, r) => s + r.invoice.total, 0);
    const overdue30 = unpaidInvoices
      .filter(r => r.daysOutstanding > 30)
      .reduce((s, r) => s + r.invoice.total, 0);

    const dueThisWeek = unpaidInvoices
      .filter(
        r =>
          r.invoice.dueDate &&
          r.invoice.dueDate >= today &&
          r.invoice.dueDate <= weekEnd,
      )
      .reduce((s, r) => s + r.invoice.total, 0);

    // Collection rate this month: paid invoices this month / (paid + unpaid this month)
    if (!store) return { totalOutstanding, overdue30, dueThisWeek, collectionRate: 0 };

    const thisMonth = today.slice(0, 7);
    const allInvoicesThisMonth = Object.values(store.invoices).filter(inv =>
      inv.date.startsWith(thisMonth),
    );
    const paidThisMonth = allInvoicesThisMonth
      .filter(inv => inv.status === 'paid')
      .reduce((s, inv) => s + inv.total, 0);
    const totalInvoicedThisMonth = allInvoicesThisMonth.reduce((s, inv) => s + inv.total, 0);

    const collectionRate =
      totalInvoicedThisMonth > 0
        ? Math.round((paidThisMonth / totalInvoicedThisMonth) * 100)
        : 0;

    return { totalOutstanding, overdue30, dueThisWeek, collectionRate };
  }, [allRows, store, today, weekEnd]);

  // ── Aging analysis ────────────────────────────────────────────────────────

  const agingBuckets = useMemo(() => {
    return AGING_BUCKETS.map(bucket => {
      const rows = allRows.filter(
        r =>
          r.daysOutstanding >= bucket.min &&
          (bucket.max === Infinity ? true : r.daysOutstanding <= bucket.max),
      );
      return {
        ...bucket,
        count: rows.length,
        amount: rows.reduce((s, r) => s + r.invoice.total, 0),
      };
    });
  }, [allRows]);

  const partyWiseOutstanding = useMemo(() => {
    if (!store) return [];

    const map: Record<
      string,
      {
        party: BizParty | undefined;
        partyId: string;
        total: number;
        count: number;
        oldestDate: string;
        rows: ReceivableRow[];
      }
    > = {};

    allRows.forEach(r => {
      const cid = r.invoice.customerId;
      if (!map[cid]) {
        map[cid] = {
          party: r.party,
          partyId: cid,
          total: 0,
          count: 0,
          oldestDate: r.invoice.date,
          rows: [],
        };
      }
      map[cid].total += r.invoice.total;
      map[cid].count += 1;
      map[cid].rows.push(r);
      if (r.invoice.date < map[cid].oldestDate) {
        map[cid].oldestDate = r.invoice.date;
      }
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [allRows, store]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleMarkPaid(invoiceId: string) {
    setMarkingPaid(invoiceId);
    markInvoicePaid(invoiceId);
    setTimeout(() => setMarkingPaid(null), 600);
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (!store) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-400 dark:text-slate-500 text-sm font-medium">Loading...</div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'week', label: 'Due This Week' },
    { key: 'month', label: 'Due This Month' },
  ];

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'amount', label: 'Amount ↓' },
    { key: 'date', label: 'Date ↓' },
    { key: 'party', label: 'Party A-Z' },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <SAPHeader
        title="Outstanding Tracker"
        subtitle="Receivables · Aging · Collections"
        fullWidth
        sticky
        kpis={[
          {
            label: 'Total Outstanding',
            value: fmtCurrency(kpiData.totalOutstanding),
            icon: IndianRupee,
            color: 'primary',
          },
          {
            label: 'Overdue (>30 days)',
            value: fmtCurrency(kpiData.overdue30),
            icon: AlertTriangle,
            color: 'error',
          },
          {
            label: 'Due This Week',
            value: fmtCurrency(kpiData.dueThisWeek),
            icon: CalendarClock,
            color: 'warning',
          },
          {
            label: 'Collection Rate',
            value: `${kpiData.collectionRate}%`,
            icon: TrendingDown,
            color: 'success',
            subtitle: 'This month',
          },
        ]}
        actions={
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {([
              { key: 'receivables', label: 'Receivables' },
              { key: 'aging', label: 'Aging Analysis' },
            ] as { key: Mode; label: string }[]).map(m => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  mode === m.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {mode === 'receivables' ? (
          <ReceivablesMode
            rows={filteredRows}
            filter={filter}
            setFilter={setFilter}
            sortKey={sortKey}
            setSortKey={setSortKey}
            search={search}
            setSearch={setSearch}
            markingPaid={markingPaid}
            onMarkPaid={handleMarkPaid}
            FILTERS={FILTERS}
            SORTS={SORTS}
          />
        ) : (
          <AgingMode
            buckets={agingBuckets}
            partyWise={partyWiseOutstanding}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECEIVABLES MODE
// ─────────────────────────────────────────────────────────────────────────────

interface ReceivablesModeProps {
  rows: ReceivableRow[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  sortKey: SortKey;
  setSortKey: (s: SortKey) => void;
  search: string;
  setSearch: (s: string) => void;
  markingPaid: string | null;
  onMarkPaid: (id: string) => void;
  FILTERS: { key: Filter; label: string }[];
  SORTS: { key: SortKey; label: string }[];
}

function ReceivablesMode({
  rows,
  filter,
  setFilter,
  sortKey,
  setSortKey,
  search,
  setSearch,
  markingPaid,
  onMarkPaid,
  FILTERS,
  SORTS,
}: ReceivablesModeProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 py-3 gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search party or invoice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === f.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-1">
          {SORTS.map(s => (
            <button
              key={s.key}
              onClick={() => setSortKey(s.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                sortKey === s.key
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-black text-slate-500 uppercase tracking-wider shrink-0">
          <div>Party</div>
          <div>Invoice #</div>
          <div>Amount</div>
          <div>Date</div>
          <div>Due Date</div>
          <div>Days Out.</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {/* Rows */}
        {rows.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
            <Clock size={40} className="opacity-30" />
            <div className="text-center">
              <p className="text-sm font-semibold">No outstanding invoices</p>
              <p className="text-xs mt-1">All dues are cleared or no invoices match the filter.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {rows.map(row => (
              <ReceivableRow
                key={row.invoice.id}
                row={row}
                marking={markingPaid === row.invoice.id}
                onMarkPaid={onMarkPaid}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Individual receivable row ─────────────────────────────────────────────────

function ReceivableRow({
  row,
  marking,
  onMarkPaid,
}: {
  row: ReceivableRow;
  marking: boolean;
  onMarkPaid: (id: string) => void;
}) {
  const { invoice, party, daysOutstanding, statusLabel } = row;

  // Days outstanding color
  const daysColor =
    daysOutstanding < 15
      ? 'text-emerald-600 dark:text-emerald-400'
      : daysOutstanding <= 30
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';

  // Status badge
  const statusBadge =
    statusLabel === 'Overdue'
      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      : statusLabel === 'Due Soon'
      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

  const phone = party?.phone?.trim();
  const waUrl = phone
    ? buildWhatsAppUrl(phone, buildSingleReminder(row))
    : null;

  return (
    <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors items-center">
      {/* Party */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
          {party?.name ?? <span className="text-slate-400 italic">Unknown</span>}
        </p>
        {party?.phone && (
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
            <Phone size={10} />
            {party.phone}
          </p>
        )}
      </div>

      {/* Invoice # */}
      <div className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">
        {invoice.number}
      </div>

      {/* Amount */}
      <div className="text-sm font-black text-slate-900 dark:text-white">
        {fmtCurrency(invoice.total)}
      </div>

      {/* Date */}
      <div className="text-xs text-slate-500 dark:text-slate-400">{fmtDate(invoice.date)}</div>

      {/* Due Date */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {invoice.dueDate ? fmtDate(invoice.dueDate) : '—'}
      </div>

      {/* Days outstanding */}
      <div className={`text-sm font-black ${daysColor}`}>{daysOutstanding}d</div>

      {/* Status badge */}
      <div>
        <span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold ${statusBadge}`}>
          {statusLabel}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onMarkPaid(invoice.id)}
          disabled={marking}
          title="Mark as Paid"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
        >
          <CheckCircle size={13} />
          {marking ? 'Saving...' : 'Paid'}
        </button>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Send WhatsApp reminder"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            <MessageCircle size={13} />
            WA
          </a>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGING ANALYSIS MODE
// ─────────────────────────────────────────────────────────────────────────────

interface AgingBucketData extends AgingBucket {
  count: number;
  amount: number;
}

interface PartyWiseEntry {
  party: BizParty | undefined;
  partyId: string;
  total: number;
  count: number;
  oldestDate: string;
  rows: ReceivableRow[];
}

interface AgingModeProps {
  buckets: AgingBucketData[];
  partyWise: PartyWiseEntry[];
}

function AgingMode({ buckets, partyWise }: AgingModeProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 py-3 gap-4">
      {/* Bucket cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {buckets.map(bucket => (
          <div
            key={bucket.label}
            className={`rounded-2xl border p-4 ${bucket.bg} ${bucket.border}`}
          >
            <p className={`text-xs font-black uppercase tracking-wider mb-2 ${bucket.textColor}`}>
              {bucket.label}
            </p>
            <p className={`text-2xl font-black mb-1 ${bucket.textColor}`}>
              {fmtCurrency(bucket.amount)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {bucket.count} invoice{bucket.count !== 1 ? 's' : ''}
              {bucket.min === 0 && bucket.max !== Infinity && ` · 0–${bucket.max} days`}
              {bucket.min > 0 && bucket.max !== Infinity && ` · ${bucket.min}–${bucket.max} days`}
              {bucket.max === Infinity && ` · ${bucket.min}+ days`}
            </p>
          </div>
        ))}
      </div>

      {/* Party-wise table */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={15} />
            Party-wise Outstanding
          </h3>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-black text-slate-500 uppercase tracking-wider shrink-0">
          <div>Party</div>
          <div>Phone</div>
          <div>Total Outstanding</div>
          <div>Invoices</div>
          <div>Oldest Invoice</div>
          <div>WhatsApp</div>
        </div>

        {partyWise.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
            <Clock size={40} className="opacity-30" />
            <p className="text-sm font-semibold">No outstanding dues</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {partyWise.map(entry => {
              const phone = entry.party?.phone?.trim();
              const waUrl = phone
                ? buildWhatsAppUrl(
                    phone,
                    buildBulkReminder(
                      entry.party?.name ?? 'Valued Customer',
                      entry.count,
                      entry.total,
                    ),
                  )
                : null;

              return (
                <div
                  key={entry.partyId}
                  className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_auto] gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors items-center"
                >
                  {/* Party */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {entry.party?.name ?? <span className="text-slate-400 italic">Unknown</span>}
                    </p>
                    {entry.party?.gstin && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {entry.party.gstin}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {phone ? (
                      <span className="flex items-center gap-1">
                        <Phone size={11} />
                        {phone}
                      </span>
                    ) : (
                      '—'
                    )}
                  </div>

                  {/* Total outstanding */}
                  <div className="text-sm font-black text-red-600 dark:text-red-400">
                    {fmtCurrency(entry.total)}
                  </div>

                  {/* Invoice count */}
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {entry.count}
                  </div>

                  {/* Oldest invoice */}
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {fmtDate(entry.oldestDate)}
                  </div>

                  {/* WhatsApp */}
                  <div>
                    {waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Send bulk WhatsApp reminder"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                      >
                        <MessageCircle size={13} />
                        Remind
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-600 italic">No phone</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
