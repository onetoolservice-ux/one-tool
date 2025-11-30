"use client";
import React, { useState } from "react";
import { ArrowDownUp } from "lucide-react";

export default function SmartBase64() {
  const [text, setText] = useState("");
  const [base64, setBase64] = useState("");

  const handleText = (v: string) => {
    setText(v);
    try { setBase64(btoa(v)); } catch(e) { setBase64("Invalid Input"); }
  };

  const handleBase64 = (v: string) => {
    setBase64(v);
    try { setText(atob(v)); } catch(e) { setText("Invalid Base64"); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Base64 Encoder</h1>
      </div>

      <div className="flex-1 grid md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
           <label className="text-xs font-bold text-slate-500 uppercase">Plain Text</label>
           <textarea 
             value={text} 
             onChange={(e) => handleText(e.target.value)} 
             className="flex-1 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
             placeholder="Type text here..." 
           />
        </div>
        
        <div className="hidden md:flex items-center justify-center text-slate-300">
           <ArrowDownUp />
        </div>

        <div className="flex flex-col gap-2">
           <label className="text-xs font-bold text-slate-500 uppercase">Base64 Output</label>
           <textarea 
             value={base64} 
             onChange={(e) => handleBase64(e.target.value)} 
             className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none font-mono text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
             placeholder="Base64 appears here..." 
           />
        </div>
      </div>
    </div>
  );
}
