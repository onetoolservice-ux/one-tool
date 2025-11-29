"use client";
import React, { useState } from "react";
import { MessageSquare, Send, ArrowLeft, Smile, Frown, Meh } from "lucide-react";
import Link from "next/link";
import Toast, { showToast } from "../shared/Toast";

export default function FeedbackPage() {
  const [mood, setMood] = useState("");
  const [text, setText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) return showToast("Please select a mood");
    if (!text) return showToast("Please write a message");
    
    // Simulate API call
    setTimeout(() => {
        showToast("Feedback Sent! Thank you.");
        setText("");
        setMood("");
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-6 font-sans">
      <Toast />
      
      <div className="w-full max-w-lg bg-surface dark:bg-slate-800 dark:bg-surface rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-slate-600 border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-surface p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500"></div>
            <Link href="/" className="absolute top-4 left-4 p-2 bg-surface dark:bg-slate-800 dark:bg-surface/10 rounded-full hover:bg-surface dark:bg-slate-800 dark:bg-surface/20 transition"><ArrowLeft size={20}/></Link>
            <MessageSquare size={48} className="mx-auto mb-4 text-violet-300 opacity-80"/>
            <h1 className="text-2xl font-bold">We value your input</h1>
            <p className="text-muted/70 text-sm mt-2">Help us make One Tool even better.</p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-8 space-y-8">
            
            {/* Mood Selector */}
            <div className="space-y-3 text-center">
                <label className="text-xs font-bold text-muted/70 uppercase tracking-wide">How are you feeling?</label>
                <div className="flex justify-center gap-4">
                    <button type="button" onClick={()=>setMood("bad")} className={`p-4 rounded-2xl border  -2 transition-all ${mood==="bad" ? "border-rose-500 bg-rose-50 text-rose-500 scale-110  " : "border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-slate-300 hover:border-rose-200 hover:text-rose-300"}`}>
                        <Frown size={32}/>
                    </button>
                    <button type="button" onClick={()=>setMood("ok")} className={`p-4 rounded-2xl border  -2 transition-all ${mood==="ok" ? "border-orange-500 bg-orange-50 text-orange-500 scale-110  " : "border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-slate-300 hover:border-orange-200 hover:text-orange-300"}`}>
                        <Meh size={32}/>
                    </button>
                    <button type="button" onClick={()=>setMood("good")} className={`p-4 rounded-2xl border  -2 transition-all ${mood==="good" ? "border-emerald-500 bg-emerald-50 text-emerald-500 scale-110  " : "border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-slate-300 hover:border-emerald-200 hover:text-emerald-300"}`}>
                        <Smile size={32}/>
                    </button>
                </div>
            </div>

            {/* Text Area */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-muted/70 uppercase tracking-wide">Your Feedback</label>
                <textarea 
                    value={text}
                    onChange={e=>setText(e.target.value)}
                    className="w-full h-32 p-4 bg-background dark:bg-surface dark:bg-slate-950 border border-line dark:border-slate-700 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none text-main dark:text-slate-300"
                    placeholder="Tell us what you love or what needs fixing..."
                />
            </div>

            {/* Submit */}
            <button className="w-full py-4 bg-surface text-white rounded-xl font-bold shadow-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2">
                <Send size={18}/> Send Feedback
            </button>
        </form>
      </div>
    </div>
  );
}
