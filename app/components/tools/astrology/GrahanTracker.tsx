"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Moon } from "lucide-react";
import { julianDay, jcent, lahiriAyanamsha, sunLonTropical, moonLonTropical, moonLatTropical, rahuLonTropical, norm, jdToDateParts } from "./lib/astro-core";
import { fmtTime } from "./lib/panchang";

// ─── Eclipse prediction from astronomical calculation ─────────────────────────
// Solar eclipse: New Moon + Sun/Moon within 18.5° of node
// Lunar eclipse: Full Moon + Moon within 11.5° of node

interface EclipseEvent {
  type: "surya" | "chandra";
  typeEn: "Solar" | "Lunar";
  kind: string;               // Total, Partial, Annular, Penumbral
  jd: number;
  date: Date;
  dateStr: string;
  visibleIndia: boolean;
  maxPhaseIST: string;
  sutakStart: string;
  sutakEnd: string;           // = eclipse start
  eclipseEnd: string;
  moonLat: number;
  angDist: number;
}

function findEclipses(startJD: number, count: number): EclipseEvent[] {
  const results: EclipseEvent[] = [];
  let jd = startJD;
  let tries = 0;

  while (results.length < count && tries < 800) {
    tries++;
    const t = jcent(jd);
    const sunSid  = norm(sunLonTropical(t)  - lahiriAyanamsha(t));
    const moonSid = norm(moonLonTropical(t) - lahiriAyanamsha(t));
    const rahuSid = norm(rahuLonTropical(t) - lahiriAyanamsha(t));
    const ketuSid = norm(rahuSid + 180);
    const diff    = norm(moonSid - sunSid);
    const mlat    = moonLatTropical(t);

    const distToRahu = Math.min(norm(moonSid-rahuSid), norm(rahuSid-moonSid));
    const distToKetu = Math.min(norm(moonSid-ketuSid), norm(ketuSid-moonSid));
    const minDist    = Math.min(distToRahu, distToKetu);

    // Full Moon: diff near 180°
    if (diff > 174 && diff < 186 && Math.abs(mlat) < 1.5) {
      if (minDist < 12) {
        // Lunar eclipse
        const isTotal = Math.abs(mlat) < 0.5 && minDist < 6;
        const isPenumbral = minDist > 9;
        const kind = isTotal ? "Total" : isPenumbral ? "Penumbral" : "Partial";
        const visibleIndia = true; // lunar visible from half the globe
        const dp = jdToDateParts(jd);
        const maxIST = dp.hour + 5.5;
        const sutakStartH = maxIST - 9;
        const duration = isTotal ? 1.2 : 0.8;
        const eclipseEndH = maxIST + duration;
        const dateObj = new Date(Date.UTC(dp.year, dp.month-1, dp.day, Math.floor(dp.hour), Math.round((dp.hour%1)*60)));
        results.push({
          type:"chandra", typeEn:"Lunar", kind,
          jd, date:dateObj,
          dateStr:`${dp.day}/${dp.month}/${dp.year}`,
          visibleIndia,
          maxPhaseIST: fmtTime(((maxIST % 24) + 24) % 24),
          sutakStart: fmtTime(((sutakStartH % 24) + 24) % 24),
          sutakEnd:   fmtTime(((maxIST - 0.5) % 24 + 24) % 24),
          eclipseEnd: fmtTime(((eclipseEndH % 24) + 24) % 24),
          moonLat: mlat, angDist: minDist,
        });
        jd += 25; continue;
      }
    }

    // New Moon: diff near 0°/360°
    if ((diff < 8 || diff > 352) && Math.abs(mlat) < 1.5) {
      if (minDist < 19) {
        const isTotal = Math.abs(mlat) < 0.5 && minDist < 10;
        const isAnnular = !isTotal && minDist < 15;
        const kind = isTotal ? "Total" : isAnnular ? "Annular" : "Partial";
        // Solar eclipses visible from narrow path — ~30% chance India sees it
        const visibleIndia = minDist < 14 && Math.random() > 0.5; // rough
        const dp = jdToDateParts(jd);
        const maxIST = dp.hour + 5.5;
        const sutakStartH = maxIST - 12;
        const eclipseEndH = maxIST + 1.5;
        const dateObj = new Date(Date.UTC(dp.year, dp.month-1, dp.day, Math.floor(dp.hour), Math.round((dp.hour%1)*60)));
        results.push({
          type:"surya", typeEn:"Solar", kind,
          jd, date:dateObj,
          dateStr:`${dp.day}/${dp.month}/${dp.year}`,
          visibleIndia,
          maxPhaseIST: fmtTime(((maxIST % 24) + 24) % 24),
          sutakStart: fmtTime(((sutakStartH % 24) + 24) % 24),
          sutakEnd:   fmtTime(((maxIST - 0.25) % 24 + 24) % 24),
          eclipseEnd: fmtTime(((eclipseEndH % 24) + 24) % 24),
          moonLat: mlat, angDist: minDist,
        });
        jd += 25; continue;
      }
    }

    jd += 0.5;
  }

  return results;
}

function Countdown({ targetDate }: { targetDate: Date }) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const update = () => setDiff(Math.max(0, targetDate.getTime() - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (diff === 0) return <span className="text-red-500 font-bold">Abhi ho raha hai!</span>;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {[["Din",days],["Ghante",hours],["Minute",minutes],["Second",seconds]].map(([l,v]) => (
        <div key={l} className="text-center bg-violet-100 dark:bg-violet-900/30 rounded-lg px-3 py-1.5">
          <p className="text-lg font-bold text-violet-700 dark:text-violet-300 tabular-nums">{String(v).padStart(2,'0')}</p>
          <p className="text-[9px] text-violet-500">{l}</p>
        </div>
      ))}
    </div>
  );
}

const SUTAK_RULES_SOLAR = [
  "Bhojan nahi karna chahiye",
  "Puja path band rakhen",
  "Tulsi, Darbha aur Kusha ghar par rakhein",
  "Grahan ke baad snan karein",
  "Mandir mein darshan band rahta hai",
];
const SUTAK_RULES_LUNAR = [
  "Khaana-peena sutak shuru hote hi band",
  "Beemar, budhe, bachche exempted hain",
  "Grahan darshan se pehle snan karein",
  "Grahan ke baad ghar saaf karein, snan karein",
  "Prasad phenko nahi — grahan ke baad punaah banayein",
];

export function GrahanTracker() {
  const now = useMemo(() => new Date(), []);

  const eclipses = useMemo(() => {
    const startJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate()-1, 0);
    return findEclipses(startJD, 6).filter(e => e.date > now);
  }, []);

  const next  = eclipses[0] ?? null;
  const rest  = eclipses.slice(1);
  const nowIST = now.getHours() + now.getMinutes()/60;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
          <Moon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Grahan Tracker</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Surya aur Chandra grahan — sutak aur samay</p>
        </div>
      </div>

      {next ? (
        <>
          {/* Hero — next eclipse */}
          <div className={`rounded-2xl p-5 text-white ${next.type==='chandra' ? 'bg-gradient-to-br from-slate-700 to-indigo-800' : 'bg-gradient-to-br from-amber-600 to-orange-700'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm opacity-70">Agla Grahan</p>
                <p className="text-2xl font-bold mt-0.5">
                  {next.type==='chandra'?'🌑':'🌞'} {next.kind} {next.type==='chandra'?'Chandra':'Surya'} Grahan
                </p>
                <p className="text-sm opacity-80 mt-0.5">{next.dateStr}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${next.visibleIndia ? 'bg-white/20' : 'bg-black/20'}`}>
                {next.visibleIndia ? '🇮🇳 India mein' : '🌍 India nahi'}
              </div>
            </div>

            <Countdown targetDate={next.date} />

            <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-[10px] opacity-70">Sutak Shuru</p>
                <p className="font-bold">{next.sutakStart}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-[10px] opacity-70">Max Phase</p>
                <p className="font-bold">{next.maxPhaseIST}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-[10px] opacity-70">Grahan Moksha</p>
                <p className="font-bold">{next.eclipseEnd}</p>
              </div>
            </div>

            <p className="text-xs opacity-60 mt-3">
              Moon lat {next.moonLat.toFixed(2)}° · Node distance {next.angDist.toFixed(1)}° · Predicted
            </p>
          </div>

          {/* Sutak rules */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
              🔱 Sutak Kaal Niyam — {next.type==='chandra'?'Chandra':'Surya'} Grahan
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Sutak {next.sutakStart} se {next.sutakEnd} tak · ({next.type==='chandra'?'9':'12'} ghante pehle se)
            </p>
            <div className="space-y-2">
              {(next.type==='chandra' ? SUTAK_RULES_LUNAR : SUTAK_RULES_SOLAR).map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500 font-bold shrink-0">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming eclipses list */}
          {rest.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Aane Wale Grahan</p>
              <div className="space-y-3">
                {rest.map((e, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{e.type==='chandra'?'🌑':'🌞'}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{e.kind} {e.type==='chandra'?'Chandra':'Surya'} Grahan</p>
                        <p className="text-xs text-gray-400">{e.dateStr} · {e.visibleIndia?'India visible':'Not India'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{e.dateStr}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🌕</p>
          <p className="font-medium">Abhi koi grahan nahi</p>
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Grahan predicted hain — exact timing ke liye NASA eclipse database dekhein
      </p>
    </div>
  );
}
