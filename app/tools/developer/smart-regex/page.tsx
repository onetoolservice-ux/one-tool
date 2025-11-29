"use client";
import React, { useState, useMemo } from "react";
import { Code2, CheckCircle, AlertCircle, Sparkles, X } from "lucide-react";
import Toast, { showToast } from "../../../shared/Toast";

export default function SmartRegex() {
  const [regex, setRegex] = useState("");
  const [text, setText] = useState("");
  const [match, setMatch] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");

  useMemo(() => {
    try { if(!regex) return; const r = new RegExp(regex); setMatch(r.test(text)); } catch {}
  }, [regex, text]);

  const handleAi = () => {
    const t = aiText.toLowerCase();
    let r = "";
    if(t.includes("email")) r = "[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}";
    else if(t.includes("phone")) r = "\\d{3}-\\d{3}-\\d{4}";
    else if(t.includes("date")) r = "\\d{4}-\\d{2}-\\d{2}";
    else if(t.includes("url")) r = "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)";
    else r = ".*";
    
    setRegex(r);
    setIsAiOpen(false);
    showToast("✨ Pattern Generated!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-surface dark:bg-slate-950/50 font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500 text-white  "><Code2 size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-50 dark:text-slate-100">Smart Regex</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Debugger</p></div>
        </div>
        <button onClick={() => setIsAiOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface text-yellow-600 border border-yellow-200 rounded-lg text-xs font-bold hover:bg-yellow-50 transition shadow-lg shadow-slate-200/50 dark:shadow-none"><Sparkles size={14}/> Smart Fill</button>
      </div>
      <div className="flex-1 grid grid-cols-2 divide-x">
        <div className="p-6 space-y-4">
            <div className="space-y-1"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Pattern</label><input value={regex} onChange={e=>setRegex(e.target.value)} className="w-full p-3 border rounded-xl font-mono" placeholder="/abc/g" /></div>
            <div className="space-y-1"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Test String</label><textarea value={text} onChange={e=>setText(e.target.value)} className="w-full p-3 border rounded-xl font-mono h-40" /></div>
        </div>
        <div className="p-6 bg-background dark:bg-surface dark:bg-slate-950 flex items-center justify-center">
            {regex && text && (
                <div className={`text-center p-6 rounded-2xl ${match ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {match ? <CheckCircle size={48} className="mx-auto mb-2"/> : <AlertCircle size={48} className="mx-auto mb-2"/>}
                    <div className="font-bold text-xl">{match ? "Match Found" : "No Match"}</div>
                </div>
            )}
        </div>
      </div>

      {isAiOpen && (
        <div className="fixed inset-0 bg-surface/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-yellow-200 animate-in zoom-in-95 relative">
                <div className="flex justify-between items-center border-b pb-3"><h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200 flex items-center gap-2"><Sparkles size={18} className="text-yellow-600"/> Smart Fill</h3><button onClick={() => setIsAiOpen(false)} className="text-muted/70 hover:text-muted dark:text-muted/70 dark:text-muted/70"><X size={20}/></button></div>
                <textarea className="w-full h-32 border p-4 rounded-lg text-sm focus:ring-2 ring-yellow-500 outline-none resize-none bg-background dark:bg-surface dark:bg-slate-950 focus:bg-surface dark:bg-slate-800 dark:bg-surface transition" placeholder="Type: 'Match emails' or 'Validate phone numbers'" value={aiText} onChange={e => setAiText(e.target.value)} autoFocus />
                <button onClick={handleAi} disabled={!aiText} className="w-full py-2.5 bg-yellow-500 text-white rounded-lg font-bold   disabled:opacity-50">Generate Pattern</button>
            </div>
        </div>
      )}
    </div>
  );
}
