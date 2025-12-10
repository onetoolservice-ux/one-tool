'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Clock, Calendar, Target, Globe, 
  Search, Command 
} from 'lucide-react';
import ActionCenter from './action-center';
import FocusSection from './focus-section';
import { DailyView } from './views/daily-view';
import { WeeklyView } from './views/weekly-view';
import { MonthlyView } from './views/monthly-view';
import { MacroView } from './views/macro-view';

// --- TYPES ---
export interface Task {
  id: number;
  text: string;
  completed: boolean;
  type: 'priority' | 'chore';
  category: string;
  startTime?: string;
  endTime?: string;
  date: string; // YYYY-MM-DD
  parentWeeklyId?: number;
  recurrenceGroupId?: string;
  recurrenceEndDate?: string;
  subtasks?: { id: number; text: string; completed: boolean }[];
}

const LOCAL_STORAGE_KEY = 'lifeos_tasks_v2';
const CATEGORIES = ["Study/Learning", "Fitness", "Business", "Personal", "Health"];

// Helper to check time conflicts
const checkConflict = (tasks: Task[], date: string, start: string, end: string) => {
    if (!start || !end) return null; 
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const nS = toMin(start); const nE = toMin(end);

    return tasks.find(t => {
        if (t.date === date && t.startTime && t.endTime) {
            const eS = toMin(t.startTime); const eE = toMin(t.endTime);
            return (nS < eE) && (nE > eS);
        }
        return false;
    })?.text || null;
};

export function LifeOS() {
  const [activeView, setActiveView] = useState('daily');
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    else {
       const today = new Date().toISOString().split('T')[0];
       setTasks([{ id: 1, text: "Welcome to Life OS", completed: false, type: 'priority', category: "Personal", date: today }]);
    }
  }, []);

  useEffect(() => { if(mounted) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks)); }, [tasks, mounted]);

  // --- CRUD HANDLERS ---
  const addTask = (params: any) => {
      const { title, date, category, startTime, endTime, isRecurring, recurrenceEndDate, parentWeeklyId } = params;

      const conflict = checkConflict(tasks, date, startTime || '', endTime || '');
      if (conflict) return { success: false, conflict };

      const baseTask = {
        text: title,
        completed: false,
        type: 'priority' as const,
        category: category || "General",
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        parentWeeklyId: parentWeeklyId || undefined,
        recurrenceGroupId: isRecurring ? crypto.randomUUID() : undefined,
        recurrenceEndDate: recurrenceEndDate || undefined,
        subtasks: []
      };

      const newTasksToAdd: Task[] = [];
      newTasksToAdd.push({ ...baseTask, id: Date.now(), date: date } as Task);

      if (isRecurring && recurrenceEndDate) {
          const start = new Date(date);
          const end = new Date(recurrenceEndDate);
          let current = new Date(start);
          current.setDate(current.getDate() + 1);
          
          let safetyCounter = 0;
          while (current <= end && safetyCounter < 365) { 
             newTasksToAdd.push({ ...baseTask, id: Date.now() + safetyCounter + 1, date: current.toISOString().split('T')[0] } as Task);
             current.setDate(current.getDate() + 1);
             safetyCounter++;
          }
      }

      setTasks(prev => [...newTasksToAdd, ...prev]);
      return { success: true, count: newTasksToAdd.length };
  };

  const addSubtask = (tid: number, txt: string) => setTasks(p => p.map(t => t.id === tid ? { ...t, subtasks: [...(t.subtasks||[]), {id: Date.now(), text: txt, completed: false}] } : t));
  const toggleSubtask = (tid: number, sid: number) => setTasks(p => p.map(t => t.id === tid ? { ...t, subtasks: (t.subtasks||[]).map(s => s.id === sid ? {...s, completed: !s.completed} : s) } : t));
  const toggleTask = (id: number) => setTasks(p => p.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id: number) => setTasks(p => p.filter(t => t.id !== id));

  // --- FIX: ADAPTIVE THEME OBJECT ---
  // Instead of checking 'isDark', we pass strings that contain BOTH light and dark classes.
  // Tailwind automatically applies the right one based on the parent class.
  const theme = {
    bg: 'bg-gray-50 dark:bg-[#0F111A]',
    sidebarBg: 'bg-white dark:bg-[#0F111A]',
    text: 'text-gray-900 dark:text-white',
    textSec: 'text-gray-500 dark:text-gray-400',
    border: 'border-gray-200 dark:border-white/5',
    cardBg: 'bg-white dark:bg-[#1C1F2E]',
    inputBg: 'bg-gray-50 dark:bg-[#151725]',
    hover: 'hover:bg-gray-100 dark:hover:bg-white/5',
    isDark: true // Kept true to force dark-style logic in sub-components if they check boolean, but CSS handles visuals
  };

  const commonProps = { tasks, addTask, toggleTask, deleteTask, addSubtask, toggleSubtask, categories: CATEGORIES, theme };

  if (!mounted) return <div className="h-full w-full bg-gray-50 dark:bg-[#0F111A]" />;

  return (
    <div className={`h-[calc(100vh-4rem)] ${theme.bg} ${theme.text} font-sans overflow-hidden flex flex-col transition-colors duration-300`}>
      
      {/* --- TOP TABS --- */}
      <div className={`px-6 pt-6 pb-2 ${theme.bg} flex items-center gap-2 overflow-x-auto no-scrollbar border-b ${theme.border} flex-shrink-0`}>
         <TabItem label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<LayoutDashboard size={16} />} theme={theme} />
         <TabItem label="Daily Planner" active={activeView === 'daily'} onClick={() => setActiveView('daily')} icon={<Clock size={16} />} theme={theme} />
         <TabItem label="Weekly Review" active={activeView === 'weekly'} onClick={() => setActiveView('weekly')} icon={<Calendar size={16} />} theme={theme} />
         <TabItem label="Monthly Goals" active={activeView === 'monthly'} onClick={() => setActiveView('monthly')} icon={<Target size={16} />} theme={theme} />
         <TabItem label="Macro Vision" active={activeView === 'macro'} onClick={() => setActiveView('macro')} icon={<Globe size={16} />} theme={theme} />
      </div>

      {/* MAIN CONTENT */}
      <main className={`flex-1 overflow-hidden relative ${theme.bg} transition-colors duration-300`}>
         {activeView === 'dashboard' && (
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                <div className="w-full pt-10">
                    <ActionCenter onAddTask={(t:string) => addTask({title:t, date: new Date().toISOString().split('T')[0], category:"Personal"})} theme={theme} />
                </div>
                <div className="max-w-6xl mx-auto w-full px-8 pb-12 mt-8">
                    <FocusSection tasks={tasks.filter(t => t.date === new Date().toISOString().split('T')[0])} onToggle={toggleTask} onDelete={deleteTask} theme={theme} />
                </div>
            </div>
         )}
         {activeView === 'daily' && <DailyView {...commonProps} />}
         {activeView === 'weekly' && <WeeklyView {...commonProps} />}
         {activeView === 'monthly' && <MonthlyView {...commonProps} />}
         {activeView === 'macro' && <MacroView theme={theme} />}
      </main>
    </div>
  );
}

const TabItem = ({ icon, label, active = false, onClick, theme }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${active 
      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
      : `${theme.cardBg} ${theme.textSec} ${theme.border} hover:border-emerald-500/50 hover:text-emerald-500`}`}
  >
    {icon}
    {label}
  </button>
);
