"use client";
import React, { useState, useEffect } from "react";
import ToolHeader from "@/app/components/ui/ToolHeader";
import { Clock, Copy, Check } from "lucide-react";

export default function TimestampConverter() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [input, setInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const dateObj = new Date(Number(input) * 1000);
  const isValid = !isNaN(dateObj.getTime());

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <ToolHeader title="Unix Timestamp" desc="Epoch to Human Time" icon={<Clock size={20}/>} />
      
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl text-center mb-8">
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Current Unix Time</div>
        <div className="text-6xl font-mono font-bold tracking-tighter">{now}</div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Enter Timestamp</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              className="flex-1 p-3 border border-slate-200 rounded-xl font-mono text-lg outline-none focus:border-emerald-500"
            />
            <button onClick={() => setInput(String(now))} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 text-sm">
              Current
            </button>
          </div>
        </div>

        {isValid ? (
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-700 uppercase">GMT / UTC</span>
              <span className="font-mono font-bold text-emerald-900">{dateObj.toUTCString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-700 uppercase">Local Time</span>
              <span className="font-mono font-bold text-emerald-900">{dateObj.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-700 uppercase">ISO 8601</span>
              <span className="font-mono font-bold text-emerald-900">{dateObj.toISOString()}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-center font-bold text-sm">Invalid Timestamp</div>
        )}
      </div>
    </div>
  );
}
