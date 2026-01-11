#!/bin/bash

echo "í¶¶ Fixing Footer Component Build Error..."

# 1. Rewrite Footer.tsx cleanly
cat > app/shared/layout/Footer.tsx << 'TS_END'
"use client";

import Link from "next/link";
import { Github, Twitter, Mail, ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-20">
      <div className="w-full px-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">OT</div>
              <span className="font-bold text-slate-900 dark:text-white text-lg">One Tool</span>
           </div>
           <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
             The privacy-first digital command center. 50+ tools running 100% offline in your browser. No tracking, no servers, no ads.
           </p>
           <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-indigo-500 transition"><Github size={20}/></a>
              <a href="#" className="hover:text-indigo-500 transition"><Twitter size={20}/></a>
              <a href="#" className="hover:text-indigo-500 transition"><Mail size={20}/></a>
           </div>
        </div>

        {/* Links 1 */}
        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Platform</h3>
           <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/tools/finance" className="hover:text-indigo-500">Finance</Link></li>
              <li><Link href="/tools/developer" className="hover:text-indigo-500">Developer</Link></li>
              <li><Link href="/tools/documents" className="hover:text-indigo-500">Documents</Link></li>
           </ul>
        </div>

        {/* Links 2 */}
        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Company</h3>
           <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/about" className="hover:text-indigo-500">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-500">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-500">Terms of Service</Link></li>
              <li><a href="mailto:support@onetool.co" className="hover:text-indigo-500">Contact</a></li>
           </ul>
        </div>

        {/* Status */}
        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Status</h3>
           <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg w-fit">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Operational
           </div>
           <p className="text-xs text-slate-400 mt-4">
              v2.1.0 â€¢ Local Execution
           </p>
        </div>

      </div>
      
      <div className="w-full px-10 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 flex justify-between items-center">
         <p>&copy; {year} One Tool Inc.</p>
         <div className="flex items-center gap-1"><ShieldCheck size={14}/> Secure & Offline</div>
      </div>
    </footer>
  );
}
TS_END

# 2. Clean Cache
echo "í·¹ Clearing Cache..."
rm -rf .next

echo "âœ… Footer Fixed. Run 'npm run dev' to restart."
