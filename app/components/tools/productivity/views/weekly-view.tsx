'use client';
import React, { useState, useEffect } from 'react';
import { Plus, X, ArrowRight, ArrowLeft, CheckCircle, Circle, PlayCircle, Trash2, Calendar, Link } from 'lucide-react';

const STORAGE_KEY = 'lifeos_weekly_kanban';

export const WeeklyView = ({ tasks, addTask, theme }: any) => {
  const t = theme;
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [activeCard, setActiveCard] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) setItems(JSON.parse(s));
    else setItems([{ id: 1, text: "Launch MVP", status: 'inprogress' }]);
  }, []);

  useEffect(() => { if(mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items, mounted]);

  const addItem = (text: string, status: string) => setItems([...items, { id: Date.now(), text, status }]);
  const deleteItem = (id: number) => setItems(items.filter(i => i.id !== id));
  
  if(!mounted) return null;

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden relative">
      <div className="flex justify-between items-end mb-6"><h2 className={`text-3xl font-bold ${t.text}`}>Weekly Sprint</h2></div>
      <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
        <Col title="To Do" status="todo" items={items} color="gray" icon={<Circle size={16}/>} onAdd={addItem} onDelete={deleteItem} setActive={setActiveCard} t={t} />
        <Col title="In Progress" status="inprogress" items={items} color="blue" icon={<PlayCircle size={16}/>} onAdd={addItem} onDelete={deleteItem} setActive={setActiveCard} t={t} />
        <Col title="Done" status="done" items={items} color="emerald" icon={<CheckCircle size={16}/>} onAdd={addItem} onDelete={deleteItem} setActive={setActiveCard} t={t} />
      </div>
      
      {activeCard && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8">
           <div className={`${t.cardBg} w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl flex flex-col border ${t.border} overflow-hidden animate-in zoom-in-95`}>
              <div className={`p-6 border-b ${t.border} flex justify-between items-start ${t.isDark?'bg-white/5':'bg-gray-50'}`}>
                 <div><div className="text-xs font-bold text-blue-500 uppercase mb-1">Project Hub</div><h2 className={`text-2xl font-bold ${t.text}`}>{activeCard.text}</h2></div>
                 <button onClick={() => setActiveCard(null)} className={`p-2 rounded-lg ${t.hover} ${t.textSec}`}><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                 <div className="mb-6">
                    <h3 className={`text-sm font-bold uppercase mb-3 flex items-center gap-2 ${t.textSec}`}><Link size={14}/> Linked Daily Tasks</h3>
                    <div className="space-y-2">
                       {tasks.filter((x:any) => x.parentWeeklyId === activeCard.id).map((task:any) => (
                          <div key={task.id} className={`p-3 rounded-lg border ${t.border} flex items-center gap-3 ${t.bg}`}>
                             <div className={`w-2 h-2 rounded-full ${task.completed?'bg-emerald-500':'bg-blue-500'}`}></div>
                             <div className="flex-1"><div className={`text-sm ${t.text} ${task.completed?'line-through opacity-50':''}`}>{task.text}</div><div className={`text-[10px] ${t.textSec}`}>{task.date}</div></div>
                          </div>
                       ))}
                       {tasks.filter((x:any) => x.parentWeeklyId === activeCard.id).length === 0 && <div className={`p-4 border border-dashed ${t.border} rounded text-center text-xs ${t.textSec}`}>No linked daily tasks yet. Add one below!</div>}
                    </div>
                 </div>
                 <div className={`p-4 rounded-xl border ${t.border} ${t.isDark?'bg-black/20':'bg-gray-50'}`}>
                    <h4 className={`text-xs font-bold mb-3 ${t.text}`}>Add Task to this Project</h4>
                    <AddLinkedTaskForm addTask={addTask} parentId={activeCard.id} t={t} />
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const AddLinkedTaskForm = ({ addTask, parentId, t }: any) => {
  const [txt, setTxt] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rec, setRec] = useState(false);
  const [end, setEnd] = useState('');

  const submit = () => {
     if(!txt) return;
     addTask({ title: txt, date, category: "Project", isRecurring: rec, recurrenceEndDate: end, parentWeeklyId: parentId });
     setTxt(''); setRec(false);
  };

  return (
    <div className="flex flex-col gap-3">
       <input type="text" placeholder="Task name..." value={txt} onChange={e=>setTxt(e.target.value)} className={`w-full ${t.inputBg} border ${t.border} rounded p-2 text-sm ${t.text}`} />
       <div className="flex gap-2">
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className={`bg-transparent border ${t.border} rounded p-1 text-xs ${t.text}`} />
          <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={rec} onChange={e=>setRec(e.target.checked)} /><span className={`text-xs ${t.textSec}`}>Repeat?</span></label>
          {rec && <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className={`bg-transparent border ${t.border} rounded p-1 text-xs ${t.text}`} />}
       </div>
       <button onClick={submit} className="bg-blue-600 text-white text-xs font-bold py-2 rounded">Add Linked Task</button>
    </div>
  );
};

const Col = ({ title, status, items, color, icon, onAdd, onDelete, setActive, t }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [txt, setTxt] = useState('');
  const filtered = items.filter((i:any) => i.status === status);

  return (
    <div className={`${t.cardBg} border ${t.border} rounded-2xl flex flex-col h-full overflow-hidden`}>
       <div className={`p-4 border-b ${t.border} flex justify-between items-center ${t.isDark?`bg-${color}-500/5`:'bg-gray-50'}`}>
          <div className={`flex items-center gap-2 font-bold text-sm uppercase ${t.textSec}`}>{icon} {title}</div>
          <span className="text-xs opacity-50">{filtered.length}</span>
       </div>
       <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {filtered.map((item:any) => (
             <div key={item.id} onClick={()=>setActive(item)} className={`p-3 rounded-xl border ${t.border} ${t.isDark?'bg-black/20 hover:bg-white/5':'bg-white hover:shadow'} cursor-pointer transition-all group relative`}>
                <div className={`text-sm font-medium ${t.text}`}>{item.text}</div>
                <button onClick={(e)=>{e.stopPropagation(); onDelete(item.id)}} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-red-400"><Trash2 size={14}/></button>
             </div>
          ))}
       </div>
       <div className={`p-3 border-t ${t.border} ${t.bg}`}>
          {isAdding ? (
             <div className="flex gap-2"><input autoFocus className={`flex-1 ${t.inputBg} rounded px-2 text-sm ${t.text}`} value={txt} onChange={e=>setTxt(e.target.value)} /><button onClick={()=>{onAdd(txt, status); setTxt(''); setIsAdding(false)}} className="text-blue-500 text-xs font-bold">Add</button></div>
          ) : <button onClick={()=>setIsAdding(true)} className={`w-full py-2 border border-dashed ${t.border} rounded text-xs ${t.textSec} hover:bg-white/5`}><Plus size={12} className="inline"/> Add</button>}
       </div>
    </div>
  );
};
