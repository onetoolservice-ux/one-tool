#!/bin/bash

echo "í» ï¸ Activating Wave 9: Developer Utility Belt..."

# =========================================================
# 1. DEVELOPER: SMART ENTITIES
# =========================================================
echo "í´¡ Activating HTML Entities..."
cat > app/tools/developer/smart-entities/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { Code, ArrowRightLeft } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartEntities() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    const textarea = document.createElement("textarea");
    textarea.innerText = input;
    setOutput(textarea.innerHTML);
  };

  const decode = () => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = input;
    setOutput(textarea.value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">HTML Entities</h1>
        <p className="text-slate-500">Encode or Decode special characters.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 flex-1">
         <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} className="flex-1 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Type text here..."/>
         </div>
         <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Output</label>
            <textarea readOnly value={output} className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none font-mono text-sm text-blue-600 dark:text-blue-400" placeholder="Result appears here..."/>
         </div>
      </div>

      <div className="flex justify-center gap-4">
         <Button onClick={encode} className="w-32">Encode</Button>
         <div className="text-slate-300 flex items-center"><ArrowRightLeft/></div>
         <Button onClick={decode} variant="secondary" className="w-32">Decode</Button>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 2. DEVELOPER: SMART CSS
# =========================================================
echo "í¾¨ Activating Smart CSS..."
cat > app/tools/developer/smart-css/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { Copy } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartCSS() {
  const [h, setH] = useState(10);
  const [v, setV] = useState(10);
  const [blur, setBlur] = useState(20);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(0.2);

  const rgba = () => {
    const r = parseInt(color.substr(1,2), 16);
    const g = parseInt(color.substr(3,2), 16);
    const b = parseInt(color.substr(5,2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const css = `box-shadow: ${h}px ${v}px ${blur}px ${spread}px ${rgba()};`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">CSS Generator</h1>
        <p className="text-slate-500">Smooth Box Shadows.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
         <div className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            {[
                {l: "Horizontal", v: h, s: setH, min:-50, max:50},
                {l: "Vertical", v: v, s: setV, min:-50, max:50},
                {l: "Blur", v: blur, s: setBlur, min:0, max:100},
                {l: "Spread", v: spread, s: setSpread, min:-50, max:50},
                {l: "Opacity", v: opacity, s: setOpacity, min:0, max:1, step:0.01}
            ].map((c: any) => (
                <div key={c.l}>
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2"><span>{c.l}</span><span>{c.v}</span></div>
                    <input type="range" min={c.min} max={c.max} step={c.step || 1} value={c.v} onChange={e=>c.s(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
            ))}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Shadow Color</label>
                <div className="flex gap-2"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer"/><input type="text" value={color} onChange={e=>setColor(e.target.value)} className="flex-1 border rounded px-3 font-mono"/></div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="aspect-square rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 transition-all duration-200" style={{boxShadow: `${h}px ${v}px ${blur}px ${spread}px ${rgba()}`}}>
                <span className="font-bold text-slate-400">Preview</span>
            </div>
            <div className="relative group cursor-pointer" onClick={() => {navigator.clipboard.writeText(css); showToast("CSS Copied!");}}>
                <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm break-all border border-slate-700 hover:border-indigo-500 transition-colors">
                    {css}
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={16} /></div>
            </div>
         </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 3. DEVELOPER: SMART MINIFIER
# =========================================================
echo "í³‰ Activating Minifier..."
cat > app/tools/developer/smart-min/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import Button from "@/app/shared/ui/Button";

export default function SmartMinifier() {
  const [code, setCode] = useState("");
  const [minified, setMinified] = useState("");

  const minify = () => {
    // Simple regex minifier for JS/CSS
    let res = code
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([:;{}])\s*/g, '$1') // Remove space around symbols
        .replace(/;}/g, '}') // Remove last semicolon
        .trim();
    setMinified(res);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center"><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Code Minifier</h1><p className="text-slate-500">Simple JS/CSS compression.</p></div>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
         <textarea value={code} onChange={e=>setCode(e.target.value)} className="p-4 rounded-xl border bg-white dark:bg-slate-800 resize-none font-mono text-xs" placeholder="Paste Source Code..."/>
         <textarea readOnly value={minified} className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/50 resize-none font-mono text-xs text-indigo-600 dark:text-indigo-400" placeholder="Minified output..."/>
      </div>
      <div className="text-center"><Button onClick={minify} className="w-48">Minify</Button></div>
    </div>
  );
}
TS_END

# =========================================================
# 4. DEVELOPER: SMART STRING
# =========================================================
echo "í·µ Activating String Tools..."
cat > app/tools/developer/smart-string/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";

export default function SmartString() {
  const [text, setText] = useState("Hello One Tool");

  const stats = {
    chars: text.length,
    words: text.trim().split(/\s+/).filter(w=>w).length,
    lines: text.split(/\r\n|\r|\n/).length,
  };

  const tools = [
    { l: "Slugify", fn: () => setText(text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')) },
    { l: "Reverse", fn: () => setText(text.split("").reverse().join("")) },
    { l: "Trim Lines", fn: () => setText(text.split("\n").map(l=>l.trim()).join("\n")) },
    { l: "Uppercase", fn: () => setText(text.toUpperCase()) },
    { l: "Lowercase", fn: () => setText(text.toLowerCase()) },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center"><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">String Tools</h1></div>
      
      <div className="flex justify-center gap-4 text-sm font-bold text-slate-500">
         <span>{stats.chars} Chars</span> &bull; <span>{stats.words} Words</span> &bull; <span>{stats.lines} Lines</span>
      </div>

      <textarea value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none outline-none text-lg focus:ring-2 focus:ring-indigo-500/20" placeholder="Type something..." autoFocus />

      <div className="flex flex-wrap justify-center gap-2">
         {tools.map(t => <button key={t.l} onClick={t.fn} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-bold text-sm transition-colors border border-slate-200 dark:border-slate-700">{t.l}</button>)}
         <button onClick={() => setText("")} className="px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-lg font-bold text-sm">Clear</button>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 5. DEVELOPER: SMART CURL
# =========================================================
echo "í³Ÿ Activating Curl Builder..."
cat > app/tools/developer/smart-curl/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { Copy } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartCurl() {
  const [url, setUrl] = useState("https://api.example.com/data");
  const [method, setMethod] = useState("GET");
  const [header, setHeader] = useState("Authorization: Bearer token");
  const [body, setBody] = useState('{"key": "value"}');

  const curl = `curl -X ${method} "${url}" \\\n${header.split('\n').map(h => `  -H "${h}"`).join(' \\\n')} ${method !== 'GET' ? `\\\n  -d '${body}'` : ''}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center"><h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">cURL Builder</h1></div>

      <div className="grid md:grid-cols-3 gap-6">
         <div className="md:col-span-1 space-y-4">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Method</label>
               <select value={method} onChange={e=>setMethod(e.target.value)} className="w-full p-2 bg-white border rounded-lg"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">URL</label>
               <input value={url} onChange={e=>setUrl(e.target.value)} className="w-full p-2 bg-white border rounded-lg"/>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Headers (One per line)</label>
               <textarea value={header} onChange={e=>setHeader(e.target.value)} className="w-full h-24 p-2 bg-white border rounded-lg resize-none"/>
            </div>
            {method !== 'GET' && <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Body</label>
               <textarea value={body} onChange={e=>setBody(e.target.value)} className="w-full h-24 p-2 bg-white border rounded-lg resize-none"/>
            </div>}
         </div>

         <div className="md:col-span-2 bg-slate-900 rounded-2xl p-6 relative group">
            <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{curl}</pre>
            <Button onClick={() => {navigator.clipboard.writeText(curl); showToast("Copied!");}} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={16} className="mr-2"/> Copy</Button>
         </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 6. DEVELOPER: SMART META
# =========================================================
echo "í¿·ï¸ Activating Meta Tag Generator..."
cat > app/tools/developer/smart-meta/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartMeta() {
  const [title, setTitle] = useState("My Page Title");
  const [desc, setDesc] = useState("A description of my page.");
  const [image, setImage] = useState("https://example.com/image.jpg");

  const code = `
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${desc}">

<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">

<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${desc}">
<meta property="twitter:image" content="${image}">
  `.trim();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 h-[calc(100vh-100px)] flex flex-col">
       <div className="text-center"><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Meta Tag Generator</h1></div>
       
       <div className="grid grid-cols-2 gap-8 flex-1">
          <div className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
             <div><label className="font-bold text-sm block mb-1">Page Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded-lg"/></div>
             <div><label className="font-bold text-sm block mb-1">Description</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} className="w-full p-2 border rounded-lg h-24 resize-none"/></div>
             <div><label className="font-bold text-sm block mb-1">Image URL</label><input value={image} onChange={e=>setImage(e.target.value)} className="w-full p-2 border rounded-lg"/></div>
          </div>

          <div className="relative">
             <textarea readOnly value={code} className="w-full h-full p-6 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl resize-none focus:outline-none" />
             <Button onClick={() => {navigator.clipboard.writeText(code); showToast("HTML Copied!");}} className="absolute top-4 right-4">Copy HTML</Button>
          </div>
       </div>
    </div>
  );
}
TS_END

echo "âœ… Wave 9 Installed. Run 'npm run dev'!"
