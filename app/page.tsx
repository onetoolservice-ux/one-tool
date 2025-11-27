import Link from "next/link";
import Button from "@/app/shared/ui/Button";
import { 
  ArrowRight, Wallet, FileText, Heart, Shield, 
  Zap, Layers, PieChart, Lock, Sparkles 
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* 1. HERO SECTION - Condensed */}
      <section className="pt-16 pb-4 px-4 text-center relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-600 animate-in fade-in slide-in-from-bottom-4">
            <Sparkles size={12} className="text-amber-500" />
            <span>The All-in-One Digital Workspace</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-5 duration-700">
            One Platform.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(117,163,163)] to-teal-600">
              Infinite Possibilities.
            </span>
          </h1>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700">
            Manage your money, manipulate documents, and track your health. 
            <br className="hidden md:block" />
            No subscriptions. No data tracking. Just powerful tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in fade-in slide-in-from-bottom-7 duration-700">
            <Link href="/tools">
              <Button className="h-12 px-8 text-base shadow-xl shadow-teal-900/10 hover:shadow-teal-900/20 transition-all hover:-translate-y-0.5">
                Start Using Tools
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary" className="h-12 px-8 text-base bg-white/80 backdrop-blur">
                Our Philosophy
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. BENTO GRID - Moved Up & Compact */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[240px]">
          
          {/* CARD 1: FINANCE (Large) */}
          <Link href="/tools/finance/budget-tracker" className="group md:col-span-2 row-span-1 relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col justify-between">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
              <PieChart size={160} />
            </div>
            <div>
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3">
                <Wallet size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Finance Master</h3>
              <p className="text-slate-500 mt-1 text-sm max-w-sm">Track expenses, incomes, and view analytics locally.</p>
            </div>
            <div className="flex items-center text-sm font-bold text-teal-600 mt-2">
              Manage Budget <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* CARD 2: DOCUMENTS (Tall) */}
          <Link href="/tools/documents" className="group md:col-span-1 row-span-1 md:row-span-2 bg-slate-900 text-white rounded-3xl shadow-lg hover:shadow-xl transition-all p-6 flex flex-col relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-slate-800 group-hover:text-slate-700 transition-colors">
              <Layers size={120} />
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm">
              <FileText size={20} />
            </div>
            <h3 className="text-xl font-bold">Docs Studio</h3>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              Merge PDFs, compress images securely in browser.
            </p>
            <div className="mt-auto pt-4 flex items-center text-sm font-bold">
              Open Studio <ArrowRight size={16} className="ml-2" />
            </div>
          </Link>

          {/* CARD 3: HEALTH */}
          <Link href="/tools/health" className="group bg-gradient-to-br from-rose-50 to-white rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-3">
                <Heart size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Wellness</h3>
              <p className="text-slate-500 text-sm mt-1">BMI & Breathing tools.</p>
            </div>
          </Link>

          {/* CARD 4: AI (Coming Soon / Placeholder) */}
          <div className="group bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
              <Zap size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">AI Suite</h3>
            <span className="mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full">Coming Soon</span>
          </div>

          {/* CARD 5: PRIVACY PROMISE (Wide) */}
          <div className="md:col-span-2 bg-slate-50 rounded-3xl border border-slate-200 p-6 flex items-center gap-6">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Shield size={24} className="text-[rgb(117,163,163)]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Lock size={14} className="text-slate-400"/> Local-First Architecture
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Your data never leaves your device. Total privacy.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. BOTTOM STATS */}
      <section className="border-t border-slate-100 bg-white mt-4">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">100%</div>
            <div className="text-xs text-slate-500 font-medium">Client-Side</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <div className="text-xs text-slate-500 font-medium">Trackers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">15+</div>
            <div className="text-xs text-slate-500 font-medium">Tools</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Free</div>
            <div className="text-xs text-slate-500 font-medium">Forever</div>
          </div>
        </div>
      </section>

    </div>
  );
}
