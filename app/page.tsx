import Link from 'next/link';
import { LineChart, Store, ArrowRight } from 'lucide-react';
import { SPACE_CONFIGS } from '@/app/lib/space-config';

const SPACE_ICONS: Record<string, typeof LineChart> = {
  'my-finance': LineChart,
  'my-business': Store,
};

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-56px)] w-full flex items-center justify-center bg-[#f5f6f8] dark:bg-[#0F111A] px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pick a workspace to get started</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
          {SPACE_CONFIGS.map(space => {
            const Icon = SPACE_ICONS[space.slug] ?? LineChart;
            return (
              <Link
                key={space.slug}
                href={`/${space.slug}`}
                className="group w-full max-w-[400px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--ot-accent,#6366f1)] transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1e1b4b] flex items-center justify-center mb-4">
                  <Icon size={20} className="text-white" strokeWidth={1.75} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[var(--ot-accent,#6366f1)] transition-colors">
                    {space.category}
                  </h2>
                  <ArrowRight
                    size={16}
                    className="text-slate-300 dark:text-slate-600 group-hover:text-[var(--ot-accent,#6366f1)] group-hover:translate-x-0.5 transition-all"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {space.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
