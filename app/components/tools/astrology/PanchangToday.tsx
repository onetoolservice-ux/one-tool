"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Sun, Moon, Star, Clock, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { calcPanchang, fmtTime, KARANA_NAMES } from "./lib/panchang";
import { calcSunTimes, calcRahuKaal, calcYamaGhantam, calcGulikaKaal, calcAbhijitMuhurta, calcChoghadiya, currentChoghadiya, CHOGHADIYA_COLOR } from "./lib/time-calc";
import { getTodayVrats } from "./lib/festivals";
import { CityPicker, useSavedCity } from "./shared/CityPicker";
import { istToUtComponents } from "./lib/astro-core";

const MOON_PHASE_EMOJI = (tithi: number): string => {
  if (tithi === 14) return "🌕";
  if (tithi === 29) return "🌑";
  if (tithi < 8)    return "🌒";
  if (tithi < 15)   return "🌔";
  if (tithi < 22)   return "🌖";
  return "🌘";
};

const QUICK_CHECKS = [
  { id:"travel",   label:"Yatra",      hindi:"यात्रा",      goodNak:[0,3,6,11,12,13,21], badTithi:[4,8,12,14] },
  { id:"shop",     label:"Shopping",   hindi:"खरीदारी",    goodNak:[7,3,4,11,12],        badTithi:[4,8,14] },
  { id:"meeting",  label:"Meeting",    hindi:"मीटिंग",     goodNak:[2,3,6,10,11,15,16],  badTithi:[4,8,12] },
  { id:"medical",  label:"Medical",    hindi:"चिकित्सा",   goodNak:[4,7,11,12,13,21,22], badTithi:[8,14] },
];

export function PanchangToday() {
  const [city, setCity] = useSavedCity();
  const [now,  setNow]  = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { panchang, sun, rahuKaal, yamaG, gulikaK, abhijit, chog, todayVrats } = useMemo(() => {
    const y = now.getFullYear(), mo = now.getMonth()+1, d = now.getDate();
    const istH = now.getHours() + now.getMinutes()/60;

    // Sunrise-time panchang (traditional: check at sunrise)
    const lat = city?.lat ?? 28.6667;
    const lon = city?.lon ?? 77.2167;
    const sunT = calcSunTimes(y, mo, d, lat, lon);

    // Panchang at sunrise (most accurate for tithi/nakshatra day assignment)
    const { utHour: srUT } = istToUtComponents(y, mo, d, Math.floor(sunT.sunriseIST), Math.round((sunT.sunriseIST%1)*60));
    const pg = calcPanchang(y, mo, d, srUT);

    const nextSun = calcSunTimes(y, mo, d+1, lat, lon);
    const chog = calcChoghadiya(sunT.sunriseIST, sunT.sunsetIST, nextSun.sunriseIST + 24, pg.vara);
    const rahuK  = calcRahuKaal(sunT.sunriseIST, sunT.sunsetIST, pg.vara);
    const yamaG  = calcYamaGhantam(sunT.sunriseIST, sunT.sunsetIST, pg.vara);
    const guliK  = calcGulikaKaal(sunT.sunriseIST, sunT.sunsetIST, pg.vara);
    const abh    = calcAbhijitMuhurta(sunT.noonIST);
    const vrats  = getTodayVrats(y, mo, d);

    return { panchang:pg, sun:sunT, rahuKaal:rahuK, yamaG, gulikaK:guliK, abhijit:abh, chog, todayVrats:vrats };
  }, [city, now]);

  const istNow  = now.getHours() + now.getMinutes()/60;
  const curChog = currentChoghadiya(chog, istNow);
  const inRahu  = istNow >= rahuKaal.start && istNow < rahuKaal.end;

  // Quick check logic
  const isGoodDay = (qc: typeof QUICK_CHECKS[0]) =>
    qc.goodNak.includes(panchang.nakshatraIdx) && !qc.badTithi.includes(panchang.tithi % 15);

  if (!city) return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Header />
      <CityPicker city={null} onSelect={setCity} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header with city */}
      <div className="flex items-center justify-between">
        <Header />
        <CityPicker city={city} onSelect={setCity} compact />
      </div>

      {/* Rahu Kaal Alert */}
      {inRahu && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-bold text-red-700 dark:text-red-400 text-sm">⚠ Abhi Rahu Kaal chal raha hai</p>
            <p className="text-xs text-red-500 dark:text-red-400">{rahuKaal.startStr} – {rahuKaal.endStr} tak — koi naya kaam shuru na karein</p>
          </div>
        </div>
      )}

      {/* Today's summary line */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-violet-200 text-xs">Aaj Ka Din</p>
            <p className="font-bold text-lg">{panchang.varaHindi} — {panchang.pakshaHindi} {panchang.tithiHindi}</p>
          </div>
          <div className="text-4xl">{MOON_PHASE_EMOJI(panchang.tithi)}</div>
        </div>
        <p className="text-violet-200 text-sm">
          {panchang.nakshatraHindi} Nakshatra · {panchang.yogaHindi} Yoga · VS {panchang.vikramSamvat}
        </p>
        <p className="text-violet-300 text-xs mt-1">
          {panchang.lunarMonthHindi} Maas · Shaka Samvat {panchang.shakaSamvat}
        </p>
      </div>

      {/* 5-element Panchang grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label:"तिथि", val: panchang.pakshaHindi+" "+panchang.tithiHindi, sub:`${panchang.paksha} ${panchang.tithiName}`, icon:"🌙" },
          { label:"नक्षत्र", val: panchang.nakshatraHindi, sub:`Pada ${panchang.nakshatraPada} · ${panchang.nakshatraLord}`, icon:"⭐" },
          { label:"योग", val: panchang.yogaHindi, sub: panchang.yogaGood ? "शुभ" : "अशुभ", icon: panchang.yogaGood ? "✅":"⛔", bad:!panchang.yogaGood },
          { label:"करण", val: KARANA_NAMES[Math.min(panchang.karanaIdx,KARANA_NAMES.length-1)], sub:"Vartaman Karana", icon:"🔄" },
          { label:"वार", val: panchang.varaHindi, sub: panchang.varaName+" · "+panchang.varaLord, icon:"📅" },
        ].map(item => (
          <div key={item.label} className={`bg-white dark:bg-gray-900 border rounded-xl p-3 text-center ${item.bad ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-800'}`}>
            <p className="text-lg">{item.icon}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight mt-0.5">{item.val}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Sunrise / Sunset / Kaal row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard icon="🌅" label="Sunrise" val={fmtTime(sun.sunriseIST)} sub="Suryoday" />
        <InfoCard icon="🌇" label="Sunset" val={fmtTime(sun.sunsetIST)} sub="Suryast" />
        <InfoCard icon="🔴" label="Rahu Kaal" val={`${rahuKaal.startStr}–${rahuKaal.endStr}`} sub="Avoid new work" bad />
        <InfoCard icon="🌟" label="Abhijit" val={`${abhijit.startStr}–${abhijit.endStr}`} sub="Sarvashreshtha muhurta" good />
      </div>

      {/* Yama + Gulika */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-xs text-gray-500">Yama Ghantam</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{yamaG.startStr} – {yamaG.endStr}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex items-center gap-3">
          <span className="text-xl">🌑</span>
          <div>
            <p className="text-xs text-gray-500">Gulika Kaal</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{gulikaK.startStr} – {gulikaK.endStr}</p>
          </div>
        </div>
      </div>

      {/* Current Choghadiya */}
      {curChog && (
        <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${CHOGHADIYA_COLOR[curChog.name] ?? ''}`}>
          <Clock className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium opacity-70">Abhi Choghadiya</p>
            <p className="font-bold text-sm">{curChog.nameHindi} ({curChog.name}) — {curChog.endStr} tak</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${curChog.quality==='good'?'bg-emerald-100 text-emerald-700':curChog.quality==='bad'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>
            {curChog.quality==='good'?'शुभ':curChog.quality==='bad'?'अशुभ':'सामान्य'}
          </span>
        </div>
      )}

      {/* Quick checks */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Aaj Yeh Karna Theek Hai?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_CHECKS.map(qc => {
            const good = isGoodDay(qc);
            return (
              <div key={qc.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${good?'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800':'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'}`}>
                {good ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs">{qc.hindi}</p>
                  <p className={`text-[10px] font-medium ${good?'text-emerald-600 dark:text-emerald-400':'text-red-500 dark:text-red-400'}`}>{good?'Haan':'Ruko'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's vrats */}
      {todayVrats.length > 0 && (
        <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">Aaj Ke Vrat / Tyohar 🙏</p>
          {todayVrats.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-lg">{v.fast ? '🕉️' : '🎊'}</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{v.hindi}</p>
                <p className="text-xs text-gray-500">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Lahiri Ayanamsha · Drik Ganit · {city.name} ({city.lat.toFixed(2)}°N, {city.lon.toFixed(2)}°E)
      </p>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
        <Sun className="w-5 h-5 text-violet-600 dark:text-violet-400" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Aaj Ka Panchang</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Tithi · Nakshatra · Yoga · Karana · Vara</p>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, val, sub, bad, good }: { icon:string; label:string; val:string; sub:string; bad?:boolean; good?:boolean }) {
  return (
    <div className={`rounded-xl p-3 border ${bad?'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900':good?'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900':'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
      <p className="text-xl">{icon}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
      <p className={`text-sm font-bold ${bad?'text-red-700 dark:text-red-400':good?'text-emerald-700 dark:text-emerald-400':'text-gray-900 dark:text-gray-100'}`}>{val}</p>
      <p className="text-[9px] text-gray-400">{sub}</p>
    </div>
  );
}
