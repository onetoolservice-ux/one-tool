cat > activate_wave_4.sh << 'EOF'
#!/bin/bash

echo "🔐 Activating Wave 4: Crypto, Code & Design..."

# =========================================================
# 1. INSTALL DEPENDENCIES
# =========================================================
echo "📦 Installing crypto & formatting libs..."
if [ -f "yarn.lock" ]; then
    yarn add crypto-js sql-formatter
    yarn add -D @types/crypto-js
else
    npm install crypto-js sql-formatter
    npm install --save-dev @types/crypto-js
fi

# =========================================================
# 2. DEVELOPER: SMART HASH
# =========================================================
echo "🛡️ Activating Smart Hash..."
cat > app/tools/developer/smart-hash/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import CryptoJS from "crypto-js";
import { Copy } from "lucide-react";
import { showToast } from "@/app/shared/Toast";

export default function SmartHash() {
  const [text, setText] = useState("OneTool");

  const hashes = [
    { label: "MD5", val: CryptoJS.MD5(text).toString() },
    { label: "SHA-1", val: CryptoJS.SHA1(text).toString() },
    { label: "SHA-256", val: CryptoJS.SHA256(text).toString() },
    { label: "SHA-512", val: CryptoJS.SHA512(text).toString() },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Hash Generator</h1>
        <p className="text-slate-500">Generate cryptographic hashes instantly.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          className="w-full p-4 text-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50" 
          placeholder="Enter text to hash..."
          autoFocus 
        />
      </div>

      <div className="grid gap-4">
        {hashes.map((h) => (
          <div key={h.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-4 group hover:border-indigo-500 transition-colors">
             <div className="w-24 font-bold text-slate-500 uppercase text-xs tracking-wider">{h.label}</div>
             <div className="flex-1 font-mono text-sm text-slate-800 dark:text-slate-200 break-all">{h.val}</div>
             <button 
               onClick={() => { navigator.clipboard.writeText(h.val); showToast(h.label + " Copied!"); }} 
               className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
             >
               <Copy size={18} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 3. DEVELOPER: SMART BASE64
# =========================================================
echo "🧬 Activating Base64..."
cat > app/tools/developer/smart-base64/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { ArrowDownUp } from "lucide-react";

export default function SmartBase64() {
  const [text, setText] = useState("");
  const [base64, setBase64] = useState("");

  const handleText = (v: string) => {
    setText(v);
    try { setBase64(btoa(v)); } catch(e) { setBase64("Invalid Input"); }
  };

  const handleBase64 = (v: string) => {
    setBase64(v);
    try { setText(atob(v)); } catch(e) { setText("Invalid Base64"); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Base64 Encoder</h1>
      </div>

      <div className="flex-1 grid md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
           <label className="text-xs font-bold text-slate-500 uppercase">Plain Text</label>
           <textarea 
             value={text} 
             onChange={(e) => handleText(e.target.value)} 
             className="flex-1 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
             placeholder="Type text here..." 
           />
        </div>
        
        <div className="hidden md:flex items-center justify-center text-slate-300">
           <ArrowDownUp />
        </div>

        <div className="flex flex-col gap-2">
           <label className="text-xs font-bold text-slate-500 uppercase">Base64 Output</label>
           <textarea 
             value={base64} 
             onChange={(e) => handleBase64(e.target.value)} 
             className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none font-mono text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
             placeholder="Base64 appears here..." 
           />
        </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 4. DEVELOPER: SMART URL
# =========================================================
echo "🔗 Activating URL Parser..."
cat > app/tools/developer/smart-url/page.tsx << 'TS_END'
"use client";
import React, { useState, useMemo } from "react";
import { Link as LinkIcon } from "lucide-react";

export default function SmartURL() {
  const [url, setUrl] = useState("https://onetool.co/search?q=developer&sort=asc");

  const parsed = useMemo(() => {
    try {
      const u = new URL(url);
      const params: Record<string, string> = {};
      u.searchParams.forEach((v, k) => { params[k] = v; });
      
      return {
        valid: true,
        protocol: u.protocol,
        host: u.hostname,
        path: u.pathname,
        params
      };
    } catch (e) {
      return { valid: false };
    }
  }, [url]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">URL Parser</h1>
        <p className="text-slate-500">Analyze URL parameters and structure.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Input URL</label>
         <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={url} onChange={e => setUrl(e.target.value)} className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
         </div>
      </div>

      {parsed.valid ? (
        <div className="grid gap-6">
           <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center">
                 <div className="text-xs font-bold text-emerald-600 uppercase">Protocol</div>
                 <div className="font-mono font-bold text-emerald-800 dark:text-emerald-300">{parsed.protocol}</div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                 <div className="text-xs font-bold text-blue-600 uppercase">Host</div>
                 <div className="font-mono font-bold text-blue-800 dark:text-blue-300 truncate">{parsed.host}</div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 text-center">
                 <div className="text-xs font-bold text-amber-600 uppercase">Path</div>
                 <div className="font-mono font-bold text-amber-800 dark:text-amber-300 truncate">{parsed.path}</div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-600 dark:text-slate-300">
                 Query Parameters
              </div>
              {Object.keys(parsed.params || {}).length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <tbody>
                        {Object.entries(parsed.params || {}).map(([k, v]) => (
                            <tr key={k} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <td className="p-4 font-bold text-slate-700 dark:text-slate-300 w-1/3 border-r border-slate-100 dark:border-slate-800">{k}</td>
                                <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400">{v}</td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
              ) : (
                  <div className="p-8 text-center text-slate-400 italic">No parameters found.</div>
              )}
           </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-center font-bold">Invalid URL format</div>
      )}
    </div>
  );
}
TS_END

# =========================================================
# 5. DEVELOPER: SMART SQL
# =========================================================
echo "💾 Activating SQL Formatter..."
cat > app/tools/developer/smart-sql/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { format } from "sql-formatter";
import { Database, Copy } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartSQL() {
  const [sql, setSql] = useState("SELECT * FROM users WHERE id=1");
  const [formatted, setFormatted] = useState("");

  const handleFormat = () => {
    try {
      setFormatted(format(sql, { language: "sql", tabWidth: 2, keywordCase: "upper" }));
    } catch (e) {
      setFormatted("Error formatting SQL");
    }
  };

  React.useEffect(handleFormat, [sql]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
       <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">SQL Formatter</h1>
      </div>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
         <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Raw SQL</label>
            <textarea value={sql} onChange={e=>setSql(e.target.value)} className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none font-mono text-sm" placeholder="SELECT * FROM..."/>
         </div>
         <div className="flex flex-col gap-2 relative">
            <label className="text-xs font-bold text-slate-500 uppercase">Prettified</label>
            <textarea readOnly value={formatted} className="flex-1 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 resize-none font-mono text-sm text-indigo-900 dark:text-indigo-200 outline-none"/>
            <Button onClick={()=>{navigator.clipboard.writeText(formatted); showToast("SQL Copied!");}} className="absolute top-8 right-4 text-xs py-1 px-3 h-8">Copy</Button>
         </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 6. DESIGN: CONTRAST CHECKER
# =========================================================
echo "🎨 Activating Contrast Checker..."
cat > app/tools/design/contrast/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function ContrastChecker() {
  const [fg, setFg] = useState("#FFFFFF");
  const [bg, setBg] = useState("#4F46E5"); // Indigo-600

  // Simple luminance calc
  const getLum = (hex: string) => {
    const rgb = parseInt(hex.substring(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = ((rgb >> 0) & 0xff) / 255;
    const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const ratio = (getLum(fg) + 0.05) / (getLum(bg) + 0.05);
  const score = ratio < 1 ? 1 / ratio : ratio;
  const rating = score.toFixed(2);
  const isAA = score >= 4.5;
  const isAAA = score >= 7;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Contrast Checker</h1>
        <p className="text-slate-500">Check WCAG accessibility scores.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
         {/* Controls */}
         <div className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Text Color</label>
               <div className="flex gap-3 items-center">
                  <input type="color" value={fg} onChange={e=>setFg(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                  <input type="text" value={fg} onChange={e=>setFg(e.target.value)} className="w-24 p-2 font-mono border rounded-lg bg-transparent" />
               </div>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Background</label>
               <div className="flex gap-3 items-center">
                  <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                  <input type="text" value={bg} onChange={e=>setBg(e.target.value)} className="w-24 p-2 font-mono border rounded-lg bg-transparent" />
               </div>
            </div>
         </div>

         {/* Preview */}
         <div className="md:col-span-2 space-y-6">
            <div className="h-40 rounded-2xl flex flex-col items-center justify-center shadow-inner transition-colors duration-300" style={{ backgroundColor: bg, color: fg }}>
               <h2 className="text-3xl font-bold">Good Design is Accessible</h2>
               <p className="mt-2 opacity-90">This is how your text looks.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl text-center">
                  <div className="text-xs font-bold text-slate-500 uppercase">Contrast Ratio</div>
                  <div className="text-4xl font-black text-slate-800 dark:text-slate-200">{rating}</div>
               </div>
               <div className={`p-4 rounded-xl text-center border-2 ${isAA ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                  <div className="text-xs font-bold uppercase mb-1">AA Normal</div>
                  <div className="flex items-center justify-center gap-2 font-bold text-xl">{isAA ? <><CheckCircle2/> Pass</> : <><XCircle/> Fail</>}</div>
               </div>
               <div className={`p-4 rounded-xl text-center border-2 ${isAAA ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                  <div className="text-xs font-bold uppercase mb-1">AAA Strict</div>
                  <div className="flex items-center justify-center gap-2 font-bold text-xl">{isAAA ? <><CheckCircle2/> Pass</> : <><XCircle/> Fail</>}</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 7. CONVERTER: PNG TO JPG
# =========================================================
echo "🖼️ Activating PNG Converter..."
cat > app/tools/converters/png-to-jpg/page.tsx << 'TS_END'
"use client";
import React, { useState, useRef } from "react";
import { Upload, Download, FileImage } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function PngToJpg() {
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
         setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = new Image();
    if (image && canvas && ctx) {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        // Fill white background for JPG (handling transparent PNGs)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement("a");
        link.download = "converted-image.jpg";
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.click();
      };
      img.src = image;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-8">
       <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">PNG to JPG</h1>
        <p className="text-slate-500">Convert transparent PNGs to high-quality JPGs.</p>
      </div>

      {!image ? (
        <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl h-64 flex flex-col items-center justify-center relative hover:bg-slate-50 dark:hover:bg-slate-900/50 transition cursor-pointer">
           <Upload size={48} className="text-slate-300 mb-4"/>
           <span className="font-bold text-slate-600 dark:text-slate-400">Upload PNG</span>
           <input type="file" accept="image/png" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm" />
           <div className="flex gap-4">
              <Button onClick={download} className="flex-1 py-3"><Download size={18} className="mr-2"/> Download JPG</Button>
              <Button variant="secondary" onClick={()=>setImage(null)}>Cancel</Button>
           </div>
           <canvas ref={canvasRef} className="hidden"/>
        </div>
      )}
    </div>
  );
}
TS_END

echo "✅ Wave 4 Installed. Run 'npm run dev'!"
EOF
