"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "lucide-react";
import { calcSunTimes, calcChoghadiya, calcHora, CHOGHADIYA_COLOR, type ChoghadiyaSegment, type HoraSegment } from "./lib/time-calc";
import { calcPanchang, fmtTime } from "./lib/panchang";
import { istToUtComponents } from "./lib/astro-core";
import { CityPicker, useSavedCity } from "./shared/CityPicker";

const CHOG_DESC: Record<string, string> = {
  Amrit:"Sarvottam — sabhi kaaryon ke liye shreshtha",
  Shubh:"Shubh — naye kaam, vivah prastav, meetings",
  Labh:"Labh — vyapar, dhan ka len-den, khareedari",
  Char:"Char — yatra, safar, movement ke liye theek",
  Udveg:"Udveg — chinta ka samay, avoid karo",
  Kaal:"Kaal — atyant ashubh, koi naya kaam nahi",
  Rog:"Rog — bimari ka samay, avoid shubh kary",
};
const CHOG_QUALITY_LABEL: Record<string,"good"|"neutral"|"bad"> = {
  Amrit:"good", Shubh:"good", Labh:"good", Char:"neutral",
  Udveg:"bad", Kaal:"bad", Rog:"bad"
};

const HORA_DESC: Record<string, string> = {
  Surya:"Netritv, sarkar, pravesh ke liye acha",
  Chandra:"Yatra, jal kaarya, naya kaam",
  Mangal:"Shakti, ladaai, nayi shuruaat se bachein",
  Budh:"Vyapar, padhaai, lekhan ke liye uttam",
  Guru:"Vivah, shiksha, dharma — sarvashreshtha",
  Shukra:"Prem, kala, saundarya, khareedari",
  Shani:"Shram, mehnat — koi naya nahi",
};

export function Choghadiya() {
  const [city, setCity]     = useSavedCity();
  const [now,  setNow]      = useState(new Date());
  const [dateStr, setDate]  = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
  const [tab, setTab] = useState<"chog"|"hora">("chog");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { chog, hora, pg, sunT } = useMemo(() => {
    const [y, mo, d] = dateStr.split("-").map(Number);
    const lat = city?.lat ?? 28.6667, lon = city?.lon ?? 77.2167;
    const sunT = calcSunTimes(y, mo, d, lat, lon);
    const nextSun = calcSunTimes(y, mo, d+1, lat, lon);
    const { utHour } = istToUtComponents(y, mo, d, Math.floor(sunT.sunriseIST), Math.round((sunT.sunriseIST%1)*60));
    const pg   = calcPanchang(y, mo, d, utHour);
    const chog = calcChoghadiya(sunT.sunriseIST, sunT.sunsetIST, nextSun.sunriseIST+24, pg.vara);
    const hora = calcHora(sunT.sunriseIST, sunT.sunsetIST, nextSun.sunriseIST+24, pg.vara);
    return { chog, hora, pg, sunT };
  }, [city, dateStr]);

  const istNow = now.getHours() + now.getMinutes()/60;
  const isToday = dateStr === new Date().toISOString().split("T")[0];

  const SegmentRow = ({ s, isCur }: { s: ChoghadiyaSegment; isCur: boolean }) => {
    const q = CHOG_QUALITY_LABEL[s.name];
    return (
      <div className={`rounded-xl border px-4 py-3 transition-all ${isCur ? 'ring-2 ring-violet-500 scale-[1.01]' : ''} ${CHOGHADIYA_COLOR[s.name] ?? 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-sm">{s.nameHindi} <span className="font-normal text-xs opacity-70">({s.name})</span></p>
              <p className="text-xs opacity-60 mt-0.5">{CHOG_DESC[s.name]}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className="font-bold text-sm">{s.startStr} – {s.endStr}</p>
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${q==='good'?'bg-emerald-600 text-white':q==='bad'?'bg-red-500 text-white':'bg-blue-500 text-white'}`}>
              {q==='good'?'शुभ ✓':q==='bad'?'अशुभ ✗':'सामान्य'}
            </div>
          </div>
        </div>
        {isCur && <p className="text-xs font-bold mt-2 opacity-90">← Abhi yahi chal raha hai</p>}
      </div>
    );
  };

  const HoraRow = ({ h, isCur }: { h: HoraSegment; isCur: boolean }) => (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 ${isCur?'ring-2 ring-violet-500':''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{h.lord} Hora <span className="text-xs text-gray-400">({h.lordEn})</span></p>
          <p className="text-xs text-gray-500 mt-0.5">{HORA_DESC[h.lord]}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{h.startStr} – {h.endStr}</p>
          {isCur && <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">← Abhi</p>}
        </div>
      </div>
    </div>
  );

  if (!city) return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <Header />
      <CityPicker city={null} onSelect={setCity} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Header />
        <div className="flex items-center gap-2">
          <input type="date" value={dateStr} onChange={e => setDate(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <CityPicker city={city} onSelect={setCity} compact />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-violet-600 text-white rounded-2xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-violet-200 text-xs">{pg.varaHindi} · {pg.lunarMonthHindi}</p>
          <p className="font-bold">Sunrise {fmtTime(sunT.sunriseIST)} → Sunset {fmtTime(sunT.sunsetIST)}</p>
        </div>
        {isToday && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Aaj</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {([["chog","Choghadiya चौघड़िया"],["hora","Hora होरा"]] as const).map(([id,label]) => (
          <button key={id} onClick={() => setTab(id as "chog"|"hora")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab===id?'bg-white dark:bg-gray-900 text-violet-700 dark:text-violet-300 shadow':'text-gray-500 dark:text-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "chog" ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">☀️ Din Choghadiya ({fmtTime(sunT.sunriseIST)} – {fmtTime(sunT.sunsetIST)})</p>
            <div className="space-y-2">
              {chog.filter(s => s.isDay).map((s, i) => (
                <SegmentRow key={i} s={s} isCur={isToday && istNow >= s.start && istNow < s.end} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">🌙 Raat Choghadiya ({fmtTime(sunT.sunsetIST)} – {fmtTime(sunT.sunriseIST+24)})</p>
            <div className="space-y-2">
              {chog.filter(s => !s.isDay).map((s, i) => (
                <SegmentRow key={i} s={s} isCur={isToday && istNow >= s.start && istNow < s.end} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 px-1">Surya se shuru hone wali 24 horas (1 hora ≈ 1 ghante)</p>
          {hora.map((h, i) => (
            <HoraRow key={i} h={h} isCur={isToday && istNow >= h.start && istNow < h.end} />
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Lahiri Ayanamsha · {city.name} ({city.lat.toFixed(2)}°N)
      </p>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
        <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Choghadiya</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Din aur Raat ka samay chart</p>
      </div>
    </div>
  );
}
