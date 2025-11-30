#!/bin/bash

echo "í·‚ï¸ Organizing Tools into Smart Sections..."

# =========================================================
# 1. UPDATE DATA (Add Subcategories)
# =========================================================
echo "í²¾ Upgrading Database with Subcategories..."
cat > app/lib/tools-data.tsx << 'TS_END'
import { 
  Wallet, FileText, Heart, Zap, Palette, Terminal, 
  LayoutGrid, Calculator, Activity, TrendingUp, PiggyBank,
  ShieldCheck, Lock, Search, Wifi, Key, Globe, Database, 
  FileCode, Type, Ruler, Move, Image as ImageIcon, 
  Minimize, FileJson, Clock, Quote, Fingerprint, 
  ArrowRightLeft, FileStack, Scissors, Crop, 
  Dumbbell, Gamepad2, Flower2, ScanLine, Table, 
  Server, Hash, GitBranch, Code, List, Link, CheckSquare,
  LucideIcon
} from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  category: "finance" | "developer" | "documents" | "health" | "design" | "productivity";
  subcategory: string; // NEW FIELD
  status: "Live" | "New" | "Beta";
}

export const ALL_TOOLS: Tool[] = [
  // --- FINANCE ---
  { id: "smart-budget", title: "Smart Budget", desc: "Enterprise G/L & Personal Tracker.", icon: Wallet, href: "/tools/finance/smart-budget", category: "finance", subcategory: "Management", status: "Live" },
  { id: "smart-net-worth", title: "Net Worth", desc: "Asset & Liability Tracker.", icon: PiggyBank, href: "/tools/finance/smart-net-worth", category: "finance", subcategory: "Management", status: "Live" },
  { id: "smart-loan", title: "Smart Loan", desc: "Amortization & Payoff visualizer.", icon: Calculator, href: "/tools/finance/smart-loan", category: "finance", subcategory: "Calculators", status: "Live" },
  { id: "smart-debt", title: "Smart Debt", desc: "Avalanche vs Snowball calculator.", icon: Activity, href: "/tools/finance/smart-debt", category: "finance", subcategory: "Calculators", status: "Live" },
  { id: "smart-sip", title: "Smart SIP", desc: "Wealth builder projection.", icon: TrendingUp, href: "/tools/finance/smart-sip", category: "finance", subcategory: "Planning", status: "Live" },
  { id: "smart-retirement", title: "FIRE Calc", desc: "Retirement planning.", icon: TrendingUp, href: "/tools/finance/smart-retirement", category: "finance", subcategory: "Planning", status: "Live" },
  
  // --- DEVELOPER ---
  // Security
  { id: "smart-hash", title: "Hash Gen", desc: "MD5, SHA-1 crypto.", icon: Fingerprint, href: "/tools/developer/smart-hash", category: "developer", subcategory: "Security", status: "Live" },
  { id: "smart-pass", title: "Pass Gen", desc: "Secure random passwords.", icon: Key, href: "/tools/developer/smart-pass", category: "developer", subcategory: "Security", status: "Live" },
  { id: "smart-jwt", title: "JWT Decoder", desc: "Debug JWT tokens.", icon: ShieldCheck, href: "/tools/developer/smart-jwt", category: "developer", subcategory: "Security", status: "Live" },
  
  // Code & Data
  { id: "smart-json2ts", title: "JSON to TS", desc: "Generate TypeScript interfaces.", icon: FileCode, href: "/tools/developer/smart-json2ts", category: "developer", subcategory: "Code & Data", status: "Live" },
  { id: "smart-sql", title: "SQL Formatter", desc: "Prettify SQL queries.", icon: Database, href: "/tools/developer/smart-sql", category: "developer", subcategory: "Code & Data", status: "Live" },
  { id: "smart-regex", title: "Regex Tester", desc: "Real-time pattern matching.", icon: Search, href: "/tools/developer/smart-regex", category: "developer", subcategory: "Code & Data", status: "Live" },
  { id: "smart-min", title: "Minifier", desc: "Shrink JS/CSS code.", icon: Minimize, href: "/tools/developer/smart-min", category: "developer", subcategory: "Code & Data", status: "Live" },
  { id: "smart-diff", title: "Text Diff", desc: "Compare two text blocks.", icon: FileCode, href: "/tools/developer/smart-diff", category: "developer", subcategory: "Code & Data", status: "Live" },
  { id: "smart-base64", title: "Base64", desc: "Encode/Decode strings.", icon: FileCode, href: "/tools/developer/smart-base64", category: "developer", subcategory: "Code & Data", status: "Live" },

  // Web & Network
  { id: "smart-url", title: "URL Parser", desc: "Analyze parameters.", icon: Link, href: "/tools/developer/smart-url", category: "developer", subcategory: "Web & Network", status: "Live" },
  { id: "smart-http", title: "HTTP Status", desc: "Code reference guide.", icon: Server, href: "/tools/developer/smart-http", category: "developer", subcategory: "Web & Network", status: "Live" },
  { id: "smart-ports", title: "Port Ref", desc: "Common server ports.", icon: Server, href: "/tools/developer/smart-ports", category: "developer", subcategory: "Web & Network", status: "Live" },
  { id: "smart-ua", title: "User Agent", desc: "Browser string parser.", icon: Globe, href: "/tools/developer/smart-ua", category: "developer", subcategory: "Web & Network", status: "Live" },
  { id: "smart-wifi", title: "WiFi QR", desc: "Share network access.", icon: Wifi, href: "/tools/developer/wifi", category: "developer", subcategory: "Web & Network", status: "Live" },
  { id: "smart-curl", title: "Curl Builder", desc: "API Request helper.", icon: Terminal, href: "/tools/developer/smart-curl", category: "developer", subcategory: "Web & Network", status: "Live" },
  { id: "smart-meta", title: "Meta Tags", desc: "SEO tag generator.", icon: FileCode, href: "/tools/developer/smart-meta", category: "developer", subcategory: "Web & Network", status: "Live" },
  { id: "smart-entities", title: "HTML Entities", desc: "Character codes.", icon: Code, href: "/tools/developer/smart-entities", category: "developer", subcategory: "Web & Network", status: "Live" },
  { id: "smart-css", title: "CSS Tools", desc: "Generators & Helpers.", icon: Palette, href: "/tools/developer/smart-css", category: "developer", subcategory: "Web & Network", status: "Live" },

  // Utilities
  { id: "smart-uuid", title: "UUID Gen", desc: "Unique ID v4.", icon: Fingerprint, href: "/tools/developer/smart-uuid", category: "developer", subcategory: "Utilities", status: "Live" },
  { id: "smart-cron", title: "Cron Gen", desc: "Schedule expression builder.", icon: Clock, href: "/tools/developer/smart-cron", category: "developer", subcategory: "Utilities", status: "Live" },
  { id: "timestamp", title: "Timestamp", desc: "Unix time converter.", icon: Clock, href: "/tools/developer/timestamp", category: "developer", subcategory: "Utilities", status: "Live" },
  { id: "smart-chmod", title: "Chmod Calc", desc: "Unix permission generator.", icon: Lock, href: "/tools/developer/smart-chmod", category: "developer", subcategory: "Utilities", status: "Live" },
  { id: "smart-git", title: "Git Cheats", desc: "Common commands reference.", icon: GitBranch, href: "/tools/developer/smart-git", category: "developer", subcategory: "Utilities", status: "Live" },
  { id: "smart-string", title: "String Tools", desc: "Text manipulation.", icon: Type, href: "/tools/developer/smart-string", category: "developer", subcategory: "Utilities", status: "Live" },
  { id: "smart-lorem", title: "Lorem Ipsum", desc: "Dummy text generator.", icon: Quote, href: "/tools/developer/smart-lorem", category: "developer", subcategory: "Utilities", status: "Live" },

  // --- DOCUMENTS ---
  // PDF
  { id: "pdf-merge", title: "PDF Merger", desc: "Combine multiple PDFs.", icon: FileStack, href: "/tools/documents/pdf/merge", category: "documents", subcategory: "PDF Tools", status: "Live" },
  { id: "pdf-split", title: "PDF Split", desc: "Extract pages from PDF.", icon: Scissors, href: "/tools/documents/pdf/split", category: "documents", subcategory: "PDF Tools", status: "Live" },
  { id: "image-pdf", title: "Img to PDF", desc: "Convert JPG/PNG to PDF.", icon: FileText, href: "/tools/converters/image-to-pdf", category: "documents", subcategory: "PDF Tools", status: "Live" },
  { id: "pdf-word", title: "PDF to Word", desc: "Convert PDF to Doc.", icon: FileText, href: "/tools/converters/pdf-to-word", category: "documents", subcategory: "PDF Tools", status: "Live" },
  
  // Image
  { id: "smart-ocr", title: "Smart OCR", desc: "Extract text from images.", icon: ScanLine, href: "/tools/documents/smart-ocr", category: "documents", subcategory: "Image Tools", status: "Live" },
  { id: "image-resize", title: "Img Resizer", desc: "Pixel-perfect resizing.", icon: Move, href: "/tools/documents/image/resizer", category: "documents", subcategory: "Image Tools", status: "Live" },
  { id: "image-compress", title: "Compressor", desc: "Shrink image size.", icon: Minimize, href: "/tools/documents/image/compressor", category: "documents", subcategory: "Image Tools", status: "Live" },
  { id: "png-jpg", title: "PNG to JPG", desc: "Format converter.", icon: ImageIcon, href: "/tools/converters/png-to-jpg", category: "documents", subcategory: "Image Tools", status: "Live" },

  // Editors
  { id: "smart-scan", title: "Smart Scan", desc: "Document digitizer.", icon: ScanLine, href: "/tools/documents/smart-scan", category: "documents", subcategory: "Editors & Viewers", status: "Live" },
  { id: "smart-excel", title: "Smart Excel", desc: "Spreadsheet viewer.", icon: Table, href: "/tools/documents/smart-excel", category: "documents", subcategory: "Editors & Viewers", status: "Live" },
  { id: "smart-word", title: "Smart Doc", desc: "Rich text editor.", icon: FileText, href: "/tools/documents/smart-word", category: "documents", subcategory: "Editors & Viewers", status: "Live" },
  { id: "markdown", title: "Markdown", desc: "Live MD Editor.", icon: FileCode, href: "/tools/writing/markdown", category: "documents", subcategory: "Editors & Viewers", status: "Live" },
  { id: "json-format", title: "JSON Fmt", desc: "Validate & Minify.", icon: FileJson, href: "/tools/documents/json/formatter", category: "documents", subcategory: "Editors & Viewers", status: "Live" },
  { id: "case-conv", title: "Case Switch", desc: "camelCase, snake_case.", icon: Type, href: "/tools/writing/case-converter", category: "documents", subcategory: "Editors & Viewers", status: "Live" },

  // --- HEALTH ---
  { id: "smart-bmi", title: "BMI Calc", desc: "Body Mass Index.", icon: Activity, href: "/tools/health/smart-bmi", category: "health", subcategory: "Metrics", status: "Live" },
  { id: "smart-breath", title: "Breathing", desc: "4-7-8 Relaxation.", icon: Heart, href: "/tools/health/smart-breath", category: "health", subcategory: "Wellness", status: "Live" },
  { id: "yoga", title: "Yoga Guide", desc: "Daily poses & flow.", icon: Flower2, href: "/tools/health/yoga", category: "health", subcategory: "Wellness", status: "Live" },
  { id: "meditation", title: "Meditation", desc: "Focus timer & sound.", icon: Flower2, href: "/tools/health/meditation", category: "health", subcategory: "Wellness", status: "Live" },
  { id: "smart-workout", title: "HIIT Timer", desc: "Interval training.", icon: Zap, href: "/tools/health/smart-workout", category: "health", subcategory: "Fitness", status: "Live" },
  { id: "gym", title: "Gym Guide", desc: "Workout sets log.", icon: Dumbbell, href: "/tools/health/gym", category: "health", subcategory: "Fitness", status: "Live" },
  { id: "games", title: "Mind Games", desc: "Focus & Memory.", icon: Gamepad2, href: "/tools/health/games", category: "health", subcategory: "Fitness", status: "Live" },

  // --- DESIGN & PRODUCTIVITY ---
  { id: "contrast", title: "Contrast", desc: "WCAG Accessibility.", icon: Palette, href: "/tools/design/contrast", category: "design", subcategory: "Utilities", status: "Live" },
  { id: "aspect-ratio", title: "Aspect Ratio", desc: "Dimension calculator.", icon: Ruler, href: "/tools/design/aspect-ratio", category: "design", subcategory: "Utilities", status: "Live" },
  { id: "unit-converter", title: "Unit Conv", desc: "Length, Weight, Temp.", icon: ArrowRightLeft, href: "/tools/converters/unit", category: "productivity", subcategory: "General", status: "Live" },
  { id: "qr-code", title: "QR Gen", desc: "Text to QR Code.", icon: LayoutGrid, href: "/tools/productivity/qr-code", category: "productivity", subcategory: "General", status: "Live" },
];
TS_END

# =========================================================
# 2. UPDATE CATEGORY PAGE (Group by Subcategory)
# =========================================================
echo "í³‚ Updating Category Page to use Subsections..."
cat > app/tools/[category]/page.tsx << 'TS_END'
"use client";
import { useParams } from "next/navigation";
import { ALL_TOOLS, Tool } from "@/app/lib/tools-data";
import ToolTile from "@/app/shared/ToolTile";
import { LayoutGrid } from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  
  const tools = ALL_TOOLS.filter(t => t.category === category);
  const title = category.charAt(0).toUpperCase() + category.slice(1);

  // Group by Subcategory
  const grouped = tools.reduce((acc, tool) => {
    const sub = tool.subcategory || "General";
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <div className="p-8 max-w-[1800px] mx-auto space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {title} Tools
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          {tools.length} applications available.
        </p>
      </div>

      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([subcat, subTools]) => (
          <div key={subcat} className="space-y-6">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                {subcat}
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subTools.map((tool) => (
                   // @ts-ignore
                   <ToolTile key={tool.id} {...tool} />
                ))}
             </div>
          </div>
        ))
      ) : (
        <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <LayoutGrid className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No tools found in this category.</p>
        </div>
      )}
    </div>
  );
}
TS_END

# =========================================================
# 3. UPDATE HOME PAGE (Group by Main Category)
# =========================================================
echo "í¿  Updating Dashboard to use Sections..."
cat > app/page.tsx << 'TS_END'
"use client";
import { Search } from "lucide-react";
import ToolTile from "@/app/shared/ToolTile";
import { useState } from "react";
import { ALL_TOOLS, Tool } from "@/app/lib/tools-data";

export default function Home() {
  const [search, setSearch] = useState("");

  const filtered = ALL_TOOLS.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  // Group by Main Category if not searching, otherwise show flat list
  const grouped = filtered.reduce((acc, tool) => {
    const cat = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  // Order: Finance, Developer, Documents, Health...
  const order = ["Finance", "Developer", "Documents", "Health", "Productivity", "Design"];

  return (
    <div className="p-8 max-w-[1800px] mx-auto space-y-12">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Good Afternoon
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
          Your digital command center. Select a tool to begin.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
          placeholder="Jump to tool (Press '/')..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* Tool Grids */}
      <div className="space-y-16">
        {search ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map(tool => (
                    // @ts-ignore
                    <ToolTile key={tool.id} {...tool} />
                ))}
             </div>
        ) : (
            order.map(cat => grouped[cat] && (
                <div key={cat} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        {cat} <span className="text-slate-200 dark:text-slate-700 text-[10px] bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full">{grouped[cat].length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {grouped[cat].map(tool => (
                            // @ts-ignore
                            <ToolTile key={tool.id} {...tool} />
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
TS_END

echo "âœ… Categorization Applied. Run 'npm run dev' to see the new layout!"
