import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';

const FocusSection = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Active Priorities</h3>
        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">View All Boards</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <FocusCard 
          title="DAILY FOCUS" 
          task="Finish Dashboard UI Implementation" 
          sub="Deep Work • 2h remaining"
          action="Add daily task" 
        />
        <FocusCard 
          title="WEEKLY FOCUS" 
          task="Launch MVP Beta to 10 Users" 
          sub="Product • Due Friday"
          action="Add weekly goal" 
        />
        <FocusCard 
          title="MONTHLY FOCUS" 
          task="Reach $1k MRR" 
          sub="Business • 45% progress"
          action="Add monthly goal" 
        />
        <FocusCard 
          title="MACRO VISION" 
          task="Financial Freedom & Travel" 
          sub="Life Goal • Long term"
          action="Add macro vision" 
        />
      </div>
    </div>
  );
};

const FocusCard = ({ title, task, sub, action }: any) => (
  <div className="bg-[#1C1F2E] p-1 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group flex flex-col h-full">
    <div className="p-5 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase">{title}</span>
        <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
      </div>

      {/* Task Content */}
      <div className="flex gap-4 items-start mb-6">
         {/* Custom Radio Button */}
         <button className="mt-1 w-5 h-5 rounded-full border-2 border-gray-600 hover:border-blue-500 hover:bg-blue-500/20 transition-all flex-shrink-0" />
         
         <div>
           <h4 className="text-white font-medium text-lg leading-snug group-hover:text-blue-100 transition-colors">{task}</h4>
           <span className="text-sm text-gray-500">{sub}</span>
         </div>
      </div>

      {/* Add Button - Pushed to bottom */}
      <button className="mt-auto w-full border border-dashed border-gray-700 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-gray-500 hover:bg-white/5 transition-all">
        <Plus size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">{action}</span>
      </button>
    </div>
  </div>
);

export default FocusSection;
