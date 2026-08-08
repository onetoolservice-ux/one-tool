"use client";
import React, { useState, useMemo } from "react";
import { Wand2, Search, Calendar, ChevronRight } from "lucide-react";
import { calcSunTimes, calcChoghadiya, calcRahuKaal, calcAbhijitMuhurta, CHOGHADIYA_COLOR, type ChoghadiyaSegment } from "./lib/time-calc";
import { calcPanchang, fmtTime } from "./lib/panchang";
import { istToUtComponents } from "./lib/astro-core";
import { CityPicker, useSavedCity } from "./shared/CityPicker";

interface Activity {
  id: string;
  name: string;
  hindi: string;
  emoji: string;
  goodTithis: number[];    // 0-29 (mod 15 for paksha)
  goodNakshatras: number[];
  goodChog: string[];
  badTithis: number[];
  avoidRahu: boolean;
  desc: string;
}

const ACTIVITIES: Activity[] = [
  {
    id:"vivah", name:"Vivah (Marriage)", hindi:"विवाह", emoji:"💍",
    goodTithis:[1,2,4,6,9,12,14],
    goodNakshatras:[2,3,6,11,12,14,15,21,22,24,25],
    goodChog:["Amrit","Shubh","Labh"],
    badTithis:[4,8,12,14,29], avoidRahu:true,
    desc:"Vivah ke liye sarvashreshtha muhurta — Rohini, Mrigashira, Uttara, Hasta, Anuradha, Shravana aur Revati nakshatra uttam"
  },
  {
    id:"vaahan", name:"Vaahan Khareed (Vehicle)", hindi:"वाहन खरीद", emoji:"🚗",
    goodTithis:[1,2,4,6,9,12],
    goodNakshatras:[0,3,7,11,12,13,21,22],
    goodChog:["Amrit","Shubh","Labh","Char"],
    badTithis:[4,8,12,14], avoidRahu:true,
    desc:"Naya vaahan khareedne ka uttam samay — Pushya, Rohini, Hasta, Chitra Nakshatra uttam"
  },
  {
    id:"griha", name:"Griha Pravesh (Housewarming)", hindi:"गृह प्रवेश", emoji:"🏠",
    goodTithis:[1,2,4,6,9,12,14],
    goodNakshatras:[2,3,4,6,11,12,13,21,24,25],
    goodChog:["Amrit","Shubh","Labh"],
    badTithis:[4,8,12,14,29], avoidRahu:true,
    desc:"Naye ghar mein pravesh — Sthir nakshatra (Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada) sarvashreshtha"
  },
  {
    id:"vyapar", name:"Vyapar Aarambh (Business Start)", hindi:"व्यापार आरम्भ", emoji:"💼",
    goodTithis:[1,2,4,6,9,11,12],
    goodNakshatras:[0,2,3,6,7,10,11,12,13,21,24],
    goodChog:["Amrit","Shubh","Labh"],
    badTithis:[4,8,12,14,29], avoidRahu:true,
    desc:"Naya vyapar shuru karne ke liye — Pushya, Rohini, Hasta sarvashreshtha"
  },
  {
    id:"sampatti", name:"Sampatti (Property)", hindi:"सम्पत्ति", emoji:"🏗️",
    goodTithis:[1,2,4,6,9,12],
    goodNakshatras:[3,6,11,12,21,24,25],
    goodChog:["Amrit","Shubh","Labh"],
    badTithis:[4,8,12,14,29], avoidRahu:true,
    desc:"Zameen ya makaan khareedne ke liye — Sthir nakshatra best, Khar Maas mein avoid karein"
  },
  {
    id:"yatra", name:"Yatra (Travel)", hindi:"यात्रा", emoji:"✈️",
    goodTithis:[1,2,4,6,9,12],
    goodNakshatras:[0,2,3,6,10,11,12,14,21],
    goodChog:["Char","Labh","Amrit","Shubh"],
    badTithis:[4,8,12,14], avoidRahu:true,
    desc:"Safar ke liye — Char nakshatra sabse acha. Mangalvaar ko avoid karein agar ho sake"
  },
  {
    id:"pushya", name:"Pushya Nakshatra Shopping", hindi:"पुष्य नक्षत्र खरीदारी", emoji:"⭐",
    goodTithis:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],
    goodNakshatras:[7], // Pushya only
    goodChog:["Amrit","Shubh","Labh","Char"],
    badTithis:[], avoidRahu:true,
    desc:"Pushya Nakshatra mein khareedari — gold, property, vehicle sab ke liye sarvashreshtha"
  },
  {
    id:"gold", name:"Sona Khareed (Gold Purchase)", hindi:"सोना खरीद", emoji:"🥇",
    goodTithis:[1,2,4,6,9,12,14],
    goodNakshatras:[7,3,11,12,21,0],
    goodChog:["Amrit","Shubh","Labh"],
    badTithis:[4,8,12,14,29], avoidRahu:true,
    desc:"Sona khareedne ke liye Pushya Nakshatra sarvashreshtha — phir Rohini, Hasta bhi acha"
  },
  {
    id:"interview", name:"Interview / Naukri Joining", hindi:"इंटरव्यू / नौकरी", emoji:"💼",
    goodTithis:[1,2,4,6,9,12],
    goodNakshatras:[2,3,4,6,10,11,12,14,21,22],
    goodChog:["Amrit","Shubh","Labh","Char"],
    badTithis:[4,8,12,14], avoidRahu:true,
    desc:"Interview ya nayi naukri ke liye — Budh Hora mein bhi kaam karein"
  },
  {
    id:"medical", name:"Medical / Surgery", hindi:"चिकित्सा / ऑपरेशन", emoji:"🏥",
    goodTithis:[1,2,4,6,9,11,12],
    goodNakshatras:[3,7,12,13,21,22,24,25],
    goodChog:["Amrit","Shubh","Labh"],
    badTithis:[4,8,12,14,29], avoidRahu:true,
    desc:"Shalyachikitsa ke liye — avoid Ashtami, Ekadashi. Ashwini Nakshatra swasthya ke liye uttam"
  },
];

interface MuhurtaWindow {
  date: string; day: string;
  chog: ChoghadiyaSegment;
  activity: string;
  score: number;
  reasons: string[];
  rahuFree: boolean;
  tithi: number; tithiName: string;
  nakshatra: number; nakshatraName: string;
}

export function MuhurtaFinder() {
  const [city, setCity] = useSavedCity();
  const [actId, setActId]   = useState("vaahan");
  const [rangeDays, setRange] = useState(15);
  const [results, setResults] = useState<MuhurtaWindow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const activity = ACTIVITIES.find(a => a.id === actId)!;

  const findMuhurtas = () => {
    if (!city) return;
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      const lat = city.lat, lon = city.lon;
      const windows: MuhurtaWindow[] = [];
      const today = new Date();

      for (let di = 0; di < rangeDays; di++) {
        const date = new Date(today);
        date.setDate(today.getDate() + di);
        const y = date.getFullYear(), mo = date.getMonth()+1, d = date.getDate();

        const sunT = calcSunTimes(y, mo, d, lat, lon);
        const nextSun = calcSunTimes(y, mo, d+1, lat, lon);
        const { utHour } = istToUtComponents(y, mo, d, Math.floor(sunT.sunriseIST), 0);
        const pg = calcPanchang(y, mo, d, utHour);
        const rahu = calcRahuKaal(sunT.sunriseIST, sunT.sunsetIST, pg.vara);
        const abhijit = calcAbhijitMuhurta(sunT.noonIST);
        const chog = calcChoghadiya(sunT.sunriseIST, sunT.sunsetIST, nextSun.sunriseIST+24, pg.vara);
        const tithiMod = pg.tithi % 15;

        for (const seg of chog) {
          if (!activity.goodChog.includes(seg.name)) continue;
          if (seg.start < sunT.sunriseIST) continue; // before sunrise

          const rahuFree = !(seg.start < rahu.end && seg.end > rahu.start);
          if (activity.avoidRahu && !rahuFree) continue;
          if (activity.badTithis.includes(tithiMod)) continue;

          let score = 0;
          const reasons: string[] = [];

          if (activity.goodTithis.includes(tithiMod))       { score += 3; reasons.push(`Shubh tithi (${pg.tithiName})`); }
          if (activity.goodNakshatras.includes(pg.nakshatraIdx)) { score += 4; reasons.push(`Uttam nakshatra (${pg.nakshatraName})`); }
          if (seg.name === "Amrit")  { score += 3; reasons.push("Amrit Choghadiya"); }
          else if (seg.name === "Shubh") { score += 2; reasons.push("Shubh Choghadiya"); }
          else if (seg.name === "Labh")  { score += 2; reasons.push("Labh Choghadiya"); }
          if (seg.start >= abhijit.start && seg.start < abhijit.end) { score += 2; reasons.push("Abhijit Muhurta"); }
          if (rahuFree)              { score += 1; reasons.push("Rahu Kaal free"); }
          if (pg.yogaGood)           { score += 1; reasons.push(`${pg.yogaName} Yoga`); }

          if (score >= 4) {
            const dayNames = ["Ravivaar","Somvaar","Mangalvaar","Budhvaar","Guruvaar","Shukravaar","Shanivaar"];
            windows.push({
              date: `${d} ${['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo]}`,
              day: dayNames[pg.vara],
              chog: seg, activity: activity.hindi,
              score, reasons, rahuFree,
              tithi: pg.tithi, tithiName: pg.tithiName,
              nakshatra: pg.nakshatraIdx, nakshatraName: pg.nakshatraName,
            });
          }
        }
      }

      windows.sort((a, b) => b.score - a.score);
      setResults(windows.slice(0, 20));
      setLoading(false);
    }, 10);
  };

  const scoreColor = (s: number) =>
    s >= 9 ? "bg-emerald-600 text-white" :
    s >= 6 ? "bg-teal-500 text-white" :
    "bg-amber-500 text-white";

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
            <Wand2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Muhurta Khojo</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Agle kuch dinon mein sarvashreshtha samay dhundho</p>
          </div>
        </div>
        {city && <CityPicker city={city} onSelect={setCity} compact />}
      </div>

      {!city ? <CityPicker city={null} onSelect={setCity} /> : (
        <>
          {/* Activity selector */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Kaun sa kaam karna hai?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACTIVITIES.map(a => (
                <button key={a.id} onClick={() => setActId(a.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${actId === a.id ? 'bg-violet-600 border-violet-600 text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-300'}`}>
                  <span className="text-xl">{a.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight">{a.hindi}</p>
                    <p className={`text-[9px] leading-tight ${actId===a.id?'text-violet-200':'text-gray-400'}`}>{a.name.split("(")[0].trim()}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Activity description */}
            <div className="bg-violet-50 dark:bg-violet-950/20 rounded-xl px-3 py-2 text-xs text-violet-700 dark:text-violet-300">
              {activity.desc}
            </div>

            {/* Range + search */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Agle</span>
                <select value={rangeDays} onChange={e => setRange(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500">
                  {[7,15,30,60].map(n => <option key={n} value={n}>{n} din</option>)}
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">scan karo</span>
              </div>
              <button onClick={findMuhurtas}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors">
                <Search className="w-4 h-4" />
                {loading ? "Dhundh raha hai..." : "Dhundho"}
              </button>
            </div>
          </div>

          {/* Results */}
          {results !== null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {results.length > 0 ? `${results.length} shubh samay mile (score ke hisaab se)` : "Koi muhurta nahi mila — range badhao"}
                </p>
              </div>
              {results.map((r, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          {r.date} — {r.day}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(r.score)}`}>
                          Score {r.score}/11
                        </span>
                        {i === 0 && <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-bold">Sarvashreshtha</span>}
                      </div>
                      <p className="text-sm text-violet-600 dark:text-violet-400 mt-0.5 font-medium">
                        {r.chog.startStr} – {r.chog.endStr} IST
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-semibold ${CHOGHADIYA_COLOR[r.chog.name]}`}>{r.chog.name}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {r.tithiName} · {r.nakshatraName}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.reasons.map((rs, j) => (
                          <span key={j} className="text-[10px] bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 px-2 py-0.5 rounded-full">
                            ✓ {rs}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Vedic muhurta niyamon par aadharit · Lahiri ayanamsha · {city?.name ?? ""}
      </p>
    </div>
  );
}
