import { 
  Wallet, Search, CheckCircle, Plus, Trash2, 
  Type, Layers, Box, Palette 
} from "lucide-react";

export default function DesignSystem() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-10 text-main dark:text-slate-50 dark:text-slate-100">
      
      {/* Header (Compact) */}
      <div className="flex items-center gap-3 border-b border-line dark:border-slate-700 dark:border-slate-800 pb-4">
        <div className="p-2 bg-slate-100 rounded-lg"><Box size={20} className="text-main dark:text-slate-300"/></div>
        <div>
          <h1 className="text-xl font-bold text-main dark:text-slate-50 dark:text-slate-100">Design System & UI Kit</h1>
          <p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">v1.1 | Compact Density</p>
        </div>
      </div>

      {/* 1. COLOR PALETTE (Grid View) */}
      <section>
        <h2 className="text-sm font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><Palette size={14}/> Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ColorStack name="Teal (Brand)" colors={['#f0fdfa', '#ccfbf1', '#14b8a6', '#0d9488', '#134e4a']} />
          <ColorStack name="Slate (Neutral)" colors={['#f8fafc', '#f1f5f9', '#64748b', '#1e293b', '#0f172a']} />
          <ColorStack name="Rose (Error)" colors={['#fff1f2', '#fecdd3', '#f43f5e', '#e11d48', '#881337']} />
          <ColorStack name="Emerald (Success)" colors={['#ecfdf5', '#a7f3d0', '#10b981', '#059669', '#064e3b']} />
          <ColorStack name="Blue (Info)" colors={['#eff6ff', '#bfdbfe', '#3b82f6', '#2563eb', '#1e3a8a']} />
        </div>
      </section>

      {/* 2. COMPONENTS (Realistic Sizing) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
        
        {/* Buttons & Inputs */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase tracking-wider flex items-center gap-2"><Layers size={14}/> Interface</h2>
          
          <div className="p-5 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-800 rounded-lg space-y-4">
             <div className="flex flex-wrap gap-3 items-center">
               <button className="px-4 py-2 bg-[rgb(117,163,163)] hover:bg-teal-700 text-white rounded-md text-sm font-bold  ">Primary</button>
               <button className="px-4 py-2 bg-surface hover:bg-slate-800 text-white rounded-md text-sm font-bold  ">Dark</button>
               <button className="px-4 py-2 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-800 text-muted dark:text-muted/70 dark:text-muted/70 hover:bg-background dark:bg-surface dark:bg-slate-950 rounded-md text-sm font-bold">Secondary</button>
               <button aria-label="Delete Item"<button className="p-2 text-muted/70 hover:text-rose-500 hover:bg-rose-50 rounded-md"><Trash2 size={16}/></button>
             </div>
             
             <div className="h-px bg-slate-100 w-full"></div>

             <div className="grid grid-cols-2 gap-3">
               <input type="text" placeholder="Standard Input" className="w-full px-3 py-2 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-800 rounded-md text-sm focus:border-teal-500 outline-none"/>
               <select className="w-full px-3 py-2 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-800 rounded-md text-sm outline-none text-muted dark:text-muted/70 dark:text-muted/70">
                 <option>Option A</option><option>Option B</option>
               </select>
             </div>
          </div>
        </div>

        {/* Typography & Cards */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase tracking-wider flex items-center gap-2"><Type size={14}/> Content</h2>
          
          <div className="grid grid-cols-2 gap-4">
             {/* Tool Card (Fixed Size) */}
             <div className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-800 rounded-lg hover:border-teal-500 hover:  transition-all cursor-pointer">
                <div className="w-8 h-8 bg-teal-50 text-teal-600 dark:text-teal-400 rounded-md flex items-center justify-center mb-2"><Wallet size={16}/></div>
                <div className="font-bold text-main dark:text-slate-100 dark:text-slate-200 text-sm">Tool Card</div>
                <div className="text-[11px] text-muted dark:text-muted dark:text-muted dark:text-muted mt-0.5">Compact description.</div>
             </div>
             
             {/* Active Card */}
             <div className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface border border-teal-500 ring-1 ring-teal-500 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                   <div className="w-8 h-8 bg-teal-600 text-white rounded-md flex items-center justify-center"><CheckCircle size={16}/></div>
                   <span className="text-xs font-bold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">ACTIVE</span>
                </div>
                <div className="font-bold text-main dark:text-slate-100 dark:text-slate-200 text-sm">Selected Item</div>
             </div>
          </div>
        </div>

      </section>
    </div>
  );
}

function ColorStack({ name, colors }: { name: string, colors: string[] }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-main dark:text-slate-300">{name}</div>
      <div className="flex rounded-md overflow-hidden border border-line dark:border-slate-700 dark:border-slate-800   h-8">
        {colors.map((c) => (
          <div key={c} className="flex-1 h-full group relative" style={{ backgroundColor: c }}>
             <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-10">{c}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
