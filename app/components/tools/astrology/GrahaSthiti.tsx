"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Star, RefreshCw } from "lucide-react";
import { julianDay, jcent, lahiriAyanamsha, sunLonTropical, moonLonTropical, rahuLonTropical, planetLonTropical, PLANET_ELEMS, norm, istToUtComponents } from "./lib/astro-core";
import { RASHI_DATA, NAKSHATRA_DATA, fmtDeg } from "./lib/panchang";
import { CityPicker, useSavedCity } from "./shared/CityPicker";

const GRAHA_LIST = [
  { name:"Surya",  hindi:"सूर्य",  en:"Sun",      emoji:"☀️",  color:"text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  { name:"Chandra",hindi:"चंद्र",  en:"Moon",     emoji:"🌙",  color:"text-slate-600 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700" },
  { name:"Mangal", hindi:"मंगल",   en:"Mars",     emoji:"♂️",  color:"text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" },
  { name:"Budh",   hindi:"बुध",    en:"Mercury",  emoji:"☿",   color:"text-green-600 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" },
  { name:"Guru",   hindi:"गुरु",   en:"Jupiter",  emoji:"♃",   color:"text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800" },
  { name:"Shukra", hindi:"शुक्र",  en:"Venus",    emoji:"♀️",  color:"text-pink-600 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800" },
  { name:"Shani",  hindi:"शनि",    en:"Saturn",   emoji:"♄",   color:"text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800" },
  { name:"Rahu",   hindi:"राहु",   en:"N.Node",   emoji:"☊",   color:"text-violet-600 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800" },
  { name:"Ketu",   hindi:"केतु",   en:"S.Node",   emoji:"☋",   color:"text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800" },
];

// Exaltation / Debilitation / Own sign lookup
const EXALT_RASHI:   Record<string, number> = { Surya:0, Chandra:1, Mangal:9, Budh:5, Guru:3, Shukra:11, Shani:6 };
const DEBIL_RASHI:   Record<string, number> = { Surya:6, Chandra:7, Mangal:3, Budh:11, Guru:9, Shukra:5, Shani:0 };
const OWN_RASHIS:    Record<string, number[]> = {
  Surya:[4], Chandra:[3], Mangal:[0,7], Budh:[2,5], Guru:[8,11], Shukra:[1,6], Shani:[9,10]
};

function getDignity(name: string, rashi: number): string {
  if (EXALT_RASHI[name] === rashi)   return "Uccha (Exalted)";
  if (DEBIL_RASHI[name] === rashi)   return "Neech (Debilitated)";
  if (OWN_RASHIS[name]?.includes(rashi)) return "Swakshetra (Own)";
  return "";
}

interface GrahaInfo {
  name: string; hindi: string; en: string; emoji: string; color: string;
  lonSid: number; rashi: number; degInRashi: number;
  nakshatra: number; dignity: string; retrograde: boolean;
}

function computeGrahas(date: Date): GrahaInfo[] {
  const y = date.getFullYear(), mo = date.getMonth()+1, d = date.getDate();
  const { utHour } = istToUtComponents(y, mo, d, date.getHours(), date.getMinutes());
  const jd   = julianDay(y, mo, d, utHour);
  const t    = jcent(jd);
  const ayan = lahiriAyanamsha(t);

  const sunT   = sunLonTropical(t);
  const moonT  = moonLonTropical(t);
  const rahuT  = rahuLonTropical(t);

  const sunSid  = norm(sunT  - ayan);
  const moonSid = norm(moonT - ayan);
  const rahuSid = norm(rahuT - ayan);
  const ketuSid = norm(rahuSid + 180);

  const results: GrahaInfo[] = [];

  const addGraha = (meta: typeof GRAHA_LIST[0], sid: number, retro: boolean) => {
    const rashi     = Math.floor(sid / 30);
    const degInR    = sid % 30;
    const nakshatra = Math.floor(sid / (360/27));
    results.push({
      ...meta, lonSid:sid, rashi, degInRashi:degInR,
      nakshatra, dignity:getDignity(meta.name, rashi), retrograde:retro
    });
  };

  addGraha(GRAHA_LIST[0], sunSid,  false);
  addGraha(GRAHA_LIST[1], moonSid, false);

  for (let i = 0; i < PLANET_ELEMS.length; i++) {
    const pe = PLANET_ELEMS[i];
    const trop = planetLonTropical(t, pe.L0, pe.Lr, pe.varpi, pe.e);
    const sid  = norm(trop - ayan);
    // Simplified retrograde: compare with yesterday
    const tY = jcent(jd - 1);
    const tropY = planetLonTropical(tY, pe.L0, pe.Lr, pe.varpi, pe.e);
    const sidY  = norm(tropY - ayan);
    const retro = ((sid - sidY + 360) % 360) > 180; // moved "backwards"
    addGraha(GRAHA_LIST[i+2], sid, retro);
  }

  addGraha(GRAHA_LIST[7], rahuSid, true);  // Rahu always retrograde
  addGraha(GRAHA_LIST[8], ketuSid, true);  // Ketu always retrograde

  return results;
}

export function GrahaSthiti() {
  const [city, setCity] = useSavedCity();
  const [now,  setNow]  = useState(new Date());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [ayanSel, setAyanSel]  = useState<"lahiri">("lahiri");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const grahas = useMemo(() => computeGrahas(now), [now]);
  const ayan   = useMemo(() => {
    const t = jcent(julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(), 0));
    return lahiriAyanamsha(t);
  }, [now]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
            <Star className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Graha Sthiti</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Navagraha ki abhi ki sthiti — live</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setNow(new Date())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Ayanamsha info */}
      <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm">
        <span className="text-xs text-gray-500">Ayanamsha:</span>
        <span className="font-bold text-violet-700 dark:text-violet-300">Lahiri {ayan.toFixed(4)}°</span>
        <span className="text-xs text-gray-400 ml-auto">
          {now.toLocaleString('hi-IN', { hour:'2-digit', minute:'2-digit' })} IST
        </span>
      </div>

      {/* Vakri alert */}
      {grahas.filter(g => g.retrograde && !["Rahu","Ketu"].includes(g.name)).length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">⚠ Vakri Graha (Retrograde)</p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {grahas.filter(g => g.retrograde && !["Rahu","Ketu"].includes(g.name)).map(g => g.hindi).join(", ")} abhi vakri (retrograde) hai
          </p>
        </div>
      )}

      {/* Planet grid */}
      <div className="space-y-2">
        {grahas.map(g => {
          const rashi = RASHI_DATA[g.rashi];
          const nk    = NAKSHATRA_DATA[g.nakshatra];
          const isExp = expanded === g.name;
          return (
            <div key={g.name}>
              <button
                onClick={() => setExpanded(isExp ? null : g.name)}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${g.color} hover:opacity-90`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{g.hindi} ({g.en})</span>
                      {g.retrograde && <span className="text-xs font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">® Vakri</span>}
                      {g.dignity && <span className="text-xs font-medium bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-full">{g.dignity}</span>}
                    </div>
                    <p className="text-xs opacity-70 mt-0.5">{rashi.symbol} {rashi.name} · {fmtDeg(g.degInRashi)} · {nk.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{g.lonSid.toFixed(2)}°</p>
                    <p className="text-[10px] opacity-60">sidereal</p>
                  </div>
                </div>
              </button>
              {isExp && (
                <div className="bg-white dark:bg-gray-900 border border-t-0 border-gray-200 dark:border-gray-800 rounded-b-xl px-4 py-3 space-y-1.5 text-xs">
                  {[
                    ["Rashi", `${rashi.name} (${rashi.en}) ${rashi.symbol}`],
                    ["Degree", `${fmtDeg(g.degInRashi)} in ${rashi.name}`],
                    ["Full Sidereal Lon", `${g.lonSid.toFixed(4)}°`],
                    ["Nakshatra", `${nk.name} (${nk.hindi}) — Lord: ${nk.lord}`],
                    ["Nakshatra Devata", nk.devata],
                    ["Rashi Lord", rashi.lord],
                    ["Element", rashi.element],
                    ["Dignity", g.dignity || "Samaanya (Normal)"],
                    ["Status", g.retrograde ? "Vakri (Retrograde) ®" : "Margi (Direct)"],
                  ].map(([k,v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        Sun ±0.01° · Moon ±0.3° · Planets ±1–5° · Lahiri {ayan.toFixed(2)}°
      </p>
    </div>
  );
}
