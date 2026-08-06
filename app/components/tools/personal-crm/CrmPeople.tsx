'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users, ArrowLeft, Plus, Phone, Mail, Building2, Cake,
  Trash2, ChevronDown, Search, X, Clock, RefreshCw,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  getContacts, getInteractions, addContact, updateContact, deleteContact,
  addInteraction, deleteInteraction,
  getHealthStatus, getDaysSinceContact, getLastInteraction,
  getUpcomingBirthdays, daysUntilBirthday, fmtDaysAgo, fmtBirthday,
  countInteractionsThisMonth,
  DEFAULT_INTERVALS, RELATIONSHIP_LABELS, INTERACTION_LABELS, INTERACTION_ICONS,
  type CRMContact, type CRMInteraction, type RelationshipType, type InteractionType,
  type HealthStatus,
} from './crm-store';

// ── Constants ─────────────────────────────────────────────────────────────────

const RELATIONSHIP_TYPES: RelationshipType[] = ['family', 'friend', 'work', 'mentor', 'other'];
const INTERACTION_TYPES:  InteractionType[]  = ['call', 'met', 'message', 'email', 'other'];

const HEALTH_COLORS: Record<HealthStatus, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-400',
  red:   'bg-red-500',
  new:   'bg-slate-300 dark:bg-slate-600',
};

const HEALTH_RING: Record<HealthStatus, string> = {
  green: 'ring-emerald-200 dark:ring-emerald-800',
  amber: 'ring-amber-200 dark:ring-amber-700',
  red:   'ring-red-200 dark:ring-red-800',
  new:   'ring-slate-200 dark:ring-slate-700',
};

const HEALTH_TEXT: Record<HealthStatus, string> = {
  green: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  red:   'text-red-600 dark:text-red-400',
  new:   'text-slate-400',
};

const REL_COLORS: Record<RelationshipType, string> = {
  family: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  friend: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  work:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  mentor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  other:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const TODAY = new Date().toISOString().split('T')[0];

// ── Helper: initials avatar ───────────────────────────────────────────────────

function Initials({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palettes = [
    'from-violet-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-fuchsia-500 to-violet-500',
  ];
  const gradient = palettes[hash % palettes.length];
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

// ── Contact Form ──────────────────────────────────────────────────────────────

interface ContactFormProps {
  initial?: CRMContact;
  onSave: (data: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function ContactForm({ initial, onSave, onCancel }: ContactFormProps) {
  const [name,        setName]        = useState(initial?.name        ?? '');
  const [rel,         setRel]         = useState<RelationshipType>(initial?.relationship ?? 'friend');
  const [phone,       setPhone]       = useState(initial?.phone       ?? '');
  const [email,       setEmail]       = useState(initial?.email       ?? '');
  const [birthday,    setBirthday]    = useState(initial?.birthday    ?? '');
  const [company,     setCompany]     = useState(initial?.company     ?? '');
  const [notes,       setNotes]       = useState(initial?.notes       ?? '');
  const [interval,    setInterval]    = useState(initial?.checkInInterval ?? DEFAULT_INTERVALS[initial?.relationship ?? 'friend']);

  const handleRelChange = (r: RelationshipType) => {
    setRel(r);
    if (!initial) setInterval(DEFAULT_INTERVALS[r]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), relationship: rel, phone: phone.trim() || undefined, email: email.trim() || undefined, birthday: birthday || undefined, company: company.trim() || undefined, notes, checkInInterval: interval });
  };

  const inputCls = 'w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-600';

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800 rounded-2xl p-5 space-y-4">
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{initial ? 'Edit Contact' : 'New Contact'}</p>

      {/* Name + Relationship */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Rohan Mehta" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Relationship *</label>
          <select value={rel} onChange={e => handleRelChange(e.target.value as RelationshipType)} className={inputCls}>
            {RELATIONSHIP_TYPES.map(r => <option key={r} value={r}>{RELATIONSHIP_LABELS[r]}</option>)}
          </select>
        </div>
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="+91 98765 43210" type="tel" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="rohan@example.com" type="email" />
        </div>
      </div>

      {/* Birthday + Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Birthday (MM-DD)</label>
          <input value={birthday} onChange={e => setBirthday(e.target.value)} className={inputCls} placeholder="08-15" pattern="\d{2}-\d{2}" maxLength={5} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Company / Org</label>
          <input value={company} onChange={e => setCompany(e.target.value)} className={inputCls} placeholder="Acme Corp" />
        </div>
      </div>

      {/* Check-in interval */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Check-in every (days)</label>
        <div className="flex items-center gap-3">
          <input type="range" min={1} max={180} value={interval} onChange={e => setInterval(Number(e.target.value))} className="flex-1 accent-violet-600" />
          <span className="text-sm font-bold text-violet-600 dark:text-violet-400 w-20 text-right">{interval} days</span>
        </div>
        <p className="text-[10px] text-slate-400">Amber warning after {Math.round(interval * 0.5)}d · Red alert after {interval}d</p>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className={`${inputCls} resize-none`} rows={2} placeholder="Things to remember about this person..." />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors">
          {initial ? 'Save Changes' : 'Add Person'}
        </button>
      </div>
    </form>
  );
}

// ── Log Interaction Form ──────────────────────────────────────────────────────

function LogInteractionBar({ contactId, onLogged }: { contactId: string; onLogged?: () => void }) {
  const [type,  setType]  = useState<InteractionType>('call');
  const [date,  setDate]  = useState(TODAY);
  const [notes, setNotes] = useState('');
  const [open,  setOpen]  = useState(false);

  const handleLog = () => {
    if (!date) return;
    addInteraction({ contactId, type, date, notes: notes.trim() });
    setNotes('');
    setDate(TODAY);
    setOpen(false);
    onLogged?.();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
        <Plus size={13} /> Log
      </button>
    );
  }

  return (
    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl p-3 space-y-2">
      <div className="flex gap-2 flex-wrap">
        {INTERACTION_TYPES.map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${type === t ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-violet-400'}`}>
            {INTERACTION_ICONS[t]} {INTERACTION_LABELS[t]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} max={TODAY}
          className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400" />
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="What happened? (optional)"
          className="flex-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-xs rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
        <button onClick={handleLog} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors">Log Interaction</button>
      </div>
    </div>
  );
}

// ── Contact Card (list row) ───────────────────────────────────────────────────

interface ContactCardProps {
  contact: CRMContact;
  onOpen: () => void;
  onLogged: () => void;
}

function ContactCard({ contact, onOpen, onLogged }: ContactCardProps) {
  const health  = getHealthStatus(contact);
  const days    = getDaysSinceContact(contact.id);
  const [showLog, setShowLog] = useState(false);

  // upcoming birthday in next 7 days
  const birthdaySoon = contact.birthday && daysUntilBirthday(contact.birthday) <= 7;

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-xl p-4 transition-all hover:shadow-sm ring-2 ${HEALTH_RING[health]} border-transparent`}>
      <div className="flex items-start gap-3">
        {/* Health dot + avatar */}
        <div className="relative shrink-0">
          <Initials name={contact.name} />
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${HEALTH_COLORS[health]}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onOpen} className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors truncate">
              {contact.name}
            </button>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${REL_COLORS[contact.relationship]}`}>
              {RELATIONSHIP_LABELS[contact.relationship]}
            </span>
            {birthdaySoon && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                🎂 {daysUntilBirthday(contact.birthday!) === 0 ? 'Today!' : `in ${daysUntilBirthday(contact.birthday!)}d`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={`text-xs font-semibold flex items-center gap-1 ${HEALTH_TEXT[health]}`}>
              <Clock size={11} />
              {fmtDaysAgo(days)}
            </span>
            {contact.company && <span className="text-xs text-slate-400 truncate">{contact.company}</span>}
            {contact.birthday && <span className="text-xs text-slate-400">🎂 {fmtBirthday(contact.birthday)}</span>}
          </div>
          {/* notes preview */}
          {contact.notes && (
            <p className="text-xs text-slate-400 mt-1 truncate">{contact.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setShowLog(v => !v)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 hover:bg-violet-100 transition-colors">
            <Plus size={12} /> Log
          </button>
          <button onClick={onOpen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
            title="Open profile">
            <ChevronDown size={15} className="-rotate-90" />
          </button>
        </div>
      </div>

      {/* Inline log form */}
      {showLog && (
        <div className="mt-3">
          <LogInteractionBar contactId={contact.id} onLogged={() => { setShowLog(false); onLogged(); }} />
        </div>
      )}
    </div>
  );
}

// ── Detail View ───────────────────────────────────────────────────────────────

function ContactDetail({ contactId, onBack, onUpdate }: { contactId: string; onBack: () => void; onUpdate: () => void }) {
  const [contact, setContact] = useState<CRMContact | null>(null);
  const [interactions, setInteractions] = useState<CRMInteraction[]>([]);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reload = () => {
    const contacts = getContacts();
    const c = contacts.find(c => c.id === contactId);
    if (!c) { onBack(); return; }
    setContact(c);
    setInteractions(getInteractions(contactId).sort((a, b) => b.date.localeCompare(a.date)));
  };

  useEffect(() => {
    reload();
    const h = () => reload();
    window.addEventListener('crm-store-updated', h);
    return () => window.removeEventListener('crm-store-updated', h);
  }, [contactId]);

  if (!contact) return null;

  const health = getHealthStatus(contact);
  const days   = getDaysSinceContact(contact.id);

  if (editing) {
    return (
      <div className="space-y-4 px-4 pb-4">
        <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
          <ArrowLeft size={15} /> Back to Profile
        </button>
        <ContactForm
          initial={contact}
          onSave={data => { updateContact(contact.id, data); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-4">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
        <ArrowLeft size={15} /> All People
      </button>

      {/* Profile card */}
      <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 ring-2 ${HEALTH_RING[health]} border-transparent`}>
        <div className="flex items-start gap-4">
          <Initials name={contact.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{contact.name}</h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${REL_COLORS[contact.relationship]}`}>
                {RELATIONSHIP_LABELS[contact.relationship]}
              </span>
            </div>
            <p className={`text-sm font-semibold mt-1 ${HEALTH_TEXT[health]}`}>
              {fmtDaysAgo(days)} · Check-in every {contact.checkInInterval} days
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
              {contact.phone   && <span className="flex items-center gap-1"><Phone size={12} />{contact.phone}</span>}
              {contact.email   && <span className="flex items-center gap-1"><Mail size={12} />{contact.email}</span>}
              {contact.company && <span className="flex items-center gap-1"><Building2 size={12} />{contact.company}</span>}
              {contact.birthday && <span className="flex items-center gap-1"><Cake size={12} />{fmtBirthday(contact.birthday)}</span>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setEditing(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Edit
            </button>
            {confirmDelete ? (
              <div className="flex gap-1">
                <button onClick={() => { deleteContact(contact.id); onUpdate(); onBack(); }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                  Confirm
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Notes */}
        {(contact.notes || true) && (
          <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Notes</label>
            <textarea
              defaultValue={contact.notes}
              onBlur={e => updateContact(contact.id, { notes: e.target.value })}
              placeholder="Things to remember about this person..."
              rows={2}
              className="w-full mt-1 text-sm text-slate-700 dark:text-slate-200 bg-transparent resize-none focus:outline-none placeholder-slate-300 dark:placeholder-slate-600"
            />
          </div>
        )}
      </div>

      {/* Log interaction */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Log Interaction</p>
        <LogInteractionBar contactId={contact.id} onLogged={reload} />
      </div>

      {/* Interaction history */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">History</p>
          <span className="text-xs text-slate-400">{interactions.length} interactions</span>
        </div>
        {interactions.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-400">
            <RefreshCw size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No interactions logged yet.</p>
            <p className="text-xs mt-1">Log your first one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {interactions.map(i => (
              <div key={i.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 group">
                <span className="text-base mt-0.5 shrink-0">{INTERACTION_ICONS[i.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{INTERACTION_LABELS[i.type]}</span>
                    <span className="text-xs text-slate-400">{new Date(i.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {i.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{i.notes}</p>}
                </div>
                <button onClick={() => { deleteInteraction(i.id); reload(); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

function CRMPeopleInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const activeId     = searchParams.get('contact');

  const openContact = (id: string) =>
    router.push(`/tools/personal-crm/crm-people?contact=${id}`);
  const goBack = () =>
    router.push('/tools/personal-crm/crm-people');

  const [mounted,         setMounted]         = useState(false);
  const [contacts,        setContacts]        = useState<CRMContact[]>([]);
  const [allInteractions, setAllInteractions] = useState<CRMInteraction[]>([]);
  const [showForm,        setShowForm]        = useState(false);
  const [search,          setSearch]          = useState('');
  const [filterRel,       setFilterRel]       = useState<RelationshipType | 'all'>('all');
  const [sortBy,          setSortBy]          = useState<'last_contact' | 'name' | 'relationship'>('last_contact');
  const [kpiFilter,       setKpiFilter]       = useState<'all' | 'attention' | 'birthdays' | 'this_month'>('all');

  const applyKpiFilter = (f: typeof kpiFilter) =>
    setKpiFilter(f);

  const reload = () => {
    setContacts(getContacts());
    setAllInteractions(getInteractions());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    const h = () => reload();
    window.addEventListener('crm-store-updated', h);
    return () => window.removeEventListener('crm-store-updated', h);
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = contacts;
    if (filterRel !== 'all') list = list.filter(c => c.relationship === filterRel);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.notes.toLowerCase().includes(q)
      );
    }
    if (kpiFilter === 'attention')  list = list.filter(c => getHealthStatus(c) === 'red');
    if (kpiFilter === 'birthdays')  list = list.filter(c => c.birthday && daysUntilBirthday(c.birthday) <= 30);
    if (kpiFilter === 'this_month') {
      const now = new Date();
      const ym  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const ids  = new Set(allInteractions.filter(i => i.date.startsWith(ym)).map(i => i.contactId));
      list = list.filter(c => ids.has(c.id));
    }
    return list;
  }, [contacts, filterRel, search, kpiFilter, allInteractions]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'relationship') return a.relationship.localeCompare(b.relationship);
      // last_contact: null (never) goes to end
      const da = getDaysSinceContact(a.id) ?? Infinity;
      const db = getDaysSinceContact(b.id) ?? Infinity;
      return db - da; // most neglected first
    });
  }, [filtered, sortBy]);

  const needsAttention = useMemo(() => sorted.filter(c => getHealthStatus(c) === 'red'), [sorted]);
  const upcomingBdays  = useMemo(() => getUpcomingBirthdays(contacts), [contacts]);
  const thisMonth      = useMemo(() => countInteractionsThisMonth(allInteractions), [allInteractions]);

  if (!mounted) return null;

  // ── Detail view ────────────────────────────────────────────────────────────
  if (activeId) {
    return (
      <div className="space-y-4">
        <SAPHeader
          fullWidth
          title="People & Relationships"
          subtitle="Personal CRM"
        />
        <ContactDetail
          contactId={activeId}
          onBack={goBack}
          onUpdate={reload}
        />
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="People & Relationships"
        subtitle="Stay intentionally connected"
        kpis={contacts.length > 0 ? [
          { label: 'People',          value: contacts.length,       color: 'neutral', active: kpiFilter === 'all',        onClick: () => applyKpiFilter('all') },
          { label: 'Needs Attention', value: needsAttention.length, color: needsAttention.length > 0 ? 'error' : 'success', active: kpiFilter === 'attention',  onClick: () => applyKpiFilter('attention') },
          { label: 'Upcoming Bdays',  value: upcomingBdays.length,  color: upcomingBdays.length > 0 ? 'warning' : 'neutral', active: kpiFilter === 'birthdays',  onClick: () => applyKpiFilter('birthdays') },
          { label: 'This Month',      value: thisMonth,             color: 'primary', active: kpiFilter === 'this_month', onClick: () => applyKpiFilter('this_month') },
        ] : undefined}
      />

      <div className="space-y-4 px-4 pb-4">

        {/* Search + Filter + Sort + Add */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>
          <select value={filterRel} onChange={e => setFilterRel(e.target.value as typeof filterRel)}
            className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400">
            <option value="all">All Types</option>
            {RELATIONSHIP_TYPES.map(r => <option key={r} value={r}>{RELATIONSHIP_LABELS[r]}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400">
            <option value="last_contact">Sort: Last Contact</option>
            <option value="name">Sort: Name</option>
            <option value="relationship">Sort: Relationship</option>
          </select>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors shrink-0">
            <Plus size={15} /> Add Person
          </button>
        </div>

        {/* Active KPI filter banner */}
        {kpiFilter !== 'all' && (
          <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl px-4 py-2.5">
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">
              {kpiFilter === 'attention'  && `Showing ${filtered.length} contacts needing attention`}
              {kpiFilter === 'birthdays'  && `Showing ${filtered.length} contacts with upcoming birthdays`}
              {kpiFilter === 'this_month' && `Showing ${filtered.length} contacts you interacted with this month`}
            </p>
            <button onClick={() => setKpiFilter('all')} className="text-xs text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1">
              <X size={12} /> Clear
            </button>
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <ContactForm
            onSave={data => { addContact(data); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Empty state */}
        {contacts.length === 0 && !showForm && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-16 text-center">
            <Users size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No contacts yet.</p>
            <p className="text-xs text-slate-400 mt-1">Add the people who matter to you — family, friends, mentors.</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors">
              Add your first contact
            </button>
          </div>
        )}

        {/* Needs Attention */}
        {needsAttention.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Needs Attention</p>
              <span className="text-xs font-bold text-red-600 dark:text-red-400">{needsAttention.length}</span>
            </div>
            <div className="space-y-2">
              {needsAttention.map(c => (
                <ContactCard key={c.id} contact={c} onOpen={() => { openContact(c.id); }} onLogged={reload} />
              ))}
            </div>
          </div>
        )}

        {/* All contacts */}
        {sorted.length > 0 && (
          <div>
            {needsAttention.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Everyone</p>
                <span className="text-xs text-slate-400">{sorted.length}</span>
              </div>
            )}
            <div className="space-y-2">
              {sorted.map(c => (
                <ContactCard key={c.id} contact={c} onOpen={() => { openContact(c.id); }} onLogged={reload} />
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {contacts.length > 0 && sorted.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
            <Search size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400">No contacts match your filters.</p>
          </div>
        )}

        {/* Upcoming birthdays callout */}
        {upcomingBdays.length > 0 && (
          <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wide mb-2">
              🎂 Upcoming Birthdays (next 30 days)
            </p>
            <div className="flex flex-wrap gap-2">
              {upcomingBdays.map(c => (
                <button key={c.id} onClick={() => { openContact(c.id); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-pink-200 dark:border-pink-700 hover:border-pink-400 transition-colors">
                  <Initials name={c.name} size="sm" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{c.name}</p>
                    <p className="text-[10px] text-pink-600 dark:text-pink-400">
                      {c.birthday && fmtBirthday(c.birthday)} · {daysUntilBirthday(c.birthday!) === 0 ? 'Today!' : `in ${daysUntilBirthday(c.birthday!)}d`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Health legend */}
        {contacts.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> On track</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Due soon</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Overdue</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> New</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CRMPeople() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-400 text-center">Loading...</div>}>
      <CRMPeopleInner />
    </Suspense>
  );
}
