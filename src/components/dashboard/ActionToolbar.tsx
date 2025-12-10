import React, { useState } from 'react';
import { 
  Zap, Calculator, StickyNote, Clock, 
  ArrowRight, Mic, Hash 
} from 'lucide-react';

const ActionToolbar = () => {
  return (
    <div className="space-y-6">
      
      {/* 1. THE COMMAND INPUT */}
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center bg-[#1C1F2E] border border-white/10 rounded-2xl p-2 shadow-2xl">
          
          <div className="pl-4 pr-3 text-gray-500">
            <Zap size={20} className="text-blue-500" />
          </div>
          
          <input 
            type="text" 
            placeholder="Add a task, log an expense, or just type..." 
            className="flex-1 bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none py-3"
            autoFocus
          />
          
          <div className="flex items-center gap-2 pr-2">
             <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
               <Mic size={18} />
             </button>
             <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2">
               <span>Enter</span>
               <ArrowRight size={16} />
             </button>
          </div>
        </div>
      </div>

      {/* 2. MICRO TOOLS (Quick Access Row) */}
      <div className="flex justify-center gap-4">
        <ToolButton icon={<Clock />} label="Timer" />
        <ToolButton icon={<Calculator />} label="Calculator" />
        <ToolButton icon={<StickyNote />} label="Quick Note" />
        <ToolButton icon={<Hash />} label="Converter" />
      </div>

    </div>
  );
};

const ToolButton = ({ icon, label }: { icon: any, label: string }) => (
  <button className="flex flex-col items-center gap-2 group">
    <div className="w-12 h-12 rounded-xl bg-[#1C1F2E] border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all shadow-lg">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <span className="text-[10px] uppercase font-bold text-gray-600 group-hover:text-gray-400 transition-colors">{label}</span>
  </button>
);

export default ActionToolbar;
