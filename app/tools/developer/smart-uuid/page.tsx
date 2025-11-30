"use client";
import React, { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartUUID() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = () => {
    const arr = Array.from({length: count}, () => crypto.randomUUID());
    setUuids(arr);
  };

  React.useEffect(generate, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">UUID v4 Generator</h1>
        <p className="text-muted">Cryptographically strong unique identifiers.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-4 items-end">
         <div className="flex-1">
             <label className="text-xs font-bold text-muted uppercase mb-1 block">Quantity</label>
             <input type="range" min="1" max="50" value={count} onChange={e=>setCount(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"/>
             <div className="text-right text-xs font-bold text-indigo-600 mt-1">{count} UUIDs</div>
         </div>
         <Button onClick={generate} className="h-10">Generate</Button>
      </div>

      <div className="space-y-2">
         {uuids.map((id, i) => (
             <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-indigo-500 transition-colors">
                 <span className="font-mono text-sm text-main dark:text-slate-300">{id}</span>
                 <button onClick={()=>{navigator.clipboard.writeText(id); showToast("Copied!");}} className="text-muted hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy size={16} />
                 </button>
             </div>
         ))}
      </div>
    </div>
  );
}
