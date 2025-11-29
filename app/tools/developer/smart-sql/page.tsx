"use client";
import React, { useState } from "react";
import { Database, Play, Copy, Trash2, Code2, Sparkles, X } from "lucide-react";
import { format } from "sql-formatter";
import Toast, { showToast } from "@/app/shared/Toast";
import SmartHistory from "@/app/components/ui/SmartHistory";

export default function SmartSQL() {
  const [input, setInput] = useState("SELECT * FROM users WHERE id=1");
  const [output, setOutput] = useState("");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");

  const formatSQL = () => {
    try { 
        setOutput(format(input, { language: 'postgresql', tabWidth: 2, keywordCase: 'upper' })); 
        showToast("Formatted"); 
    } 
    catch { setOutput("-- Error: Invalid SQL"); showToast("Error"); }
  };

  const handleAi = () => {
    const t = aiText.toLowerCase();
    let q = "SELECT * FROM table";
    if(t.includes("user")) q = "SELECT * FROM users";
    if(t.includes("active")) q += " WHERE status = 'active'";
    setInput(q); setIsAiOpen(false); showToast("✨ Query Generated!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white  "><Database size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart SQL</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Beautifier</p></div>
        </div>
        <div className="flex gap-2">
            <SmartHistory toolId="sql" currentValue={input} onRestore={setInput} />
            <button onClick={() => setIsAiOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface text-blue-600 dark:text-blue-400 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-50 transition shadow-lg shadow-slate-200/50 dark:shadow-none"><Sparkles size={14}/> Smart Fill</button>
            <button onClick={formatSQL} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"><Play size={14}/> Format</button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 divide-x border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
        <textarea value={input} onChange={e=>setInput(e.target.value)} className="p-6 resize-none outline-none font-mono text-sm bg-transparent dark:text-white" placeholder="Input SQL..." />
        <pre className="p-6 bg-[#1e293b] text-emerald-400 font-mono text-sm overflow-auto">{output || "// Output..."}</pre>
      </div>
      {/* AI Modal omitted for brevity, assumed same as before */}
      {isAiOpen && (
        <div className="fixed inset-0 bg-surface/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-blue-200 animate-in zoom-in-95 relative">
                <div className="flex justify-between items-center border-b pb-3"><h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200 flex items-center gap-2"><Sparkles size={18} className="text-blue-600 dark:text-blue-400"/> Smart Fill</h3><button onClick={() => setIsAiOpen(false)} className="text-muted/70 hover:text-muted dark:text-muted/70 dark:text-muted/70"><X size={20}/></button></div>
                <textarea className="w-full h-32 border p-4 rounded-lg text-sm focus:ring-2 ring-blue-500 outline-none resize-none bg-background dark:bg-surface dark:bg-slate-950 focus:bg-surface dark:bg-slate-800 dark:bg-surface transition" placeholder="Type: 'Find all active users'" value={aiText} onChange={e => setAiText(e.target.value)} autoFocus />
                <button onClick={handleAi} disabled={!aiText} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold   disabled:opacity-50">Generate SQL</button>
            </div>
        </div>
      )}
    </div>
  );
}
