"use client";
import React, { useState } from "react";
import { format } from "sql-formatter";
import { Database, Copy } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartSQL() {
  const [sql, setSql] = useState("SELECT * FROM users WHERE id=1");
  const [formatted, setFormatted] = useState("");

  const handleFormat = () => {
    try {
      setFormatted(format(sql, { language: "sql", tabWidth: 2, keywordCase: "upper" }));
    } catch (e) {
      setFormatted("Error formatting SQL");
    }
  };

  React.useEffect(handleFormat, [sql]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
       <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">SQL Formatter</h1>
      </div>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
         <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Raw SQL</label>
            <textarea value={sql} onChange={e=>setSql(e.target.value)} className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none font-mono text-sm" placeholder="SELECT * FROM..."/>
         </div>
         <div className="flex flex-col gap-2 relative">
            <label className="text-xs font-bold text-slate-500 uppercase">Prettified</label>
            <textarea readOnly value={formatted} className="flex-1 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 resize-none font-mono text-sm text-indigo-900 dark:text-indigo-200 outline-none"/>
            <Button onClick={()=>{navigator.clipboard.writeText(formatted); showToast("SQL Copied!");}} className="absolute top-8 right-4 text-xs py-1 px-3 h-8">Copy</Button>
         </div>
      </div>
    </div>
  );
}
