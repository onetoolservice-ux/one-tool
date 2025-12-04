"use client";
import React, { useState } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';

export const AiStudio = ({ toolId }: { toolId: string }) => {
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! I am your local AI assistant. How can I help you today?" }]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: 'user', text: input }];
    setMessages(newMsgs);
    setInput("");
    
    // Mock Response
    setTimeout(() => {
      setMessages([...newMsgs, { role: 'ai', text: "This is a demo response. To make this real, connect the OpenAI API key in the codebase." }]);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden">
       {/* Header */}
       <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-600"/>
          <h3 className="font-bold text-sm">{toolId === 'smart-analyze' ? 'Sentiment Analyzer' : 'Smart Chat'}</h3>
       </div>
       
       {/* Chat Area */}
       <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
             <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-200 dark:bg-slate-800' : 'bg-indigo-600 text-white'}`}>
                   {m.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] ${m.role === 'user' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-none' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 rounded-tl-none'}`}>
                   {m.text}
                </div>
             </div>
          ))}
       </div>

       {/* Input */}
       <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
             <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && send()}
               className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full pl-6 pr-12 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all"
               placeholder="Type a message..."
             />
             <button onClick={send} className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"><Send size={16}/></button>
          </div>
       </div>
    </div>
  );
};
