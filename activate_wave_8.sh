#!/bin/bash

echo "íº€ Activating Wave 8: Power Documents & Settings..."

# =========================================================
# 1. INSTALL DEPENDENCIES
# =========================================================
echo "í³¦ Installing OCR & Editor libraries..."
if [ -f "yarn.lock" ]; then
    yarn add tesseract.js react-quill
    yarn add -D @types/react-quill
else
    npm install tesseract.js react-quill
    npm install --save-dev @types/react-quill
fi

# =========================================================
# 2. DOCUMENTS: SMART OCR (Image to Text)
# =========================================================
echo "í±ï¸ Activating Smart OCR..."
cat > app/tools/documents/smart-ocr/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import Tesseract from 'tesseract.js';
import { Upload, FileText, Copy, Loader2, RefreshCw } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartOCR() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImage(url);
      setText("");
      setProgress(0);
    }
  };

  const processImage = () => {
    if (!image) return;
    setIsProcessing(true);
    Tesseract.recognize(
      image,
      'eng',
      { logger: m => {
          if(m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
      }}
    ).then(({ data: { text } }) => {
      setText(text);
      setIsProcessing(false);
      showToast("Text Extracted!", "success");
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Smart OCR</h1>
        <p className="text-slate-500">Extract text from images instantly.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 flex-1">
         {/* Image Input */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
            {!image ? (
                <div className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center relative hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer">
                    <Upload size={40} className="text-slate-400 mb-3" />
                    <span className="font-bold text-slate-600 dark:text-slate-300">Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
            ) : (
                <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 flex items-center justify-center">
                    <img src={image} alt="OCR Source" className="max-w-full max-h-full object-contain" />
                    <button onClick={() => { setImage(null); setText(""); }} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-rose-600 transition"><RefreshCw size={16}/></button>
                </div>
            )}
            <div className="mt-4">
               <Button onClick={processImage} disabled={!image || isProcessing} className="w-full py-3">
                  {isProcessing ? <><Loader2 size={18} className="animate-spin mr-2"/> Processing {progress}%</> : <><FileText size={18} className="mr-2"/> Extract Text</>}
               </Button>
            </div>
         </div>

         {/* Text Output */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
               <label className="text-xs font-bold text-slate-500 uppercase">Extracted Content</label>
               <button onClick={() => { navigator.clipboard.writeText(text); showToast("Copied!"); }} disabled={!text} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline disabled:opacity-50"><Copy size={14}/> Copy</button>
            </div>
            <textarea 
               value={text} 
               readOnly 
               className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none font-mono text-sm leading-relaxed"
               placeholder="Text will appear here..."
            />
         </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 3. DOCUMENTS: SMART EXCEL (Viewer)
# =========================================================
echo "í³Š Activating Smart Excel..."
cat > app/tools/documents/smart-excel/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

export default function SmartExcel() {
  const [data, setData] = useState<any[]>([]);
  const [cols, setCols] = useState<string[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const wb = XLSX.read(event.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (json.length > 0) {
           setCols(json[0] as string[]);
           setData(json.slice(1) as any[]);
        }
      };
      reader.readAsBinaryString(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Smart Excel</h1>
            <p className="text-xs text-slate-500">View CSV and Excel files instantly.</p>
        </div>
        <div className="relative">
            <input type="file" accept=".csv, .xlsx, .xls" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 transition"><Upload size={14}/> Open File</button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm relative">
         {data.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                 <FileSpreadsheet size={48} className="mb-4 opacity-50"/>
                 <p className="font-medium">No spreadsheet loaded</p>
             </div>
         ) : (
             <div className="overflow-auto h-full">
                 <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                        <tr>
                            {cols.map((c, i) => (
                                <th key={i} className="p-3 border-b border-r border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap min-w-[150px]">{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-blue-50 dark:hover:bg-slate-800/50">
                                {row.map((cell: any, j: number) => (
                                    <td key={j} className="p-3 border-b border-r border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
         )}
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 4. DOCUMENTS: SMART WORD (Simple Editor)
# =========================================================
echo "í³ Activating Smart Word..."
cat > app/tools/documents/smart-word/page.tsx << 'TS_END'
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
TS_END

# =========================================================
# 5. GLOBAL SETTINGS (Data Management)
# =========================================================
echo "âš™ï¸ Activating Settings Page..."
cat > app/settings/page.tsx << 'TS_END'
"use client";
import React from "react";
import { Trash2, Download, Database, Moon, Sun, Laptop } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SettingsPage() {
  const clearData = () => {
    if(confirm("Are you sure? This will wipe all your saved Budget, Loan, and Net Worth data.")) {
        localStorage.clear();
        showToast("All data cleared.", "success");
        setTimeout(() => window.location.reload(), 1000);
    }
  };

  const exportData = () => {
     const data = JSON.stringify(localStorage);
     const blob = new Blob([data], {type: "application/json"});
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = "onetool-backup.json";
     a.click();
     showToast("Backup downloaded.", "success");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-10">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your preferences and data.</p>
      </div>

      {/* Data Management */}
      <section className="space-y-4">
         <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Database size={16}/> Data Management</h2>
         <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
               <div>
                  <div className="font-bold text-slate-900 dark:text-white">Export All Data</div>
                  <div className="text-sm text-slate-500">Download a JSON backup of your local storage.</div>
               </div>
               <Button onClick={exportData} variant="secondary" className="text-sm"><Download size={16} className="mr-2"/> Export</Button>
            </div>
            <div className="p-6 flex items-center justify-between bg-rose-50/30 dark:bg-rose-900/10">
               <div>
                  <div className="font-bold text-rose-700 dark:text-rose-400">Clear Everything</div>
                  <div className="text-sm text-rose-600/70 dark:text-rose-500/70">Permanently remove all locally saved data.</div>
               </div>
               <Button onClick={clearData} className="bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 shadow-none text-sm"><Trash2 size={16} className="mr-2"/> Clear Data</Button>
            </div>
         </div>
      </section>
      
      {/* Info */}
      <div className="text-center text-xs text-slate-400 pt-10">
         <p>OneTool v2.0.0 â€¢ 100% Offline â€¢ Privacy First</p>
      </div>
    </div>
  );
}
TS_END

echo "âœ… Wave 8 Complete. All Systems Go."
