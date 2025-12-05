"use client";
import React from 'react';
import { Split } from 'lucide-react';
export const DiffStudio = () => (
  <div className="grid grid-cols-2 gap-4 h-[60vh] p-4">
     <textarea className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 resize-none outline-none focus:ring-2 ring-red-500/20" placeholder="Original Text..."></textarea>
     <textarea className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 resize-none outline-none focus:ring-2 ring-green-500/20" placeholder="Modified Text..."></textarea>
  </div>
);