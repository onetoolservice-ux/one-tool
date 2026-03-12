/**
 * Business CRM Store — Deal pipeline + follow-up tracker
 * Local-first, localStorage only. No server, no accounts.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type DealStage    = 'lead' | 'prospect' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'on_hold';
export type BizRelType   = 'client' | 'prospect' | 'vendor' | 'partner' | 'investor' | 'other';
export type BizInterType = 'call' | 'met' | 'whatsapp' | 'email' | 'proposal_sent' | 'demo' | 'contract_sent' | 'payment_received' | 'other';
export type BizHealth    = 'green' | 'amber' | 'red' | 'new';

export interface BizContact {
  id: string;
  name: string;
  company?: string;
  role?: string;
  phone?: string;
  email?: string;
  relationship: BizRelType;
  dealStage: DealStage;
  notes: string;
  checkInInterval: number;
  createdAt: string;
  updatedAt: string;
}

export interface BizFollowUp {
  id: string;
  contactId: string;
  task: string;
  dueDate: string;   // YYYY-MM-DD
  done: boolean;
  createdAt: string;
}

export interface BizInteraction {
  id: string;
  contactId: string;
  type: BizInterType;
  date: string;       // YYYY-MM-DD
  notes: string;
  createdAt: string;
}

export interface BizCRMStore {
  contacts:     Record<string, BizContact>;
  interactions: BizInteraction[];
  followUps:    BizFollowUp[];
  lastUpdated:  string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const BIZ_STORAGE_KEY = 'otsd-biz-crm-store';

export const DEAL_STAGES: DealStage[] = ['lead', 'prospect', 'proposal', 'negotiation', 'won', 'lost', 'on_hold'];

export const STAGE_LABELS: Record<DealStage, string> = {
  lead:        'Lead',
  prospect:    'Prospect',
  proposal:    'Proposal',
  negotiation: 'Negotiation',
  won:         'Won',
  lost:        'Lost',
  on_hold:     'On Hold',
};

export const STAGE_COLORS: Record<DealStage, { bg: string; text: string; border: string; header: string }> = {
  lead:        { bg: 'bg-slate-50 dark:bg-slate-800/40',    text: 'text-slate-600 dark:text-slate-300',    border: 'border-slate-200 dark:border-slate-700',   header: 'bg-slate-100 dark:bg-slate-800' },
  prospect:    { bg: 'bg-blue-50 dark:bg-blue-900/20',      text: 'text-blue-700 dark:text-blue-300',      border: 'border-blue-200 dark:border-blue-800',     header: 'bg-blue-100 dark:bg-blue-900/40' },
  proposal:    { bg: 'bg-amber-50 dark:bg-amber-900/20',    text: 'text-amber-700 dark:text-amber-300',    border: 'border-amber-200 dark:border-amber-800',   header: 'bg-amber-100 dark:bg-amber-900/40' },
  negotiation: { bg: 'bg-orange-50 dark:bg-orange-900/20',  text: 'text-orange-700 dark:text-orange-300',  border: 'border-orange-200 dark:border-orange-800', header: 'bg-orange-100 dark:bg-orange-900/40' },
  won:         { bg: 'bg-emerald-50 dark:bg-emerald-900/20',text: 'text-emerald-700 dark:text-emerald-300',border: 'border-emerald-200 dark:border-emerald-800',header: 'bg-emerald-100 dark:bg-emerald-900/40' },
  lost:        { bg: 'bg-red-50 dark:bg-red-900/10',        text: 'text-red-600 dark:text-red-400',        border: 'border-red-200 dark:border-red-800',       header: 'bg-red-100 dark:bg-red-900/30' },
  on_hold:     { bg: 'bg-purple-50 dark:bg-purple-900/20',  text: 'text-purple-700 dark:text-purple-300',  border: 'border-purple-200 dark:border-purple-800', header: 'bg-purple-100 dark:bg-purple-900/40' },
};

export const REL_LABELS: Record<BizRelType, string> = {
  client:   'Client',
  prospect: 'Prospect',
  vendor:   'Vendor',
  partner:  'Partner',
  investor: 'Investor',
  other:    'Other',
};

export const INTER_LABELS: Record<BizInterType, string> = {
  call:              'Call',
  met:               'Met',
  whatsapp:          'WhatsApp',
  email:             'Email',
  proposal_sent:     'Proposal Sent',
  demo:              'Demo',
  contract_sent:     'Contract Sent',
  payment_received:  'Payment Received',
  other:             'Other',
};

export const INTER_ICONS: Record<BizInterType, string> = {
  call:              '📞',
  met:               '🤝',
  whatsapp:          '💬',
  email:             '✉️',
  proposal_sent:     '📋',
  demo:              '🖥️',
  contract_sent:     '📝',
  payment_received:  '💰',
  other:             '📌',
};

export const DEFAULT_BIZ_INTERVAL: Record<BizRelType, number> = {
  client:   15,
  prospect: 7,
  vendor:   30,
  partner:  14,
  investor: 30,
  other:    30,
};

// ── Persistence ───────────────────────────────────────────────────────────────

function emptyStore(): BizCRMStore {
  return { contacts: {}, interactions: [], followUps: [], lastUpdated: new Date().toISOString() };
}

export function loadBizStore(): BizCRMStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(BIZ_STORAGE_KEY);
    if (!raw) return emptyStore();
    const p = JSON.parse(raw) as BizCRMStore;
    return { contacts: p.contacts ?? {}, interactions: p.interactions ?? [], followUps: p.followUps ?? [], lastUpdated: p.lastUpdated ?? new Date().toISOString() };
  } catch { return emptyStore(); }
}

export function saveBizStore(data: BizCRMStore): void {
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(BIZ_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('biz-crm-store-updated'));
}

// ── Contact CRUD ──────────────────────────────────────────────────────────────

export function getBizContacts(): BizContact[] {
  return Object.values(loadBizStore().contacts);
}

export function addBizContact(params: Omit<BizContact, 'id' | 'createdAt' | 'updatedAt'>): BizContact {
  const store = loadBizStore();
  const c: BizContact = { ...params, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  store.contacts[c.id] = c;
  saveBizStore(store);
  return c;
}

export function updateBizContact(id: string, updates: Partial<Omit<BizContact, 'id' | 'createdAt'>>): void {
  const store = loadBizStore();
  if (!store.contacts[id]) return;
  store.contacts[id] = { ...store.contacts[id], ...updates, updatedAt: new Date().toISOString() };
  saveBizStore(store);
}

export function deleteBizContact(id: string): void {
  const store = loadBizStore();
  delete store.contacts[id];
  store.interactions = store.interactions.filter(i => i.contactId !== id);
  store.followUps    = store.followUps.filter(f => f.contactId !== id);
  saveBizStore(store);
}

// ── Interaction CRUD ──────────────────────────────────────────────────────────

export function getBizInteractions(contactId?: string): BizInteraction[] {
  const all = loadBizStore().interactions;
  return contactId ? all.filter(i => i.contactId === contactId) : all;
}

export function addBizInteraction(params: Omit<BizInteraction, 'id' | 'createdAt'>): BizInteraction {
  const store = loadBizStore();
  const i: BizInteraction = { ...params, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  store.interactions.push(i);
  saveBizStore(store);
  return i;
}

export function deleteBizInteraction(id: string): void {
  const store = loadBizStore();
  store.interactions = store.interactions.filter(i => i.id !== id);
  saveBizStore(store);
}

// ── Follow-up CRUD ────────────────────────────────────────────────────────────

export function getFollowUps(contactId?: string): BizFollowUp[] {
  const all = loadBizStore().followUps;
  return contactId ? all.filter(f => f.contactId === contactId) : all;
}

export function addFollowUp(params: Omit<BizFollowUp, 'id' | 'done' | 'createdAt'>): BizFollowUp {
  const store = loadBizStore();
  const f: BizFollowUp = { ...params, id: crypto.randomUUID(), done: false, createdAt: new Date().toISOString() };
  store.followUps.push(f);
  saveBizStore(store);
  return f;
}

export function toggleFollowUp(id: string): void {
  const store = loadBizStore();
  const f = store.followUps.find(f => f.id === id);
  if (f) { f.done = !f.done; saveBizStore(store); }
}

export function deleteFollowUp(id: string): void {
  const store = loadBizStore();
  store.followUps = store.followUps.filter(f => f.id !== id);
  saveBizStore(store);
}

// ── Computed Helpers ──────────────────────────────────────────────────────────

export function getBizLastInteraction(contactId: string): BizInteraction | null {
  const list = getBizInteractions(contactId);
  if (!list.length) return null;
  return list.sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function getBizDaysSince(contactId: string): number | null {
  const last = getBizLastInteraction(contactId);
  if (!last) return null;
  const d = new Date(last.date); d.setHours(0, 0, 0, 0);
  const t = new Date();          t.setHours(0, 0, 0, 0);
  return Math.floor((t.getTime() - d.getTime()) / 86400000);
}

export function getBizHealthStatus(c: BizContact): BizHealth {
  const days = getBizDaysSince(c.id);
  if (days === null) return 'new';
  if (days < c.checkInInterval * 0.5) return 'green';
  if (days < c.checkInInterval)       return 'amber';
  return 'red';
}

const TODAY_STR = () => new Date().toISOString().split('T')[0];

export function getOverdueFollowUps(): BizFollowUp[] {
  return loadBizStore().followUps.filter(f => !f.done && f.dueDate < TODAY_STR());
}

export function getTodayFollowUps(): BizFollowUp[] {
  return loadBizStore().followUps.filter(f => !f.done && f.dueDate === TODAY_STR());
}

export function getUpcomingFollowUps(days = 7): BizFollowUp[] {
  const today = TODAY_STR();
  const limit = new Date(); limit.setDate(limit.getDate() + days);
  const limitStr = limit.toISOString().split('T')[0];
  return loadBizStore().followUps.filter(f => !f.done && f.dueDate > today && f.dueDate <= limitStr);
}

export function getNextFollowUp(contactId: string): BizFollowUp | null {
  const today = TODAY_STR();
  const pending = getFollowUps(contactId).filter(f => !f.done && f.dueDate >= today);
  if (!pending.length) return null;
  return pending.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
}

export function fmtBizDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function fmtDaysAgo(days: number | null): string {
  if (days === null) return 'Never';
  if (days === 0)  return 'Today';
  if (days === 1)  return 'Yesterday';
  if (days < 30)   return `${days}d ago`;
  if (days < 365)  return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function followUpStatus(dueDate: string): 'overdue' | 'today' | 'upcoming' {
  const today = TODAY_STR();
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'today';
  return 'upcoming';
}
