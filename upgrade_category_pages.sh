#!/bin/bash

echo "í´„ Synchronizing Category Pages with Enterprise Layout..."

cat > app/tools/\[category\]/page.tsx << 'CAT_CODE'
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import ToolTile from "@/app/shared/ToolTile";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// 1. Define Props
type Props = {
  params: Promise<{ category: string }>;
};

// 2. Generate Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category);
  
  // Capitalize first letter
  const title = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    title: \`\${title} Tools - One Tool Enterprise\`,
    description: \`Free online \${title} tools. Secure, fast, and privacy-first utilities for professionals.\`,
  };
}

// 3. The Page Component
export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const categorySlug = decodeURIComponent(resolvedParams.category).toLowerCase();
  
  // Filter tools for this category
  const categoryTools = ALL_TOOLS.filter(t => t.category.toLowerCase() === categorySlug);

  if (!categoryTools.length) {
    return notFound();
  }

  // Capitalize for display
  const displayCategory = categoryTools[0].category;

  // Group by Subcategory
  const subcategories: Record<string, typeof ALL_TOOLS> = {};
  categoryTools.forEach(tool => {
    const sub = tool.subcategory || "General";
    if (!subcategories[sub]) subcategories[sub] = [];
    subcategories[sub].push(tool);
  });

  // Sort subcategories alphabetically or by custom logic
  const sortedSubcats = Object.keys(subcategories).sort();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 pb-8 pt-6 px-6">
        <div className="max-w-[1600px] mx-auto">
           <div className="flex items-center gap-4 mb-4">
             <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
               <ArrowLeft size={20} />
             </Link>
             <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
             <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/" className="hover:text-indigo-600">Home</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-medium">{displayCategory}</span>
             </div>
           </div>
           
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
               <Layers size={24} />
             </div>
             {displayCategory} Suite
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl text-lg">
             {categoryTools.length} professional tools available. Secure, client-side, and free.
           </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 space-y-12 pt-10 pb-24 max-w-[1600px] mx-auto">
        {sortedSubcats.map((subName) => (
          <section key={subName}>
             <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
               {subName}
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
               {subcategories[subName].map((tool) => (
                 <ToolTile key={tool.id} tool={tool} />
               ))}
             </div>
          </section>
        ))}
      </div>
    </div>
  );
}
CAT_CODE

echo "âœ… Category Pages Synchronized with Design System."
echo "í±‰ Deploying to Vercel..."

# Auto-commit to save you time
git add .
git commit -m "feat: finalize enterprise UI and taxonomy"
git push
