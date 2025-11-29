import Link from "next/link";
import { BookOpen, CreditCard, Layers, Activity, ChevronRight } from "lucide-react";

export default function LearnPage() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-main dark:text-slate-50 dark:text-slate-100 mb-4">Learning Center</h1>
        <p className="text-lg text-muted dark:text-muted dark:text-muted dark:text-muted max-w-2xl mx-auto">
          Master your digital life with our step-by-step guides on finance, productivity, and wellness.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Finance Guide */}
        <GuideCard 
          icon={<CreditCard size={24}/>}
          title="Finance Mastery"
          desc="How to take control of your monthly budget without complex spreadsheets."
          color="text-teal-600 dark:text-teal-400"
          bg="bg-teal-50"
          articles={[
            "Getting started with 50/30/20 rule",
            "How to track recurring subscriptions",
            "Exporting data for tax season"
          ]}
        />

        {/* Docs Guide */}
        <GuideCard 
          icon={<Layers size={24}/>}
          title="Document Workflow"
          desc="Tips for managing, merging, and optimizing your digital files securely."
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-50"
          articles={[
            "Merging contracts securely",
            "Reducing image size for web",
            "JSON formatting best practices"
          ]}
        />

        {/* Wellness Guide */}
        <GuideCard 
          icon={<Activity size={24}/>}
          title="Health & Focus"
          desc="Using our wellness tools to maintain balance during your workday."
          color="text-rose-600 dark:text-rose-400"
          bg="bg-rose-50"
          articles={[
            "The 4-7-8 breathing technique explained",
            "Why BMI is just one metric",
            "Setting up a Tabata timer"
          ]}
        />

      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-main dark:text-slate-50 dark:text-slate-100 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <FAQ 
            q="Is my data really private?" 
            a="Yes. We use LocalStorage API. Your data literally lives on your hard drive, inside your browser. We have no database." 
          />
          <FAQ 
            q="Is this platform free?" 
            a="100% free. We might add premium cloud sync later, but the core tools will always be free." 
          />
          <FAQ 
            q="Can I use this offline?" 
            a="Yes! Once the page loads, you can disconnect your internet and the tools (Calculator, PDF merge, etc.) will still work." 
          />
        </div>
      </div>

    </div>
  );
}

function GuideCard({ icon, title, desc, color, bg, articles }: any) {
  return (
    <div className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-2xl border   border-line dark:border-slate-700 dark:border-slate-800 p-6   hover:  transition-all">
      <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-main dark:text-slate-100 dark:text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-muted dark:text-muted dark:text-muted dark:text-muted mb-6 h-10">{desc}</p>
      
      <div className="space-y-3">
        {articles.map((art: string, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm font-medium text-main dark:text-slate-300 hover:text-[rgb(117,163,163)] cursor-pointer group">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[rgb(117,163,163)]"></div>
            {art}
          </div>
        ))}
      </div>
      
      <button className="mt-6 w-full py-2 rounded-lg border border-line dark:border-slate-700 dark:border-slate-800 text-sm font-bold text-muted dark:text-muted/70 dark:text-muted/70 hover:bg-background dark:bg-surface dark:bg-slate-950 transition-colors flex items-center justify-center gap-1">
        Read Guides <ChevronRight size={14}/>
      </button>
    </div>
  )
}

function FAQ({ q, a }: { q: string, a: string }) {
  return (
    <div className="bg-background dark:bg-surface dark:bg-slate-950 rounded-xl p-6 border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
      <h4 className="font-bold text-main dark:text-slate-50 dark:text-slate-100 mb-2">{q}</h4>
      <p className="text-sm text-muted dark:text-muted dark:text-muted dark:text-muted leading-relaxed">{a}</p>
    </div>
  )
}
