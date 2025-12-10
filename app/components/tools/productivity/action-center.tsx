'use client';
import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, Clock, Calculator, StickyNote } from 'lucide-react';
import { ModalWrapper } from './modal-wrapper';
import { TimerWidget, CalculatorWidget, NoteWidget } from './tool-widgets';

export default function ActionCenter({ onAddTask, theme }: any) {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const t = theme || { bg: 'bg-[#0F111A]', cardBg: 'bg-[#1C1F2E]', text: 'text-white', border: 'border-white/10' };

  return (
    <>
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[30vh]">
        <div className={`text-center transition-all duration-500 ${focused ? 'opacity-0 -translate-y-10 h-0 overflow-hidden' : 'opacity-100 mb-8'}`}>
          <h2 className={`text-4xl font-bold ${t.text} mb-2 tracking-tight`}>Focus. Act. Achieve.</h2>
          <p className="text-gray-500">{mounted ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '...'}</p>
        </div>

        <div className={`relative w-full transition-all duration-300 ${focused ? 'scale-110' : 'scale-100'}`}>
          <div className={`relative ${t.cardBg} border transition-all duration-300 rounded-2xl p-2 flex items-center shadow-xl ${focused ? 'border-blue-500 ring-2 ring-blue-500/20' : t.border}`}>
            <div className={`pl-4 pr-4 border-r ${t.border} text-gray-400`}><Zap className={focused ? 'text-blue-500' : 'text-gray-500'} size={24} /></div>
            <input 
              type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && inputValue.trim()) { onAddTask(inputValue); setInputValue(''); } }}
              placeholder="What needs to be done?" 
              className={`flex-1 bg-transparent text-xl ${t.text} placeholder-gray-500 px-4 py-4 focus:outline-none`}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoFocus
            />
            <button onClick={() => { if(inputValue.trim()) { onAddTask(inputValue); setInputValue(''); } }} className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors"><ArrowRight size={20} /></button>
          </div>
        </div>

        <div className={`flex gap-6 mt-12 transition-all duration-500 ${focused ? 'opacity-0 translate-y-10' : 'opacity-100'}`}>
           <QuickTool icon={<Clock />} label="Timer" onClick={() => setActiveTool('timer')} theme={t} />
           <QuickTool icon={<Calculator />} label="Calc" onClick={() => setActiveTool('calc')} theme={t} />
           <QuickTool icon={<StickyNote />} label="Note" onClick={() => setActiveTool('note')} theme={t} />
        </div>
      </div>
      <ModalWrapper isOpen={activeTool === 'timer'} onClose={() => setActiveTool(null)} title="Focus Timer"><TimerWidget /></ModalWrapper>
      <ModalWrapper isOpen={activeTool === 'calc'} onClose={() => setActiveTool(null)} title="Quick Calculator"><CalculatorWidget /></ModalWrapper>
      <ModalWrapper isOpen={activeTool === 'note'} onClose={() => setActiveTool(null)} title="Scratchpad"><NoteWidget /></ModalWrapper>
    </>
  );
}

const QuickTool = ({ icon, label, onClick, theme }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-3 group">
    <div className={`w-14 h-14 rounded-2xl ${theme.cardBg} border ${theme.border} flex items-center justify-center text-gray-500 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-sm`}>{React.cloneElement(icon, { size: 24 })}</div>
    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
  </button>
);
