import Link from "next/link";
import { 
  CreditCard, Layers, Calculator, 
  Wind, Timer, Image, Braces, ArrowRight, Wallet
} from "lucide-react";

export default function MegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-[90vw] max-w-5xl bg-surface dark:bg-slate-800 dark:bg-surface rounded-2xl shadow-2xl border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 p-8 grid grid-cols-1 md:grid-cols-3 gap-10 mx-auto mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Finance Column */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
          <Wallet size={16} className="text-teal-600 dark:text-teal-400"/>
          <span className="text-xs font-bold text-muted/70 uppercase tracking-wider">Finance</span>
        </div>
        <div className="space-y-2">
          <MenuLink href="/tools/finance/budget-tracker" icon={<CreditCard size={18}/>} title="Budget Ultimate" desc="Track expenses & income" onClose={onClose} />
        </div>
      </div>

      {/* Documents Column */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
          <Layers size={16} className="text-blue-600 dark:text-blue-400"/>
          <span className="text-xs font-bold text-muted/70 uppercase tracking-wider">Documents</span>
        </div>
        <div className="space-y-2">
          <MenuLink href="/tools/documents/pdf/merge" icon={<Layers size={18}/>} title="PDF Merger" desc="Combine PDF files" onClose={onClose} />
          <MenuLink href="/tools/documents/image/compressor" icon={<Image size={18}/>} title="Image Compressor" desc="Optimize JPG/PNG" onClose={onClose} />
          <MenuLink href="/tools/documents/json/formatter" icon={<Braces size={18}/>} title="JSON Tool" desc="Format & Validate" onClose={onClose} />
        </div>
      </div>

      {/* Health Column */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
          <Calculator size={16} className="text-rose-600 dark:text-rose-400"/>
          <span className="text-xs font-bold text-muted/70 uppercase tracking-wider">Health</span>
        </div>
        <div className="space-y-2">
          <MenuLink href="/tools/health/bmi" icon={<Calculator size={18}/>} title="BMI Calc" desc="Check health index" onClose={onClose} />
          <MenuLink href="/tools/health/breathing" icon={<Wind size={18}/>} title="Breathing" desc="4-7-8 Relaxation" onClose={onClose} />
          <MenuLink href="/tools/health/timer" icon={<Timer size={18}/>} title="Workout Timer" desc="HIIT / Tabata" onClose={onClose} />
        </div>
      </div>

      {/* Footer Link (Full Width) */}
      <div className="col-span-1 md:col-span-3 pt-4 border-t border-slate-50 flex justify-end">
        <Link href="/tools" onClick={onClose} aria-label="View all tools" className="group inline-flex items-center text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-teal-600 dark:text-teal-400 transition-colors">
          View All Tools <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform"/>
        </Link>
      </div>

    </div>
  );
}

function MenuLink({ href, icon, title, desc, onClose }: any) {
  return (
    <Link href={href} onClick={onClose} aria-label={`Open ${title} tool`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-background dark:bg-surface dark:bg-slate-950 transition-colors group">
      <div className="mt-0.5 text-muted/70 group-hover:text-teal-600 dark:text-teal-400 transition-colors">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-main dark:text-slate-300 group-hover:text-main dark:text-slate-50 dark:text-slate-100">{title}</div>
        <div className="text-xs text-muted/70 group-hover:text-muted dark:text-muted dark:text-muted dark:text-muted">{desc}</div>
      </div>
    </Link>
  )
}
