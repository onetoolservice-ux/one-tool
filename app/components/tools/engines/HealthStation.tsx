"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Wind, Play, Pause, RotateCcw, Ruler, Weight, Dumbbell, Timer } from 'lucide-react';

interface HealthProps {
  toolId: string;
}

export const HealthStation = ({ toolId }: HealthProps) => {
  
  // --- BMI STATE ---
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  
  // --- BREATH STATE ---
  const [breathState, setBreathState] = useState<'idle' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out'>('idle');
  const [breathText, setBreathText] = useState("Ready");
  const breathRef = useRef<NodeJS.Timeout | null>(null);

  // --- WORKOUT STATE ---
  const [workoutState, setWorkoutState] = useState<'idle' | 'work' | 'rest'>('idle');
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentExercise, setCurrentExercise] = useState(0);
  
  const exercises = [
    "Jumping Jacks", "Wall Sit", "Pushups", "Crunches", "Step-ups", "Squats", "Triceps Dip", "Plank"
  ];

  // --- BMI LOGIC ---
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
  const bmiNum = parseFloat(bmi);
  let status = "Normal";
  let color = "text-[#638c80]";
  if (bmiNum < 18.5) { status = "Underweight"; color = "text-blue-500"; }
  else if (bmiNum < 25) { status = "Healthy"; color = "text-[#638c80]"; }
  else if (bmiNum < 30) { status = "Overweight"; color = "text-amber-500"; }
  else { status = "Obese"; color = "text-rose-500"; }

  // --- BREATH LOGIC ---
  const stopBreath = () => {
    if (breathRef.current) clearTimeout(breathRef.current);
    setBreathState('idle');
    setBreathText("Ready");
  };

  const startBreathCycle = () => {
    setBreathState('inhale');
    setBreathText("Inhale...");
    
    // 4-4-4-4 Box Breathing Loop
    breathRef.current = setTimeout(() => {
      setBreathState('hold-in');
      setBreathText("Hold...");
      breathRef.current = setTimeout(() => {
        setBreathState('exhale');
        setBreathText("Exhale...");
        breathRef.current = setTimeout(() => {
          setBreathState('hold-out');
          setBreathText("Hold...");
          breathRef.current = setTimeout(() => {
            startBreathCycle(); // Loop
          }, 4000);
        }, 4000);
      }, 4000);
    }, 4000);
  };

  useEffect(() => { return () => stopBreath(); }, []);

  // --- WORKOUT LOGIC ---
  useEffect(() => {
    let interval: any;
    if (workoutState !== 'idle' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      if (workoutState === 'work') {
        setWorkoutState('rest');
        setTimeLeft(10); // 10s Rest
      } else if (workoutState === 'rest') {
        setWorkoutState('work');
        setCurrentExercise((p) => (p + 1) % exercises.length);
        setTimeLeft(30); // 30s Work
      }
    }
    return () => clearInterval(interval);
  }, [workoutState, timeLeft]);

  // ===========================================
  // RENDER: BOX BREATHING
  // ===========================================
  if (toolId === 'smart-breath') {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-[#0B1120] text-white p-6 rounded-3xl overflow-hidden relative">
         {/* Animated Background */}
         <div className={`absolute inset-0 transition-opacity duration-[4000ms] ${breathState === 'inhale' ? 'bg-blue-500/20' : 'bg-transparent'}`}></div>
         
         <div className="relative z-10 text-center">
            <div className="mb-12">
               <h2 className="text-3xl font-black tracking-tight mb-2">Box Breathing</h2>
               <p className="text-blue-300 font-mono uppercase tracking-widest text-sm">{breathText}</p>
            </div>

            {/* The Orb */}
            <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
               <div className={`
                  absolute inset-0 border-2 rounded-full transition-all duration-[4000ms] ease-in-out
                  ${breathState === 'inhale' ? 'scale-125 border-blue-400 opacity-100' : 'scale-75 border-slate-700 opacity-30'}
               `}></div>
               <div className={`
                  w-40 h-40 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-2xl transition-all duration-[4000ms] ease-in-out
                  ${breathState === 'inhale' ? 'scale-150 opacity-80' : 'scale-50 opacity-20'}
               `}></div>
               
               <button 
                 onClick={() => breathState === 'idle' ? startBreathCycle() : stopBreath()}
                 className="relative z-20 bg-white text-slate-900 w-20 h-20 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl shadow-blue-500/50"
               >
                  {breathState === 'idle' ? <Play size={28} className="ml-1"/> : <RotateCcw size={28}/>}
               </button>
            </div>

            <p className="mt-12 text-slate-500 text-xs">4s Inhale • 4s Hold • 4s Exhale • 4s Hold</p>
         </div>
      </div>
    );
  }

  // ===========================================
  // RENDER: HIIT TIMER
  // ===========================================
  if (toolId === 'smart-workout') {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
         <div className="text-center space-y-8 max-w-md w-full">
            
            {/* Timer Display */}
            <div className={`
               relative w-64 h-64 mx-auto rounded-full border-8 flex flex-col items-center justify-center shadow-xl transition-colors duration-500
               ${workoutState === 'work' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : workoutState === 'rest' ? 'border-[#638c80] bg-[#638c80]/10 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}
            `}>
               <span className="text-6xl font-black text-slate-900 dark:text-white tabular-nums">{timeLeft}</span>
               <span className="text-xs font-bold uppercase tracking-widest mt-2 text-slate-500">
                  {workoutState === 'idle' ? 'Ready' : workoutState === 'work' ? 'WORK' : 'REST'}
               </span>
            </div>

            {/* Exercise Name */}
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-2">Current Exercise</p>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white">{exercises[currentExercise]}</h2>
               <p className="text-sm text-slate-500 mt-1">Next: {exercises[(currentExercise + 1) % exercises.length]}</p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
               {workoutState === 'idle' ? (
                 <button onClick={() => {setWorkoutState('work'); setTimeLeft(30);}} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all">
                    <Play size={18}/> Start Workout
                 </button>
               ) : (
                 <button onClick={() => {setWorkoutState('idle'); setTimeLeft(30); setCurrentExercise(0);}} className="bg-rose-100 text-rose-600 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-rose-200 transition-colors">
                    <RotateCcw size={18}/> Reset
                 </button>
               )}
            </div>
         </div>
      </div>
    );
  }

  // ===========================================
  // RENDER: BMI CALCULATOR (Default)
  // ===========================================
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
       <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-center">
          <div className="mb-8">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Activity className="text-[#638c80]"/> Smart BMI</h2>
          </div>
          <div className="space-y-8">
             <div>
                <div className="flex justify-between items-end mb-4"><label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Ruler size={14}/> Height</label><div className="text-3xl font-black text-slate-900 dark:text-white">{height} <span className="text-sm font-medium text-slate-400">cm</span></div></div>
                <input type="range" min="100" max="250" value={height} onChange={(e)=>setHeight(Number(e.target.value))} className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full appearance-none cursor-pointer accent-emerald-500"/>
             </div>
             <div>
                <div className="flex justify-between items-end mb-4"><label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Weight size={14}/> Weight</label><div className="text-3xl font-black text-slate-900 dark:text-white">{weight} <span className="text-sm font-medium text-slate-400">kg</span></div></div>
                <input type="range" min="30" max="200" value={weight} onChange={(e)=>setWeight(Number(e.target.value))} className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full appearance-none cursor-pointer accent-blue-500"/>
             </div>
          </div>
       </div>
       <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative">
          <div className="text-center z-10">
             <h3 className={`text-8xl font-black mb-2 ${color}`}>{bmi}</h3>
             <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider bg-white dark:bg-slate-900 shadow-sm ${color}`}>{status}</div>
          </div>
       </div>
    </div>
  );
};
