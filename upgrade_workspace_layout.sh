#!/bin/bash

echo "ÌøóÔ∏è  Building Tool Workspace Architecture..."

# 1. CREATE SIDEBAR COMPONENT
# This reads your data and creates a navigation list for the current category.
mkdir -p app/components/layout
cat > app/components/layout/ToolSidebar.tsx << 'SIDEBAR_EOF'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { ChevronLeft, LayoutGrid, CheckCircle2 } from "lucide-react";
import { getTheme } from "@/app/lib/theme-config";
import React from "react";

interface ToolSidebarProps {
  category: string;
  currentToolId?: string;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

export default function ToolSidebar({ category, currentToolId, isOpen, setIsOpen }: ToolSidebarProps) {
  const pathname = usePathname();
  const theme = getTheme(category);
  
  // Get sibling tools
  const tools = ALL_TOOLS.filter(t => t.category === category);

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800
        transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-0 lg:translate-x-0"}
      `}>
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
             <div className={`p-1.5 rounded-lg text-white ${theme.iconBg}`}>
               <LayoutGrid size={16} />
             </div>
             <span className="font-bold text-slate-900 dark:text-white text-sm">{category}</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Tool List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
           {tools.map((tool) => {
             const isActive = tool.id === currentToolId || pathname === tool.href;
             
             // Clone icon to adjust size if needed, or use as is
             const Icon = tool.icon;
             
             return (
               <Link 
                 key={tool.id} 
                 href={tool.href || "#"}
                 className={`
                   flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                   ${isActive 
                     ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" 
                     : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"}
                 `}
               >
                 {/* Icon wrapper */}
                 <div className={`
                    flex items-center justify-center w-6 h-6 rounded-md transition-colors
                    ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-500"}
                 `}>
                    {/* Use cloneElement or render function if it's a valid element, else nothing */}
                    {React.isValidElement(Icon) ? React.cloneElement(Icon as React.ReactElement, { size: 16 }) : null}
                 </div>
                 
                 <span className="truncate">{tool.name}</span>
                 
                 {isActive && <CheckCircle2 size={14} className="ml-auto text-indigo-500" />}
               </Link>
             )
           })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
           <Link href="/" className="flex items-center justify-center w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              ‚Üê Back to Dashboard
           </Link>
        </div>

      </aside>
    </>
  );
}
SIDEBAR_EOF

# 2. UPDATE TOOLSHELL (To Support Sidebar Mode)
# We are modifying the shell to handle the grid layout and sidebar toggling.
cat > app/components/layout/ToolShell.tsx << 'SHELL_EOF'
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, Sidebar as SidebarIcon, Star } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import ToolSidebar from "./ToolSidebar";

interface ToolShellProps {
  title: string;
  description: string;
  category: string;
  toolId?: string; // NEW: Needed for highlighting in sidebar
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function ToolShell({ title, description, category, toolId, icon, children, actions }: ToolShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120] flex">
      
      {/* SIDEBAR COMPONENT */}
      <ToolSidebar 
        category={category} 
        currentToolId={toolId} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
      />

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? "lg:pl-64" : ""}`}>
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Left: Toggle & Title */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Toggle Sidebar"
              >
                {isSidebarOpen ? <ArrowLeft size={20} /> : <SidebarIcon size={20} />}
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
              
              <div className="flex items-center gap-3">
                {icon && <span className="text-slate-500 hidden sm:inline-flex">{icon}</span>}
                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {title}
                </h1>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {actions}
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
              <Button variant="ghost" size="sm" className="text-slate-400">
                <Star size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {description}
            </p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {children}
          </div>
        </main>

      </div>
    </div>
  );
}
SHELL_EOF

# 3. UPDATE CLIENTS TO PASS TOOL ID (Linking the System)

# 3a. Smart Budget
sed -i 's/icon={<Wallet/toolId="smart-budget" icon={<Wallet/g' app/tools/finance/smart-budget/BudgetClient.tsx

# 3b. Smart Loan
sed -i 's/icon={<Calculator/toolId="smart-loan" icon={<Calculator/g' app/tools/finance/smart-loan/LoanClient.tsx

# 3c. Smart Word
sed -i 's/icon={<FileText/toolId="smart-word" icon={<FileText/g' app/tools/documents/smart-word/WordClient.tsx

# 3d. Generic Client (Important for the 50+ other tools)
sed -i 's/icon={toolData.icon}/toolId={toolData.id} icon={toolData.icon}/g' app/tools/\[category\]/\[tool\]/ToolClient.tsx

echo "‚úÖ Workspace Layout Deployed."
echo "Ì±â Run 'npm run dev'. Open any tool. You now have a Sidebar!"
