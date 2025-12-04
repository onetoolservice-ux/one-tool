"use client";
import React, { useEffect, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
}

export const CodeEditor = ({ language, value, onChange, readOnly = false }: CodeEditorProps) => {
  const [theme, setTheme] = useState<"vs-dark" | "light">("light");

  // Auto-detect system/app theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "vs-dark" : "light");
    
    // Listen for theme changes (optional polish)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === 'attributes' && m.attributeName === 'class') {
           const newIsDark = document.documentElement.classList.contains("dark");
           setTheme(newIsDark ? "vs-dark" : "light");
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e1e1e]">
       <Editor
         height="100%"
         language={language}
         value={value}
         theme={theme}
         onChange={onChange}
         options={{
           readOnly: readOnly,
           minimap: { enabled: false },
           fontSize: 14,
           lineNumbers: "on",
           scrollBeyondLastLine: false,
           automaticLayout: true,
           padding: { top: 16 },
           fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
         }}
         loading={<div className="flex items-center justify-center h-full text-slate-400 gap-2"><Loader2 className="animate-spin" /> Loading Editor...</div>}
       />
    </div>
  );
};
