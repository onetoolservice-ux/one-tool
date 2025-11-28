"use client";
import React, { useState } from "react";
import { Database, Play } from "lucide-react";
import { format } from "sql-formatter";
import ToolHeader from "@/app/components/ui/ToolHeader";

export default function SqlFormatter() {
  const [input, setInput] = useState("SELECT * FROM users WHERE id=1");
  const [output, setOutput] = useState("");

  const handleFormat = () => {
    try {
      setOutput(format(input, { language: 'postgresql' }));
    } catch (e) { setOutput("Error formatting SQL"); }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 h-[calc(100vh-64px)] flex flex-col">
      <ToolHeader title="SQL Formatter" desc="Beautify SQL Queries" icon={<Database size={20}/>} />
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        <textarea 
          value={input} onChange={e=>setInput(e.target.value)} 
          className="p-4 font-mono text-sm bg-white border rounded-xl resize-none focus:border-indigo-500 outline-none"
          placeholder="Paste raw SQL here..."
        />
        <div className="relative bg-slate-900 rounded-xl overflow-hidden flex flex-col">
          <div className="absolute top-4 right-4">
            <button onClick={handleFormat} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition-colors">
              <Play size={14}/> Run Format
            </button>
          </div>
          <pre className="flex-1 p-4 font-mono text-sm text-blue-300 overflow-auto">
            {output || "// Formatted output will appear here"}
          </pre>
        </div>
      </div>
    </div>
  );
}
