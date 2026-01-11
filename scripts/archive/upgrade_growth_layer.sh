#!/bin/bash

echo "��� Initializing Growth & Analytics Layer..."

# 1. Create the "Related Tools" Component
# This logic finds tools in the same category, shuffles them, and picks 3.
mkdir -p app/components/tools
cat > app/components/tools/RelatedTools.tsx << 'RELATED_EOF'
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { ArrowRight } from "lucide-react";
import { getTheme } from "@/app/lib/theme-config";

interface RelatedToolsProps {
  currentToolId: string;
  category: string;
}

export default function RelatedTools({ currentToolId, category }: RelatedToolsProps) {
  const related = useMemo(() => {
    // 1. Get other tools in the same category
    const sameCategory = ALL_TOOLS.filter(
      t => t.category === category && t.id !== currentToolId
    );
    
    // 2. If not enough, fill with "Popular" tools
    const popular = ALL_TOOLS.filter(
      t => t.popular && t.category !== category && t.id !== currentToolId
    );

    // 3. Combine and slice (Take top 3)
    return [...sameCategory, ...popular].slice(0, 3);
  }, [currentToolId, category]);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        You might also like
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((tool) => {
          const theme = getTheme(tool.category);
          return (
            <Link 
              key={tool.id} 
              href={tool.href}
              className="group flex flex-col p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 transition-all hover:-translate-y-1 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl text-white shadow-sm ${theme.iconBg}`}>
                  {tool.icon}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  {tool.name}
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow">
                {tool.desc}
              </p>
              <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-auto">
                Try Tool <ArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform"/>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
RELATED_EOF

# 2. Inject "Related Tools" into Generic Client
# We need to patch the generic ToolClient.tsx to include this new section
# We use a full overwrite to ensure clean insertion (no regex mess)

cat > app/tools/\[category\]/\[tool\]/ToolClient.tsx << 'GENERIC_EOF'
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import ToolTile from "@/app/shared/ToolTile";
import RelatedTools from "@/app/components/tools/RelatedTools";

interface ToolClientProps {
  params: {
    tool: string;
    category: string;
  };
}

export default function ToolClient({ params }: ToolClientProps) {
  const { tool, category } = params;

  const toolData = ALL_TOOLS.find((t) => t.id === tool);

  if (!toolData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Tool Not Found</h2>
        <Link href="/tools" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link href="/" className="hover:text-indigo-600 transition"><ArrowLeft size={16} /></Link>
        <span>/</span>
        <Link href={`/tools/${category}`} className="hover:text-indigo-600 capitalize transition">{category}</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">{toolData.name}</span>
      </div>

      {/* Tool Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-2xl text-white ${toolData.bg.replace('bg-', 'text-').replace('50', '600')} bg-slate-100 dark:bg-slate-800`}>
             {/* Icon rendered via ToolTile logic usually, but here direct */}
             {toolData.icon}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {toolData.name}
          </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          {toolData.desc} This tool runs entirely in your browser for maximum privacy and speed.
        </p>
      </div>

      {/* Tool Interface Area (Placeholder for generic tools) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
         <div className="max-w-md">
           <p className="text-slate-500 mb-4">This is a placeholder for the <strong>{toolData.name}</strong> interface.</p>
           <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition">
             Initialize Tool
           </button>
         </div>
      </div>

      {/* GROWTH ENGINE: Related Tools */}
      <RelatedTools currentToolId={toolData.id} category={toolData.category} />
    </div>
  );
}
GENERIC_EOF

# 3. Setup Google Analytics Component
# This creates a clean, reusable GA4 component
mkdir -p app/components/analytics
cat > app/components/analytics/GoogleAnalytics.tsx << 'GA_EOF'
"use client";

import Script from "next/script";

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
GA_EOF

# 4. Add GA to Layout
# We will append it to the body. Note: You need to replace 'G-XXXXXXXXXX' later.
LAYOUT_FILE="app/layout.tsx"
if ! grep -q "GoogleAnalytics" "$LAYOUT_FILE"; then
  sed -i '1i import GoogleAnalytics from "@/app/components/analytics/GoogleAnalytics";' "$LAYOUT_FILE"
  # Insert before closing body
  sed -i '/<\/body>/i \        <GoogleAnalytics gaId="G-J4B6SYJZQF" />' "$LAYOUT_FILE"
fi

echo "✅ Growth Layer Applied."
echo "⚠️  ACTION REQUIRED: Replace 'G-J4B6SYJZQF' in app/layout.tsx with your real GA4 ID from Google Analytics."
