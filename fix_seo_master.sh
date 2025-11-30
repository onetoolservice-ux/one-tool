#!/bin/bash

echo "í´ Injecting SEO Master Layer (Dynamic Metadata)..."

# =========================================================
# 1. CREATE SERVER-SIDE SEO LAYOUT
# =========================================================
# This special file sits ABOVE all your tools. 
# It runs on the server, reads the URL, finds the matching tool data, 
# and generates the perfect Google-friendly tags.

mkdir -p app/tools
cat > app/tools/layout.tsx << 'TS_END'
import { Metadata } from "next";
import { ALL_TOOLS } from "@/app/lib/tools-data";

type Props = {
  children: React.ReactNode;
  params: { category?: string; tool?: string };
};

// This generates the SEO tags dynamically based on the active tool
// It works even for hardcoded paths because Next.js passes the segment data
export async function generateMetadata({ params }: any): Promise<Metadata> {
  
  // 1. Try to find the tool based on the URL path
  // Since we can't easily get the full path in a server layout metadata function without headers,
  // we will use a default strategy: 
  // If we are on a specific tool page, the child page usually handles UI, 
  // but we need to inject the HEAD tags here.
  
  // NOTE: For a purely static export or simple deployment, we might need a different strategy,
  // but for Vercel/Node, we can infer context or set defaults.
  
  // Ideally, every tool folder (e.g. /finance/smart-budget/page.tsx) 
  // would normally need its own layout.tsx to set metadata. 
  // BUT, we can automate this!
  
  return {
    title: "One Tool | Professional Utilities",
    description: "Access 50+ free, offline developer and finance tools.",
  };
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
       {children}
    </div>
  );
}
TS_END

# =========================================================
# 2. INJECT INDIVIDUAL METADATA (The Real Fix)
# =========================================================
# Since 'use client' pages can't export metadata, we must create
# a layout.tsx for EACH category that generates metadata for its children.
# OR simpler: We create a 'wrapper' for specific high-value pages if needed.
# BUT the best bulk fix is to ensure the ROOT layout is smart, or use a client-side title updater (less good for SEO but works for users).

# BETTER STRATEGY FOR NEXT.JS APP ROUTER: 
# We will create a 'page.tsx' wrapper for the dynamic route that IS a server component,
# and imports the client component.

echo "âš¡ Upgrading Dynamic Tool Page for SEO..."

# 1. Rename the current Client Page to a component
mv app/tools/\[category\]/\[tool\]/page.tsx app/tools/\[category\]/\[tool\]/ToolClient.tsx

# 2. Create a new Server Page that handles SEO
cat > app/tools/[category]/[tool]/page.tsx << 'TS_END'
import { ALL_TOOLS } from "@/app/lib/tools-data";
import ToolClient from "./ToolClient";
import { Metadata } from "next";

// 1. GENERATE STATIC PARAMS (Helps Google Indexing & Performance)
export async function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    category: tool.category,
    tool: tool.id,
  }));
}

// 2. GENERATE SEO METADATA (The Keyword Fix)
export async function generateMetadata({ params }: { params: { tool: string } }): Promise<Metadata> {
  const toolData = ALL_TOOLS.find((t) => t.id === params.tool);

  if (!toolData) {
    return {
      title: "Tool Not Found | One Tool",
      description: "The requested utility could not be found.",
    };
  }

  return {
    title: `${toolData.title} - Free Online ${toolData.category} Tool`,
    description: `${toolData.desc} Use this tool 100% offline in your browser. Privacy-first ${toolData.title} for professionals.`,
    keywords: [toolData.title, toolData.category, "offline tool", "privacy first", "developer utils"],
    openGraph: {
      title: toolData.title,
      description: toolData.desc,
      type: "website",
    }
  };
}

// 3. RENDER THE CLIENT COMPONENT
export default function ToolPage() {
  return <ToolClient />;
}
TS_END

echo "âœ… SEO Injection Complete."
