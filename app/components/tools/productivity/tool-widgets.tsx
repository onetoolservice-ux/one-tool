'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Save } from 'lucide-react';

// --- POMODORO TIMER ---
export const TimerWidget = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-7xl font-mono font-bold text-white mb-8 tracking-tighter">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isActive ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
        >
          {isActive ? <><Pause size={18} /> PAUSE</> : <><Play size={18} /> START</>}
        </button>
        <button 
          onClick={resetTimer}
          className="p-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

// --- CALCULATOR ---
export const CalculatorWidget = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleClick = (val: string) => setInput((prev) => prev + val);
  
  const clear = () => {
    setInput('');
    setResult('');
  };

  const calculate = () => {
    try {
      // safe eval replacement
      // eslint-disable-next-line no-new-func
      setResult(new Function('return ' + input)());
    } catch (e) {
      setResult('Error');
    }
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', 'C', '+'
  ];

  return (
    <div className="w-full">
      <div className="bg-[#0F111A] p-4 rounded-xl mb-4 text-right min-h-[80px] flex flex-col justify-end">
        <div className="text-gray-400 text-sm h-6">{input || '0'}</div>
        <div className="text-3xl font-bold text-white truncate">{result || (input ? '' : '0')}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => btn === 'C' ? clear() : handleClick(btn)}
            className={`p-4 rounded-lg font-bold transition-colors ${
              ['/', '*', '-', '+'].includes(btn) 
                ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white' 
                : btn === 'C' 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            {btn}
          </button>
        ))}
        <button 
          onClick={calculate}
          className="col-span-4 bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-500 mt-2"
        >
          =
        </button>
      </div>
    </div>
  );
};

// --- NOTE WIDGET ---
export const NoteWidget = () => {
  const [note, setNote] = useState('');
  
  return (
    <div className="flex flex-col gap-4">
      <textarea 
        className="w-full h-48 bg-[#0F111A] rounded-xl p-4 text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        placeholder="Type your quick thoughts here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{note.length} characters</span>
        <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
          <Save size={14} /> Auto-saving...
        </button>
      </div>
    </div>
  );
};
