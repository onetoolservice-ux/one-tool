#!/bin/bash

echo "🚀 Injecting Pro Features (Loan Calc & Image Converter)..."

# Create directories
mkdir -p app/tools/finance/loan-emi
mkdir -p app/tools/documents/image/converter

# ---------------------------------------------------------
# 1. LOAN / EMI CALCULATOR (app/tools/finance/loan-emi/page.tsx)
# ---------------------------------------------------------
cat > app/tools/finance/loan-emi/page.tsx << 'EOF'
"use client";

import React, { useState, useMemo } from "react";
import { Calculator, DollarSign, Calendar, Percent, PieChart, ArrowRight } from "lucide-react";

export default function LoanCalculator() {
  const [amount, setAmount] = useState(50000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(5);

  const results = useMemo(() => {
    const principal = Number(amount);
    const r = Number(rate) / 12 / 100;
    const n = Number(years) * 12;
    
    if (principal <= 0 || r <= 0 || n <= 0) return { emi: 0, total: 0, interest: 0 };

    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - principal;

    return {
      emi: Math.round(emi),
      total: Math.round(totalPayment),
      interest: Math.round(totalInterest)
    };
  }, [amount, rate, years]);

  // Chart sizing
  const total = results.total || 1;
  const pPercent = (amount / total) * 100;
  const iPercent = 100 - pPercent;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex p-3 bg-teal-50 text-teal-600 rounded-2xl mb-4">
          <Calculator size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Loan Planner</h1>
        <p className="text-slate-500 mt-2">Calculate EMIs for Home, Car, or Personal loans.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          
          <div>
            <label className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span>Loan Amount</span>
              <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded">{amount.toLocaleString()}</span>
            </label>
            <input 
              type="range" min="1000" max="1000000" step="1000" 
              value={amount} onChange={e => setAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[rgb(117,163,163)]"
            />
            <div className="mt-4 relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:border-teal-500 outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span>Interest Rate (%)</span>
              <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded">{rate}%</span>
            </label>
            <input 
              type="range" min="1" max="30" step="0.1" 
              value={rate} onChange={e => setRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[rgb(117,163,163)]"
            />
            <div className="mt-4 relative">
              <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:border-teal-500 outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span>Tenure (Years)</span>
              <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded">{years} Yr</span>
            </label>
            <input 
              type="range" min="1" max="30" step="1" 
              value={years} onChange={e => setYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[rgb(117,163,163)]"
            />
            <div className="mt-4 flex gap-2">
              {[1, 5, 10, 15, 20, 25, 30].map(y => (
                <button key={y} onClick={() => setYears(y)} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${years === y ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Result Section */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Monthly EMI Card */}
          <div className="bg-[rgb(117,163,163)] text-white p-8 rounded-3xl shadow-lg shadow-teal-900/10 text-center">
            <div className="text-teal-100 text-sm font-bold uppercase tracking-widest mb-2">Monthly EMI</div>
            <div className="text-5xl font-bold tracking-tight">${results.emi.toLocaleString()}</div>
            <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4 text-left">
              <div>
                <div className="text-teal-100 text-xs">Total Interest</div>
                <div className="text-xl font-semibold">${results.interest.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-teal-100 text-xs">Total Amount</div>
                <div className="text-xl font-semibold">${results.total.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><PieChart size={18}/> Breakdown</h3>
            
            <div className="relative h-4 rounded-full w-full flex overflow-hidden mb-6">
              <div style={{ width: `${pPercent}%` }} className="bg-emerald-400 h-full" />
              <div style={{ width: `${iPercent}%` }} className="bg-rose-400 h-full" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" /> Principal
                </div>
                <span className="font-bold text-slate-800">{Math.round(pPercent)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-3 h-3 rounded-full bg-rose-400" /> Interest
                </div>
                <span className="font-bold text-slate-800">{Math.round(iPercent)}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
EOF

# ---------------------------------------------------------
# 2. IMAGE CONVERTER (app/tools/documents/image/converter/page.tsx)
# ---------------------------------------------------------
cat > app/tools/documents/image/converter/page.tsx << 'EOF'
"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, RefreshCw, Download, Upload, X, CheckCircle } from "lucide-react";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("image/jpeg");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setConvertedUrl(null);
    }
  };

  const convertImage = () => {
    if (!file) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // If converting to JPG, fill background white (transparent PNGs turn black otherwise)
          if (format === "image/jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL(format, 0.9);
          setConvertedUrl(dataUrl);
          setIsProcessing(false);
        }
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const getExt = () => format.split("/")[1];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
          <RefreshCw size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Image Converter</h1>
        <p className="text-slate-500 mt-2">Convert WEBP to PNG, PNG to JPG, and more. Zero server upload.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          {!file ? (
            <label className="cursor-pointer flex flex-col items-center group">
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                <Upload size={32} />
              </div>
              <span className="font-semibold text-slate-700">Upload Image</span>
              <span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP supported</span>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase text-slate-400">Original</span>
                <button onClick={() => { setFile(null); setConvertedUrl(null); }} className="p-1 hover:bg-slate-100 rounded-full"><X size={16}/></button>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden p-4 border border-slate-100 relative">
                <img src={URL.createObjectURL(file)} alt="Original" className="max-h-60 object-contain" />
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Convert To</label>
                  <div className="flex gap-2">
                    {["jpeg", "png", "webp"].map(f => (
                      <button 
                        key={f} 
                        onClick={() => setFormat(`image/${f}`)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${format === `image/${f}` ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={convertImage} disabled={isProcessing} className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all">
                  {isProcessing ? "Converting..." : "Convert Now"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Output Card */}
        <div className={`bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] transition-all ${convertedUrl ? 'opacity-100' : 'opacity-50 grayscale'}`}>
          {!convertedUrl ? (
            <div className="text-center text-slate-300">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>Converted image will appear here</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase text-emerald-500 flex items-center gap-1"><CheckCircle size={14}/> Ready</span>
              </div>
              <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden p-4 border border-slate-100">
                <img src={convertedUrl} alt="Converted" className="max-h-60 object-contain" />
              </div>
              <div className="mt-6">
                <a href={convertedUrl} download={`converted.${getExt()}`} className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200">
                  <Download size={18} /> Download {getExt().toUpperCase()}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}
EOF

# 3. UPDATE DOCUMENT DASHBOARD (To Link Converter)
cat > app/tools/documents/page.tsx << 'EOF'
import Link from "next/link";
import { FileText, Layers, Image, Braces, FileType, ArrowRight, RefreshCw } from "lucide-react";

const CATEGORIES = [
  {
    title: "PDF Tools",
    desc: "Merge, split, and modify PDF documents securely.",
    icon: <Layers size={24} />,
    color: "text-rose-600",
    bg: "bg-rose-50",
    tools: [
      { name: "Merge PDFs", href: "/tools/documents/pdf/merge" },
      { name: "Split PDF", href: "#", tag: "Soon" }
    ]
  },
  {
    title: "JSON Tools",
    desc: "Format, validate, and minify JSON data.",
    icon: <Braces size={24} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    tools: [
      { name: "JSON Formatter", href: "/tools/documents/json/formatter" },
      { name: "JSON to CSV", href: "#", tag: "Soon" }
    ]
  },
  {
    title: "Image Tools",
    desc: "Compress, resize and convert images locally.",
    icon: <Image size={24} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    tools: [
      { name: "Compressor", href: "/tools/documents/image/compressor" },
      { name: "Converter", href: "/tools/documents/image/converter" }
    ]
  }
];

export default function DocumentsHub() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-[rgb(117,163,163)]/10 text-[rgb(117,163,163)] rounded-2xl mb-4">
          <FileType size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Document Studio</h1>
        <p className="text-lg text-slate-500 mt-3 max-w-2xl mx-auto">
          A suite of private, client-side tools. Your files never leave your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
            <div className="p-6 border-b border-slate-100">
              <div className={`w-12 h-12 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center mb-4`}>
                {cat.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-800">{cat.title}</h2>
              <p className="text-sm text-slate-500 mt-2">{cat.desc}</p>
            </div>
            <div className="p-4 bg-slate-50/50">
              <div className="space-y-2">
                {cat.tools.map((tool) => (
                  <Link key={tool.name} href={tool.href} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${tool.tag ? 'opacity-60 cursor-not-allowed' : 'bg-white hover:bg-[rgb(117,163,163)]/5 hover:border-[rgb(117,163,163)]/20 border border-transparent'}`}>
                    <span className="text-sm font-medium text-slate-700">{tool.name}</span>
                    {tool.tag ? (
                      <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-500 px-2 py-0.5 rounded">{tool.tag}</span>
                    ) : (
                      <ArrowRight size={16} className="text-slate-400" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

echo "✅ Pro Features Injected (Loan Calc & Image Converter)."