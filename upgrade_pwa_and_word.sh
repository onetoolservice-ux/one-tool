#!/bin/bash

echo "í³² Initializing PWA Engine & Refactoring Smart Word..."

# 1. REFACTOR SMART WORD (Apply Design System)
# We keep the logic but wrap the UI in ToolShell
cat > app/tools/documents/smart-word/WordClient.tsx << 'WORD_EOF'
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Download, Copy, Trash2, Check, FileText, Printer } from "lucide-react";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function WordClient() {
  const [content, setContent] = useLocalStorage<string>("onetool_word_draft", "");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      printWindow.document.write('</head><body>');
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

  if (!mounted) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Editor...</div>;

  return (
    <ToolShell
      title="Smart Word"
      description="Distraction-free rich text editor. Your documents are auto-saved to your browser instantly."
      category="Documents"
      icon={<FileText className="w-5 h-5 text-blue-500" />}
      actions={
        <div className="flex gap-2">
           <Button variant="secondary" size="sm" onClick={handleCopy} icon={copied ? <Check size={16}/> : <Copy size={16}/>}>
             {copied ? "Copied" : "Copy"}
           </Button>
           <Button variant="primary" size="sm" onClick={handlePrint} icon={<Printer size={16}/>}>
             Print / PDF
           </Button>
        </div>
      }
    >
      <Card className="overflow-hidden min-h-[70vh] flex flex-col">
        <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 p-2 flex justify-end">
           <Button variant="ghost" size="sm" onClick={handleClear} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
             <Trash2 size={16} className="mr-2"/> Clear Page
           </Button>
        </div>
        
        <div className="flex-1 bg-white dark:bg-slate-900">
          <style>{`
            .ql-toolbar { border: none !important; border-bottom: 1px solid #e2e8f0 !important; background: transparent; padding: 12px !important; }
            .dark .ql-toolbar { border-bottom: 1px solid #1e293b !important; }
            .ql-container { border: none !important; font-size: 16px; font-family: inherit; }
            .ql-editor { padding: 32px; min-height: 60vh; color: inherit; }
            .dark .ql-stroke { stroke: #94a3b8 !important; }
            .dark .ql-fill { fill: #94a3b8 !important; }
            .dark .ql-picker { color: #94a3b8 !important; }
            .dark .ql-picker-options { background-color: #1e293b !important; border-color: #334155 !important; }
          `}</style>
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent} 
            modules={modules}
            placeholder="Start typing your ideas..."
            className="h-full"
          />
        </div>
      </Card>
    </ToolShell>
  );
}
WORD_EOF

# 2. GENERATE PWA MANIFEST
# This file tells browsers "I am an installable app"
mkdir -p public
cat > public/manifest.json << 'MANIFEST_EOF'
{
  "name": "One Tool Enterprise",
  "short_name": "OneTool",
  "description": "The all-in-one privacy-first utility suite for professionals.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
MANIFEST_EOF

# 3. CONNECT MANIFEST TO LAYOUT
# We need to add the manifest link to the head
LAYOUT_FILE="app/layout.tsx"
if ! grep -q "manifest.json" "$LAYOUT_FILE"; then
  # Add manifest link inside the metadata export or inject a link tag
  # Since metadata object is cleaner, we'll assume it's handled by Next.js automatically if manifest.json exists in public
  # BUT we should explicitely link it for better support
  sed -i '/<head>/a \        <link rel="manifest" href="/manifest.json" />' "$LAYOUT_FILE" || echo "âš ï¸  Could not auto-inject manifest link. Next.js 15 might handle this via metadata object."
fi

# 4. UPDATE METADATA FOR PWA
# We will append the manifest to the metadata export in layout.tsx if possible, 
# but a safer bet for this script is to instruct you to check it.

echo "âœ… Smart Word Refactored & PWA Manifest Created."
echo "í±‰ Run 'npm run dev' to verify Smart Word."
echo "í±‰ To test PWA: Open Chrome DevTools -> Application -> Manifest. You should see your app details."
