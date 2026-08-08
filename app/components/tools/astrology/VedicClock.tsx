"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import { calcSunTimes, calcChoghadiya, currentChoghadiya, calcHora, calcGhadi, calcPrahar, calcMuhurtas, CHOGHADIYA_COLOR } from "./lib/time-calc";
import { calcPanchang } from "./lib/panchang";
import { istToUtComponents } from "./lib/astro-core";
import { CityPicker, useSavedCity } from "./shared/CityPicker";
import { fmtTime } from "./lib/panchang";

// ─── SVG Vedic Clock Face ─────────────────────────────────────────────────────
function polarXY(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s   = polarXY(cx, cy, r, startDeg);
  const e   = polarXY(cx, cy, r, endDeg);
  const la  = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${la} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

const MUHURTA_NAMES_SHORT = [
  "Rudra","Ahi","Mitra","Pitru","Vasu","Vara","Vishv","Vidhi","Satam",
  "Puruh","Vahini","Nakt","Varuna","Aryama","Bhaga","Girish","Ajap",
  "Ahirb","Pushya","Ashwini","Yama","Agni","Vidhatra","Kanda","Aditi",
  "Amrita","Vishnu","Dyum","Brahma","Samudra",
];
const MUHURTA_GOOD_SET = new Set([2,4,5,6,7,8,12,13,14,25,26,27,28]);
const HORA_PLANET_EMOJI: Record<string, string> = {
  Surya:"☀️", Chandra:"🌙", Mangal:"♂️", Budh:"☿", Guru:"♃", Shukra:"♀️", Shani:"♄"
};
const HORA_EN: Record<string, string> = {
  Surya:"Sun", Chandra:"Moon", Mangal:"Mars", Budh:"Mercury", Guru:"Jupiter", Shukra:"Venus", Shani:"Saturn"
};

function VedicClockFace({ nowIST, sunriseIST, sunsetIST }: { nowIST: number; sunriseIST: number; sunsetIST: number }) {
  const CX = 110, CY = 110, R_OUT = 100, R_MID = 78, R_INN = 58;

  // 30 muhurta arcs — start at 0° (top), each 12°
  const dayDur = sunsetIST - sunriseIST;
  const muhDur = dayDur / 15;
  // Current muhurta from sunrise
  const sinceRise = nowIST - sunriseIST;
  const curMuh    = sinceRise >= 0 && sinceRise < dayDur
    ? Math.floor(sinceRise / muhDur)
    : -1;

  // Clock: 12° per muhurta = 30 muhurtas full circle
  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[260px] mx-auto select-none">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer ring background */}
      <circle cx={CX} cy={CY} r={R_OUT} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-violet-200 dark:text-violet-900" />

      {/* 30 Muhurta segments */}
      {Array.from({ length: 30 }, (_, i) => {
        const startDeg = i * 12;
        const endDeg   = startDeg + 11.5;
        const isGood   = MUHURTA_GOOD_SET.has(i);
        const isCur    = i === curMuh;
        const color    = isCur ? '#7c3aed' : isGood ? '#a78bfa' : '#e2e8f0';
        const darkColor = isCur ? '#7c3aed' : isGood ? '#4c1d95' : '#374151';
        const mid = polarXY(CX, CY, (R_OUT + R_MID) / 2, startDeg + 6);
        return (
          <g key={i}>
            <path d={`${arcPath(CX, CY, R_OUT, startDeg, endDeg)} L ${polarXY(CX,CY,R_MID,endDeg).x.toFixed(1)} ${polarXY(CX,CY,R_MID,endDeg).y.toFixed(1)} ${arcPath(CX,CY,R_MID,endDeg,startDeg).replace('M','L')} Z`}
              fill={color} opacity={isCur ? 1 : 0.5}
              className={isCur ? '' : 'dark:opacity-30'}
              filter={isCur ? 'url(#glow)' : undefined}
            />
            {i % 5 === 0 && (
              <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="5" fill={isCur ? '#fff' : '#7c3aed'} className="dark:fill-violet-300"
                fontWeight={isCur ? 'bold' : 'normal'}>
                {i+1}
              </text>
            )}
          </g>
        );
      })}

      {/* Middle ring — Hora segments (24, each 15°) */}
      <circle cx={CX} cy={CY} r={R_MID} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-violet-300 dark:text-violet-800" />
      {Array.from({ length: 24 }, (_, i) => {
        const startDeg = i * 15;
        const endDeg   = startDeg + 14.5;
        const colors = ['#fbbf24','#c4b5fd','#f87171','#6ee7b7','#f9a8d4','#93c5fd','#d1d5db'];
        const c = colors[i % 7];
        return (
          <path key={i} d={`${arcPath(CX,CY,R_MID,startDeg,endDeg)} L ${polarXY(CX,CY,R_INN,endDeg).x.toFixed(1)} ${polarXY(CX,CY,R_INN,endDeg).y.toFixed(1)} ${arcPath(CX,CY,R_INN,endDeg,startDeg).replace('M','L')} Z`}
            fill={c} opacity={0.25} />
        );
      })}

      {/* Inner circle */}
      <circle cx={CX} cy={CY} r={R_INN} fill="#1e1b4b" opacity={0.08} className="dark:opacity-50" />
      <circle cx={CX} cy={CY} r={R_INN} fill="none" stroke="currentColor" strokeWidth="1" className="text-violet-400 dark:text-violet-700" />

      {/* Clock hand — current time as angle from sunrise */}
      {(() => {
        // Map 24h to 360°
        const angle = ((nowIST % 24) / 24) * 360;
        const tip = polarXY(CX, CY, R_INN - 5, angle);
        return <line x1={CX} y1={CY} x2={tip.x.toFixed(1)} y2={tip.y.toFixed(1)} stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />;
      })()}

      {/* Center dot */}
      <circle cx={CX} cy={CY} r="4" fill="#7c3aed" />

      {/* Cardinal marks */}
      {[0,90,180,270].map(deg => {
        const p = polarXY(CX, CY, R_OUT + 7, deg);
        const labels = ["N","E","S","W"];
        return <text key={deg} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#7c3aed" className="dark:fill-violet-400" fontWeight="bold">{labels[deg/90]}</text>;
      })}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function VedicClock() {
  const [city, setCity] = useSavedCity();
  const [now,  setNow]  = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const data = useMemo(() => {
    const y = now.getFullYear(), mo = now.getMonth()+1, d = now.getDate();
    const lat = city?.lat ?? 28.6667, lon = city?.lon ?? 77.2167;
    const sunT     = calcSunTimes(y, mo, d, lat, lon);
    const nextSun  = calcSunTimes(y, mo, d+1, lat, lon);
    const { utHour } = istToUtComponents(y, mo, d, Math.floor(sunT.sunriseIST), Math.round((sunT.sunriseIST%1)*60));
    const pg       = calcPanchang(y, mo, d, utHour);
    const chog     = calcChoghadiya(sunT.sunriseIST, sunT.sunsetIST, nextSun.sunriseIST+24, pg.vara);
    const hora     = calcHora(sunT.sunriseIST, sunT.sunsetIST, nextSun.sunriseIST+24, pg.vara);
    const muhs     = calcMuhurtas(y, mo, d, lat, lon);
    return { sunT, pg, chog, hora, muhs };
  }, [city, now.getMinutes()]);

  const istNow = now.getHours() + now.getMinutes()/60 + now.getSeconds()/3600;
  const curChog = currentChoghadiya(data.chog, istNow);
  const curHora = data.hora.find(h => istNow >= h.start && istNow < h.end);
  const curMuh  = data.muhs.find(m => istNow >= m.start && istNow < m.end);
  const ghadi   = calcGhadi(data.sunT.sunriseIST, istNow);
  const prahar  = calcPrahar(data.sunT.sunriseIST, data.sunT.sunsetIST, istNow);
  const inRahu  = istNow >= data.sunT.sunriseIST &&
    (() => {
      const rk = data.chog; // just for reference; calc separately below
      return false; // simplified
    })();

  // Format live time
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const ss = String(now.getSeconds()).padStart(2,'0');

  // Countdown to next muhurta
  const muhSecsLeft = curMuh ? Math.max(0, Math.round((curMuh.end - istNow) * 3600)) : 0;
  const muhMLeft = Math.floor(muhSecsLeft / 60);
  const muhSLeft = muhSecsLeft % 60;

  // Countdown ghadi
  const ghadiSecsLeft = Math.round(ghadi.minutesLeft * 60);
  const gMLeft = Math.floor(ghadiSecsLeft / 60);
  const gSLeft = ghadiSecsLeft % 60;

  if (!city) return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <Header />
      <CityPicker city={null} onSelect={setCity} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Header />
        <CityPicker city={city} onSelect={setCity} compact />
      </div>

      {/* Main clock area */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* SVG Clock */}
          <VedicClockFace nowIST={istNow} sunriseIST={data.sunT.sunriseIST} sunsetIST={data.sunT.sunsetIST} />

          {/* Right panel */}
          <div className="space-y-3">
            {/* Digital time */}
            <div className="text-center">
              <p className="text-4xl font-mono font-bold text-violet-700 dark:text-violet-300 tracking-wider">
                {hh}:{mm}<span className="text-2xl text-violet-400">:{ss}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">IST — {city.name}</p>
            </div>

            {/* Current muhurta */}
            {curMuh && (
              <div className={`rounded-xl px-3 py-2 ${curMuh.good ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900'}`}>
                <p className="text-[10px] text-gray-400">Vartaman Muhurta</p>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{curMuh.name}</p>
                <p className={`text-xs font-semibold ${curMuh.good ? 'text-emerald-600' : 'text-red-500'}`}>
                  {curMuh.good ? '✓ Shubh' : '✗ Ashubh'} · {muhMLeft}m {muhSLeft}s baki
                </p>
              </div>
            )}

            {/* Hora */}
            {curHora && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400">Vartaman Hora</p>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {HORA_PLANET_EMOJI[curHora.lord]} {curHora.lord} Hora
                </p>
                <p className="text-xs text-gray-500">{curHora.startStr} – {curHora.endStr}</p>
              </div>
            )}

            {/* Choghadiya */}
            {curChog && (
              <div className={`rounded-xl px-3 py-2 ${CHOGHADIYA_COLOR[curChog.name] ?? 'bg-gray-50'}`}>
                <p className="text-[10px] opacity-60">Abhi Choghadiya</p>
                <p className="font-bold text-sm">{curChog.nameHindi} ({curChog.name})</p>
                <p className="text-xs opacity-70">tak {curChog.endStr}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vedic time breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <VCard label="घड़ी" val={`${ghadi.ghadiNum}`} sub={`${gMLeft}m ${gSLeft}s baki`} note="1 Ghadi = 24 min" />
        <VCard label="प्रहर" val={`${prahar.num}`} sub={prahar.name} note={prahar.isDay?'Din Prahar':'Raat Prahar'} />
        <VCard label="सूर्योदय" val={fmtTime(data.sunT.sunriseIST)} sub={city.name} note="IST" />
        <VCard label="सूर्यास्त" val={fmtTime(data.sunT.sunsetIST)} sub={`${Math.floor(data.sunT.durationH)}h ${Math.round((data.sunT.durationH%1)*60)}m`} note="Din ki lambaai" />
      </div>

      {/* Today's muhurta strip */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Aaj Ke 15 Din Muhurta</p>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {data.muhs.slice(0,15).map((m, i) => {
            const isCur = istNow >= m.start && istNow < m.end;
            return (
              <div key={i} className={`shrink-0 text-center px-2 py-1.5 rounded-lg text-[9px] border transition-all
                ${isCur ? 'bg-violet-600 text-white border-violet-600 scale-110 font-bold shadow-md' :
                  m.good ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400' :
                  'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'}`}>
                <p className="font-bold">{i+1}</p>
                <p className="leading-tight">{MUHURTA_NAMES_SHORT[i]}</p>
                <p className="opacity-60">{m.startStr}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        Vedic Kaal Ganana · Lahiri Ayanamsha · {city.name}
      </p>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
        <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vedic Clock</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Muhurta · Hora · Ghadi · Prahar — live</p>
      </div>
    </div>
  );
}

function VCard({ label, val, sub, note }: { label:string; val:string; sub:string; note:string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold text-violet-700 dark:text-violet-300 mt-0.5">{val}</p>
      <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mt-0.5">{sub}</p>
      <p className="text-[9px] text-gray-400">{note}</p>
    </div>
  );
}
