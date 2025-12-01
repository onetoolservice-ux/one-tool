"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import ToolShell from "@/app/components/layout/ToolShell";
import RelatedTools from "@/app/components/tools/RelatedTools";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

interface ToolClientProps {
  params: {
    tool: string;
    category: string;
  };
}

export default function ToolClient({ params }: ToolClientProps) {
  const { tool } = params;
  const toolData = ALL_TOOLS.find((t) => t.id === tool);

  // Fallback if tool not found in data
  if (!toolData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-slate-50 dark:bg-[#0B1120]">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Tool Not Found</h2>
        <Link href="/">
          <Button>Go Back Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <ToolShell 
      title={toolData.name}
      description={toolData.desc + " Secure, client-side processing. No data leaves your device."}
      category={toolData.category}
      icon={toolData.icon}
      actions={
        <Button variant="ghost" size="sm" disabled>
          Ver: 1.0.0
        </Button>
      }
    >
      {/* Placeholder Interface for Unbuilt Tools */}
      <div className="grid gap-8">
        <Card className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
           <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full mb-6 animate-pulse">
             <Wrench size={48} className="text-slate-300 dark:text-slate-600" />
           </div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
             {toolData.name} is Ready to Build
           </h3>
           <p className="text-slate-500 max-w-md mb-8">
             This tool is part of the Enterprise Suite. The interface is being initialized. 
             Check back soon or use the search (Ctrl+K) to find other tools.
           </p>
           <div className="flex gap-4">
             <Link href="/">
               <Button variant="secondary">Back to Dashboard</Button>
             </Link>
             <Button disabled>Launch Tool</Button>
           </div>
        </Card>

        {/* Recommendation Engine */}
        <RelatedTools currentToolId={toolData.id} category={toolData.category} />
      </div>
    </ToolShell>
  );
}
