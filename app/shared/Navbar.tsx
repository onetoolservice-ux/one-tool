"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function Navbar(){
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    function onDoc(e: MouseEvent){
      if(!ref.current) return;
      if(!(e.target instanceof Node)) return;
      if(!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return ()=> document.removeEventListener("click", onDoc);
  },[]);
  return (
    <header className="w-full bg-surface dark:bg-slate-800 dark:bg-surface border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"rgb(117,163,163)"}}>
            <span className="text-white font-bold">OT</span>
          </div>
          <div className="font-semibold">One Tool Solutions</div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium">Home</Link>

          <div className="relative" ref={ref}>
            <button onClick={()=>setOpen(o=>!o)} className="text-sm font-medium inline-flex items-center gap-2">
              Tools
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-surface dark:bg-slate-800 dark:bg-surface border rounded-lg  ooth p-4 z-50">
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/tools/finance" className="p-2 rounded hover:bg-gray-50">Finance</Link>
                  <Link href="/tools/health" className="p-2 rounded hover:bg-gray-50">Health</Link>
                  <Link href="/tools/documents" className="p-2 rounded hover:bg-gray-50">Documents</Link>
                  <Link href="/tools/converters" className="p-2 rounded hover:bg-gray-50">Converters</Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/ai" className="text-sm font-medium">AI</Link>
          <Link href="/learn" className="text-sm font-medium">Learn</Link>
          <Link href="/about" className="text-sm font-medium">About</Link>
        </nav>
      </div>
    </header>
  );
}
