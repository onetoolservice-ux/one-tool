"use client";
import React, { useState, useMemo } from "react";
import { Heart } from "lucide-react";
import { getFestivals, type Festival } from "./lib/festivals";
import { CityPicker, useSavedCity } from "./shared/CityPicker";

const TYPE_EMOJI: Record<string, string> = {
  major:"🎊", ekadashi:"🕉️", purnima:"🌕", amavasya:"🌑",
  pradosh:"🔱", chaturthi:"🐘", other:"⭐"
};
const TYPE_COLOR: Record<string, string> = {
  major:"bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  ekadashi:"bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  purnima:"bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700",
  amavasya:"bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800",
  pradosh:"bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800",
  chaturthi:"bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
  other:"bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800",
};

const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_HINDI   = ['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'];

export function VratTyohar() {
  const [city, setCity] = useSavedCity();
  const today = new Date();
  const [filter, setFilter] = useState<string>("all");
  const [days, setDays]     = useState(45);

  const festivals = useMemo(() => {
    const start = new Date(today);
    const end   = new Date(today);
    end.setDate(today.getDate() + days);
    return getFestivals(start, end);
  }, [days]);

  const filtered = filter === "all" ? festivals : festivals.filter(f => f.type === filter);

  const todayFests = useMemo(() => {
    const s = new Date(today); s.setHours(0,0,0,0);
    const e = new Date(today); e.setHours(23,59,59,999);
    return getFestivals(s, e);
  }, []);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Festival[]>();
    filtered.forEach(f => {
      const key = f.date.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    });
    return [...map.entries()].map(([key, fests]) => ({ date: new Date(key), fests }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filtered]);

  const FILTERS = [
    { id:"all",       label:"Sabhi", hindi:"सभी" },
    { id:"major",     label:"Tyohar", hindi:"त्योहार" },
    { id:"ekadashi",  label:"Ekadashi", hindi:"एकादशी" },
    { id:"purnima",   label:"Purnima", hindi:"पूर्णिमा" },
    { id:"amavasya",  label:"Amavasya", hindi:"अमावस्या" },
    { id:"pradosh",   label:"Pradosh", hindi:"प्रदोष" },
    { id:"chaturthi", label:"Chaturthi", hindi:"चतुर्थी" },
    { id:"other",     label:"Vishesh", hindi:"विशेष" },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
          <Heart className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vrat aur Tyohar</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming vrat, parv aur tyohar ka calendar</p>
        </div>
      </div>

      {/* Today's vrats */}
      {todayFests.length > 0 && (
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl p-4">
          <p className="text-violet-200 text-xs mb-1.5">🙏 Aaj Ke Vrat / Tyohar</p>
          {todayFests.map((f, i) => (
            <div key={i} className="flex items-center gap-2 mb-1">
              <span className="text-lg">{TYPE_EMOJI[f.type]}</span>
              <div>
                <p className="font-bold text-sm">{f.hindi}</p>
                <p className="text-violet-200 text-xs">{f.description}</p>
              </div>
              {f.fast && <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">Upvas</span>}
            </div>
          ))}
        </div>
      )}

      {/* Range + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Agle</span>
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500">
            {[30,45,60,90,120].map(n => <option key={n} value={n}>{n} din</option>)}
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">ke tyohar</span>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter===f.id ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300'}`}>
            {f.hindi} ({f.label})
          </button>
        ))}
      </div>

      {/* Festival list */}
      {groupedByDate.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🙏</p>
          <p>Koi tyohar nahi mila</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(({ date, fests }) => {
            const isToday = date.toDateString() === today.toDateString();
            const isTomorrow = date.toDateString() === new Date(today.getTime()+86400000).toDateString();
            return (
              <div key={date.toDateString()}>
                {/* Date header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isToday ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {isToday ? "Aaj" : isTomorrow ? "Kal" : `${date.getDate()} ${MONTH_NAMES[date.getMonth()+1]}`}
                    <span className="font-normal">{DAY_HINDI[date.getDay()]}</span>
                  </div>
                  <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                </div>
                {/* Festival cards */}
                <div className="space-y-2">
                  {fests.map((f, i) => (
                    <div key={i} className={`border rounded-xl px-4 py-3 flex items-start gap-3 ${TYPE_COLOR[f.type]}`}>
                      <span className="text-2xl mt-0.5">{TYPE_EMOJI[f.type]}</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{f.hindi}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {f.fast && (
                              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full font-semibold">
                                🕉 Upvas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Drik Ganit par aadharit · Tithi sunrise-based · Kuch pradeshik tyohar alag ho sakte hain
      </p>
    </div>
  );
}
