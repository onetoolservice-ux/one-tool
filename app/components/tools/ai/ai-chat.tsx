"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Bot } from 'lucide-react';

export const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm OneTool AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const lastSendTimeRef = useRef<number>(0);

  const send = async () => {
    // Prevent empty messages
    if(!input.trim()) return;
    
    // Prevent rapid successive sends (rate limiting: 1 second between messages)
    const now = Date.now();
    if (now - lastSendTimeRef.current < 1000) {
      return;
    }
    
    // Prevent sending while already processing
    if (isSending || isTyping) return;
    
    setIsSending(true);
    lastSendTimeRef.current = now;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Delay & Response
    setTimeout(() => {
       const aiMsg = { role: 'ai', text: "This is a demo response. Connect an OpenAI API key to make me real! I can verify code, write emails, or calculate taxes." };
       setMessages(prev => [...prev, aiMsg]);
       setIsTyping(false);
       setIsSending(false);
    }, 1500);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto bg-white dark:bg-[#0B1120] border-x border-slate-200 dark:border-slate-800">
       
       <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
             <div key={i} className={`flex gap-4 ${m.role==='user'?'flex-row-reverse':''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role==='ai'?'bg-blue-600 text-white':'bg-slate-200 text-slate-500'}`}>
                   {m.role==='ai' ? <Sparkles size={16}/> : <User size={16}/>}
                </div>
                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed max-w-[80%] ${m.role==='user'?'bg-slate-100 dark:bg-slate-800 rounded-tr-none':'bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-sm'}`}>
                   {m.text}
                </div>
             </div>
          ))}
          {isTyping && (
             <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"><Sparkles size={16} className="text-white"/></div>
                <div className="px-5 py-4 bg-white dark:bg-black border rounded-2xl rounded-tl-none flex gap-1 items-center">
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                </div>
             </div>
          )}
          <div ref={endRef}></div>
       </div>

       <div className="p-4 border-t bg-white dark:bg-[#0B1120]">
          <div className="relative">
             <input 
               value={input} 
               onChange={e=>setInput(e.target.value)} 
               onKeyDown={e=>e.key==='Enter' && send()}
               className="w-full pl-6 pr-14 py-4 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-full outline-none text-sm transition-all"
               placeholder="Ask anything..."
             />
             <button 
               onClick={send} 
               disabled={isSending || isTyping || !input.trim()}
               className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
             >
               <Send size={16}/>
             </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-3">AI can make mistakes. Verify important information.</p>
       </div>
    </div>
  );
};