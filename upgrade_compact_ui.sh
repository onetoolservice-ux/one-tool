#!/bin/bash

echo "í³‰ Optimizing UI for Density & Efficiency..."

# 1. UPDATE BUTTON COMPONENT (Smaller, Professional Defaults)
cat > app/components/ui/Button.tsx << 'BTN_EOF'
import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg"; // Added xs
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  children, variant = "primary", size = "md", isLoading, icon, className = "", ...props 
}: ButtonProps) {
  // More compact base styles
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow focus:ring-indigo-500",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-200",
    outline: "border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:ring-indigo-500",
    ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500"
  };

  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm", // Reduced padding
    lg: "px-5 py-2.5 text-base" // Reduced padding
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={isLoading} {...props}>
      {isLoading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
      {!isLoading && icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </button>
  );
}
BTN_EOF

# 2. UPDATE TOOL SHELL (Less Padding, More Focus)
cat > app/components/layout/ToolShell.tsx << 'SHELL_EOF'
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

interface ToolShellProps {
  title: string;
  description: string;
  category: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function ToolShell({ title, description, category, icon, children, actions }: ToolShellProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120]">
      {/* Compact Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>
      </div>

      {/* Content Area - Optimized Width */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           {children}
        </div>
      </main>
    </div>
  );
}
SHELL_EOF

# 3. BUILD SMART PDF MERGE (Functional Tool)
# Since we need actual tools, let's build the PDF Merger.
# Note: We need 'pdf-lib' for this to work.
npm install pdf-lib

mkdir -p app/tools/documents/pdf/merge
cat > app/tools/documents/pdf/merge/MergeClient.tsx << 'MERGE_EOF'
"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Upload, FileText, X, ArrowDown, Layers } from "lucide-react";

export default function MergeClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "onetool-merged.pdf";
      link.click();
    } catch (error) {
      alert("Error merging PDFs. Please try valid PDF files.");
    }
    
    setProcessing(false);
  };

  return (
    <ToolShell
      title="PDF Merge"
      description="Combine multiple PDF files into one document securely in your browser."
      category="Documents"
      icon={<Layers className="w-4 h-4 text-rose-500" />}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Upload Area */}
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50 group">
           <input 
             type="file" 
             multiple 
             accept="application/pdf"
             onChange={handleUpload}
             className="hidden" 
             id="pdf-upload"
           />
           <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Upload size={24} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Click to upload PDFs</p>
                <p className="text-xs text-slate-500">or drag and drop</p>
              </div>
           </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <Card className="divide-y divide-slate-100 dark:divide-slate-800">
            {files.map((file, i) => (
              <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg shrink-0">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                 </div>
                 <button onClick={() => removeFile(i)} className="p-1 text-slate-400 hover:text-rose-500 transition">
                   <X size={16} />
                 </button>
              </div>
            ))}
          </Card>
        )}

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={mergePDFs} 
            disabled={files.length < 2 || processing}
            isLoading={processing}
            size="lg"
            className="w-full sm:w-auto"
            icon={<ArrowDown size={18}/>}
          >
            {files.length < 2 ? "Select at least 2 files" : "Merge PDFs Now"}
          </Button>
        </div>

      </div>
    </ToolShell>
  );
}
MERGE_EOF

# 4. Create Server Page
cat > app/tools/documents/pdf/merge/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import MergeClient from "./MergeClient";
import ToolSchema from "@/app/components/seo/ToolSchema";

export const metadata: Metadata = {
  title: "Free PDF Merger - Combine PDF Files Online | One Tool",
  description: "Merge multiple PDF files into one document instantly. 100% free, secure, and private. No upload to server required.",
  keywords: ["pdf merge", "combine pdf", "join pdf", "free pdf tool"],
};

export default function PDFMergePage() {
  return (
    <>
      <ToolSchema 
        name="PDF Merge" 
        description="Secure client-side PDF merger tool."
        path="/tools/documents/pdf/merge"
        category="WebApplication"
      />
      <MergeClient />
    </>
  );
}
PAGE_EOF

echo "âœ… Compact UI & PDF Tool Built."
echo "í±‰ Run 'npm run dev' and check out the new clean look."
