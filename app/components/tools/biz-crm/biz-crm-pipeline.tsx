'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Plus, Phone, Mail, Briefcase, Trash2,
  Search, X, CheckCircle2, Circle, ChevronRight, AlertCircle, Clock,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  getBizContacts, addBizContact, updateBizContact, deleteBizContact,
  getBizInteractions, addBizInteraction, deleteBizInteraction,
  getFollowUps, addFollowUp, toggleFollowUp, deleteFollowUp,
  getBizHealthStatus, getBizDaysSince, getBizLastInteraction,
  getOverdueFollowUps, getTodayFollowUps, getNextFollowUp,
  followUpStatus, fmtBizDate, fmtDaysAgo,
  DEAL_STAGES, STAGE_LABELS, STAGE_COLORS,
  REL_LABELS, INTER_LABELS, INTER_ICONS,
  DEFAULT_BIZ_INTERVAL,
  type BizContact, type BizFollowUp, type BizInteraction,
  type DealStage, type BizRelType, type BizInterType, type BizHealth,
} from './biz-crm-store';

// ── Constants ─────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];
const BIZ_REL_TYPES: BizRelType[]  = ['client', 'prospect', 'vendor', 'partner', 'investor', 'other'];
const BIZ_INTER_TYPES: BizInterType[] = ['call', 'met', 'whatsapp', 'email', 'proposal_sent', 'demo', 'contract_sent', 'payment_received', 'other'];

const HEALTH_DOT: Record<BizHealth, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-400',
  red:   'bg-red-500',
  new:   'bg-slate-300 dark:bg-slate-600',
};

const REL_BADGE: Record<BizRelType, string> = {
  client:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  prospect: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  vendor:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  partner:  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  investor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  other:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

// ── Initials Avatar ───────────────────────────────────────────────────────────

function Initials({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const palettes = ['from-blue-500 to-cyan-500', 'from-violet-500 to-indigo-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-pink-500 to-rose-500', 'from-fuchsia-500 to-violet-500'];
  const g = palettes[hash % palettes.length];
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm';
  return <div className={`${sz} rounded-full bg-gradient-to-br ${g} flex items-center justify-center text-white font-bold shrink-0`}>{initials}</div>;
}

// ── Contact Form ──────────────────────────────────────────────────────────────

function BizContactForm({ initial, onSave, onCancel }: {
  initial?: BizContact;
  onSave: (d: Omit<BizContact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) {
  const [name,     setName]     = useState(initial?.name     ?? '');
  const [company,  setCompany]  = useState(initial?.company  ?? '');
  const [role,     setRole]     = useState(initial?.role     ?? '');
  const [phone,    setPhone]    = useState(initial?.phone    ?? '');
  const [email,    setEmail]    = useState(initial?.email    ?? '');
  const [rel,      setRel]      = useState<BizRelType>(initial?.relationship ?? 'prospect');
  const [stage,    setStage]    = useState<DealStage>(initial?.dealStage ?? 'lead');
  const [notes,    setNotes]    = useState(initial?.notes    ?? '');
  const [interval, setInterval] = useState(initial?.checkInInterval ?? DEFAULT_BIZ_INTERVAL['prospect']);

  const handleRelChange = (r: BizRelType) => { setRel(r); if (!initial) setInterval(DEFAULT_BIZ_INTERVAL[r]); };

  const inp = 'w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <form onSubmit={e => { e.preventDefault(); if (!name.trim()) return; onSave({ name: name.trim(), company: company.trim() || undefined, role: role.trim() || undefined, phone: phone.trim() || undefined, email: email.trim() || undefined, relationship: rel, dealStage: stage, notes, checkInInterval: interval }); }}
      className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 space-y-4">
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{initial ? 'Edit Contact' : 'New Contact'}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Name *</label><input value={name} onChange={e => setName(e.target.value)} className={inp} placeholder="Ramesh Sharma" required /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Company</label><input value={company} onChange={e => setCompany(e.target.value)} className={inp} placeholder="Sharma Industries" /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Role / Designation</label><input value={role} onChange={e => setRole(e.target.value)} className={inp} placeholder="Purchase Manager" /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className={inp} placeholder="+91 98765 43210" type="tel" /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Email</label><input value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="ramesh@sharma.co" type="email" /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Relationship</label>
          <select value={rel} onChange={e => handleRelChange(e.target.value as BizRelType)} className={inp}>{BIZ_REL_TYPES.map(r => <option key={r} value={r}>{REL_LABELS[r]}</option>)}</select>
        </div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Deal Stage</label>
          <select value={stage} onChange={e => setStage(e.target.value as DealStage)} className={inp}>{DEAL_STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}</select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Check-in every (days)</label>
        <div className="flex items-center gap-3"><input type="range" min={1} max={90} value={interval} onChange={e => setInterval(Number(e.target.value))} className="flex-1 accent-blue-600" /><span className="text-sm font-bold text-blue-600 dark:text-blue-400 w-16 text-right">{interval}d</span></div>
      </div>
      <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className={`${inp} resize-none`} rows={2} placeholder="Context about this deal..." /></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">{initial ? 'Save' : 'Add Contact'}</button>
      </div>
    </form>
  );
}

// ── Follow-up Row ─────────────────────────────────────────────────────────────

function FollowUpRow({ fu, contactName, showContact = false, onToggle, onDelete }: {
  fu: BizFollowUp; contactName?: string; showContact?: boolean;
  onToggle: () => void; onDelete: () => void;
}) {
  const status = followUpStatus(fu.dueDate);
  const statusStyle = fu.done
    ? 'text-slate-400 line-through'
    : status === 'overdue' ? 'text-red-600 dark:text-red-400 font-semibold'
    : status === 'today'   ? 'text-amber-600 dark:text-amber-400 font-semibold'
    : 'text-slate-700 dark:text-slate-200';
  const dateBadge = fu.done
    ? 'text-slate-400'
    : status === 'overdue' ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
    : status === 'today'   ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
    : 'text-slate-500 bg-slate-100 dark:bg-slate-800';

  return (
    <div className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 group ${fu.done ? 'opacity-50' : ''}`}>
      <button onClick={onToggle} className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-500 transition-colors">
        {fu.done ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${statusStyle} truncate`}>{fu.task}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${dateBadge}`}>
            {status === 'overdue' && !fu.done ? '⚠ ' : ''}{fmtBizDate(fu.dueDate)}
            {status === 'overdue' && !fu.done ? ' · OVERDUE' : status === 'today' && !fu.done ? ' · Today' : ''}
          </span>
          {showContact && contactName && <span className="text-[10px] text-slate-400 truncate">{contactName}</span>}
        </div>
      </div>
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all shrink-0">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── Log Interaction Bar ───────────────────────────────────────────────────────

function BizLogBar({ contactId, onLogged }: { contactId: string; onLogged?: () => void }) {
  const [type,  setType]  = useState<BizInterType>('call');
  const [date,  setDate]  = useState(TODAY);
  const [notes, setNotes] = useState('');
  const [open,  setOpen]  = useState(false);

  const handleLog = () => {
    if (!date) return;
    addBizInteraction({ contactId, type, date, notes: notes.trim() });
    setNotes(''); setDate(TODAY); setOpen(false); onLogged?.();
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 transition-colors">
      <Plus size={13} /> Log Interaction
    </button>
  );

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 space-y-2">
      <div className="flex gap-2 flex-wrap">
        {BIZ_INTER_TYPES.map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${type === t ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-blue-400'}`}>
            {INTER_ICONS[t]} {INTER_LABELS[t]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} max={TODAY}
          className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="What happened?"
          className="flex-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-xs rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
        <button onClick={handleLog} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">Log</button>
      </div>
    </div>
  );
}

// ── Pipeline Card ─────────────────────────────────────────────────────────────

function PipelineCard({ contact, onOpen }: { contact: BizContact; onOpen: () => void }) {
  const health   = getBizHealthStatus(contact);
  const days     = getBizDaysSince(contact.id);
  const nextFu   = getNextFollowUp(contact.id);
  const lastInter = getBizLastInteraction(contact.id);
  const fuStatus  = nextFu ? followUpStatus(nextFu.dueDate) : null;

  return (
    <button onClick={onOpen}
      className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group">
      <div className="flex items-start gap-2.5">
        <div className="relative shrink-0">
          <Initials name={contact.name} size="sm" />
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${HEALTH_DOT[health]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{contact.name}</p>
          {contact.company && <p className="text-[10px] text-slate-400 truncate">{contact.company}</p>}
          {contact.role    && <p className="text-[10px] text-slate-400 truncate">{contact.role}</p>}
        </div>
        <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-400 shrink-0 mt-0.5" />
      </div>

      <div className="mt-2 space-y-1">
        {/* Last contact */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Clock size={10} />
          {fmtDaysAgo(days)}
          {lastInter && <span className="ml-1">{INTER_ICONS[lastInter.type]}</span>}
        </div>
        {/* Next follow-up */}
        {nextFu && (
          <div className={`flex items-center gap-1 text-[10px] font-semibold ${fuStatus === 'overdue' ? 'text-red-500' : fuStatus === 'today' ? 'text-amber-500' : 'text-slate-400'}`}>
            <AlertCircle size={10} />
            {fuStatus === 'overdue' ? 'Overdue: ' : fuStatus === 'today' ? 'Today: ' : `${fmtBizDate(nextFu.dueDate)}: `}
            <span className="truncate font-normal">{nextFu.task}</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ── Contact Detail ────────────────────────────────────────────────────────────

function BizContactDetail({ contactId, onBack, onUpdate }: { contactId: string; onBack: () => void; onUpdate: () => void }) {
  const [contact,      setContact]      = useState<BizContact | null>(null);
  const [interactions, setInteractions] = useState<BizInteraction[]>([]);
  const [followUps,    setFollowUps]    = useState<BizFollowUp[]>([]);
  const [editing,      setEditing]      = useState(false);
  const [confirmDel,   setConfirmDel]   = useState(false);
  const [fuTask,       setFuTask]       = useState('');
  const [fuDate,       setFuDate]       = useState(TODAY);

  const reload = () => {
    const c = getBizContacts().find(c => c.id === contactId);
    if (!c) { onBack(); return; }
    setContact(c);
    setInteractions(getBizInteractions(contactId).sort((a, b) => b.date.localeCompare(a.date)));
    setFollowUps(getFollowUps(contactId).sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate);
    }));
  };

  useEffect(() => {
    reload();
    const h = () => reload();
    window.addEventListener('biz-crm-store-updated', h);
    return () => window.removeEventListener('biz-crm-store-updated', h);
  }, [contactId]);

  if (!contact) return null;

  const health = getBizHealthStatus(contact);
  const days   = getBizDaysSince(contact.id);

  const handleAddFu = () => {
    if (!fuTask.trim() || !fuDate) return;
    addFollowUp({ contactId, task: fuTask.trim(), dueDate: fuDate });
    setFuTask(''); setFuDate(TODAY);
  };

  if (editing) return (
    <div className="space-y-4 px-4 pb-4">
      <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"><ArrowLeft size={15} /> Back to Profile</button>
      <BizContactForm initial={contact} onSave={d => { updateBizContact(contact.id, d); setEditing(false); }} onCancel={() => setEditing(false)} />
    </div>
  );

  const inp = 'text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <div className="space-y-4 px-4 pb-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={15} /> Back to Pipeline
      </button>

      {/* Profile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <Initials name={contact.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{contact.name}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${REL_BADGE[contact.relationship]}`}>{REL_LABELS[contact.relationship]}</span>
            </div>
            {contact.role    && <p className="text-sm text-slate-500 mt-0.5">{contact.role}</p>}
            {contact.company && <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1"><Briefcase size={13} className="text-slate-400" />{contact.company}</p>}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
              {contact.phone && <span className="flex items-center gap-1"><Phone size={12} />{contact.phone}</span>}
              {contact.email && <span className="flex items-center gap-1"><Mail size={12} />{contact.email}</span>}
              <span className="flex items-center gap-1"><Clock size={12} />{fmtDaysAgo(days)}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Edit</button>
            {confirmDel ? (
              <div className="flex gap-1">
                <button onClick={() => { deleteBizContact(contact.id); onUpdate(); onBack(); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white">Confirm</button>
                <button onClick={() => setConfirmDel(false)} className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500"><X size={12} /></button>
              </div>
            ) : (
              <button onClick={() => setConfirmDel(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15} /></button>
            )}
          </div>
        </div>

        {/* Deal Stage Pills */}
        <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Deal Stage</p>
          <div className="flex flex-wrap gap-1.5">
            {DEAL_STAGES.map(s => {
              const sc = STAGE_COLORS[s];
              const isActive = contact.dealStage === s;
              return (
                <button key={s} onClick={() => updateBizContact(contact.id, { dealStage: s })}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${isActive ? `${sc.bg} ${sc.text} ${sc.border} ring-2 ring-offset-1 ring-current` : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}>
                  {STAGE_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Notes</p>
          <textarea defaultValue={contact.notes} onBlur={e => updateBizContact(contact.id, { notes: e.target.value })} rows={2}
            placeholder="Deal context, key decision makers, pricing discussed..."
            className="w-full text-sm text-slate-700 dark:text-slate-200 bg-transparent resize-none focus:outline-none placeholder-slate-300 dark:placeholder-slate-600" />
        </div>
      </div>

      {/* Follow-up Tasks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Follow-up Tasks</p>
        </div>
        {/* Add task */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <input value={fuTask} onChange={e => setFuTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddFu()}
            placeholder="e.g. Call about contract revision..." className={`flex-1 ${inp} py-1.5`} />
          <input type="date" value={fuDate} onChange={e => setFuDate(e.target.value)} className={`${inp} py-1.5`} />
          <button onClick={handleAddFu} disabled={!fuTask.trim()} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors shrink-0">Add</button>
        </div>
        {followUps.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 text-sm">No follow-ups yet. Add one above.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {followUps.map(fu => (
              <FollowUpRow key={fu.id} fu={fu} onToggle={() => { toggleFollowUp(fu.id); reload(); }} onDelete={() => { deleteFollowUp(fu.id); reload(); }} />
            ))}
          </div>
        )}
      </div>

      {/* Interaction History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Interaction History</p>
          <span className="text-xs text-slate-400">{interactions.length} logged</span>
        </div>
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <BizLogBar contactId={contact.id} onLogged={reload} />
        </div>
        {interactions.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 text-sm">No interactions logged yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {interactions.map(i => (
              <div key={i.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 group">
                <span className="text-base mt-0.5 shrink-0">{INTER_ICONS[i.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{INTER_LABELS[i.type]}</span>
                    <span className="text-xs text-slate-400">{fmtBizDate(i.date)}</span>
                  </div>
                  {i.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{i.notes}</p>}
                </div>
                <button onClick={() => { deleteBizInteraction(i.id); reload(); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all shrink-0"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

function BizCRMPipelineInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const activeId     = searchParams.get('contact');

  const openContact = (id: string) => router.push(`/tools/business-crm/biz-crm-pipeline?contact=${id}`);
  const goBack      = () => router.push('/tools/business-crm/biz-crm-pipeline');

  const [mounted,   setMounted]   = useState(false);
  const [contacts,  setContacts]  = useState<BizContact[]>([]);
  const [followUps, setFollowUps] = useState<BizFollowUp[]>([]);
  const [showForm,  setShowForm]  = useState(false);
  const [search,    setSearch]    = useState('');

  const reload = () => {
    setContacts(getBizContacts());
    setFollowUps(getFollowUps());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    const h = () => reload();
    window.addEventListener('biz-crm-store-updated', h);
    return () => window.removeEventListener('biz-crm-store-updated', h);
  }, []);

  const overdueCount = useMemo(() => getOverdueFollowUps().length, [followUps]);
  const todayCount   = useMemo(() => getTodayFollowUps().length,   [followUps]);

  const todayAndOverdue = useMemo(() => {
    const overdue = getOverdueFollowUps().sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const today   = getTodayFollowUps().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return [...overdue, ...today];
  }, [followUps]);

  const contactMap = useMemo(() => {
    const m: Record<string, BizContact> = {};
    contacts.forEach(c => { m[c.id] = c; });
    return m;
  }, [contacts]);

  const byStage = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = q
      ? contacts.filter(c => c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q))
      : contacts;
    const m: Record<DealStage, BizContact[]> = { lead: [], prospect: [], proposal: [], negotiation: [], won: [], lost: [], on_hold: [] };
    filtered.forEach(c => m[c.dealStage].push(c));
    return m;
  }, [contacts, search]);

  if (!mounted) return null;

  // ── Detail view ─────────────────────────────────────────────────────────────
  if (activeId) {
    return (
      <div className="space-y-4">
        <SAPHeader fullWidth title="Business CRM" subtitle="Deal Pipeline" />
        <BizContactDetail contactId={activeId} onBack={goBack} onUpdate={reload} />
      </div>
    );
  }

  // ── Pipeline board ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Business CRM"
        subtitle="Deal pipeline & follow-up tracker"
        kpis={contacts.length > 0 ? [
          { label: 'Total Contacts',   value: contacts.length,                                   color: 'neutral' },
          { label: 'Follow-ups Today', value: todayCount,   color: todayCount > 0   ? 'warning' : 'neutral' },
          { label: 'Overdue',          value: overdueCount, color: overdueCount > 0 ? 'error'   : 'success' },
          { label: 'Active Pipeline',  value: (byStage.lead.length + byStage.prospect.length + byStage.proposal.length + byStage.negotiation.length), color: 'primary' },
        ] : undefined}
      />

      <div className="space-y-4 px-4 pb-4">

        {/* Search + Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={13} /></button>}
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0">
            <Plus size={15} /> Add Contact
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <BizContactForm onSave={d => { addBizContact(d); setShowForm(false); }} onCancel={() => setShowForm(false)} />
        )}

        {/* Today's follow-ups + overdue */}
        {todayAndOverdue.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 flex items-center justify-between">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                ⚡ Needs Action Today
              </p>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{todayAndOverdue.length}</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {todayAndOverdue.map(fu => (
                <FollowUpRow
                  key={fu.id} fu={fu}
                  contactName={contactMap[fu.contactId]?.name}
                  showContact
                  onToggle={() => { toggleFollowUp(fu.id); reload(); }}
                  onDelete={() => { deleteFollowUp(fu.id); reload(); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {contacts.length === 0 && !showForm && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-16 text-center">
            <Briefcase size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No contacts yet.</p>
            <p className="text-xs text-slate-400 mt-1">Add your leads, clients, and partners to start tracking deals.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">Add first contact</button>
          </div>
        )}

        {/* Pipeline Board */}
        {contacts.length > 0 && (
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max">
              {DEAL_STAGES.map(stage => {
                const sc    = STAGE_COLORS[stage];
                const cards = byStage[stage];
                return (
                  <div key={stage} className={`w-56 rounded-2xl border ${sc.border} flex flex-col overflow-hidden`} style={{ minHeight: 200 }}>
                    {/* Column header */}
                    <div className={`${sc.header} px-3 py-2.5 flex items-center justify-between shrink-0`}>
                      <span className={`text-xs font-bold uppercase tracking-wide ${sc.text}`}>{STAGE_LABELS[stage]}</span>
                      <span className={`text-xs font-black ${sc.text} opacity-70`}>{cards.length}</span>
                    </div>
                    {/* Cards */}
                    <div className={`flex-1 ${sc.bg} p-2 space-y-2 overflow-y-auto max-h-96`}>
                      {cards.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-4">Empty</p>
                      ) : (
                        cards.map(c => <PipelineCard key={c.id} contact={c} onOpen={() => openContact(c.id)} />)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Health legend */}
        {contacts.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Active</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Due soon</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Overdue</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> New</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function BizCRMPipeline() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-400 text-center">Loading...</div>}>
      <BizCRMPipelineInner />
    </Suspense>
  );
}
