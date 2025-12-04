#!/bin/bash

echo "í¿­ Factory Mode: Deploying 5 Developer Tools..."

# 1. Install lightweight logic libraries (Standard industry tools)
npm install sql-formatter uuid

# ==========================================
# TOOL 1: SMART SQL (Formatter)
# ==========================================
mkdir -p app/tools/developer/smart-sql
cat > app/tools/developer/smart-sql/SqlClient.tsx << 'SQL_EOF'
"use client";
import React, { useState } from "react";
import { format } from "sql-formatter";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Database, Copy, Check, Eraser } from "lucide-react";

export default function SqlClient() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    try {
      const formatted = format(input, { language: "sql", tabWidth: 2, keywordCase: "upper" });
      setInput(formatted);
    } catch (e) {
      alert("Invalid SQL");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell title="Smart SQL Formatter" description="Beautify and standardise your SQL queries instantly." category="Developer" icon={<Database className="w-5 h-5 text-blue-500" />}>
      <div className="grid gap-4">
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setInput("")} icon={<Eraser size={16}/>}>Clear</Button>
          <Button variant="primary" size="sm" onClick={handleFormat}>Format SQL</Button>
        </div>
        <Card className="relative overflow-hidden">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SELECT * FROM users WHERE id = 1..."
            className="w-full h-[400px] p-4 font-mono text-sm bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-200"
          />
          <button onClick={handleCopy} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-indigo-500 transition">
            {copied ? <Check size={16}/> : <Copy size={16}/>}
          </button>
        </Card>
      </div>
    </ToolShell>
  );
}
SQL_EOF

cat > app/tools/developer/smart-sql/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import SqlClient from "./SqlClient";
import ToolSchema from "@/app/components/seo/ToolSchema";

export const metadata: Metadata = { title: "Free SQL Formatter - Beautify SQL Online | One Tool" };
export default function Page() {
  return <><ToolSchema name="SQL Formatter" description="Format SQL queries online." path="/tools/developer/smart-sql" /><SqlClient /></>;
}
PAGE_EOF


# ==========================================
# TOOL 2: SMART JSON (Validator/Formatter)
# ==========================================
mkdir -p app/tools/documents/json/formatter
cat > app/tools/documents/json/formatter/JsonClient.tsx << 'JSON_EOF'
"use client";
import React, { useState } from "react";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Braces, Copy, Check, Minimize } from "lucide-react";

export default function JsonClient() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "valid" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setStatus("valid");
    } catch (e) { setStatus("error"); }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setStatus("valid");
    } catch (e) { setStatus("error"); }
  };

  return (
    <ToolShell title="JSON Formatter" description="Validate, format, and minify JSON data." category="Documents" icon={<Braces className="w-5 h-5 text-amber-500" />}>
      <div className="grid gap-4">
        <div className="flex gap-2 justify-between items-center">
          <span className={`text-xs font-bold px-2 py-1 rounded ${status === 'error' ? 'bg-red-100 text-red-600' : status === 'valid' ? 'bg-emerald-100 text-emerald-600' : 'opacity-0'}`}>
            {status === 'error' ? 'Invalid JSON' : 'Valid JSON'}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={minifyJson} icon={<Minimize size={16}/>}>Minify</Button>
            <Button variant="primary" size="sm" onClick={formatJson}>Beautify</Button>
          </div>
        </div>
        <Card className="relative">
          <textarea 
            value={input}
            onChange={(e) => { setInput(e.target.value); setStatus("idle"); }}
            placeholder='{"key": "value"}'
            className="w-full h-[400px] p-4 font-mono text-sm bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-200"
          />
          <button onClick={() => {navigator.clipboard.writeText(input); setCopied(true); setTimeout(()=>setCopied(false),2000)}} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-indigo-500 transition">
            {copied ? <Check size={16}/> : <Copy size={16}/>}
          </button>
        </Card>
      </div>
    </ToolShell>
  );
}
JSON_EOF

cat > app/tools/documents/json/formatter/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import JsonClient from "./JsonClient";
import ToolSchema from "@/app/components/seo/ToolSchema";

export const metadata: Metadata = { title: "JSON Formatter & Validator | One Tool" };
export default function Page() {
  return <><ToolSchema name="JSON Formatter" description="Validate and beautify JSON." path="/tools/documents/json/formatter" /><JsonClient /></>;
}
PAGE_EOF


# ==========================================
# TOOL 3: SMART BASE64 (Encode/Decode)
# ==========================================
mkdir -p app/tools/developer/smart-base64
cat > app/tools/developer/smart-base64/Base64Client.tsx << 'B64_EOF'
"use client";
import React, { useState } from "react";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Binary, ArrowDown, ArrowUp } from "lucide-react";

export default function Base64Client() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const handleEncode = () => setResult(btoa(text));
  const handleDecode = () => {
    try { setResult(atob(text)); } catch(e) { setResult("Invalid Base64 string"); }
  };

  return (
    <ToolShell title="Base64 Converter" description="Encode text to Base64 or decode Base64 strings." category="Developer" icon={<Binary className="w-5 h-5 text-indigo-500" />}>
      <div className="grid gap-6">
        <Card className="p-4">
          <label className="text-xs font-bold text-slate-500 mb-2 block">INPUT</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-32 bg-transparent outline-none resize-none" placeholder="Type here..." />
        </Card>
        <div className="flex gap-4 justify-center">
           <Button onClick={handleEncode} icon={<ArrowDown size={16}/>}>Encode</Button>
           <Button variant="secondary" onClick={handleDecode} icon={<ArrowUp size={16}/>}>Decode</Button>
        </div>
        <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
          <label className="text-xs font-bold text-slate-500 mb-2 block">OUTPUT</label>
          <textarea readOnly value={result} className="w-full h-32 bg-transparent outline-none resize-none font-mono text-slate-700 dark:text-slate-300" placeholder="Result..." />
        </Card>
      </div>
    </ToolShell>
  );
}
B64_EOF

cat > app/tools/developer/smart-base64/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import Base64Client from "./Base64Client";
import ToolSchema from "@/app/components/seo/ToolSchema";

export const metadata: Metadata = { title: "Base64 Encoder/Decoder | One Tool" };
export default function Page() {
  return <><ToolSchema name="Base64 Converter" description="Encode and decode Base64." path="/tools/developer/smart-base64" /><Base64Client /></>;
}
PAGE_EOF

# ==========================================
# TOOL 4: UUID GENERATOR
# ==========================================
mkdir -p app/tools/developer/smart-uuid
cat > app/tools/developer/smart-uuid/UuidClient.tsx << 'UUID_EOF'
"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Hash, Copy, RefreshCw } from "lucide-react";

export default function UuidClient() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => uuidv4());
    setUuids(newUuids);
  };

  return (
    <ToolShell title="UUID Generator" description="Generate random v4 UUIDs in bulk." category="Developer" icon={<Hash className="w-5 h-5 text-slate-500" />}>
      <div className="space-y-6">
         <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium">Quantity:</span>
            <input type="number" min="1" max="50" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-20 p-2 border rounded-lg bg-transparent" />
            <Button onClick={generate} icon={<RefreshCw size={16}/>}>Generate</Button>
         </div>
         
         {uuids.length > 0 && (
           <Card className="divide-y divide-slate-100 dark:divide-slate-800">
              {uuids.map((id, i) => (
                <div key={i} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                   <span className="font-mono text-slate-600 dark:text-slate-300">{id}</span>
                   <button onClick={() => navigator.clipboard.writeText(id)} className="text-slate-400 hover:text-indigo-500"><Copy size={16}/></button>
                </div>
              ))}
           </Card>
         )}
      </div>
    </ToolShell>
  );
}
UUID_EOF

cat > app/tools/developer/smart-uuid/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import UuidClient from "./UuidClient";
import ToolSchema from "@/app/components/seo/ToolSchema";

export const metadata: Metadata = { title: "UUID Generator | One Tool" };
export default function Page() {
  return <><ToolSchema name="UUID Generator" description="Bulk UUID v4 generator." path="/tools/developer/smart-uuid" /><UuidClient /></>;
}
PAGE_EOF

echo "âœ… Factory Run Complete: 4 New Tools Deployed!"
echo "í±‰ Run 'npm run dev' and check the Developer section."
