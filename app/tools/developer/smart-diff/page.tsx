"use client";
import React, { useState } from "react";
import { Split, ArrowRightLeft, RefreshCw } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

// Simple diff logic (Line by line)
const compareLines = (t1: string, t2: string) => {
  const lines1 = t1.split('\n');
  const lines2 = t2.split('\n');
  const max = Math.max(lines1.length, lines2.length);
  const diffs = [];

  for(let i=0; i<max; i++) {
    const l1 = lines1[i] || "";
    const l2 = lines2[i] || "";
    if(l1 !== l2) {
      diffs.push({ line: i+1, l1, l2, type: 'diff' });
    } else {
      diffs.push({ line: i+1, l1, l2, type: 'same' });
    }
  }
  return diffs;
};

export default function SmartDiff() {
  const [text1, setText1] = useState("{\n  \"name\": \"Project A\",\n  \"version\": 1.0\n}");
  const [text2, setText2] = useState("{\n  \"name\": \"Project B\",\n  \"version\": 2.0\n}");
  const [mode, setMode] = useState<'input'|'result'>('input');

  const diffs = compareLines(text1, text2);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans overflow-hidden">
      <Toast />
      
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between shadow-lg shadow-slate-200/50 dark:shadow-none shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-600 text-white  "><Split size={22} /></div>
            <div><h1 className="text-lg font-extrabold text-main dark:text-slate-100 dark:text-slate-200">Smart Diff</h1><p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted font-bold uppercase">Text Comparator</p></div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setMode('input')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${mode==='input' ? 'bg-slate-200 text-main dark:text-slate-100 dark:text-slate-200' : 'text-muted dark:text-muted dark:text-muted dark:text-muted hover:bg-slate-100'}`}>Input</button>
            <button onClick={() => setMode('result')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${mode==='result' ? 'bg-orange-600 text-white  ' : 'text-muted dark:text-muted dark:text-muted dark:text-muted hover:bg-slate-100'}`}>Compare</button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        {mode === 'input' ? (
            <div className="grid grid-cols-2 gap-6 h-full">
                <div className="flex flex-col h-full">
                    <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted mb-2 uppercase">Original Text</label>
                    <textarea value={text1} onChange={e=>setText1(e.target.value)} className="flex-1 border p-4 rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Paste original..."/>
                </div>
                <div className="flex flex-col h-full">
                    <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted mb-2 uppercase">Modified Text</label>
                    <textarea value={text2} onChange={e=>setText2(e.target.value)} className="flex-1 border p-4 rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Paste modified..."/>
                </div>
            </div>
        ) : (
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface border rounded-xl h-full overflow-auto shadow-lg shadow-slate-200/50 dark:shadow-none">
                <table className="w-full text-xs font-mono border-collapse">
                    <thead>
                        <tr className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] border-b text-muted dark:text-muted dark:text-muted dark:text-muted text-left">
                            <th className="p-2 w-10 text-center border-r">Ln</th>
                            <th className="p-2 w-[45%] border-r">Original</th>
                            <th className="p-2 w-[45%]">Modified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {diffs.map((d, i) => (
                            <tr key={i} className={`border-b ${d.type === 'diff' ? 'bg-orange-50/50' : 'hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617]'}`}>
                                <td className="p-2 text-center text-muted/70 border-r select-none">{d.line}</td>
                                <td className={`p-2 border-r whitespace-pre-wrap ${d.type === 'diff' ? 'bg-rose-100/50 text-rose-800' : 'text-muted dark:text-muted/70 dark:text-muted/70'}`}>{d.l1}</td>
                                <td className={`p-2 whitespace-pre-wrap ${d.type === 'diff' ? 'bg-emerald-100/50 text-emerald-800' : 'text-muted dark:text-muted/70 dark:text-muted/70'}`}>{d.l2}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}
