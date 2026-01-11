"use client";
import React, { useState } from 'react';
import { Eye, Code, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Textarea, Button, CopyButton } from '@/app/components/shared';

export const MarkdownStudio = () => {
  const [text, setText] = useState("# Hello World\n\nStart writing **markdown** here...\n\n- Item 1\n- Item 2");

  const download = () => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='document.md'; a.click();
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
       {/* EDITOR */}
       <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><Code size={14}/> MARKDOWN EDITOR</span>
             <div className="flex gap-2">
                <CopyButton
                  text={text}
                  variant="button"
                  size="sm"
                  successMessage="Markdown copied to clipboard"
                  className="text-xs"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={download}
                  icon={<Download size={12} />}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Save
                </Button>
             </div>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 p-6 bg-slate-50 dark:bg-slate-950 resize-none font-mono text-sm leading-relaxed border-0"
            spellCheck={false}
          />
       </div>

       {/* PREVIEW */}
       <div className="w-1/2 flex flex-col bg-white dark:bg-slate-900">
          <div className="h-12 border-b flex items-center px-4">
             <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><Eye size={14}/> LIVE PREVIEW</span>
          </div>
          <div className="flex-1 p-8 overflow-y-auto prose dark:prose-invert max-w-none prose-sm">
             <ReactMarkdown>{text}</ReactMarkdown>
          </div>
       </div>
    </div>
  );
};