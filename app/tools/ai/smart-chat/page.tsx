"use client";
import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Bot, RefreshCw, Trash2 } from "lucide-react";
import Toast from "../../../shared/Toast";

interface Message { id: string; role: 'user' | 'bot'; text: string; time: string; }

export default function SmartChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: 'Hello! I am your local AI assistant. How can I help you today?', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if(!input.trim()) return;
    
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: input, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
        const responses = [
            "That's an interesting perspective! Tell me more.",
            "I can certainly help with that. Here's a breakdown...",
            "Could you clarify what you mean by that?",
            "Processing your request... Done! The result is optimized.",
            "I'm running locally, so I don't have real-time data, but I can process logic!"
        ];
        const botText = responses[Math.floor(Math.random() * responses.length)];
        const botMsg: Message = { id: crypto.randomUUID(), role: 'bot', text: botText, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
        
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
    }, 1500);
  };

  const handleKey = (e: React.KeyboardEvent) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      
      {/* Header */}
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-600 text-white  "><Sparkles size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Chat</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Conversational UI</p></div>
        </div>
        <button onClick={()=>{setMessages([]); setIsTyping(false);}} className="p-2 text-muted/70 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 rounded-lg transition"><Trash2 size={18}/></button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {messages.map((m) => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-slate-200 text-muted dark:text-muted/70 dark:text-muted/70' : 'bg-violet-600 text-white  '}`}>
                    {m.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none text-sm leading-relaxed ${m.role === 'user' ? 'bg-surface dark:bg-slate-800 dark:bg-surface text-main dark:text-slate-100 dark:text-slate-200 rounded-tr-none' : 'bg-violet-600 text-white rounded-tl-none'}`}>
                    {m.text}
                    <div className={`text-xs mt-2 text-right opacity-60 font-bold`}>{m.time}</div>
                </div>
            </div>
        ))}
        {isTyping && (
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center  "><Bot size={16}/></div>
                <div className="bg-violet-50 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
            </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface border-t">
        <div className="max-w-4xl mx-auto relative">
            <input 
                value={input} 
                onChange={e=>setInput(e.target.value)} 
                onKeyDown={handleKey}
                placeholder="Type a message..." 
                className="w-full pl-6 pr-14 py-4 bg-slate-100 border-transparent focus:bg-surface dark:bg-slate-800 dark:bg-surface focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-full outline-none transition-all shadow-lg shadow-slate-200/50 dark:shadow-none font-medium text-main dark:text-slate-300"
            />
            <button 
                onClick={send}
                disabled={!input.trim()}
                className="absolute right-2 top-2 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition  "
            >
                <Send size={18} className={input.trim() ? "ml-0.5" : ""}/>
            </button>
        </div>
      </div>
    </div>
  );
}
