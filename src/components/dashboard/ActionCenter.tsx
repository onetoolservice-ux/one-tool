import React, { useState } from 'react';
import { 
  Zap, ArrowRight, Clock, Calculator, 
  StickyNote, Hash, Search 
} from 'lucide-react';

const ActionCenter = () => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[40vh]">
      
      {/* HEADER TEXT - visible when idle */}
      <div className={`text-center transition-all duration-500 ${focused ? 'opacity-0 -translate-y-10 h-0 overflow-hidden' : 'opacity-100 mb-8'}`}>
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Focus. Act. Achieve.</h2>
        <p className="text-gray-500">Sunday, December 7 • 02:48 PM</p>
      </div>

      {/* THE INPUT BAR (The Core) */}
      <div 
        className={`relative w-full transition-all duration-300 ${focused ? 'scale-110' : 'scale-100'}`}
      >
        <div className="absolute inset-0 bg-blue-600/20 rounded-2xl blur-2xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
        
        <div className={`relative bg-[#1C1F2E] border transition-all duration-300 rounded-2xl p-2 flex items-center shadow-2xl ${focused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/10'}`}>
          
          {/* Icon / Trigger */}
          <div className="pl-4 pr-4 border-r border-white/5 text-gray-400">
             <Zap className={focused ? 'text-blue-500' : 'text-gray-500'} size={24} />
          </div>

          <input 
            type="text" 
            placeholder="What needs to be done?" 
            className="flex-1 bg-transparent text-xl text-white placeholder-gray-600 px-4 py-4 focus:outline-none"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
          />

          <button className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* MICRO TOOLS - Only appear when needed or hover */}
      <div className={`flex gap-6 mt-12 transition-all duration-500 ${focused ? 'opacity-0 translate-y-10' : 'opacity-100'}`}>
         <QuickTool icon={<Clock />} label="Timer" />
         <QuickTool icon={<Calculator />} label="Calc" />
         <QuickTool icon={<StickyNote />} label="Note" />
         <QuickTool icon={<Hash />} label="Convert" />
         <QuickTool icon={<Search />} label="Find" />
      </div>

    </div>
  );
};

const QuickTool = ({ icon, label }: { icon: any, label: string }) => (
  <button className="flex flex-col items-center gap-3 group">
    <div className="w-14 h-14 rounded-2xl bg-[#1C1F2E] border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-white group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300 shadow-lg">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-gray-600 group-hover:text-gray-400 transition-colors">{label}</span>
  </button>
);

export default ActionCenter;
