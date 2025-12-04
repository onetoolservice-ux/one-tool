"use client";
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Circle, Trash2, Plus, 
  Calendar, CalendarDays, // Fixed Imports
  BarChart3, Layout, Target, Eye, MoreVertical, Clock, Zap, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

// --- TYPES ---
type PlannerType = 'daily' | 'weekly' | 'monthly' | 'vision';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  type: PlannerType;
  date: string; // ISO Date
}

export const LifeOS = () => {
  // STATE
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<PlannerType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [input, setInput] = useState("");
  const [focusMode, setFocusMode] = useState(false);

  // LOAD / SAVE
  useEffect(() => {
    const saved = localStorage.getItem('onetool-life-os-v2');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('onetool-life-os-v2', JSON.stringify(tasks));
  }, [tasks]);

  // ACTIONS
  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: input,
      status: 'todo',
      type: view,
      date: selectedDate.toISOString()
    };
    setTasks([newTask, ...tasks]);
    setInput("");
  };

  const toggleStatus = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // FILTERING
  const filteredTasks = tasks.filter(t => {
    if (view === 'daily') return isSameDay(new Date(t.date), selectedDate) && t.type === 'daily';
    return t.type === view;
  });

  // STATS
  const progress = filteredTasks.length > 0 
    ? Math.round((filteredTasks.filter(t => t.status === 'done').length / filteredTasks.length) * 100) 
    : 0;

  // --- COMPONENTS ---

  // 1. DATE STRIP (Calendar)
  const DateStrip = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

    return (
      <div className="flex justify-between items-center bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto no-scrollbar">
         {weekDays.map((date) => {
           const isSelected = isSameDay(date, selectedDate);
           return (
             <button 
               key={date.toString()}
               onClick={() => {setSelectedDate(date); setView('daily');}}
               className={`
                 flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-all min-w-[48px]
                 ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
               `}
             >
               <span className="text-[10px] font-bold uppercase">{format(date, 'EEE')}</span>
               <span className="text-lg font-black">{format(date, 'd')}</span>
             </button>
           )
         })}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] p-4 md:p-8 flex flex-col overflow-hidden relative">
       
       {/* FOCUS MODE OVERLAY */}
       <AnimatePresence>
         {focusMode && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8"
           >
              <button onClick={() => setFocusMode(false)} className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={32}/></button>
              <h2 className="text-white/50 font-bold uppercase tracking-widest mb-8">Current Focus</h2>
              {filteredTasks.filter(t => t.status !== 'done')[0] ? (
                <div className="text-center">
                   <h1 className="text-4xl md:text-6xl font-black text-white mb-8">{filteredTasks.filter(t => t.status !== 'done')[0].title}</h1>
                   <button 
                     onClick={() => toggleStatus(filteredTasks.filter(t => t.status !== 'done')[0].id)}
                     className="bg-[#638c80] text-white px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform"
                   >
                     Mark Complete
                   </button>
                </div>
              ) : (
                <div className="text-white text-2xl font-bold">No pending tasks! You are free.</div>
              )}
           </motion.div>
         )}
       </AnimatePresence>

       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
             <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
               Life OS <span className="text-xs font-bold px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">v2.0</span>
             </h1>
             <p className="text-slate-500 font-medium mt-1">{format(selectedDate, 'MMMM do, yyyy')}</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-full shadow-sm">
                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{progress}% Done</span>
             </div>
             <button 
               onClick={() => setFocusMode(true)}
               className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
             >
               <Zap size={14}/> Focus Mode
             </button>
          </div>
       </div>

       {/* MAIN GRID */}
       <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
          
          {/* LEFT: SIDEBAR (Views) */}
          <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto lg:overflow-visible">
             {[
               { id: 'daily', label: 'Daily', icon: Clock },
               { id: 'weekly', label: 'Weekly', icon: CalendarDays },
               { id: 'monthly', label: 'Monthly', icon: Calendar },
               { id: 'vision', label: 'Vision', icon: Eye }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setView(tab.id as any)}
                 className={`
                   flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all border
                   ${view === tab.id 
                     ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-600 shadow-md lg:translate-x-2' 
                     : 'bg-transparent border-transparent text-slate-500 hover:bg-white/50 dark:hover:bg-slate-900/50'}
                 `}
               >
                 <tab.icon size={18} /> {tab.label}
               </button>
             ))}
          </div>

          {/* CENTER: TASK BOARD */}
          <div className="flex-1 flex flex-col bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-6 overflow-hidden shadow-2xl">
             
             {view === 'daily' && <DateStrip />}

             {/* INPUT */}
             <form onSubmit={addTask} className="relative mb-6 group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Add a new ${view} goal...`}
                  className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-lg font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-transform active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={20} />
                </button>
             </form>

             {/* LIST */}
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                <AnimatePresence initial={false}>
                  {filteredTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                       <Target size={48} className="mb-4"/>
                       <p className="font-bold">No tasks for {view} view.</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`
                          group flex items-center gap-4 p-4 rounded-2xl border transition-all
                          ${task.status === 'done' 
                            ? 'bg-slate-100/50 dark:bg-slate-900/30 border-transparent opacity-60' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'}
                        `}
                      >
                         <button onClick={() => toggleStatus(task.id)} className={`shrink-0 transition-colors ${task.status === 'done' ? 'text-[#638c80]' : 'text-slate-300 hover:text-indigo-500'}`}>
                            {task.status === 'done' ? <CheckCircle size={24} className="fill-[#638c80]/20 dark:fill-emerald-900/30"/> : <Circle size={24}/>}
                         </button>
                         
                         <span className={`flex-1 font-medium text-lg ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                           {task.title}
                         </span>

                         <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={18}/>
                         </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
             </div>

          </div>
       </div>
    </div>
  );
};
