#!/bin/bash

echo "í³ Initializing OneTool Design System (ODS)..."

# 1. Create the Reusable UI Atoms (Buttons, Cards, Inputs)
# This ensures every button across the app looks identical.
mkdir -p app/components/ui

cat > app/components/ui/Button.tsx << 'BTN_EOF'
import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  children, variant = "primary", size = "md", isLoading, icon, className = "", ...props 
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow focus:ring-indigo-500",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-200",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
    ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={isLoading} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
BTN_EOF

cat > app/components/ui/Card.tsx << 'CARD_EOF'
import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
CARD_EOF

# 2. Create the "ToolShell" (The Master Layout)
# This enforces the "Same Layout" rule. Every tool page will use this.
mkdir -p app/components/layout
cat > app/components/layout/ToolShell.tsx << 'SHELL_EOF'
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
SHELL_EOF

echo "âœ… Design System Established."
echo "í±‰ We now have standard Buttons, Cards, and a ToolShell."
