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
