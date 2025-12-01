#!/bin/bash

echo "í³ Upgrading Smart Word to React 19 compatible engine..."

# 1. Swap the libraries
# We remove the broken one and install the fixed fork
npm uninstall react-quill
npm install react-quill-new --legacy-peer-deps

# 2. Create the directory structure
mkdir -p app/tools/documents/smart-word

# 3. Create the Editor Client Component
cat > app/tools/documents/smart-word/WordClient.tsx << 'CLIENT_EOF'
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Download, Copy, Trash2, Check, FileText } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import to avoid "window is not defined" error during SSR
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function WordClient() {
  const [content, setContent] = useLocalStorage<string>("onetool_word_draft", "");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom Toolbar Options
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const handleCopy = () => {
    // Strip HTML for copy
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>OneTool Doc</title>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(content);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear your document?")) {
      setContent("");
    }
  };

  if (!mounted) return <div className="h-screen flex items-center justify-center">Loading Editor...</div>;

  return (
    <div className="space-y-6">
      {/* Toolbar Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <FileText size={18} className="text-blue-600" />
          <span className="hidden sm:inline">Auto-saved to browser storage</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
            title="Clear Document"
          >
            <Trash2 size={20} />
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy Text"}</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[600px]">
        <style>{`
          .ql-toolbar { border: none !important; border-bottom: 1px solid #e2e8f0 !important; background: #f8fafc; }
          .dark .ql-toolbar { border-bottom: 1px solid #334155 !important; background: #0f172a; color: white; }
          .ql-container { border: none !important; font-size: 1.1rem; }
          .ql-editor { min-height: 500px; padding: 2rem; }
          .dark .ql-stroke { stroke: #cbd5e1 !important; }
          .dark .ql-fill { fill: #cbd5e1 !important; }
          .dark .ql-picker { color: #cbd5e1 !important; }
        `}</style>
        <ReactQuill 
          theme="snow" 
          value={content} 
          onChange={setContent} 
          modules={modules}
          placeholder="Start typing your document here..."
          className="text-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  );
}
CLIENT_EOF

# 4. Create the Server Page (Metadata)
cat > app/tools/documents/smart-word/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import WordClient from "./WordClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Smart Word Editor - Online Rich Text & PDF Writer | One Tool",
  description: "A distraction-free online word processor that saves your work automatically. Export to PDF, copy as text, and format easily. No login required.",
  keywords: ["online word editor", "text editor", "free word processor", "write online", "note taking app"],
  alternates: {
    canonical: "https://onetool.co.in/tools/documents/smart-word",
  }
};

export default function SmartWordPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 min-h-screen">
      <ToolSchema 
        name="Smart Word" 
        description="Free online rich text editor with auto-save and PDF export capabilities."
        path="/tools/documents/smart-word"
        category="WebApplication"
      />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>/</span>
          <Link href="/tools/documents" className="hover:text-blue-600 transition">Documents</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white">Smart Word</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Smart <span className="text-blue-600">Word</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
          A secure, distraction-free writing environment. Your documents are stored locally in your browser.
        </p>
      </div>

      <WordClient />
    </div>
  );
}
PAGE_EOF

echo "âœ… Smart Word Fixed & Upgraded."
echo "í±‰ Run 'npm run dev' and try the editor again!"
