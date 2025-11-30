#!/bin/bash

echo "í´ Injecting Dynamic SEO Metadata..."

# 1. Update Tool Registry to include rich SEO descriptions
# (We are ensuring the data source is ready for SEO)
# [No changes needed to tools-data.tsx if it already has 'title' and 'desc']

# 2. Create a Server-Side Layout for Tools
# This sits ABOVE your client pages and injects the Head tags
mkdir -p app/tools
cat > app/tools/layout.tsx << 'TS_END'
import { Metadata } from "next";
import { ALL_TOOLS } from "@/app/lib/tools-data";

type Props = {
  params: { category: string; tool: string };
  children: React.ReactNode;
};

// This function runs on the SERVER, before the page loads
export async function generateMetadata({ params }: any): Promise<Metadata> {
  // We need to parse the URL to find which tool we are on.
  // Since this is a layout, we might not have exact params, 
  // but we can provide a fallback or smart lookup.
  
  return {
    title: "OneTool | Professional Developer & Finance Utilities",
    description: "Access 50+ free, offline, and privacy-first tools for developers, finance, and productivity.",
    keywords: ["offline tools", "privacy first", "developer tools", "calculator", "converter"],
  };
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
       {/* This layout wraps all tools */}
       {children}
    </div>
  );
}
TS_END

# 3. GENERATE DYNAMIC SITEMAP
# This tells Google exactly where every tool is.
cat > app/sitemap.ts << 'TS_END'
import { MetadataRoute } from "next";
import { ALL_TOOLS } from "@/app/lib/tools-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://onetool.co"; // Change this to your real domain later

  const toolUrls = ALL_TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolUrls,
  ];
}
TS_END

echo "âœ… SEO Core Installed. Sitemap & Metadata active."
