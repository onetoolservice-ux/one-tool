"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Save } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function SmartWord() {
  const [value, setValue] = useState("");
  
  const save = () => {
     const blob = new Blob([value], { type: "text/html" });
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = "document.html";
     a.click();
     showToast("Document Saved!", "success");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Smart Doc</h1>
            <p className="text-xs text-slate-500">Rich text editor.</p>
        </div>
        <Button onClick={save} className="text-xs h-9"><Save size={14} className="mr-2"/> Save HTML</Button>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
         <ReactQuill theme="snow" value={value} onChange={setValue} className="flex-1 h-full flex flex-col [&>.ql-container]:flex-1 [&>.ql-container]:border-none [&>.ql-toolbar]:border-none [&>.ql-toolbar]:border-b [&>.ql-toolbar]:border-slate-200 dark:[&>.ql-toolbar]:border-slate-700" />
      </div>
    </div>
  );
}
