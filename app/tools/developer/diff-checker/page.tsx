"use client";
import React, { useState } from "react";
import ToolHeader from "@/app/components/ui/ToolHeader";
import { Split } from "lucide-react";

export default function DiffChecker() {
  const [textA, setTextA] = useState("Original Text");
  const [textB, setTextB] = useState("Modified Text");
  
  // Very basic diff logic for display (real diffs require complex lib)
  // This is a placeholder logic to show the UI structure
  const isDifferent = textA !== textB;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <ToolHeader title="Diff Checker" desc="Compare text differences" icon={<Split size={20}/>} />
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-hidden">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2">Original</label>
          <textarea 
            value={textA} onChange={(e) => setTextA(e.target.value)}
            className="flex-1 w-full p-4 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2">Modified</label>
          <textarea 
            value={textB} onChange={(e) => setTextB(e.target.value)}
            className={`flex-1 w-full p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 font-mono text-sm ${isDifferent ? 'border-orange-200 bg-orange-50/30' : 'border-slate-200'}`}
          />
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 bg-white text-center text-sm font-medium text-slate-500">
        {isDifferent ? <span className="text-orange-600">Files are different</span> : <span className="text-emerald-600">Files are identical</span>}
      </div>
    </div>
  );
}
