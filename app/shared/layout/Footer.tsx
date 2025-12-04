"use client";
import Link from "next/link";
import { Github, Twitter, ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="w-full px-8 py-6 md:flex md:items-center md:justify-between text-sm">
        
        <div className="flex flex-col md:flex-row items-center gap-6 text-slate-600 dark:text-slate-400">
           <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">OT</div>
              <span>One Tool</span>
           </div>
           <span className="hidden md:inline opacity-50">|</span>
           <span>&copy; {year} One Tool Inc.</span>
           <span className="hidden md:inline opacity-50">|</span>
           <div className="flex gap-6 font-medium">
              <Link href="/privacy" className="hover:text-indigo-600 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-indigo-600 transition">Terms</Link>
              <a href="mailto:support@onetool.co" className="hover:text-indigo-600 transition">Contact</a>
           </div>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-6 justify-center">
           <div className="flex items-center gap-2 bg-[#638c80]/10 dark:bg-emerald-900/20 text-[#4a6b61] dark:text-[#638c80] px-3 py-1 rounded-full font-bold text-xs border border-[#638c80]/20 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 bg-[#638c80] rounded-full animate-pulse"></span>
              System Normal
           </div>
           
           <div className="flex gap-4 text-slate-500 dark:text-slate-400">
              {/* FIX: Added aria-labels */}
              <a href="#" className="hover:text-indigo-600 transition" aria-label="Visit GitHub Profile"><Github size={16}/></a>
              <a href="#" className="hover:text-indigo-600 transition" aria-label="Visit Twitter Profile"><Twitter size={16}/></a>
           </div>
        </div>

      </div>
    </footer>
  );
}
