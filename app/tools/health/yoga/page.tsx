"use client";
import React from "react";
import { CheckCircle2 } from "lucide-react";

const POSES = [
  { name: "Mountain Pose", desc: "Tadasana. Stand tall with feet together, shoulders relaxed, weight evenly distributed.", time: "1 min" },
  { name: "Downward Dog", desc: "Adho Mukha Svanasana. Hands and feet on floor, hips lifted back and up.", time: "2 min" },
  { name: "Warrior I", desc: "Virabhadrasana I. High lunge with back foot flat, arms raised overhead.", time: "1 min/side" },
  { name: "Tree Pose", desc: "Vrksasana. Stand on one leg, other foot on thigh/calf. Hands at heart.", time: "1 min/side" },
  { name: "Child's Pose", desc: "Balasana. Kneel and fold forward, forehead to floor. Rest and breathe.", time: "3 min" },
  { name: "Cobra Pose", desc: "Bhujangasana. Lying prone, lift chest using back muscles. Gentle backbend.", time: "1 min" }
];

export default function YogaGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Daily Yoga Flow</h1>
        <p className="text-slate-500">Simple poses to start your day right.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         {POSES.map((pose, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-4 items-start hover:shadow-md transition-all group">
               <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg flex-shrink-0">
                  {i+1}
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">{pose.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{pose.desc}</p>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><CheckCircle2 size={12}/> {pose.time}</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
