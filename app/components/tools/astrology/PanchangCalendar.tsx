"use client";
import React, { useState, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { calcPanchang, RASHI_DATA, fmtTime } from "./lib/panchang";
import { calcSunTimes, calcRahuKaal } from "./lib/time-calc";
import { istToUtComponents } from "./lib/astro-core";
import { getFestivals } from "./lib/festivals";
import { CityPicker, useSavedCity } from "./shared/CityPicker";

const MOON_EMOJI = (t: number) => t===14?"🌕":t===29?"🌑":t<8?"🌒":t<15?"🌔":t<22?"🌖":"🌘";
const DAYS_HI = ["Ravi","Som","Man","Budh","Guru","Shukr","Shan"];

interface DayData {
  day: number; tithi: number; tithiName: string; paksha: string;
  nakshatraName: string; nakshatraHindi: string;
  varaHindi: string; vara: number;
  sunrise: string; sunset: string;
  festivals: string[];
  moonEmoji: string; isToday: boolean;
}

export function PanchangCalendar() {
  const [city, setCity] = useSavedCity();
  const today = new Date();
  const [yr, setYr]   = useState(today.getFullYear());
  const [mo, setMo]   = useState(today.getMonth() + 1);
  const [selDay, setSel] = useState<DayData | null>(null);

  const monthData = useMemo(() => {
    if (!city) return [];
    const lat = city.lat, lon = city.lon;
    const daysInMonth = new Date(yr, mo, 0).getDate();
    const festStart = new Date(yr, mo-1, 1);
    const festEnd   = new Date(yr, mo-1, daysInMonth);
    const festivals = getFestivals(festStart, festEnd);

    const days: DayData[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const sunT = calcSunTimes(yr, mo, d, lat, lon);
      const { utHour } = istToUtComponents(yr, mo, d, Math.floor(sunT.sunriseIST), Math.round((sunT.sunriseIST%1)*60));
      const pg = calcPanchang(yr, mo, d, utHour);
      const dayFests = festivals
        .filter(f => f.date.getDate() === d)
        .map(f => f.hindi);
      days.push({
        day: d, tithi: pg.tithi, tithiName: pg.tithiName,
        paksha: pg.pakshaHindi,
        nakshatraName: pg.nakshatraName, nakshatraHindi: pg.nakshatraHindi,
        varaHindi: pg.varaHindi, vara: pg.vara,
        sunrise: fmtTime(sunT.sunriseIST), sunset: fmtTime(sunT.sunsetIST),
        festivals: dayFests,
        moonEmoji: MOON_EMOJI(pg.tithi),
        isToday: yr===today.getFullYear() && mo===today.getMonth()+1 && d===today.getDate(),
      });
    }
    return days;
  }, [city, yr, mo]);

  const firstDayOfWeek = new Date(yr, mo-1, 1).getDay(); // 0=Sun
  const MONTH_NAMES = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTH_HINDI = ['','जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];

  const prevMonth = () => { if (mo === 1) { setMo(12); setYr(y => y-1); } else setMo(m => m-1); setSel(null); };
  const nextMonth = () => { if (mo === 12) { setMo(1); setYr(y => y+1); } else setMo(m => m+1); setSel(null); };

  if (!city) return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Header />
      <CityPicker city={null} onSelect={setCity} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Header />
        <CityPicker city={city} onSelect={setCity} compact />
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="text-center">
          <p className="font-bold text-gray-900 dark:text-gray-100">{MONTH_NAMES[mo]} {yr}</p>
          <p className="text-xs text-violet-500 dark:text-violet-400">{MONTH_HINDI[mo]}</p>
        </div>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS_HI.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e${i}`} />)}
        {monthData.map(d => {
          const hasFest = d.festivals.length > 0;
          const isSel   = selDay?.day === d.day;
          return (
            <button key={d.day} onClick={() => setSel(isSel ? null : d)}
              className={`aspect-square rounded-xl border text-center p-1 transition-all relative
                ${d.isToday ? 'border-violet-500 ring-2 ring-violet-400 bg-violet-50 dark:bg-violet-950/40' :
                  isSel ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/30' :
                  'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-violet-300'}
                ${d.vara === 0 ? 'text-red-500' : d.vara === 6 ? 'text-blue-500' : 'text-gray-800 dark:text-gray-200'}
              `}>
              <p className="text-sm font-bold leading-none">{d.day}</p>
              <p className="text-[9px] leading-none mt-0.5">{d.moonEmoji}</p>
              <p className="text-[8px] leading-none mt-0.5 text-violet-500 dark:text-violet-400 truncate">{d.tithiName.substring(0,5)}</p>
              {hasFest && <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-gray-400 px-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Tyohar</span>
        <span className="text-red-400">Ravi = Ravivaar</span>
        <span className="text-blue-400">Shan = Shanivaar</span>
      </div>

      {/* Selected day detail */}
      {selDay && (
        <div className="bg-white dark:bg-gray-900 border border-violet-200 dark:border-violet-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {selDay.day} {MONTH_NAMES[mo]} {yr} — {selDay.varaHindi}
            </p>
            <span className="text-2xl">{selDay.moonEmoji}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["तिथि", `${selDay.paksha} ${selDay.tithiName}`],
              ["नक्षत्र", selDay.nakshatraHindi],
              ["Sunrise", selDay.sunrise],
              ["Sunset",  selDay.sunset],
            ].map(([k,v]) => (
              <div key={k} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
                <p className="text-xs text-gray-400">{k}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{v}</p>
              </div>
            ))}
          </div>
          {selDay.festivals.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">🎊 Tyohar / Vrat</p>
              {selDay.festivals.map((f, i) => (
                <p key={i} className="text-sm font-medium text-amber-600 dark:text-amber-400">• {f}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
        <CalendarDays className="w-5 h-5 text-violet-600 dark:text-violet-400" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Panchang Calendar</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Maasik panchang — tithi, nakshatra, tyohar</p>
      </div>
    </div>
  );
}
