'use client';
import React from 'react';
import { Target, Heart, Briefcase } from 'lucide-react';

export const MacroView = ({ theme }: any) => {
  const t = theme; // Now using the passed theme
  
  return (
    <div className="h-full p-8 flex flex-col overflow-hidden">
      <h2 className={`text-3xl font-bold mb-8 ${t.text}`}>The Macro Vision (3 Years)</h2>
      
      <div className="grid grid-cols-3 gap-8 flex-1 h-full min-h-0">
        <VisionCard 
          icon={<Briefcase size={32} className="text-blue-400" />}
          title="Wealth & Career"
          statement="Build a portfolio of micro-SaaS apps generating $10k MRR."
          steps={["Launch 3 Products", "Build 10k Twitter Audience", "Hire first dev"]}
          t={t}
        />
        <VisionCard 
          icon={<Heart size={32} className="text-red-400" />}
          title="Health & Body"
          statement="Maintain 12% body fat and run a marathon."
          steps={["Gym 4x Week", "Clean Diet (80/20)", "Sleep 8h daily"]}
          t={t}
        />
        <VisionCard 
          icon={<Target size={32} className="text-purple-400" />}
          title="Mind & Spirit"
          statement="Financial freedom allowing for 3 months of travel per year."
          steps={["Read 24 Books/yr", "Daily Meditation", "Visit Japan"]}
          t={t}
        />
      </div>
    </div>
  );
};

const VisionCard = ({ icon, title, statement, steps, t }: any) => (
  <div className={`${t.cardBg} rounded-3xl p-8 border ${t.border} hover:border-blue-500/20 transition-all flex flex-col h-full`}>
    <div className={`mb-6 ${t.isDark ? 'bg-white/5' : 'bg-gray-100'} w-16 h-16 rounded-2xl flex items-center justify-center`}>
      {icon}
    </div>
    <h3 className={`text-2xl font-bold mb-4 ${t.text}`}>{title}</h3>
    <p className={`${t.textSec} text-lg leading-relaxed mb-8 border-l-2 ${t.border} pl-4 italic`}>
      "{statement}"
    </p>
    
    <div className="mt-auto">
      <h4 className={`text-xs font-bold uppercase ${t.textSec} tracking-widest mb-4`}>Key Steps</h4>
      <div className="space-y-3">
        {steps.map((step: string, i: number) => (
          <div key={i} className={`flex items-center gap-3 ${t.bg} p-3 rounded-lg border ${t.border}`}>
            <span className="text-blue-500 font-mono text-xs">0{i+1}</span>
            <span className={`text-sm font-medium ${t.text}`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
