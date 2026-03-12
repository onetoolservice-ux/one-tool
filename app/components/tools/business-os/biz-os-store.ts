'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS OS STORE
// 3-Anchor data model: Party Register + Master Ledger + Product Catalog
// All derived modules (invoices, reports, dashboard) pull from these 3 anchors.
// ═══════════════════════════════════════════════════════════════════════════════

const STORE_KEY = 'otsd-biz-os-store';
const STORE_EVENT = 'biz-os-store-updated';

// ── ANCHOR 1: Party Register ───────────────────────────────────────────────────
export interface BizParty {
  id: string;
  name: string;
  type: 'customer' | 'vendor' | 'employee' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  notes?: string;
  createdAt: string;
}

// ── ANCHOR 2: Master Ledger ────────────────────────────────────────────────────
export type PaymentMode = 'cash' | 'upi' | 'bank' | 'credit' | 'other';

export interface BizTransaction {
  id: string;
  date: string;            // YYYY-MM-DD
  type: 'income' | 'expense';
  amount: number;
  partyId?: string;
  productId?: string;
  category: string;
  description: string;
  paymentMode: PaymentMode;
  invoiceId?: string;
  notes?: string;
  createdAt: string;
}

// ── ANCHOR 3: Product Catalog ──────────────────────────────────────────────────
export interface BizProduct {
  id: string;
  name: string;
  sku?: string;
  category: string;
  unit: string;            // pcs, kg, box, litre, etc.
  sellingPrice: number;
  costPrice: number;
  stock: number;
  lowStockAlert: number;
  supplierId?: string;     // partyId of the vendor
  gstRate: number;         // 0 | 5 | 12 | 18 | 28
  createdAt: string;
}

// ── DERIVED: Invoice ───────────────────────────────────────────────────────────
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface BizInvoiceItem {
  productId?: string;
  name: string;
  qty: number;
  rate: number;
  gstRate: number;
  amount: number;
}

export interface BizInvoice {
  id: string;
  number: string;          // INV-0001
  date: string;
  dueDate?: string;
  customerId: string;      // partyId
  items: BizInvoiceItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
}

// ── ROOT STORE ─────────────────────────────────────────────────────────────────
export interface BizOSStore {
  parties: Record<string, BizParty>;
  transactions: BizTransaction[];
  products: Record<string, BizProduct>;
  invoices: Record<string, BizInvoice>;
  settings: {
    businessName: string;
    businessPhone?: string;
    gstin?: string;
    financialYearStart: string;  // YYYY-MM-DD
  };
  lastUpdated: string;
}

// ── INCOME/EXPENSE CATEGORIES ──────────────────────────────────────────────────
export const INCOME_CATEGORIES = [
  'Sales', 'Service', 'Commission', 'Rent Received', 'Interest', 'Other Income',
] as const;

export const EXPENSE_CATEGORIES = [
  'Purchase', 'Rent', 'Salary', 'Electricity', 'Transport', 'Marketing',
  'Maintenance', 'Raw Material', 'Packaging', 'Miscellaneous',
] as const;

export const PRODUCT_CATEGORIES = [
  'Electronics', 'Clothing', 'Food & Beverage', 'Hardware', 'Stationery',
  'Furniture', 'Raw Material', 'Packaging', 'Services', 'Other',
] as const;

export const UNITS = ['pcs', 'kg', 'gm', 'litre', 'ml', 'box', 'packet', 'metre', 'set', 'pair'] as const;
export const GST_RATES = [0, 5, 12, 18, 28] as const;
export const PAYMENT_MODES: PaymentMode[] = ['cash', 'upi', 'bank', 'credit', 'other'];

// ── STORE LIFECYCLE ────────────────────────────────────────────────────────────

function emptyStore(): BizOSStore {
  return {
    parties: {},
    transactions: [],
    products: {},
    invoices: {},
    settings: {
      businessName: '',
      financialYearStart: `${new Date().getFullYear()}-04-01`,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function loadBizStore(): BizOSStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as BizOSStore;
    // Ensure all required keys exist (migration safety)
    return {
      parties: parsed.parties ?? {},
      transactions: parsed.transactions ?? [],
      products: parsed.products ?? {},
      invoices: parsed.invoices ?? {},
      settings: parsed.settings ?? emptyStore().settings,
      lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
    };
  } catch {
    return emptyStore();
  }
}

export function saveBizStore(data: BizOSStore): void {
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export function onBizStoreUpdate(cb: () => void): () => void {
  window.addEventListener(STORE_EVENT, cb);
  return () => window.removeEventListener(STORE_EVENT, cb);
}

// ── ID GENERATORS ──────────────────────────────────────────────────────────────

export function newPartyId() { return `biz-party-${Date.now()}`; }
export function newTxId() { return `biz-tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }
export function newProductId() { return `biz-prod-${Date.now()}`; }
export function newInvoiceId() { return `biz-inv-${Date.now()}`; }

function nextInvoiceNumber(invoices: Record<string, BizInvoice>): string {
  const nums = Object.values(invoices)
    .map(inv => parseInt(inv.number.replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `INV-${String(next).padStart(4, '0')}`;
}

// ── PARTY CRUD ─────────────────────────────────────────────────────────────────

export function addParty(party: Omit<BizParty, 'id' | 'createdAt'>): void {
  const store = loadBizStore();
  const id = newPartyId();
  store.parties[id] = { ...party, id, createdAt: new Date().toISOString() };
  saveBizStore(store);
}

export function updateParty(id: string, updates: Partial<BizParty>): void {
  const store = loadBizStore();
  if (!store.parties[id]) return;
  store.parties[id] = { ...store.parties[id], ...updates };
  saveBizStore(store);
}

export function deleteParty(id: string): void {
  const store = loadBizStore();
  delete store.parties[id];
  saveBizStore(store);
}

// ── TRANSACTION CRUD ───────────────────────────────────────────────────────────

export function addTransaction(tx: Omit<BizTransaction, 'id' | 'createdAt'>): string {
  const store = loadBizStore();
  const id = newTxId();
  store.transactions.push({ ...tx, id, createdAt: new Date().toISOString() });
  saveBizStore(store);
  return id;
}

export function deleteTransaction(id: string): void {
  const store = loadBizStore();
  store.transactions = store.transactions.filter(t => t.id !== id);
  saveBizStore(store);
}

// ── PRODUCT CRUD ───────────────────────────────────────────────────────────────

export function addProduct(product: Omit<BizProduct, 'id' | 'createdAt'>): void {
  const store = loadBizStore();
  const id = newProductId();
  store.products[id] = { ...product, id, createdAt: new Date().toISOString() };
  saveBizStore(store);
}

export function updateProduct(id: string, updates: Partial<BizProduct>): void {
  const store = loadBizStore();
  if (!store.products[id]) return;
  store.products[id] = { ...store.products[id], ...updates };
  saveBizStore(store);
}

export function deleteProduct(id: string): void {
  const store = loadBizStore();
  delete store.products[id];
  saveBizStore(store);
}

// ── INVOICE CRUD ───────────────────────────────────────────────────────────────

export function addInvoice(invoice: Omit<BizInvoice, 'id' | 'number' | 'createdAt'>): string {
  const store = loadBizStore();
  const id = newInvoiceId();
  const number = nextInvoiceNumber(store.invoices);
  store.invoices[id] = { ...invoice, id, number, createdAt: new Date().toISOString() };
  saveBizStore(store);
  return id;
}

export function updateInvoice(id: string, updates: Partial<BizInvoice>): void {
  const store = loadBizStore();
  if (!store.invoices[id]) return;
  store.invoices[id] = { ...store.invoices[id], ...updates };
  saveBizStore(store);
}

export function markInvoicePaid(invoiceId: string): void {
  const store = loadBizStore();
  const inv = store.invoices[invoiceId];
  if (!inv) return;
  inv.status = 'paid';
  // Auto-create a Daybook income entry linked to this invoice
  const txId = newTxId();
  const party = store.parties[inv.customerId];
  store.transactions.push({
    id: txId,
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    amount: inv.total,
    partyId: inv.customerId,
    category: 'Sales',
    description: `Payment received for ${inv.number}${party ? ` from ${party.name}` : ''}`,
    paymentMode: 'other',
    invoiceId: invoiceId,
    createdAt: new Date().toISOString(),
  });
  store.invoices[invoiceId] = inv;
  saveBizStore(store);
}

export function deleteInvoice(id: string): void {
  const store = loadBizStore();
  delete store.invoices[id];
  saveBizStore(store);
}

// ── SETTINGS ───────────────────────────────────────────────────────────────────

export function updateSettings(updates: Partial<BizOSStore['settings']>): void {
  const store = loadBizStore();
  store.settings = { ...store.settings, ...updates };
  saveBizStore(store);
}

// ── COMPUTED: Party Balance ────────────────────────────────────────────────────
// Positive = party owes us; Negative = we owe them

export function getPartyBalance(
  partyId: string,
  transactions: BizTransaction[],
  invoices: Record<string, BizInvoice>,
): number {
  // Income transactions with this party = they paid us (reduces what they owe)
  // Expense transactions with this party = we paid them (they owe us less / we owe them)
  let balance = 0;

  // Unpaid invoices = they owe us
  Object.values(invoices).forEach(inv => {
    if (inv.customerId === partyId && inv.status !== 'paid' && inv.status !== 'cancelled') {
      balance += inv.total;
    }
  });

  // Transactions: if income linked to party and NOT to an invoice, add to balance owed to us
  // if expense to vendor/employee, they owe us nothing — we track what we owe them via negative
  transactions.forEach(tx => {
    if (tx.partyId !== partyId) return;
    if (tx.invoiceId) return; // invoice-linked already counted above
    if (tx.type === 'income') balance -= tx.amount; // they paid us directly
    if (tx.type === 'expense') balance -= tx.amount; // we paid them
  });

  return balance;
}

// ── COMPUTED: Dashboard KPIs ───────────────────────────────────────────────────

export interface DashboardKPIs {
  todaySales: number;
  todayExpenses: number;
  todayNet: number;
  monthSales: number;
  monthExpenses: number;
  monthNet: number;
  pendingAmount: number;
  overdueAmount: number;
  lowStockCount: number;
  totalParties: number;
}

export function getDashboardKPIs(store: BizOSStore): DashboardKPIs {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7); // YYYY-MM

  let todaySales = 0, todayExpenses = 0;
  let monthSales = 0, monthExpenses = 0;

  store.transactions.forEach(tx => {
    if (tx.date === today) {
      if (tx.type === 'income') todaySales += tx.amount;
      else todayExpenses += tx.amount;
    }
    if (tx.date.startsWith(thisMonth)) {
      if (tx.type === 'income') monthSales += tx.amount;
      else monthExpenses += tx.amount;
    }
  });

  let pendingAmount = 0, overdueAmount = 0;
  const now = new Date();
  Object.values(store.invoices).forEach(inv => {
    if (inv.status === 'sent' || inv.status === 'draft') pendingAmount += inv.total;
    if (inv.status === 'overdue') overdueAmount += inv.total;
    // Auto-detect overdue
    if ((inv.status === 'sent') && inv.dueDate && new Date(inv.dueDate) < now) {
      overdueAmount += inv.total;
      pendingAmount -= inv.total;
    }
  });

  const lowStockCount = Object.values(store.products).filter(
    p => p.lowStockAlert > 0 && p.stock <= p.lowStockAlert,
  ).length;

  return {
    todaySales,
    todayExpenses,
    todayNet: todaySales - todayExpenses,
    monthSales,
    monthExpenses,
    monthNet: monthSales - monthExpenses,
    pendingAmount,
    overdueAmount,
    lowStockCount,
    totalParties: Object.keys(store.parties).length,
  };
}

// ── COMPUTED: Last N Days Chart Data ──────────────────────────────────────────

export function getLast7DaysData(transactions: BizTransaction[]): { date: string; income: number; expense: number }[] {
  const days: { date: string; income: number; expense: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    const income = transactions.filter(t => t.date === dateStr && t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.date === dateStr && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    days.push({ date: label, income, expense });
  }
  return days;
}

// ── COMPUTED: P&L Report ──────────────────────────────────────────────────────

export interface PLReport {
  income: number;
  expenses: number;
  gross: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  monthlyData: { month: string; income: number; expense: number }[];
  topCustomers: { partyId: string; name: string; total: number }[];
  topProducts: { productId: string; name: string; revenue: number }[];
}

export function getProfitAndLoss(store: BizOSStore, from: string, to: string): PLReport {
  const txs = store.transactions.filter(t => t.date >= from && t.date <= to);

  let income = 0, expenses = 0;
  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};
  const customerMap: Record<string, number> = {};
  const productMap: Record<string, number> = {};

  txs.forEach(tx => {
    if (tx.type === 'income') {
      income += tx.amount;
      incomeByCategory[tx.category] = (incomeByCategory[tx.category] ?? 0) + tx.amount;
      if (tx.partyId) customerMap[tx.partyId] = (customerMap[tx.partyId] ?? 0) + tx.amount;
      if (tx.productId) productMap[tx.productId] = (productMap[tx.productId] ?? 0) + tx.amount;
    } else {
      expenses += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] ?? 0) + tx.amount;
    }
  });

  // Monthly data (last 12 months)
  const monthlyData: { month: string; income: number; expense: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    const mi = store.transactions.filter(t => t.date.startsWith(monthStr) && t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const me = store.transactions.filter(t => t.date.startsWith(monthStr) && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    monthlyData.push({ month: label, income: mi, expense: me });
  }

  const topCustomers = Object.entries(customerMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([partyId, total]) => ({
      partyId,
      name: store.parties[partyId]?.name ?? 'Unknown',
      total,
    }));

  const topProducts = Object.entries(productMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([productId, revenue]) => ({
      productId,
      name: store.products[productId]?.name ?? 'Unknown',
      revenue,
    }));

  return { income, expenses, gross: income - expenses, incomeByCategory, expenseByCategory, monthlyData, topCustomers, topProducts };
}

// ── STAFF & PAYROLL ────────────────────────────────────────────────────────────

export interface BizStaff {
  id: string;
  name: string;
  role: string;
  phone?: string;
  salary: number;           // monthly gross
  joiningDate: string;
  pfEnabled: boolean;       // 12% deduction
  esiEnabled: boolean;      // 0.75% deduction (if salary <= 21000)
  active: boolean;
  notes?: string;
  createdAt: string;
}

export interface BizAttendance {
  staffId: string;
  month: string;            // YYYY-MM
  days: Record<string, 'P' | 'A' | 'H'>;  // date -> status
}

export interface BizAdvance {
  id: string;
  staffId: string;
  date: string;
  amount: number;
  note?: string;
  recovered: boolean;
}

export function newStaffId() { return `biz-staff-${Date.now()}`; }
export function newAdvanceId() { return `biz-adv-${Date.now()}`; }

export function addStaff(s: Omit<BizStaff, 'id' | 'createdAt'>): string {
  const store = loadBizStore();
  const id = newStaffId();
  (store as any).staff = (store as any).staff ?? {};
  (store as any).attendance = (store as any).attendance ?? {};
  (store as any).advances = (store as any).advances ?? [];
  (store as any).staff[id] = { ...s, id, createdAt: new Date().toISOString() };
  saveBizStore(store);
  return id;
}

export function updateStaff(id: string, updates: Partial<BizStaff>): void {
  const store = loadBizStore();
  const staff = (store as any).staff ?? {};
  if (!staff[id]) return;
  staff[id] = { ...staff[id], ...updates };
  (store as any).staff = staff;
  saveBizStore(store);
}

export function deleteStaff(id: string): void {
  const store = loadBizStore();
  delete (store as any).staff?.[id];
  saveBizStore(store);
}

export function saveAttendance(att: BizAttendance): void {
  const store = loadBizStore();
  (store as any).attendance = (store as any).attendance ?? {};
  (store as any).attendance[`${att.staffId}-${att.month}`] = att;
  saveBizStore(store);
}

export function getAttendance(staffId: string, month: string, store: BizOSStore): BizAttendance {
  const key = `${staffId}-${month}`;
  return (store as any).attendance?.[key] ?? { staffId, month, days: {} };
}

export function addAdvance(adv: Omit<BizAdvance, 'id'>): void {
  const store = loadBizStore();
  (store as any).advances = (store as any).advances ?? [];
  (store as any).advances.push({ ...adv, id: newAdvanceId() });
  saveBizStore(store);
}

export function getStaffAdvances(staffId: string, store: BizOSStore): BizAdvance[] {
  return ((store as any).advances ?? []).filter((a: BizAdvance) => a.staffId === staffId);
}

export function calcSalary(staff: BizStaff, att: BizAttendance, advances: BizAdvance[], month: string): {
  workingDays: number; presentDays: number; absentDays: number; halfDays: number;
  gross: number; pfDeduction: number; esiDeduction: number; advanceDeduction: number; net: number;
} {
  const year = parseInt(month.split('-')[0]);
  const mon = parseInt(month.split('-')[1]) - 1;
  const workingDays = new Date(year, mon + 1, 0).getDate();
  let presentDays = 0, absentDays = 0, halfDays = 0;
  Object.values(att.days).forEach(s => {
    if (s === 'P') presentDays++;
    else if (s === 'A') absentDays++;
    else if (s === 'H') halfDays++;
  });
  const effectiveDays = presentDays + halfDays * 0.5;
  const gross = (staff.salary / workingDays) * effectiveDays;
  const pfDeduction = staff.pfEnabled ? gross * 0.12 : 0;
  const esiDeduction = staff.esiEnabled && staff.salary <= 21000 ? gross * 0.0075 : 0;
  const advanceDeduction = advances.filter(a => !a.recovered && a.date.startsWith(month)).reduce((s, a) => s + a.amount, 0);
  return {
    workingDays, presentDays, absentDays, halfDays,
    gross: Math.round(gross), pfDeduction: Math.round(pfDeduction),
    esiDeduction: Math.round(esiDeduction), advanceDeduction,
    net: Math.round(gross - pfDeduction - esiDeduction - advanceDeduction),
  };
}

// ── PURCHASE BILLS ─────────────────────────────────────────────────────────────

export interface BizPurchaseItem {
  productId?: string;
  name: string;
  qty: number;
  rate: number;
  gstRate: number;
  amount: number;
}

export type PurchaseStatus = 'pending' | 'paid' | 'partial';

export interface BizPurchaseBill {
  id: string;
  number: string;           // vendor bill number
  date: string;
  dueDate?: string;
  vendorId: string;
  items: BizPurchaseItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  paidAmount: number;
  status: PurchaseStatus;
  notes?: string;
  createdAt: string;
}

export function newPurchaseId() { return `biz-pur-${Date.now()}`; }

export function addPurchaseBill(bill: Omit<BizPurchaseBill, 'id' | 'createdAt'>): string {
  const store = loadBizStore();
  const id = newPurchaseId();
  (store as any).purchases = (store as any).purchases ?? {};
  (store as any).purchases[id] = { ...bill, id, createdAt: new Date().toISOString() };
  saveBizStore(store);
  return id;
}

export function updatePurchaseBill(id: string, updates: Partial<BizPurchaseBill>): void {
  const store = loadBizStore();
  const purchases = (store as any).purchases ?? {};
  if (!purchases[id]) return;
  purchases[id] = { ...purchases[id], ...updates };
  (store as any).purchases = purchases;
  saveBizStore(store);
}

export function deletePurchaseBill(id: string): void {
  const store = loadBizStore();
  delete (store as any).purchases?.[id];
  saveBizStore(store);
}

export function markPurchasePaid(id: string): void {
  const store = loadBizStore();
  const purchases = (store as any).purchases ?? {};
  const bill = purchases[id];
  if (!bill) return;
  bill.status = 'paid';
  bill.paidAmount = bill.total;
  const party = store.parties[bill.vendorId];
  store.transactions.push({
    id: newTxId(),
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    amount: bill.total,
    partyId: bill.vendorId,
    category: 'Purchase',
    description: `Payment for purchase bill ${bill.number}${party ? ` to ${party.name}` : ''}`,
    paymentMode: 'other',
    createdAt: new Date().toISOString(),
  });
  (store as any).purchases = purchases;
  saveBizStore(store);
}

export function getPurchaseBills(store: BizOSStore): Record<string, BizPurchaseBill> {
  return (store as any).purchases ?? {};
}

export function getITC(store: BizOSStore, from: string, to: string): number {
  const bills = getPurchaseBills(store);
  return Object.values(bills)
    .filter(b => b.date >= from && b.date <= to)
    .reduce((s, b) => s + b.gstAmount, 0);
}

// ── QUOTATIONS ─────────────────────────────────────────────────────────────────

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface BizQuotation {
  id: string;
  number: string;           // QUO-0001
  date: string;
  validTill: string;
  customerId: string;
  items: BizInvoiceItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  status: QuoteStatus;
  notes?: string;
  convertedInvoiceId?: string;
  createdAt: string;
}

export function newQuoteId() { return `biz-quo-${Date.now()}`; }

function nextQuoteNumber(quotes: Record<string, BizQuotation>): string {
  const nums = Object.values(quotes).map(q => parseInt(q.number.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `QUO-${String(next).padStart(4, '0')}`;
}

export function addQuotation(q: Omit<BizQuotation, 'id' | 'number' | 'createdAt'>): string {
  const store = loadBizStore();
  const id = newQuoteId();
  (store as any).quotations = (store as any).quotations ?? {};
  const number = nextQuoteNumber((store as any).quotations);
  (store as any).quotations[id] = { ...q, id, number, createdAt: new Date().toISOString() };
  saveBizStore(store);
  return id;
}

export function updateQuotation(id: string, updates: Partial<BizQuotation>): void {
  const store = loadBizStore();
  const quotes = (store as any).quotations ?? {};
  if (!quotes[id]) return;
  quotes[id] = { ...quotes[id], ...updates };
  (store as any).quotations = quotes;
  saveBizStore(store);
}

export function deleteQuotation(id: string): void {
  const store = loadBizStore();
  delete (store as any).quotations?.[id];
  saveBizStore(store);
}

export function convertQuoteToInvoice(quoteId: string): string {
  const store = loadBizStore();
  const quotes = (store as any).quotations ?? {};
  const quote = quotes[quoteId];
  if (!quote) return '';
  const invoiceId = addInvoice({
    date: new Date().toISOString().split('T')[0],
    customerId: quote.customerId,
    items: quote.items,
    subtotal: quote.subtotal,
    gstAmount: quote.gstAmount,
    total: quote.total,
    status: 'draft',
    notes: quote.notes,
  });
  updateQuotation(quoteId, { status: 'converted', convertedInvoiceId: invoiceId });
  return invoiceId;
}

export function getQuotations(store: BizOSStore): Record<string, BizQuotation> {
  return (store as any).quotations ?? {};
}

// ── LOANS & EMI ────────────────────────────────────────────────────────────────

export interface BizLoan {
  id: string;
  lender: string;
  type: 'term' | 'overdraft' | 'cc' | 'mudra' | 'other';
  principal: number;
  interestRate: number;     // annual %
  tenure: number;           // months
  startDate: string;
  emiAmount: number;        // computed or manual
  notes?: string;
  createdAt: string;
}

export interface BizEMIPayment {
  loanId: string;
  month: string;            // YYYY-MM
  paid: boolean;
  paidDate?: string;
  amount: number;
}

export function newLoanId() { return `biz-loan-${Date.now()}`; }

export function addLoan(loan: Omit<BizLoan, 'id' | 'createdAt'>): string {
  const store = loadBizStore();
  const id = newLoanId();
  (store as any).loans = (store as any).loans ?? {};
  (store as any).loans[id] = { ...loan, id, createdAt: new Date().toISOString() };
  saveBizStore(store);
  return id;
}

export function updateLoan(id: string, updates: Partial<BizLoan>): void {
  const store = loadBizStore();
  const loans = (store as any).loans ?? {};
  if (!loans[id]) return;
  loans[id] = { ...loans[id], ...updates };
  (store as any).loans = loans;
  saveBizStore(store);
}

export function deleteLoan(id: string): void {
  const store = loadBizStore();
  delete (store as any).loans?.[id];
  saveBizStore(store);
}

export function toggleEMIPayment(loanId: string, month: string, amount: number): void {
  const store = loadBizStore();
  (store as any).emiPayments = (store as any).emiPayments ?? {};
  const key = `${loanId}-${month}`;
  const existing = (store as any).emiPayments[key];
  if (existing?.paid) {
    (store as any).emiPayments[key] = { loanId, month, paid: false, amount };
  } else {
    (store as any).emiPayments[key] = { loanId, month, paid: true, paidDate: new Date().toISOString().split('T')[0], amount };
    store.transactions.push({
      id: newTxId(),
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      amount,
      category: 'Loan EMI',
      description: `EMI payment for loan from ${(store as any).loans?.[loanId]?.lender ?? loanId} — ${month}`,
      paymentMode: 'bank',
      createdAt: new Date().toISOString(),
    });
  }
  saveBizStore(store);
}

export function getLoanEMISchedule(loan: BizLoan): { month: string; principal: number; interest: number; balance: number }[] {
  const schedule: { month: string; principal: number; interest: number; balance: number }[] = [];
  const r = loan.interestRate / 12 / 100;
  const n = loan.tenure;
  const emi = r === 0 ? loan.principal / n : loan.principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  let balance = loan.principal;
  const [startYear, startMon] = loan.startDate.split('-').map(Number);
  for (let i = 0; i < n; i++) {
    const d = new Date(startYear, startMon - 1 + i);
    const month = d.toISOString().slice(0, 7);
    const interest = balance * r;
    const principal = emi - interest;
    balance = Math.max(0, balance - principal);
    schedule.push({ month, principal: Math.round(principal), interest: Math.round(interest), balance: Math.round(balance) });
  }
  return schedule;
}

export function getLoans(store: BizOSStore): Record<string, BizLoan> {
  return (store as any).loans ?? {};
}

export function getEMIPayments(store: BizOSStore): Record<string, BizEMIPayment> {
  return (store as any).emiPayments ?? {};
}

// ── HELPERS ────────────────────────────────────────────────────────────────────

export function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function monthRangeISO(): [string, string] {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return [from, to];
}

// ── STOCK MOVEMENT ─────────────────────────────────────────────────────────────
// Updates product.stock AND creates a linked Daybook transaction

export interface StockMovementParams {
  productId: string;
  type: 'in' | 'out';       // in = goods received, out = dispatched/sold
  qty: number;
  rate: number;              // cost price for in, selling price for out
  partyId?: string;
  date: string;
  notes?: string;
  invoiceId?: string;
}

export function addStockMovement(params: StockMovementParams): void {
  const store = loadBizStore();
  const product = store.products[params.productId];
  if (!product) return;

  // Update stock
  store.products[params.productId].stock = Math.max(
    0,
    product.stock + (params.type === 'in' ? params.qty : -params.qty),
  );

  // Auto-description
  const party = params.partyId ? store.parties[params.partyId] : null;
  const direction = params.type === 'in' ? 'Received' : 'Dispatched';
  const preposition = params.type === 'in' ? 'from' : 'to';
  const desc = `${direction} ${params.qty} ${product.unit} of ${product.name}${party ? ` ${preposition} ${party.name}` : ''}`;

  const id = newTxId();
  store.transactions.push({
    id,
    date: params.date,
    type: params.type === 'in' ? 'expense' : 'income',
    amount: params.qty * params.rate,
    partyId: params.partyId,
    productId: params.productId,
    category: params.type === 'in' ? 'Purchase' : 'Sales',
    description: desc,
    paymentMode: 'other',
    invoiceId: params.invoiceId,
    notes: params.notes,
    createdAt: new Date().toISOString(),
  });

  saveBizStore(store);
}

// Returns all transactions linked to a specific product, newest first
export function getProductMovements(
  productId: string,
  transactions: BizTransaction[],
): BizTransaction[] {
  return transactions
    .filter(t => t.productId === productId)
    .sort((a, b) => b.date.localeCompare(a.date));
}
