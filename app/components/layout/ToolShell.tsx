"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Star } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

interface ToolShellProps {
  title: string;
  description: string;
  category: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode; // For tool-specific buttons (Save, Reset, etc.)
}

export default function ToolShell({ title, description, category, icon, children, actions }: ToolShellProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120]">
      {/* 1. Standardized Header Area */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Breadcrumb & Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              {icon && <span className="text-slate-500 hidden sm:inline-flex">{icon}</span>}
              <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
                {title}
              </h1>
            </div>
            <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
              {category}
            </span>
          </div>

          {/* Right: Actions Toolbar */}
          <div className="flex items-center gap-2">
            {actions}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            <Button variant="ghost" size="sm" className="text-slate-400">
              <Star size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Standardized Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tool Description (Optional Context) */}
        <div className="mb-8 max-w-3xl">
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* The Actual Tool Interface */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {children}
        </div>

      </main>
    </div>
  );
}
