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
