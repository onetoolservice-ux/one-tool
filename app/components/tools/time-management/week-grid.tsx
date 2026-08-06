"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Check, X, Clock,
  Moon, Sunrise, Sunset, Dumbbell, UtensilsCrossed,
  Briefcase, BookOpen, RotateCcw, ChevronRight, ChevronLeft,
  Sparkles, CalendarCheck, BarChart2, Timer,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = 'morning' | 'exercise' | 'meal' | 'work' | 'personal' | 'evening' | 'sleep';

interface Activity {
  id: string;
  time: string;
  title: string;
  duration: number;
  category: Category;
  emoji: string;
}

interface Store {
  routine: Activity[];
  logs: Record<string, string[]>;
}

// ── Config ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'otsd-daily-routine';

// Muted, professional palette — no loud backgrounds on cards
const CAT: Record<Category, {
  label: string;
  textColor: string;       // for chip / category label
  chipBg: string;          // very subtle chip bg
  dot: string;             // timeline dot
  bar: string;             // timeline bar fill
  Icon: React.ElementType;
}> = {
  morning:  { label: 'Morning',  textColor: 'text-amber-600  dark:text-amber-400',  chipBg: 'bg-amber-50  dark:bg-amber-500/10',  dot: 'bg-amber-400',  bar: 'bg-amber-300  dark:bg-amber-500',  Icon: Sunrise },
  exercise: { label: 'Exercise', textColor: 'text-emerald-600 dark:text-emerald-400', chipBg: 'bg-emerald-50 dark:bg-emerald-500/10', dot: 'bg-emerald-400', bar: 'bg-emerald-300 dark:bg-emerald-500', Icon: Dumbbell },
  meal:     { label: 'Meal',     textColor: 'text-orange-600 dark:text-orange-400', chipBg: 'bg-orange-50 dark:bg-orange-500/10', dot: 'bg-orange-400', bar: 'bg-orange-300 dark:bg-orange-500', Icon: UtensilsCrossed },
  work:     { label: 'Work',     textColor: 'text-blue-600   dark:text-blue-400',   chipBg: 'bg-blue-50   dark:bg-blue-500/10',   dot: 'bg-blue-400',   bar: 'bg-blue-300   dark:bg-blue-500',   Icon: Briefcase },
  personal: { label: 'Personal', textColor: 'text-violet-600 dark:text-violet-400', chipBg: 'bg-violet-50 dark:bg-violet-500/10', dot: 'bg-violet-400', bar: 'bg-violet-300 dark:bg-violet-500', Icon: BookOpen },
  evening:  { label: 'Evening',  textColor: 'text-indigo-600 dark:text-indigo-400', chipBg: 'bg-indigo-50 dark:bg-indigo-500/10', dot: 'bg-indigo-400', bar: 'bg-indigo-300 dark:bg-indigo-500', Icon: Sunset },
  sleep:    { label: 'Sleep',    textColor: 'text-slate-500  dark:text-slate-400',  chipBg: 'bg-slate-100 dark:bg-slate-500/10',  dot: 'bg-slate-400',  bar: 'bg-slate-300  dark:bg-slate-600',  Icon: Moon },
};

const QUICK_EMOJIS = ['☀️','🧘','🏃','🚿','☕','🥗','🥞','💼','📚','💻','🎯','🏋️','🚶','🧹','🛁','📖','🎵','🌙','😴','🍽️','🥤','🍎','🧘‍♂️','✍️','🎨','📞','🌇','🎮','🛒','🧠'];

const DEFAULT_ROUTINE: Activity[] = [
  { id: 'r1',  time: '06:00', title: 'Wake Up',          duration: 10,  category: 'morning',  emoji: '☀️' },
  { id: 'r2',  time: '06:10', title: 'Morning Workout',  duration: 45,  category: 'exercise', emoji: '🏃' },
  { id: 'r3',  time: '07:00', title: 'Shower & Freshen', duration: 20,  category: 'morning',  emoji: '🚿' },
  { id: 'r4',  time: '07:30', title: 'Breakfast',        duration: 30,  category: 'meal',     emoji: '☕' },
  { id: 'r5',  time: '08:30', title: 'Deep Work Block',  duration: 120, category: 'work',     emoji: '💻' },
  { id: 'r6',  time: '10:30', title: 'Short Break',      duration: 15,  category: 'personal', emoji: '🚶' },
  { id: 'r7',  time: '10:45', title: 'Work / Meetings',  duration: 75,  category: 'work',     emoji: '📞' },
  { id: 'r8',  time: '13:00', title: 'Lunch',            duration: 45,  category: 'meal',     emoji: '🍽️' },
  { id: 'r9',  time: '14:00', title: 'Work Block 2',     duration: 120, category: 'work',     emoji: '💼' },
  { id: 'r10', time: '16:30', title: 'Evening Walk',     duration: 30,  category: 'exercise', emoji: '🌇' },
  { id: 'r11', time: '17:00', title: 'Learning / Read',  duration: 60,  category: 'personal', emoji: '📚' },
  { id: 'r12', time: '19:00', title: 'Dinner',           duration: 45,  category: 'meal',     emoji: '🥗' },
  { id: 'r13', time: '20:00', title: 'Relax / Family',   duration: 90,  category: 'evening',  emoji: '🎵' },
  { id: 'r14', time: '22:00', title: 'Wind Down',        duration: 30,  category: 'evening',  emoji: '📖' },
  { id: 'r15', time: '22:30', title: 'Sleep',            duration: 450, category: 'sleep',    emoji: '😴' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().split('T')[0]; }

function toMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${p}`;
}

function fmtDuration(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function endTimeStr(start: string, dur: number) {
  const total = toMin(start) + dur;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function sortByTime(arr: Activity[]): Activity[] {
  return [...arr].sort((a, b) => a.time.localeCompare(b.time));
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { routine: DEFAULT_ROUTINE, logs: {} };
  } catch { return { routine: DEFAULT_ROUTINE, logs: {} }; }
}
function persist(s: Store) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}
function genId() { return Math.random().toString(36).slice(2, 10); }

const BLANK: Omit<Activity, 'id'> = { time: '08:00', title: '', duration: 30, category: 'work', emoji: '📌' };
const ONBOARDING_KEY = 'otsd-daily-routine-onboarded';

// ── Onboarding walkthrough ────────────────────────────────────────────────────

const SLIDES = [
  {
    icon: <Clock className="w-8 h-8 text-slate-700 dark:text-slate-200" />,
    tag: 'The Problem',
    headline: 'You plan a great day.\nThen life happens.',
    body: "You meant to wake up at 6, hit the gym, deep-work by 9. But without a clear structure visible in front of you — the day slips. By evening you wonder where it went.",
    visual: (
      <div className="flex flex-col gap-1.5 w-full max-w-xs mx-auto">
        {[
          { time: '06:00', label: 'Wake up early', done: false, fade: true },
          { time: '07:00', label: 'Morning workout', done: false, fade: true },
          { time: '09:00', label: 'Deep work block', done: false, fade: true },
          { time: '13:00', label: 'Lunch', done: false, fade: true },
        ].map((r, i) => (
          <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${r.fade ? 'opacity-40' : ''}`}>
            <span className="text-xs font-mono text-slate-400 w-10 flex-shrink-0">{r.time}</span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex-1">{r.label}</span>
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
          </div>
        ))}
        <p className="text-center text-[11px] text-slate-400 mt-1 italic">Planned. Never tracked. Forgotten.</p>
      </div>
    ),
  },
  {
    icon: <CalendarCheck className="w-8 h-8 text-slate-700 dark:text-slate-200" />,
    tag: 'The Solution',
    headline: 'Design your ideal day.\nLive it every day.',
    body: "Daily Routine lets you map every hour — from wake-up to sleep — into a personal timetable. One tap to check off each activity. Watch your day unfold exactly as you planned it.",
    visual: (
      <div className="flex flex-col gap-1.5 w-full max-w-xs mx-auto">
        {[
          { time: '06:00', label: 'Wake Up',         emoji: '☀️', done: true  },
          { time: '06:10', label: 'Morning Workout',  emoji: '🏃', done: true  },
          { time: '08:30', label: 'Deep Work Block',  emoji: '💻', done: true  },
          { time: '13:00', label: 'Lunch',            emoji: '🍽️', done: false, now: true },
        ].map((r, i) => (
          <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
            r.now
              ? 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-500 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          }`}>
            <span className="text-xs font-mono text-slate-400 w-10 flex-shrink-0">{r.time}</span>
            <span className="text-lg leading-none flex-shrink-0">{r.emoji}</span>
            <span className={`text-xs font-medium flex-1 ${r.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{r.label}</span>
            {r.now && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900">NOW</span>}
            {r.done && (
              <div className="w-4 h-4 rounded-full bg-slate-700 dark:bg-slate-300 flex items-center justify-center flex-shrink-0">
                <Check size={9} strokeWidth={3} className="text-white dark:text-slate-900" />
              </div>
            )}
          </div>
        ))}
        <div className="mt-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-slate-700 dark:bg-slate-300" />
        </div>
        <p className="text-center text-[11px] text-slate-400">75% done · 1 activity active</p>
      </div>
    ),
  },
  {
    icon: <BarChart2 className="w-8 h-8 text-slate-700 dark:text-slate-200" />,
    tag: 'See Your Day',
    headline: 'Your whole day,\nat a glance.',
    body: "A visual timeline spans your full day — every activity as a color block. A live indicator shows exactly where you are right now. No calendar app. No subscriptions. Just clarity.",
    visual: (
      <div className="w-full max-w-xs mx-auto space-y-3">
        {/* Mini timeline */}
        <div>
          <div className="flex justify-between text-[9px] text-slate-400 mb-1 px-0.5">
            <span>6a</span><span>9a</span><span>12p</span><span>3p</span><span>6p</span><span>10p</span>
          </div>
          <div className="relative h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="absolute h-full bg-amber-300  dark:bg-amber-500  opacity-80" style={{ left: '0%',   width: '6%'  }} />
            <div className="absolute h-full bg-emerald-300 dark:bg-emerald-500 opacity-80" style={{ left: '2%',   width: '11%' }} />
            <div className="absolute h-full bg-orange-300 dark:bg-orange-500  opacity-80" style={{ left: '16%',  width: '7%'  }} />
            <div className="absolute h-full bg-blue-300   dark:bg-blue-500    opacity-80" style={{ left: '25%',  width: '20%' }} />
            <div className="absolute h-full bg-blue-300   dark:bg-blue-500    opacity-80" style={{ left: '48%',  width: '20%' }} />
            <div className="absolute h-full bg-orange-300 dark:bg-orange-500  opacity-80" style={{ left: '69%',  width: '7%'  }} />
            <div className="absolute h-full bg-indigo-300 dark:bg-indigo-500  opacity-80" style={{ left: '78%',  width: '13%' }} />
            <div className="absolute h-full bg-slate-300  dark:bg-slate-600   opacity-80" style={{ left: '91%',  width: '9%'  }} />
            {/* Now line */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-slate-900 z-10" style={{ left: '55%' }} />
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { dot: 'bg-amber-400',  label: 'Morning'  },
            { dot: 'bg-emerald-400',label: 'Exercise' },
            { dot: 'bg-orange-400', label: 'Meal'     },
            { dot: 'bg-blue-400',   label: 'Work'     },
            { dot: 'bg-indigo-400', label: 'Evening'  },
            { dot: 'bg-slate-400',  label: 'Sleep'    },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              <span className={`w-2 h-2 rounded-full ${l.dot}`} />{l.label}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: <Timer className="w-8 h-8 text-slate-700 dark:text-slate-200" />,
    tag: 'Get Started',
    headline: 'Ready in 60 seconds.\nNo signup. Ever.',
    body: "A default routine is already loaded — wake up to sleep. Customise it to fit your life. All data stays in your browser. Private by design.",
    visual: (
      <div className="w-full max-w-xs mx-auto space-y-2.5">
        {[
          { num: '1', text: 'Click Edit → pencil to change any activity, or Add to create your own' },
          { num: '2', text: 'Set the time, duration, pick a category and emoji' },
          { num: '3', text: 'Each day, tick off activities as you go — watch your progress bar fill up' },
        ].map(s => (
          <div key={s.num} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
              {s.num}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.text}</p>
          </div>
        ))}
        <p className="text-center text-[11px] text-slate-400 pt-1">
          💾 Saved in your browser · No account needed · 100% free
        </p>
      </div>
    ),
  },
];

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const total = SLIDES.length;
  const slide = SLIDES[step];
  const isLast = step === total - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0 flex-shrink-0">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${
                  i === step
                    ? 'w-5 h-1.5 bg-slate-800 dark:bg-slate-200'
                    : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Tag + headline */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                {slide.icon}
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {slide.tag}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight whitespace-pre-line">
              {slide.headline}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {slide.body}
            </p>
          </div>

          {/* Visual */}
          <div className="py-1">
            {slide.visual}
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={13} /> Back
            </button>
          )}
          <button
            onClick={isLast ? onClose : () => setStep(s => s + 1)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-700 dark:hover:bg-white transition-colors"
          >
            {isLast ? (
              <><Sparkles size={14} /> Start building my routine</>
            ) : (
              <>Next <ChevronRight size={13} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  form: Omit<Activity, 'id'>;
  editId: string | null;
  onChange: (f: Omit<Activity, 'id'>) => void;
  onSave: () => void;
  onClose: () => void;
}

function ActivityModal({ form, editId, onChange, onSave, onClose }: ModalProps) {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" />

      {/* Modal box */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {editId ? 'Edit Activity' : 'Add Activity'}
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {editId ? 'Update this slot in your routine' : 'Add a new slot to your daily routine'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">

          {/* Emoji + Title */}
          <div className="flex gap-3 items-start">
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowEmoji(p => !p)}
                className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              >
                {form.emoji}
              </button>
              {showEmoji && (
                <div className="absolute top-12 left-0 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 w-56">
                  <div className="flex flex-wrap gap-2">
                    {QUICK_EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => { onChange({ ...form, emoji: e }); setShowEmoji(false); }}
                        className="text-lg hover:scale-125 transition-transform"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Activity Name</label>
              <input
                type="text"
                placeholder="e.g. Morning Yoga"
                value={form.title}
                onChange={e => onChange({ ...form, title: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && onSave()}
                autoFocus
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 focus:border-slate-400"
              />
            </div>
          </div>

          {/* Time + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Start Time</label>
              <input
                type="time"
                value={form.time}
                onChange={e => onChange({ ...form, time: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Duration</label>
              <select
                value={form.duration}
                onChange={e => onChange({ ...form, duration: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              >
                {[5,10,15,20,30,45,60,90,120,150,180,240,300,360,420,480].map(m => (
                  <option key={m} value={m}>{fmtDuration(m)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* End time hint */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-1">
            Ends at <span className="font-semibold text-slate-600 dark:text-slate-300">{fmtTime(endTimeStr(form.time, form.duration))}</span>
          </p>

          {/* Category */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CAT) as Category[]).map(cat => {
                const c = CAT[cat];
                const active = form.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => onChange({ ...form, category: cat })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? `${c.chipBg} ${c.textColor} border-current`
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <c.Icon size={11} /> {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!form.title.trim()}
            className="flex-1 h-10 rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-700 dark:hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {editId ? 'Save Changes' : 'Add Activity'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function WeekGrid() {
  const [store, setStore]           = useState<Store>({ routine: DEFAULT_ROUTINE, logs: {} });
  const [editing, setEditing]       = useState(false);
  const [form, setForm]             = useState<Omit<Activity, 'id'> | null>(null);
  const [editId, setEditId]         = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setStore(load());
    // Show onboarding only on first visit
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) setShowOnboarding(true);
  }, []);

  function closeOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShowOnboarding(false);
  }

  const today      = todayStr();
  const doneIds    = store.logs[today] ?? [];
  const sorted     = sortByTime(store.routine);
  const doneCount  = sorted.filter(a => doneIds.includes(a.id)).length;
  const total      = sorted.length;
  const progress   = total ? Math.round((doneCount / total) * 100) : 0;

  const nowMin     = new Date().getHours() * 60 + new Date().getMinutes();
  const currentAct = sorted.find(a => { const s = toMin(a.time); return nowMin >= s && nowMin < s + a.duration; });
  const nextAct    = !currentAct ? sorted.find(a => toMin(a.time) > nowMin) : undefined;

  const hour       = new Date().getHours();
  const greeting   = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Timeline geometry
  const tlStart  = sorted.length ? toMin(sorted[0].time) : 360;
  const tlEnd    = sorted.length ? Math.max(...sorted.map(a => toMin(a.time) + a.duration)) : tlStart + 960;
  const tlSpan   = tlEnd - tlStart || 1;

  function pct(min: number, dur: number) {
    return { left: `${((min - tlStart) / tlSpan) * 100}%`, width: `${(dur / tlSpan) * 100}%` };
  }

  const ticks: number[] = [];
  for (let m = Math.ceil(tlStart / 120) * 120; m <= tlEnd; m += 120) ticks.push(m);

  // Mutations
  function upd(next: Store) { setStore(next); persist(next); }

  function toggle(id: string) {
    const cur = store.logs[today] ?? [];
    upd({ ...store, logs: { ...store.logs, [today]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] } });
  }

  function resetToday() { upd({ ...store, logs: { ...store.logs, [today]: [] } }); }

  function openAdd() {
    setEditId(null);
    setForm({ ...BLANK });
  }

  function openEdit(a: Activity) {
    setEditId(a.id);
    setForm({ time: a.time, title: a.title, duration: a.duration, category: a.category, emoji: a.emoji });
  }

  function closeModal() { setForm(null); setEditId(null); }

  function saveForm() {
    if (!form?.title.trim()) return;
    const t = { ...form, title: form.title.trim() };
    upd(editId
      ? { ...store, routine: store.routine.map(a => a.id === editId ? { ...t, id: editId } : a) }
      : { ...store, routine: [...store.routine, { ...t, id: genId() }] }
    );
    closeModal();
  }

  function del(id: string) { upd({ ...store, routine: store.routine.filter(a => a.id !== id) }); }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#0f1117] flex flex-col">

      {/* Onboarding walkthrough */}
      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}

      {/* Activity add/edit modal */}
      {form && (
        <ActivityModal
          form={form}
          editId={editId}
          onChange={setForm}
          onSave={saveForm}
          onClose={closeModal}
        />
      )}

      {/* ── Header ── */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="w-full px-5 py-3.5">

          {/* Row 1 */}
          <div className="flex items-center gap-4">
            {/* Title */}
            <div className="min-w-0 mr-1">
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Daily Routine</h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                &nbsp;·&nbsp;{greeting}
              </p>
            </div>

            <div className="w-px h-7 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

            {/* KPIs */}
            <div className="flex items-center gap-5">
              <div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Done</p>
                <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">
                  {doneCount}<span className="text-slate-400 dark:text-slate-500 font-normal text-xs">/{total}</span>
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Progress</p>
                <p className={`text-sm font-black leading-none ${progress >= 70 ? 'text-emerald-600 dark:text-emerald-400' : progress >= 40 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {progress}%
                </p>
              </div>
              {(currentAct || nextAct) && (
                <>
                  <div className="w-px h-7 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                  <div className="min-w-0 hidden sm:block">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                      {currentAct ? 'Now' : 'Up Next'}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                      {(currentAct ?? nextAct)!.emoji}&nbsp;{(currentAct ?? nextAct)!.title}
                      {!currentAct && nextAct && (
                        <span className="text-slate-400 font-normal"> · {fmtTime(nextAct.time)}</span>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Actions — top right */}
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <button
                onClick={() => setShowOnboarding(true)}
                title="How it works"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-black border border-slate-200 dark:border-slate-700"
              >
                ?
              </button>
              {doneCount > 0 && (
                <button
                  onClick={resetToday}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
              <button
                onClick={() => { setEditing(e => !e); closeModal(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  editing
                    ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100'
                    : 'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {editing ? <><X size={11} /> Done</> : <><Pencil size={11} /> Edit</>}
              </button>
              {editing && (
                <button
                  onClick={openAdd}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white transition-colors"
                >
                  <Plus size={11} /> Add
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-700 dark:bg-slate-300 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">{doneCount}/{total}</span>
          </div>
        </div>

        {/* Horizontal visual timeline */}
        {sorted.length > 0 && (
          <div className="w-full px-5 pb-3">
            <div className="relative h-4 mb-1">
              {ticks.map(m => {
                const left = ((m - tlStart) / tlSpan) * 100;
                if (left < 0 || left > 100) return null;
                const h = Math.floor(m / 60), min = m % 60;
                const label = `${h % 12 || 12}${min ? `:${String(min).padStart(2, '0')}` : ''}${h >= 12 ? 'p' : 'a'}`;
                return (
                  <span
                    key={m}
                    className="absolute text-[9px] text-slate-400 dark:text-slate-600 -translate-x-1/2"
                    style={{ left: `${left}%` }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
            <div className="relative w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              {sorted.map(act => {
                const { left, width } = pct(toMin(act.time), act.duration);
                const c = CAT[act.category];
                const done = doneIds.includes(act.id);
                return (
                  <div
                    key={act.id}
                    title={`${act.emoji} ${act.title} · ${fmtTime(act.time)} (${fmtDuration(act.duration)})`}
                    className={`absolute h-full ${c.bar} transition-opacity ${done ? 'opacity-25' : 'opacity-80'}`}
                    style={{ left, width }}
                  />
                );
              })}
              {/* Now indicator */}
              {nowMin >= tlStart && nowMin <= tlEnd && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-slate-900 z-10"
                  style={{ left: `${((nowMin - tlStart) / tlSpan) * 100}%` }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Cards grid ── */}
      <div className="w-full flex-1 p-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-600">
            <Clock size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">No activities yet</p>
            <p className="text-xs mt-1">Click Edit → Add to build your day</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
            {sorted.map(act => {
              const c = CAT[act.category];
              const done = doneIds.includes(act.id);
              const isCur = currentAct?.id === act.id;

              return (
                <div
                  key={act.id}
                  className={`relative flex flex-col rounded-2xl border transition-all bg-white dark:bg-slate-900 ${
                    isCur
                      ? 'border-slate-400 dark:border-slate-500 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
                  } ${done ? 'opacity-50' : ''}`}
                >
                  {/* Top accent line — subtle */}
                  <div className={`h-0.5 rounded-t-2xl ${c.dot} opacity-70`} />

                  <div className="flex flex-col flex-1 p-3 gap-2.5">
                    {/* Emoji + NOW badge */}
                    <div className="flex items-start justify-between">
                      <span className="text-2xl leading-none">{act.emoji}</span>
                      {isCur && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 leading-tight tracking-wide">
                          NOW
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p className={`text-xs font-semibold leading-snug line-clamp-2 flex-1 ${
                      done
                        ? 'line-through text-slate-400 dark:text-slate-600'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {act.title}
                    </p>

                    {/* Time + duration */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{fmtTime(act.time)}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-600">{fmtDuration(act.duration)}</p>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${c.chipBg} ${c.textColor} truncate max-w-[65%]`}>
                        {c.label}
                      </span>

                      {editing ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(act)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            onClick={() => del(act.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggle(act.id)}
                          className={`w-6 h-6 flex items-center justify-center rounded-full border-2 flex-shrink-0 transition-all ${
                            done
                              ? 'bg-slate-700 dark:bg-slate-300 border-slate-700 dark:border-slate-300 text-white dark:text-slate-900'
                              : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-slate-500 hover:text-slate-500'
                          }`}
                        >
                          <Check size={11} strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add placeholder card */}
            {editing && (
              <button
                onClick={openAdd}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-all min-h-[140px] gap-2"
              >
                <Plus size={18} />
                <span className="text-xs font-semibold">Add</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WeekGrid;
