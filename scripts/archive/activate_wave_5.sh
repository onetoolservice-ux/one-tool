#!/bin/bash

echo "íº€ Activating Wave 5: Advanced PDF & Dev Tools..."

# =========================================================
# 1. INSTALL PDF LIBRARY
# =========================================================
echo "í³¦ Installing pdf-lib..."
if [ -f "yarn.lock" ]; then
    yarn add pdf-lib file-saver
    yarn add -D @types/file-saver
else
    npm install pdf-lib file-saver
    npm install --save-dev @types/file-saver
fi

# =========================================================
# 2. DOCUMENTS: PDF MERGER
# =========================================================
echo "í³‘ Activating PDF Merger..."
cat > app/tools/documents/pdf/merge/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, FileText, Download, X } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const remove = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const merge = async () => {
    if (files.length < 2) return showToast("Select at least 2 PDFs", "error");
    try {
      const mergedPdf = await PDFDocument.create(); 
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "onetool-merged.pdf";
      link.click();
      showToast("PDFs Merged Successfully!", "success");
    } catch (err) {
      showToast("Failed to merge PDFs", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">PDF Merger</h1>
        <p className="text-slate-500">Combine multiple PDF documents into one.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-6">
         <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
            <Upload size={40} className="mx-auto text-slate-400 mb-3" />
            <span className="font-bold text-slate-600 dark:text-slate-300">Click to Select PDFs</span>
            <input type="file" accept=".pdf" multiple onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
         </div>

         {files.length > 0 && (
             <div className="space-y-2">
                {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded text-red-600"><FileText size={18}/></div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.name}</span>
                        </div>
                        <button onClick={() => remove(i)} className="text-slate-400 hover:text-rose-500"><X size={18}/></button>
                    </div>
                ))}
             </div>
         )}

         <Button onClick={merge} disabled={files.length < 2} className="w-full py-3"><Download size={18} className="mr-2"/> Merge & Download</Button>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 3. DOCUMENTS: IMAGE TO PDF
# =========================================================
echo "í¶¼ï¸ Activating Image to PDF..."
cat > app/tools/converters/image-to-pdf/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, Download, Image as ImageIcon, X } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function ImageToPdf() {
  const [images, setImages] = useState<File[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages([...images, ...Array.from(e.target.files)]);
  };

  const convert = async () => {
    if (images.length === 0) return;
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of images) {
        const imageBytes = await file.arrayBuffer();
        let image;
        if (file.type === 'image/jpeg') image = await pdfDoc.embedJpg(imageBytes);
        else if (file.type === 'image/png') image = await pdfDoc.embedPng(imageBytes);
        
        if (image) {
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "images.pdf";
      link.click();
      showToast("Converted Successfully!", "success");
    } catch (e) {
        showToast("Only JPG/PNG supported", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Image to PDF</h1>
        <p className="text-slate-500">Convert JPG/PNG images into a single PDF document.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
         <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-center">
            <ImageIcon size={40} className="mx-auto text-slate-400 mb-3" />
            <span className="font-bold text-slate-600 dark:text-slate-300">Upload Images</span>
            <input type="file" accept="image/png, image/jpeg" multiple onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
         </div>

         {images.length > 0 && (
             <div className="grid grid-cols-3 gap-4">
                {images.map((f, i) => (
                    <div key={i} className="relative p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg">
                        <div className="text-xs truncate text-center">{f.name}</div>
                        <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1"><X size={12}/></button>
                    </div>
                ))}
             </div>
         )}
         <Button onClick={convert} disabled={images.length === 0} className="w-full py-3">Convert to PDF</Button>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 4. DEVELOPER: JWT DECODER
# =========================================================
echo "í´“ Activating JWT Decoder..."
cat > app/tools/developer/smart-jwt/page.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import { Lock, Unlock } from "lucide-react";

export default function SmartJWT() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState({});
  const [payload, setPayload] = useState({});
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    if (!token) { setHeader({}); setPayload({}); return; }
    try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error();
        const decode = (str: string) => JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
        setHeader(decode(parts[0]));
        setPayload(decode(parts[1]));
        setIsInvalid(false);
    } catch (e) {
        setIsInvalid(true);
    }
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">JWT Debugger</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6 flex-1">
        <div className="flex flex-col gap-2">
           <label className="text-xs font-bold text-slate-500 uppercase">Encoded Token</label>
           <textarea value={token} onChange={e => setToken(e.target.value)} className={`flex-1 p-4 rounded-xl border ${isInvalid ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'} bg-white dark:bg-slate-800 resize-none font-mono text-xs leading-relaxed outline-none focus:ring-4 transition`} placeholder="Paste JWT here..." />
        </div>

        <div className="flex flex-col gap-4">
           <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-auto">
              <div className="text-xs font-bold text-rose-500 uppercase mb-2">Header</div>
              <pre className="text-xs font-mono text-slate-700 dark:text-slate-300">{JSON.stringify(header, null, 2)}</pre>
           </div>
           <div className="flex-[2] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-auto">
              <div className="text-xs font-bold text-emerald-500 uppercase mb-2">Payload</div>
              <pre className="text-xs font-mono text-slate-700 dark:text-slate-300">{JSON.stringify(payload, null, 2)}</pre>
           </div>
        </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 5. DEVELOPER: JSON TO TS
# =========================================================
echo "í³œ Activating JSON to TS..."
cat > app/tools/developer/smart-json2ts/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { FileJson, ArrowRight, FileCode } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function JsonToTs() {
  const [json, setJson] = useState("");
  const [ts, setTs] = useState("");

  const convert = () => {
    try {
        const obj = JSON.parse(json);
        const generateType = (o: any, name = "Root") => {
            let out = `interface ${name} {\n`;
            for (const key in o) {
                const type = typeof o[key];
                if (Array.isArray(o[key])) {
                    const subType = o[key].length > 0 ? typeof o[key][0] : "any";
                    out += `  ${key}: ${subType}[];\n`;
                } else if (type === 'object' && o[key] !== null) {
                     // Simplified nested for demo
                     out += `  ${key}: object;\n`; 
                } else {
                    out += `  ${key}: ${type};\n`;
                }
            }
            out += "}";
            return out;
        };
        setTs(generateType(obj));
    } catch(e) {
        setTs("Invalid JSON");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">JSON to TypeScript</h1>
      </div>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
         <div className="flex flex-col gap-2">
             <label className="text-xs font-bold text-slate-500 uppercase">JSON Input</label>
             <textarea value={json} onChange={e=>setJson(e.target.value)} className="flex-1 p-4 rounded-xl border bg-white dark:bg-slate-800 resize-none font-mono text-xs" placeholder='{"id": 1, "name": "Tool"}'/>
         </div>
         <div className="flex flex-col gap-2">
             <label className="text-xs font-bold text-slate-500 uppercase">TypeScript Interface</label>
             <textarea readOnly value={ts} className="flex-1 p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/50 resize-none font-mono text-xs text-blue-600 dark:text-blue-400" placeholder="interface Root {...}"/>
         </div>
      </div>
      <div className="text-center">
         <Button onClick={convert} className="w-48">Convert</Button>
      </div>
    </div>
  );
}
TS_END

echo "âœ… Wave 5 Logic Injected!"
