"use client";
import React, { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { julianDay, jcent, lahiriAyanamsha, sunLonTropical, moonLonTropical, rahuLonTropical, planetLonTropical, PLANET_ELEMS, norm, jdToDateParts } from "./lib/astro-core";
import { RASHI_DATA, NAKSHATRA_DATA } from "./lib/panchang";

interface Transit {
  planet: string; planetHindi: string; emoji: string;
  fromRashi: number; toRashi: number;
  approxDate: string;
  daysFromNow: number;
  significance: string;
  retrograde: boolean;
}

const PLANET_META = [
  { name:"Surya",   hindi:"सूर्य",   emoji:"☀️",  significance:"Har maas rashi badalta hai — vitality, net-worth, status" },
  { name:"Chandra", hindi:"चंद्र",   emoji:"🌙",  significance:"Har 2.5 din — mann, bhavana, roz ka mood" },
  { name:"Budh",    hindi:"बुध",     emoji:"☿",   significance:"Vyapar, lekhan, yatra — Vakri hone par technical problems" },
  { name:"Shukra",  hindi:"शुक्र",   emoji:"♀️",  significance:"Prem, kala, dhan — vivah ke faislon mein important" },
  { name:"Mangal",  hindi:"मंगल",    emoji:"♂️",  significance:"Shakti, kaam, accidents — Mangal Dosha check karein" },
  { name:"Guru",    hindi:"गुरु",    emoji:"♃",   significance:"Sabse shubh — Guru transit 12-13 maah tak asar karta hai" },
  { name:"Shani",   hindi:"शनि",     emoji:"♄",   significance:"Sade Sati, Dhaiya — Shani transit 2.5 saal tak asar karta hai" },
  { name:"Rahu",    hindi:"राहु",    emoji:"☊",   significance:"Illusion, ambition — 18 maah ek rashi mein. Axis shift important" },
  { name:"Ketu",    hindi:"केतु",    emoji:"☋",   significance:"Spirituality, detachment — Rahu ke saath axis shift" },
];

function getLonForPlanet(name: string, t: number, ayan: number): number {
  if (name === "Surya")   return norm(sunLonTropical(t) - ayan);
  if (name === "Chandra") return norm(moonLonTropical(t) - ayan);
  if (name === "Rahu")    return norm(rahuLonTropical(t) - ayan);
  if (name === "Ketu")    return norm(rahuLonTropical(t) - ayan + 180);
  const pe = PLANET_ELEMS.find(p => p.name === name);
  if (!pe) return 0;
  return norm(planetLonTropical(t, pe.L0, pe.Lr, pe.varpi, pe.e) - ayan);
}

const STEP_DAYS: Record<string, number> = {
  Surya:1, Chandra:0.1, Budh:1, Shukra:1, Mangal:2, Guru:10, Shani:15, Rahu:5, Ketu:5
};

function findNextTransit(name: string, startJD: number): Transit | null {
  const ayan0 = lahiriAyanamsha(jcent(startJD));
  const lon0  = getLonForPlanet(name, jcent(startJD), ayan0);
  const rashi0 = Math.floor(lon0 / 30);
  const step   = STEP_DAYS[name] ?? 1;
  const meta   = PLANET_META.find(p => p.name === name)!;

  for (let d = step; d < 800; d += step) {
    const jd  = startJD + d;
    const t   = jcent(jd);
    const lon = getLonForPlanet(name, t, lahiriAyanamsha(t));
    const rashi = Math.floor(lon / 30);
    if (rashi !== rashi0) {
      const dp = jdToDateParts(jd);
      const dateStr = `${dp.day}/${dp.month}/${dp.year}`;
      // Retrograde check for planets (simplified: going backwards in rashi)
      const prevLon = getLonForPlanet(name, jcent(jd - step), lahiriAyanamsha(jcent(jd - step)));
      const diff = norm(lon - prevLon);
      const retro = diff > 180;
      return {
        planet: name, planetHindi: meta.hindi, emoji: meta.emoji,
        fromRashi: rashi0, toRashi: rashi,
        approxDate: dateStr, daysFromNow: Math.round(d),
        significance: meta.significance, retrograde: retro,
      };
    }
  }
  return null;
}

// Sade Sati check — Shani in 12th, 1st, or 2nd from Moon rashi
function sadeSatiStatus(shaniRashi: number, moonRashi: number): string {
  const diff = (shaniRashi - moonRashi + 12) % 12;
  if (diff === 11) return "Shuru ho raha hai (12th house)";
  if (diff === 0)  return "Madhya mein (1st house — intense)";
  if (diff === 1)  return "Khatam ho raha hai (2nd house)";
  // Dhaiya
  if (diff === 3 || diff === 7) return "Dhaiya chal raha hai";
  return "Nahi";
}

export function Gochar() {
  const [selRashi, setSelRashi] = useState<number | null>(null);

  const { transits, currentPositions, shaniRashi, rahuRashi } = useMemo(() => {
    const now = new Date();
    const jd  = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(), 0);
    const t   = jcent(jd);
    const ayan = lahiriAyanamsha(t);

    const positions = PLANET_META.map(pm => {
      const lon  = getLonForPlanet(pm.name, t, ayan);
      const rashi = Math.floor(lon / 30);
      return { name:pm.name, hindi:pm.hindi, emoji:pm.emoji, rashi, lon, significance:pm.significance };
    });

    const transits = PLANET_META.map(pm => findNextTransit(pm.name, jd)).filter(Boolean) as Transit[];
    transits.sort((a, b) => a.daysFromNow - b.daysFromNow);

    const shaniP = positions.find(p => p.name==="Shani")!;
    const rahuP  = positions.find(p => p.name==="Rahu")!;

    return { transits, currentPositions:positions, shaniRashi:shaniP.rashi, rahuRashi:rahuP.rashi };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
          <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gochar (Planetary Transits)</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Agle graha rashi parivartan ka samay</p>
        </div>
      </div>

      {/* Sade Sati check */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Apni Rashi aur Sade Sati</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
          {RASHI_DATA.map((r, i) => (
            <button key={i} onClick={() => setSelRashi(i === selRashi ? null : i)}
              className={`p-2 rounded-xl border text-center transition-all ${i === selRashi ? 'bg-violet-600 border-violet-600 text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-violet-300'}`}>
              <p className="text-lg">{r.symbol}</p>
              <p className="text-[9px] font-semibold text-gray-700 dark:text-gray-300">{r.name}</p>
            </button>
          ))}
        </div>
        {selRashi !== null && (
          <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-xl p-3 space-y-1.5 text-sm">
            <p className="font-bold text-violet-800 dark:text-violet-200">
              {RASHI_DATA[selRashi].symbol} {RASHI_DATA[selRashi].name} — {RASHI_DATA[selRashi].en}
            </p>
            <div className="flex justify-between">
              <span className="text-gray-500">Sade Sati / Dhaiya</span>
              <span className={`font-semibold ${sadeSatiStatus(shaniRashi,selRashi).includes("Nahi") ? 'text-emerald-600' : 'text-red-500'}`}>
                {sadeSatiStatus(shaniRashi, selRashi)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Rahu axis</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                Rahu {RASHI_DATA[rahuRashi].name} / Ketu {RASHI_DATA[(rahuRashi+6)%12].name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Current positions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Abhi Ki Sthiti</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {currentPositions.map(p => (
            <div key={p.name} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 text-center">
              <p className="text-xl">{p.emoji}</p>
              <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{p.hindi}</p>
              <p className="text-[10px] text-violet-600 dark:text-violet-400">{RASHI_DATA[p.rashi].symbol} {RASHI_DATA[p.rashi].name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming transits */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">Aane Wale Rashi Parivartan</p>
        {transits.slice(0,12).map((tr, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tr.emoji}</span>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                    {tr.planetHindi} ({tr.planet})
                    {tr.retrograde && <span className="ml-1 text-[10px] text-red-500 font-bold">® Vakri</span>}
                  </p>
                  <p className="text-xs text-violet-600 dark:text-violet-400">
                    {RASHI_DATA[tr.fromRashi].symbol} {RASHI_DATA[tr.fromRashi].name}
                    {" → "}
                    {RASHI_DATA[tr.toRashi].symbol} {RASHI_DATA[tr.toRashi].name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{tr.significance}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{tr.approxDate}</p>
                <p className="text-[10px] text-gray-400">{tr.daysFromNow} din mein</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        Lahiri Ayanamsha · Approximate transit dates · Outer planets ±2-5 din accuracy
      </p>
    </div>
  );
}
