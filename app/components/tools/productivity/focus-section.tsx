'use client';

import React from 'react';
import { Plus, ChevronRight, Check } from 'lucide-react';

export default function FocusSection({ tasks, onToggle, onDelete, theme }: any) {
  // Filter for priority tasks only to show in focus
  const priorityTasks = tasks.filter((t: any) => t.type === 'priority');
  const t = theme;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {priorityTasks.length === 0 && (
        <div className={`col-span-2 p-8 border border-dashed ${t.border} rounded-2xl text-center text-sm ${t.textSec}`}>
          No priority tasks set for today. Check your Daily Planner!
        </div>
      )}
      
      {priorityTasks.map((task: any) => (
        <div key={task.id} className={`${t.cardBg} p-1 rounded-2xl border ${t.border} hover:border-blue-500/30 transition-all group flex flex-col`}>
          <div className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${t.textSec}`}>DAILY FOCUS</span>
              <ChevronRight size={14} className={`${t.textSec}`} />
            </div>

            <div className="flex gap-4 items-start mb-6">
               <button 
                 onClick={() => onToggle(task.id)}
                 className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 hover:border-blue-500'}`}
               >
                 {task.completed && <Check size={12} className="text-white" />}
               </button>
               
               <div>
                 <h4 className={`font-medium text-lg leading-snug ${t.text} ${task.completed ? 'line-through opacity-50' : ''}`}>{task.text}</h4>
                 <span className={`text-sm ${t.textSec}`}>{task.category || 'General'}</span>
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
