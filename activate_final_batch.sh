#!/bin/bash

echo "íº€ Activating Final Batch: AI, PDFs, and Advanced Finance..."

# =========================================================
# 1. INSTALL PDF LIBS (Required for Merger)
# =========================================================
echo "í³¦ Installing PDF libraries..."
if [ -f "yarn.lock" ]; then
    yarn add pdf-lib file-saver
    yarn add -D @types/file-saver
else
    npm install pdf-lib file-saver
    npm install --save-dev @types/file-saver
fi

# =========================================================
# 2. FINANCE: SMART RETIREMENT (FIRE CALC)
# =========================================================
echo "í²° Activating FIRE Calculator..."
cat > app/tools/finance/smart-retirement/page.tsx << 'TS_END'
"use client";
import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export default function FireCalc() {
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(55);
  const [current, setCurrent] = useState(1000000);
  const [monthly, setMonthly] = useState(50000);
  const [expense, setExpense] = useState(40000);
  const [roi, setRoi] = useState(10);

  const data = useMemo(() => {
    const result = [];
    let balance = current;
    const years = 90 - age; // Plan until 90
    
    for (let i = 0; i <= years; i++) {
      const year = age + i;
      const isRetired = year >= retireAge;
      if (!isRetired) {
         balance = (balance + (monthly * 12)) * (1 + roi/100);
      } else {
         balance = (balance * (1 + (roi-3)/100)) - (expense * 12); 
      }
      if (balance < 0) balance = 0;
      result.push({ year, balance: Math.round(balance) });
    }
    return result;
  }, [age, retireAge, current, monthly, expense, roi]);

  const freedomNum = expense * 12 * 25; 
  const canRetire = data.find(d => d.year === retireAge)?.balance || 0;
  const status = canRetire > freedomNum ? "Safe" : "At Risk";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">FIRE Projection</h1>
        <p className="text-slate-500">Financial Independence, Retire Early.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6 h-fit">
            <div><label className="text-xs font-bold uppercase text-slate-500">Current Age: {age}</label><input type="range" min="18" max="70" value={age} onChange={e=>setAge(Number(e.target.value))} className="w-full accent-indigo-600"/></div>
            <div><label className="text-xs font-bold uppercase text-slate-500">Retire At: {retireAge}</label><input type="range" min="40" max="80" value={retireAge} onChange={e=>setRetireAge(Number(e.target.value))} className="w-full accent-emerald-600"/></div>
            
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-xs font-bold text-slate-500">Savings</label><input type="number" value={current} onChange={e=>setCurrent(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
               <div><label className="text-xs font-bold text-slate-500">Return %</label><input type="number" value={roi} onChange={e=>setRoi(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
            </div>
            <div><label className="text-xs font-bold text-slate-500">Monthly Invest</label><input type="number" value={monthly} onChange={e=>setMonthly(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
            <div><label className="text-xs font-bold text-slate-500">Monthly Expense</label><input type="number" value={expense} onChange={e=>setExpense(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
         </div>

         <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
               <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <div className="text-xs uppercase font-bold text-indigo-500">Freedom Number</div>
                  <div className="text-xl font-black text-indigo-900 dark:text-white">â‚¹{(freedomNum/10000000).toFixed(2)} Cr</div>
               </div>
               <div className={`p-4 rounded-xl border ${status === 'Safe' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  <div className="text-xs uppercase font-bold">Plan Status</div>
                  <div className="text-xl font-black">{status}</div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                     <defs>
                        <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                     <XAxis dataKey="year" />
                     <YAxis tickFormatter={(v) => `â‚¹${v/100000}L`} />
                     <Tooltip contentStyle={{borderRadius: '12px'}} formatter={(v: any) => `â‚¹${v.toLocaleString()}`}/>
                     <Area type="monotone" dataKey="balance" stroke="#4F46E5" fillOpacity={1} fill="url(#colorBal)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}
TS_END

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
import { Upload, Image as ImageIcon, X } from "lucide-react";
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
        <p className="text-slate-500">Convert JPG/PNG images into a PDF.</p>
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
                    <div key={i} className="relative p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg text-center">
                        <div className="text-xs truncate">{f.name}</div>
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
    } catch (e) { setIsInvalid(true); }
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center"><h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">JWT Debugger</h1></div>
      <div className="grid md:grid-cols-2 gap-6 flex-1">
        <textarea value={token} onChange={e => setToken(e.target.value)} className={`flex-1 p-4 rounded-xl border ${isInvalid ? 'border-rose-500' : 'border-slate-200'} bg-white dark:bg-slate-800 resize-none font-mono text-xs outline-none`} placeholder="Paste JWT..." />
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
import Button from "@/app/shared/ui/Button";

export default function JsonToTs() {
  const [json, setJson] = useState("");
  const [ts, setTs] = useState("");

  const convert = () => {
    try {
        const obj = JSON.parse(json);
        const generateType = (o: any, name = "Root") => {
            let out = `interface ${name} {\n`;
            for (const key in o) {
                out += `  ${key}: ${typeof o[key]};\n`;
            }
            out += "}";
            return out;
        };
        setTs(generateType(obj));
    } catch(e) { setTs("Invalid JSON"); }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center"><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">JSON to TS</h1></div>
      <div className="grid grid-cols-2 gap-4 flex-1">
         <textarea value={json} onChange={e=>setJson(e.target.value)} className="p-4 rounded-xl border bg-white dark:bg-slate-800 resize-none font-mono text-xs" placeholder='{"id": 1}'/>
         <textarea readOnly value={ts} className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/50 resize-none font-mono text-xs text-blue-600 dark:text-blue-400" placeholder="interface Root..."/>
      </div>
      <div className="text-center"><Button onClick={convert} className="w-48">Convert</Button></div>
    </div>
  );
}
TS_END

# =========================================================
# 6. AI: SMART CHAT
# =========================================================
echo "í²¬ Activating Smart Chat..."
cat > app/ai/page.tsx << 'TS_END'
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

export default function SmartChat() {
  const [messages, setMessages] = useState([{ role: "ai", content: "Hello! I am OneTool AI. How can I help?" }]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setTimeout(() => {
       let reply = "I'm a demo bot. I can't browse the web, but I can help you use OneTool.";
       if (input.toLowerCase().includes("finance")) reply = "Check out Smart Budget in the Finance section.";
       setMessages(prev => [...prev, { role: "ai", content: reply }]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3"><Sparkles className="text-indigo-600"/><h2 className="font-bold text-sm">OneTool Assistant</h2></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
           {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200'}`}>{m.role === 'ai' ? <Bot size={18}/> : <User size={18}/>}</div>
                 <div className={`p-4 rounded-2xl text-sm ${m.role === 'ai' ? 'bg-slate-50 dark:bg-slate-900' : 'bg-indigo-600 text-white'}`}>{m.content}</div>
              </div>
           ))}
        </div>
        <div className="p-4 border-t bg-white dark:bg-slate-800"><form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative"><input value={input} onChange={e => setInput(e.target.value)} className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-slate-900 border rounded-xl outline-none" placeholder="Type a message..."/><button type="submit" disabled={!input} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg"><Send size={18} /></button></form></div>
      </div>
    </div>
  );
}
TS_END

echo "âœ… Final Batch Activated. Run 'npm run dev'!"
