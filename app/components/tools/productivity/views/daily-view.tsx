'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Check, Clock, Trash2, X, CornerDownRight, Repeat } from 'lucide-react';

const getNext7Days = () => { const d=[]; const t=new Date(); for(let i=0;i<7;i++){ const x=new Date(t); x.setDate(t.getDate()+i); d.push({fullDate:x.toISOString().split('T')[0], dayName:x.toLocaleDateString('en-US',{weekday:'short'}), dayNum:x.getDate().toString().padStart(2,'0')}); } return d; };

const Toast = ({ message, type, onClose }: any) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`fixed bottom-8 right-8 ${type==='error'?'bg-red-600':'bg-[#6366f1]'} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in`}><div><p className="font-bold text-sm">{type==='error'?'Error':'Success'}</p><p className="text-xs text-white/80">{message}</p></div></div>;
};

export const DailyView = ({ tasks, addTask, toggleTask, deleteTask, addSubtask, toggleSubtask, categories, theme }: any) => {
  const t = theme;
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [selectedDate, setSelectedDate] = useState('');
  useEffect(() => { setSelectedDate(new Date().toISOString().split('T')[0]); }, []);

  const [weekDays, setWeekDays] = useState<any[]>([]);
  useEffect(() => { setWeekDays(getNext7Days()); }, []);

  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<any>(null);

  // Form
  const [newTaskText, setNewTaskText] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceEnd, setRecurrenceEnd] = useState('');

  if (!mounted) return null;

  const tasksForSelectedDate = tasks.filter((x: any) => x.date === selectedDate);

  const handleAdd = () => {
    if(!newTaskText.trim()) return;
    const result = addTask({ title: newTaskText, date: selectedDate, category, startTime, endTime, isRecurring, recurrenceEndDate: recurrenceEnd });
    if (result.success) {
        setToast({ msg: isRecurring ? `Series created (${result.count} tasks)` : 'Task added!', type: 'success' });
        setNewTaskText(''); setStartTime(''); setEndTime(''); setIsRecurring(false); setRecurrenceEnd(''); setIsAdding(false);
    } else {
        setToast({ msg: `Conflict: ${result.conflict}`, type: 'error' });
    }
  };

  const handleTimelineClick = (hour: string) => { setStartTime(hour); setIsAdding(true); };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Date Header */}
      <div className="flex-shrink-0 px-8 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4"><h2 className={`text-2xl font-bold ${t.text}`}>Schedule | {selectedDate}</h2></div>
        <div className={`flex gap-2 ${t.cardBg} border ${t.border} p-2 rounded-2xl`}>
          {weekDays.map((item, i) => ( 
             <button key={i} onClick={() => setSelectedDate(item.fullDate)} className={`flex-1 py-3 rounded-xl transition-all ${item.fullDate === selectedDate ? 'bg-blue-600 text-white shadow-lg' : `${t.textSec} ${t.hover}`}`}>
                <span className="text-xs font-bold block opacity-70">{item.dayName}</span><span className="text-xl font-mono">{item.dayNum}</span>
             </button> 
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-8 pt-4 overflow-hidden min-h-0">
        {/* Timeline */}
        <div className={`w-1/3 ${t.cardBg} border ${t.border} rounded-2xl flex flex-col overflow-hidden`}>
           <div className={`p-4 border-b ${t.border} ${t.isDark?'bg-white/5':'bg-gray-50'}`}><h3 className={`font-bold text-sm uppercase ${t.textSec}`}>Timeline</h3></div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
             {hours.map(h => {
               const task = tasksForSelectedDate.find((x:any)=>x.startTime===h); 
               return ( 
                 <div key={h} className="flex gap-3 min-h-[60px]">
                   <span className="text-xs text-gray-400 w-10 text-right pt-2">{h}</span>
                   <div onClick={()=>handleTimelineClick(h)} className={`flex-1 border-t ${t.border} mt-3 cursor-pointer hover:bg-blue-500/5 group relative`}>
                     {task && (
                       <div className="absolute top-0 left-0 right-0 z-10 bg-indigo-500/20 border-l-2 border-indigo-500 p-2 rounded-r">
                         <div className="text-xs font-bold text-indigo-500 truncate">{task.text}</div>
                         <div className="text-[10px] opacity-70">{task.startTime} - {task.endTime}</div>
                       </div>
                     )}
                   </div>
                 </div> 
               ); 
             })}
           </div>
        </div>

        {/* Task List */}
        <div className={`flex-1 ${t.cardBg} border ${t.border} rounded-2xl flex flex-col overflow-hidden`}>
           <div className={`p-4 border-b ${t.border} flex justify-between items-center ${t.isDark?'bg-white/5':'bg-gray-50'}`}>
             <h3 className="font-bold text-sm uppercase text-blue-500">Tasks</h3>
             <button onClick={() => setIsAdding(true)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus size={14}/> Add Task</button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {isAdding && (
                <div className={`p-4 rounded-xl border border-blue-500/30 mb-4 animate-in fade-in slide-in-from-top-2 ${t.bg}`}>
                   <input autoFocus type="text" value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} placeholder="What needs to be done?" className={`w-full ${t.inputBg} rounded-lg p-2 text-sm ${t.text} border ${t.border} mb-3 outline-none `} />
                   
                   <div className="grid grid-cols-2 gap-2 mb-3">
                      <div><label className="text-[10px] uppercase font-bold opacity-50">Start</label><input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className={`w-full ${t.inputBg} rounded p-1 text-xs ${t.text} border ${t.border}`}/></div>
                      <div><label className="text-[10px] uppercase font-bold opacity-50">End</label><input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className={`w-full ${t.inputBg} rounded p-1 text-xs ${t.text} border ${t.border}`}/></div>
                   </div>

                   <div className="flex items-center gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isRecurring ? 'bg-blue-500 border-blue-500' : t.border}`}>{isRecurring && <Check size={10} className="text-white"/>}</div>
                        <input type="checkbox" className="hidden" checked={isRecurring} onChange={e=>setIsRecurring(e.target.checked)} />
                        <span className={`text-xs ${t.textSec}`}>Repeat Daily</span>
                      </label>
                      {isRecurring && (
                        <div className="flex items-center gap-2 animate-in fade-in">
                           <span className={`text-[10px] ${t.textSec}`}>Until:</span>
                           <input type="date" value={recurrenceEnd} onChange={e=>setRecurrenceEnd(e.target.value)} className={`bg-transparent text-xs ${t.text} border-b ${t.border} outline-none`} />
                        </div>
                      )}
                   </div>

                   <div className="flex gap-2 justify-end">
                      <button onClick={() => setIsAdding(false)} className={`px-3 py-1.5 rounded text-xs ${t.textSec} hover:bg-white/10`}>Cancel</button>
                      <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-blue-500">Save Task</button>
                   </div>
                </div>
              )}

              {tasksForSelectedDate.map((task:any) => (
                <div key={task.id} className={`p-4 rounded-xl border transition-all ${task.completed ? 'opacity-50' : ''} ${t.border} ${t.isDark?'bg-black/20':'bg-white hover:shadow-sm'}`}>
                   <div className="flex items-center gap-3">
                     <button onClick={() => toggleTask(task.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-400'}`}>{task.completed && <Check size={12} className="text-white"/>}</button>
                     <div className="flex-1">
                        <div className={`text-sm font-medium ${t.text} ${task.completed ? 'line-through text-gray-500' : ''}`}>
                           {task.text}
                           {task.isRecurring && <Repeat size={10} className="inline ml-2 text-blue-400" />}
                        </div>
                        {task.parentWeeklyId && <div className="mt-1"><span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">Weekly Goal Linked</span></div>}
                     </div>
                     <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                   </div>
                   <div className="ml-8 mt-2 space-y-1">
                      {task.subtasks?.map((s:any) => (<div key={s.id} onClick={()=>toggleSubtask(task.id,s.id)} className="flex items-center gap-2 cursor-pointer group"><div className={`w-3 h-3 rounded border ${s.completed?'bg-gray-400 border-gray-400':'border-gray-400'}`}></div><span className={`text-xs ${s.completed?'line-through':''} ${t.textSec} group-hover:${t.text}`}>{s.text}</span></div>))}
                      <button onClick={()=>addSubtask(task.id, "New Step")} className="text-[10px] text-blue-500 flex items-center gap-1 mt-1 hover:underline"><CornerDownRight size={10}/> Add Step</button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
