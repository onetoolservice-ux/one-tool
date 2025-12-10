"use client";
import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

export const SmartChat = () => {
  const [msgs, setMsgs] = useState([{ role: 'ai', text: 'Hello! I am your OneTool AI Assistant. How can I help you today?' }]);
  const [input, setInput] = useState("");

  const send = () => {
     if(!input.trim()) return;
     setMsgs([...msgs, { role: 'user', text: input }]);
     setInput("");
     setTimeout(() => setMsgs(prev => [...prev, { role: 'ai', text: 'This is a demo response. Connect an LLM API to make me real!' }]), 1000);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-80px)] flex flex-col p-4">
       <div className="flex-1 bg-white dark:bg-slate-900 border rounded-2xl p-6 overflow-y-auto space-y-4 shadow-sm mb-4">
          {msgs.map((m, i) => (
             <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${m.role==='user'?'bg-blue-600 text-white rounded-br-none':'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>{m.text}</div>
             </div>
          ))}
       </div>
       <div className="flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} className="flex-1 p-4 bg-white dark:bg-slate-900 border rounded-xl outline-none shadow-sm" placeholder="Ask anything..."/>
          <button onClick={send} className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"><Send size={20}/></button>
       </div>
    </div>
  );
};