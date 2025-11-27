import Link from "next/link";
import { Activity, Heart, Wind, Timer, ArrowRight, Calculator } from "lucide-react";

const TOOLS = [
  {
    id: "bmi",
    name: "BMI Calculator",
    desc: "Calculate your Body Mass Index and check your health category.",
    icon: <Calculator size={24} />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: "/tools/health/bmi",
    status: "Ready"
  },
  {
    id: "breathing",
    name: "Breathing Exercise",
    desc: "Visual 4-7-8 guided breathing to reduce stress and anxiety.",
    icon: <Wind size={24} />,
    color: "text-sky-600",
    bg: "bg-sky-50",
    href: "/tools/health/breathing",
    status: "Ready"
  },
  {
    id: "timer",
    name: "Workout Timer",
    desc: "Simple interval timer for HIIT and home workouts.",
    icon: <Timer size={24} />,
    color: "text-orange-600",
    bg: "bg-orange-50",
    href: "#",
    status: "Coming Soon"
  }
];

export default function HealthDashboard() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-rose-50 text-rose-500 rounded-2xl mb-4">
          <Heart size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Health & Wellness</h1>
        <p className="text-lg text-slate-500 mt-3 max-w-2xl mx-auto">
          Tools to help you stay physically fit and mentally centered.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TOOLS.map((tool) => (
          <Link key={tool.id} href={tool.href} className={`group relative block p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${tool.status !== "Ready" ? "opacity-60 pointer-events-none" : ""}`}>
            <div className={`w-14 h-14 rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {tool.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{tool.name}</h3>
            <p className="text-slate-500 leading-relaxed mb-6 min-h-[48px]">{tool.desc}</p>
            
            {tool.status === "Ready" ? (
              <div className="flex items-center font-semibold text-slate-900 group-hover:text-[rgb(117,163,163)] transition-colors">
                Open Tool <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform"/>
              </div>
            ) : (
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-full">Soon</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
