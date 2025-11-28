"use client";
import React, { useState, useMemo } from "react";
import { Code2 } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const match = useMemo(() => { try { return text.match(new RegExp(pattern, "g")); } catch { return null; } }, [pattern, text]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <ToolHeader title="Regex Tester" desc="Test Regular Expressions" icon={<Code2 size={18}/>} />
      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <textarea value={pattern} onChange={e=>setPattern(e.target.value)} placeholder="Pattern (e.g. [a-z]+)" className="w-full p-4 border rounded-xl h-24 font-mono text-sm outline-none focus:border-indigo-500"/>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Test String" className="flex-1 w-full p-4 border rounded-xl font-mono text-sm outline-none focus:border-indigo-500 resize-none"/>
        </div>
        <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm overflow-auto">
          <div className="text-xs font-bold text-slate-500 uppercase mb-4">Matches</div>
          {match ? match.map((m,i)=><div key={i} className="bg-slate-800 p-2 rounded mb-2 border border-slate-700">{m}</div>) : "No matches"}
        </div>
      </div>
    </div>
  );
}
