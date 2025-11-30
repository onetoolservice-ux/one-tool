"use client";
import React, { useState, useEffect } from "react";
import { Clock, Copy } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartCron() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("*");
  const [desc, setDesc] = useState("Every minute");

  const cron = `${minute} ${hour} ${dom} ${month} ${dow}`;

  useEffect(() => {
     // Simple English description logic
     let d = "Every minute";
     if(minute === "0" && hour === "*") d = "Every hour";
     if(minute === "0" && hour === "0") d = "Every day at midnight";
     if(minute === "*/5") d = "Every 5 minutes";
     if(dow === "0") d = "Every Sunday";
     if(dom === "1") d = "On the 1st of every month";
     setDesc(d);
  }, [cron]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Cron Generator</h1>
        <p className="text-slate-500">Build schedule expressions visually.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-8">
         <div className="grid grid-cols-5 gap-4 text-center">
            {[
                {l: "Minute", v: minute, s: setMinute, o: ["*", "0", "*/5", "*/15", "30"]},
                {l: "Hour", v: hour, s: setHour, o: ["*", "0", "8", "12", "18"]},
                {l: "Day", v: dom, s: setDom, o: ["*", "1", "15", "L"]},
                {l: "Month", v: month, s: setMonth, o: ["*", "1", "6", "12"]},
                {l: "Week", v: dow, s: setDow, o: ["*", "0", "1-5", "6"]}
            ].map(f => (
                <div key={f.l} className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{f.l}</label>
                    <input value={f.v} onChange={e=>f.s(e.target.value)} className="w-full p-2 text-center font-mono font-bold bg-slate-50 dark:bg-slate-900 border rounded-lg"/>
                </div>
            ))}
         </div>

         <div className="p-6 bg-slate-900 rounded-xl text-center relative group cursor-pointer" onClick={()=>{navigator.clipboard.writeText(cron); showToast("Copied!");}}>
            <div className="text-4xl font-mono font-bold text-emerald-400 tracking-widest mb-2">{cron}</div>
            <div className="text-slate-400 text-sm font-medium">“{desc}”</div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"><Copy size={18}/></div>
         </div>
      </div>
    </div>
  );
}
