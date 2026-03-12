/**
 * Personal CRM Store — Local-first relationship tracker
 *
 * All data stored in localStorage. No server. No accounts.
 * Dispatch 'crm-store-updated' after every write so components stay in sync.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type RelationshipType = 'family' | 'friend' | 'work' | 'mentor' | 'other';
export type InteractionType  = 'call' | 'met' | 'message' | 'email' | 'other';
export type HealthStatus     = 'green' | 'amber' | 'red' | 'new';

export interface CRMContact {
  id: string;
  name: string;
  relationship: RelationshipType;
  phone?: string;
  email?: string;
  birthday?: string;       // MM-DD format
  company?: string;
  notes: string;
  checkInInterval: number; // days between check-ins
  createdAt: string;
  updatedAt: string;
}

export interface CRMInteraction {
  id: string;
  contactId: string;
  type: InteractionType;
  date: string;            // YYYY-MM-DD
  notes: string;
  createdAt: string;
}

export interface CRMStore {
  contacts: Record<string, CRMContact>;
  interactions: CRMInteraction[];
  lastUpdated: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const CRM_STORAGE_KEY = 'otsd-crm-store';

export const DEFAULT_INTERVALS: Record<RelationshipType, number> = {
  family:  7,
  friend:  30,
  mentor:  45,
  work:    30,
  other:   60,
};

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  family: 'Family',
  friend: 'Friend',
  work:   'Work',
  mentor: 'Mentor',
  other:  'Other',
};

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  call:    'Call',
  met:     'Met',
  message: 'Message',
  email:   'Email',
  other:   'Other',
};

export const INTERACTION_ICONS: Record<InteractionType, string> = {
  call:    '📞',
  met:     '🤝',
  message: '💬',
  email:   '✉️',
  other:   '📝',
};

// ── Persistence ───────────────────────────────────────────────────────────────

function emptyStore(): CRMStore {
  return { contacts: {}, interactions: [], lastUpdated: new Date().toISOString() };
}

export function loadCRMStore(): CRMStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CRMStore;
    return {
      contacts:     parsed.contacts     ?? {},
      interactions: parsed.interactions ?? [],
      lastUpdated:  parsed.lastUpdated  ?? new Date().toISOString(),
    };
  } catch {
    return emptyStore();
  }
}

export function saveCRMStore(data: CRMStore): void {
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('crm-store-updated'));
}

// ── Contact CRUD ──────────────────────────────────────────────────────────────

export function getContacts(): CRMContact[] {
  return Object.values(loadCRMStore().contacts);
}

export function addContact(params: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>): CRMContact {
  const store = loadCRMStore();
  const contact: CRMContact = {
    ...params,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.contacts[contact.id] = contact;
  saveCRMStore(store);
  return contact;
}

export function updateContact(id: string, updates: Partial<Omit<CRMContact, 'id' | 'createdAt'>>): void {
  const store = loadCRMStore();
  if (!store.contacts[id]) return;
  store.contacts[id] = { ...store.contacts[id], ...updates, updatedAt: new Date().toISOString() };
  saveCRMStore(store);
}

export function deleteContact(id: string): void {
  const store = loadCRMStore();
  delete store.contacts[id];
  store.interactions = store.interactions.filter(i => i.contactId !== id);
  saveCRMStore(store);
}

// ── Interaction CRUD ──────────────────────────────────────────────────────────

export function getInteractions(contactId?: string): CRMInteraction[] {
  const all = loadCRMStore().interactions;
  return contactId ? all.filter(i => i.contactId === contactId) : all;
}

export function addInteraction(params: Omit<CRMInteraction, 'id' | 'createdAt'>): CRMInteraction {
  const store = loadCRMStore();
  const interaction: CRMInteraction = {
    ...params,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  store.interactions.push(interaction);
  saveCRMStore(store);
  return interaction;
}

export function deleteInteraction(id: string): void {
  const store = loadCRMStore();
  store.interactions = store.interactions.filter(i => i.id !== id);
  saveCRMStore(store);
}

// ── Computed Helpers ──────────────────────────────────────────────────────────

export function getLastInteraction(contactId: string): CRMInteraction | null {
  const interactions = getInteractions(contactId);
  if (!interactions.length) return null;
  return interactions.sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function getDaysSinceContact(contactId: string): number | null {
  const last = getLastInteraction(contactId);
  if (!last) return null;
  const lastDate = new Date(last.date);
  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function getHealthStatus(contact: CRMContact): HealthStatus {
  const days = getDaysSinceContact(contact.id);
  if (days === null) return 'new';
  const interval = contact.checkInInterval;
  if (days < interval * 0.5)  return 'green';
  if (days < interval)        return 'amber';
  return 'red';
}

/** Returns contacts with birthday in the next N days (ignoring year) */
export function getUpcomingBirthdays(contacts: CRMContact[], withinDays = 30): CRMContact[] {
  const today = new Date();
  return contacts.filter(c => {
    if (!c.birthday) return false;
    const [mm, dd] = c.birthday.split('-').map(Number);
    const birthday = new Date(today.getFullYear(), mm - 1, dd);
    if (birthday < today) birthday.setFullYear(today.getFullYear() + 1);
    const diff = Math.floor((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= withinDays;
  });
}

/** Days until next birthday (ignoring year) */
export function daysUntilBirthday(birthday: string): number {
  const today = new Date();
  const [mm, dd] = birthday.split('-').map(Number);
  const next = new Date(today.getFullYear(), mm - 1, dd);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Format days ago as a human string */
export function fmtDaysAgo(days: number | null): string {
  if (days === null) return 'Never';
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** Format MM-DD birthday as human readable */
export function fmtBirthday(birthday: string): string {
  const [mm, dd] = birthday.split('-').map(Number);
  return new Date(2000, mm - 1, dd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/** Count interactions logged this calendar month */
export function countInteractionsThisMonth(interactions: CRMInteraction[]): number {
  const now = new Date();
  const ym  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return interactions.filter(i => i.date.startsWith(ym)).length;
}
