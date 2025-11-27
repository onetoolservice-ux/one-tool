import Link from "next/link";
import { Shield, Zap, Heart, Globe, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      
      {/* Hero */}
      <div className="text-center mb-16 space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Tools built for <span className="text-[rgb(117,163,163)]">privacy & speed.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          One Tool Solutions (OTS) was born from a simple idea: 
          You shouldn't have to upload your data to a server just to merge a PDF or track your expenses.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <ValueCard 
          icon={<Shield size={24}/>} 
          title="Privacy First" 
          desc="Local-first architecture means your data never leaves your device. We have zero trackers."
        />
        <ValueCard 
          icon={<Zap size={24}/>} 
          title="Lightning Fast" 
          desc="No server round-trips. Everything runs instantly in your browser using WebAssembly."
        />
        <ValueCard 
          icon={<Heart size={24}/>} 
          title="Open Design" 
          desc="Clean, ad-free, and accessible. Built to be the tool we actually want to use ourselves."
        />
      </div>

      {/* Story Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Mission</h2>
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            The internet is full of "free tools" that are actually data traps. You upload a sensitive PDF to convert it, and who knows where it goes? You track your budget, and suddenly you see ads for credit cards.
          </p>
          <p>
            <strong>OTS is different.</strong> We are building a suite of essential digital utilities—Finance, Documents, Health—that run 100% client-side. This platform is a demonstration of what the modern web can do without invading your privacy.
          </p>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[rgb(117,163,163)] rounded-full flex items-center justify-center text-white font-bold text-sm">OT</div>
            <div>
              <div className="text-sm font-bold text-slate-900">The OTS Team</div>
              <div className="text-xs text-slate-500">Building for the future</div>
            </div>
          </div>
          <Link href="/contact" className="text-sm font-semibold text-[rgb(117,163,163)] hover:underline">Get in Touch</Link>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to simplify your workflow?</h3>
        <Link href="/tools">
          <button className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all hover:-translate-y-1 shadow-lg shadow-slate-900/20">
            Explore Tools <ArrowRight size={18}/>
          </button>
        </Link>
      </div>

    </div>
  );
}

function ValueCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[rgb(117,163,163)]/30 transition-colors">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[rgb(117,163,163)] shadow-sm mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}
