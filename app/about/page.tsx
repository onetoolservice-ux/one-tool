import Link from "next/link";
import { Shield, Zap, Heart, Globe, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto py-20 px-6 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center mb-20 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Built for <span className="text-[rgb(117,163,163)]">privacy.</span><br />
          Designed for <span className="text-[rgb(117,163,163)]">speed.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-light">
          One Tool Solutions (OTS) was created with a belief:  
          <span className="font-medium text-slate-700">
            simple tools should not steal your data.
          </span>
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
        <ValueCard 
          icon={<Shield size={26}/>} 
          title="Private by Default" 
          desc="No servers. No logs. No tracking. Everything runs on your device using a pure local-first architecture."
        />
        <ValueCard 
          icon={<Zap size={26}/>} 
          title="Blazing Fast" 
          desc="Thanks to WebAssembly + client-side processing, OTS tools respond instantly — even offline."
        />
        <ValueCard 
          icon={<Heart size={26}/>} 
          title="Purposeful Design" 
          desc="Clean, distraction-free, ad-free UI focused purely on productivity and clarity."
        />
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-10 md:p-16 shadow-lg">
        <h2 className="text-3xl font-semibold text-slate-900 mb-6">
          Why We Built OTS
        </h2>

        <div className="space-y-5 text-slate-600 text-lg leading-relaxed">
          <p>
            Most “free tools” aren’t actually free — they take your data.  
            You upload a PDF to compress it, and suddenly your inbox is full of ads.
          </p>

          <p>
            <strong className="text-slate-900">OTS changes that.</strong>  
            We are building essential digital utilities — Documents, Finance, Health — that run fully in your browser with no middleman.
          </p>

          <p>
            Your files never leave your device.  
            Not now. Not ever.  
          </p>
        </div>

        {/* Signature */}
        <div className="mt-10 pt-8 border-t border-slate-200 flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[rgb(117,163,163)] text-white rounded-full flex items-center justify-center text-lg font-bold">OT</div>
            <div>
              <div className="text-sm font-bold text-slate-900">The OTS Team</div>
              <div className="text-xs text-slate-500">Crafting tools for the next decade</div>
            </div>
          </div>

          <Link href="/contact" className="text-sm font-semibold text-[rgb(117,163,163)] hover:underline">
            Connect with us →
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-bold text-slate-900 mb-5">
          Ready to experience the future of simple tools?
        </h3>

        <Link href="/tools">
          <button className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-medium transition-all hover:-translate-y-1 shadow-xl shadow-slate-900/20">
            Explore All Tools <ArrowRight size={20}/>
          </button>
        </Link>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[rgb(117,163,163)]/40 transition-all hover:bg-white hover:shadow-lg group cursor-default">
      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-[rgb(117,163,163)] shadow-sm mb-4 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-3">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
