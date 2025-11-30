"use client";
import React, { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartLorem() {
  const [count, setCount] = useState(3);
  const [type, setType] = useState<"paragraphs" | "sentences">("paragraphs");
  const [text, setText] = useState("");

  const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  const generate = () => {
    let result = [];
    for(let i=0; i<count; i++) {
        if(type === 'paragraphs') result.push(LOREM);
        else result.push(LOREM.split('.')[0] + ".");
    }
    setText(result.join("\n\n"));
  };

  React.useEffect(generate, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
       <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">Lorem Ipsum</h1>
        <p className="text-muted">Generate placeholder text.</p>
      </div>

      <div className="flex gap-4 items-end bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
         <div className="flex-1 space-y-1">
            <label className="text-xs font-bold text-muted uppercase">Count</label>
            <input type="number" min="1" max="20" value={count} onChange={e=>setCount(Number(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"/>
         </div>
         <div className="flex-1 space-y-1">
            <label className="text-xs font-bold text-muted uppercase">Type</label>
            <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg">
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
            </select>
         </div>
         <Button onClick={generate} className="h-[42px]">Generate</Button>
      </div>

      <div className="relative group">
         <textarea readOnly value={text} className="w-full h-96 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none outline-none text-muted dark:text-slate-300 leading-relaxed" />
         <Button onClick={()=>{navigator.clipboard.writeText(text); showToast("Copied!");}} className="absolute top-4 right-4 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Copy size={16} className="mr-2"/> Copy
         </Button>
      </div>
    </div>
  );
}
