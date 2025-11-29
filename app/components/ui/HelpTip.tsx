"use client";
import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface Props {
  content: string;
  title?: string;
}

export default function HelpTip({ content, title }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1 group">
      <button 
        onClick={(e) => { e.preventDefault(); setShow(!show); }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-slate-300 hover:text-indigo-500 transition cursor-help focus:outline-none"
        aria-label="More Info"
      >
        <HelpCircle size={14} />
      </button>

      {/* Tooltip */}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-xl shadow-xl dark:shadow-none dark:border dark:border-slate-600 z-50 transition-all duration-200 origin-bottom ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        {title && <div className="font-bold text-slate-200 mb-1 border-b border-slate-700 pb-1">{title}</div>}
        <div className="leading-relaxed opacity-90">{content}</div>
        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
      </div>
    </div>
  );
}
