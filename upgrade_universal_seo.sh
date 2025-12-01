#!/bin/bash

echo "í¼ Upgrading Universal SEO Engine (All Tools)..."

# We are overwriting the GENERIC page handler.
# This file handles every tool that DOESN'T have a specific folder yet.
# It acts as the "Fallback" but now it will be a "Premium Fallback".

cat > app/tools/\[category\]/\[tool\]/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import ToolClient from "./ToolClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { notFound } from "next/navigation";

// 1. DEFINE PARAMS TYPE (Next.js 15)
type Props = {
  params: Promise<{
    category: string;
    tool: string;
  }>;
};

// 2. STATIC PARAMS (Faster Builds)
export async function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    category: tool.category,
    tool: tool.id,
  }));
}

// 3. DYNAMIC SEO METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const tool = ALL_TOOLS.find((t) => t.id === resolvedParams.tool);

  if (!tool) {
    return {
      title: "Tool Not Found | One Tool",
    };
  }

  // "Common Man" Friendly Titles
  const displayName = tool.name;
  const categoryName = tool.category === "AI" ? "AI" : tool.category.slice(0, -1); // Remove 's' from 'Documents' -> 'Document'

  return {
    title: \`\${displayName} - Free Online \${categoryName} Tool | One Tool\`,
    description: \`Use \${displayName} online for free. \${tool.desc} Simple, private, and fast tool for everyone. No login required.\`,
    keywords: [
      displayName.toLowerCase(), 
      \`free \${displayName.toLowerCase()}\`, 
      \`online \${displayName.toLowerCase()}\`, 
      tool.category.toLowerCase(), 
      "one tool", 
      "web utility"
    ],
    alternates: {
      canonical: \`https://onetool.co.in/tools/\${tool.category}/\${tool.id}\`,
    },
    openGraph: {
      title: \`\${displayName} - Free Online Tool\`,
      description: tool.desc,
      type: "website",
      siteName: "One Tool",
    }
  };
}

// 4. THE SERVER PAGE COMPONENT
export default async function UniversalToolPage({ params }: Props) {
  const resolvedParams = await params;
  const tool = ALL_TOOLS.find((t) => t.id === resolvedParams.tool);

  if (!tool) {
    notFound();
  }

  // Friendly Schema Description
  const schemaDesc = \`Free online \${tool.name}. \${tool.desc} Safe, client-side processing.\`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
      {/* INJECT SEO SCHEMA AUTOMATICALLY */}
      <ToolSchema 
        name={tool.name}
        description={schemaDesc}
        path={\`/tools/\${tool.category}/\${tool.id}\`}
        category="WebApplication"
      />

      {/* RENDER CLIENT INTERFACE */}
      <ToolClient params={resolvedParams} />
    </div>
  );
}
PAGE_EOF

echo "âœ… Universal SEO Engine Deployed."
echo "í±‰ Every single tool now has Title Tags, Meta Descriptions, and JSON-LD Schema."
