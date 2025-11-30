"use client";
import React, { useState } from "react";
import { Dumbbell, Plus, Trash2, Save } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function GymGuide() {
  const [log, setLog] = useState<{name: string, sets: string, reps: string, weight: string}[]>([]);
  const [form, setForm] = useState({name: "", sets: "", reps: "", weight: ""});

  const add = () => {
    if(!form.name) return;
    setLog([...log, form]);
    setForm({name: "", sets: "", reps: "", weight: ""});
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
       <div className="text-center"><h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Gym Log</h1><p className="text-slate-500">Track your sets and reps.</p></div>

       <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 h-fit">
             <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Dumbbell size={18}/> New Exercise</h3>
             <input placeholder="Exercise Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/>
             <div className="grid grid-cols-3 gap-2">
                <input placeholder="Sets" value={form.sets} onChange={e=>setForm({...form, sets: e.target.value})} className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 text-center"/>
                <input placeholder="Reps" value={form.reps} onChange={e=>setForm({...form, reps: e.target.value})} className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 text-center"/>
                <input placeholder="kg" value={form.weight} onChange={e=>setForm({...form, weight: e.target.value})} className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 text-center"/>
             </div>
             <Button onClick={add} className="w-full">Add to Log</Button>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-500 font-bold uppercase text-xs">
                    <tr><th className="p-4">Exercise</th><th className="p-4 text-center">Sets</th><th className="p-4 text-center">Reps</th><th className="p-4 text-center">Weight</th><th className="p-4"></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {log.map((l, i) => (
                        <tr key={i}>
                            <td className="p-4 font-bold text-slate-800 dark:text-white">{l.name}</td>
                            <td className="p-4 text-center">{l.sets}</td>
                            <td className="p-4 text-center">{l.reps}</td>
                            <td className="p-4 text-center font-mono">{l.weight}kg</td>
                            <td className="p-4 text-right"><button onClick={()=>setLog(log.filter((_, x)=>x!==i))} className="text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button></td>
                        </tr>
                    ))}
                    {log.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No exercises logged today.</td></tr>}
                </tbody>
             </table>
             {log.length > 0 && <div className="p-4 border-t border-slate-100 dark:border-slate-800"><Button onClick={()=>showToast("Workout Saved!", "success")} variant="secondary" className="w-full"><Save size={16} className="mr-2"/> Finish Workout</Button></div>}
          </div>
       </div>
    </div>
  );
}
