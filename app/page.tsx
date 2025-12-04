import { Suspense } from 'react';
import { SuperNavbar } from "@/app/components/layout/super-navbar";
import { BentoHero } from "@/app/components/home/bento-hero";
import { ToolGrid } from "@/app/components/home/tool-grid";
import { Footer } from "@/app/components/layout/Footer";
import { DynamicBackground } from "@/app/components/layout/dynamic-background";
import { Loader2 } from "lucide-react";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home(props: Props) {
  const searchParams = await props.searchParams;
  const category = searchParams.cat;
  const query = searchParams.q;
  const showHero = (!category || category === 'All Tools') && !query;

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      <DynamicBackground />
      
      <Suspense fallback={<div className="h-16 border-b bg-white dark:bg-slate-950"></div>}>
        <SuperNavbar />
      </Suspense>

      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] p-4 max-w-[1600px] mx-auto w-full gap-4">
        
        {/* COMPACT HERO (Only ~20% Height now) */}
        {showHero && (
           <div className="flex-shrink-0 h-[180px] animate-in fade-in slide-in-from-top-2 duration-500">
              <BentoHero />
           </div>
        )}

        {/* MAIN GRID (Takes remaining 80%) */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar rounded-3xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-5 transition-all duration-500 ${showHero ? '' : 'h-full border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80'}`}>
           <div className="flex items-center justify-between mb-4 sticky top-0 z-10">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                {showHero ? 'All Utilities' : (
                  <><span className="text-teal-600 dark:text-teal-400">{category || 'Search'}</span> <span className="opacity-50">/</span> Tools</>
                )}
              </h3>
              <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">63 APPS</span>
           </div>
           
           <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={30} /></div>}>
              <ToolGrid /> 
           </Suspense>
           <div className="mt-8"><Footer /></div>
        </div>

      </main>
    </div>
  );
}
