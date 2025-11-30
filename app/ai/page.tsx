"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

export default function SmartChat() {
  const [messages, setMessages] = useState([{ role: "ai", content: "Hello! I am OneTool AI. How can I help?" }]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setTimeout(() => {
       let reply = "I'm a demo bot. I can't browse the web, but I can help you use OneTool.";
       if (input.toLowerCase().includes("finance")) reply = "Check out Smart Budget in the Finance section.";
       setMessages(prev => [...prev, { role: "ai", content: reply }]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3"><Sparkles className="text-indigo-600"/><h2 className="font-bold text-sm">OneTool Assistant</h2></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
           {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200'}`}>{m.role === 'ai' ? <Bot size={18}/> : <User size={18}/>}</div>
                 <div className={`p-4 rounded-2xl text-sm ${m.role === 'ai' ? 'bg-slate-50 dark:bg-slate-900' : 'bg-indigo-600 text-white'}`}>{m.content}</div>
              </div>
           ))}
        </div>
        <div className="p-4 border-t bg-white dark:bg-slate-800"><form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative"><input value={input} onChange={e => setInput(e.target.value)} className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-slate-900 border rounded-xl outline-none" placeholder="Type a message..."/><button type="submit" disabled={!input} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg"><Send size={18} /></button></form></div>
      </div>
    </div>
  );
}
