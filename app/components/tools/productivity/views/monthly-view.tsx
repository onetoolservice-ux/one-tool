'use client';
import React from 'react';

interface Task { id: string | number; text: string; completed?: boolean; recurrenceEndDate?: string; [key: string]: any }

interface MonthlyViewProps {
  tasks: Task[];
  theme: Record<string, string | boolean>;
}

export const MonthlyView = ({ tasks, theme }: MonthlyViewProps) => {
  const t = theme;
  const roadmapItems = tasks.filter((x) => x.recurrenceEndDate);

  return (
    <div className="h-full p-8 flex flex-col overflow-hidden">
      <div className="mb-6"><h2 className={`text-3xl font-bold ${t.text}`}>Monthly Roadmap</h2></div>
      
      <div className="grid grid-cols-4 gap-6 flex-1 h-full min-h-0">
         <div className={`col-span-3 ${t.cardBg} border ${t.border} rounded-2xl p-6 flex flex-col`}>
            <h3 className={`text-sm font-bold uppercase mb-4 ${t.textSec}`}>Active Recurring Series</h3>
            <div className="space-y-3 flex-1 overflow-y-auto">
               {roadmapItems.length === 0 && <div className={`text-center py-10 ${t.textSec}`}>No recurring series found. Add one in Daily Planner!</div>}
               {roadmapItems.map((task) => (
                  <div key={task.id} className={`p-4 rounded-xl border ${t.border} ${t.bg} flex justify-between items-center`}>
                     <div>
                        <div className={`font-bold ${t.text}`}>{task.text}</div>
                        <div className={`text-xs ${t.textSec}`}>Repeats until: {task.recurrenceEndDate}</div>
                     </div>
                     <div className="px-3 py-1 rounded bg-blue-500/10 text-blue-500 text-xs border border-blue-500/20">Active</div>
                  </div>
               ))}
            </div>
         </div>
         
         <div className={`col-span-1 ${t.cardBg} border ${t.border} rounded-2xl p-6`}>
            <h3 className={`text-sm font-bold uppercase mb-4 ${t.textSec}`}>Stats</h3>
            <div className={`text-4xl font-bold ${t.text} mb-1`}>{tasks.length}</div>
            <div className={`text-xs ${t.textSec} mb-6`}>Total Tasks Logged</div>
            
            <div className={`text-4xl font-bold text-emerald-500 mb-1`}>{tasks.filter((t)=>t.completed).length}</div>
            <div className={`text-xs ${t.textSec}`}>Completed</div>
         </div>
      </div>
    </div>
  );
};
