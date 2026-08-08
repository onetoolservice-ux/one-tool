"use client";
import React, { useState, useMemo } from "react";
import { Star, MapPin, Calendar, Clock, Copy, Check, RefreshCw, ChevronDown, AlertCircle } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// VEDIC ASTROLOGY DATA
// ═══════════════════════════════════════════════════════════════════════════════

const RASHIS = [
  { name: "Mesh",     en: "Aries",       symbol: "♈", lord: "Mangal",  element: "Agni",    quality: "Char" },
  { name: "Vrishabh", en: "Taurus",      symbol: "♉", lord: "Shukra",  element: "Prithvi", quality: "Sthir" },
  { name: "Mithun",   en: "Gemini",      symbol: "♊", lord: "Budh",    element: "Vayu",    quality: "Dwiswabhav" },
  { name: "Karka",    en: "Cancer",      symbol: "♋", lord: "Chandra", element: "Jal",     quality: "Char" },
  { name: "Simha",    en: "Leo",         symbol: "♌", lord: "Surya",   element: "Agni",    quality: "Sthir" },
  { name: "Kanya",    en: "Virgo",       symbol: "♍", lord: "Budh",    element: "Prithvi", quality: "Dwiswabhav" },
  { name: "Tula",     en: "Libra",       symbol: "♎", lord: "Shukra",  element: "Vayu",    quality: "Char" },
  { name: "Vrischik", en: "Scorpio",     symbol: "♏", lord: "Mangal",  element: "Jal",     quality: "Sthir" },
  { name: "Dhanu",    en: "Sagittarius", symbol: "♐", lord: "Guru",    element: "Agni",    quality: "Dwiswabhav" },
  { name: "Makar",    en: "Capricorn",   symbol: "♑", lord: "Shani",   element: "Prithvi", quality: "Char" },
  { name: "Kumbh",    en: "Aquarius",    symbol: "♒", lord: "Shani",   element: "Vayu",    quality: "Sthir" },
  { name: "Meen",     en: "Pisces",      symbol: "♓", lord: "Guru",    element: "Jal",     quality: "Dwiswabhav" },
];

const NAKSHATRAS = [
  { name: "Ashwini",           lord: "Ketu",    devata: "Ashwini Kumars" },
  { name: "Bharani",           lord: "Shukra",  devata: "Yama" },
  { name: "Krittika",          lord: "Surya",   devata: "Agni" },
  { name: "Rohini",            lord: "Chandra", devata: "Brahma" },
  { name: "Mrigashira",        lord: "Mangal",  devata: "Soma" },
  { name: "Ardra",             lord: "Rahu",    devata: "Rudra" },
  { name: "Punarvasu",         lord: "Guru",    devata: "Aditi" },
  { name: "Pushya",            lord: "Shani",   devata: "Brihaspati" },
  { name: "Ashlesha",          lord: "Budh",    devata: "Sarpa" },
  { name: "Magha",             lord: "Ketu",    devata: "Pitru" },
  { name: "Purva Phalguni",    lord: "Shukra",  devata: "Bhaga" },
  { name: "Uttara Phalguni",   lord: "Surya",   devata: "Aryaman" },
  { name: "Hasta",             lord: "Chandra", devata: "Savitar" },
  { name: "Chitra",            lord: "Mangal",  devata: "Vishwakarma" },
  { name: "Swati",             lord: "Rahu",    devata: "Vayu" },
  { name: "Vishakha",          lord: "Guru",    devata: "Indra-Agni" },
  { name: "Anuradha",          lord: "Shani",   devata: "Mitra" },
  { name: "Jyeshtha",          lord: "Budh",    devata: "Indra" },
  { name: "Mula",              lord: "Ketu",    devata: "Nirrti" },
  { name: "Purva Ashadha",     lord: "Shukra",  devata: "Apas" },
  { name: "Uttara Ashadha",    lord: "Surya",   devata: "Vishvedeva" },
  { name: "Shravana",          lord: "Chandra", devata: "Vishnu" },
  { name: "Dhanishtha",        lord: "Mangal",  devata: "Ashta Vasus" },
  { name: "Shatabhisha",       lord: "Rahu",    devata: "Varuna" },
  { name: "Purva Bhadrapada",  lord: "Guru",    devata: "Aja Ekapad" },
  { name: "Uttara Bhadrapada", lord: "Shani",   devata: "Ahir Budhnya" },
  { name: "Revati",            lord: "Budh",    devata: "Pushan" },
];

const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Shukra: 20, Surya: 6, Chandra: 10,
  Mangal: 7, Rahu: 18, Guru: 16, Shani: 19, Budh: 17,
};
const DASHA_ORDER = ["Ketu","Shukra","Surya","Chandra","Mangal","Rahu","Guru","Shani","Budh"];

const CITIES = [
  { name: "Delhi",             lat: 28.6667, lon: 77.2167 },
  { name: "Mumbai",            lat: 18.9667, lon: 72.8167 },
  { name: "Chennai",           lat: 13.0667, lon: 80.2500 },
  { name: "Kolkata",           lat: 22.5667, lon: 88.3667 },
  { name: "Bengaluru",         lat: 12.9667, lon: 77.5833 },
  { name: "Hyderabad",         lat: 17.3667, lon: 78.4667 },
  { name: "Ahmedabad",         lat: 23.0333, lon: 72.6167 },
  { name: "Pune",              lat: 18.5333, lon: 73.8667 },
  { name: "Jaipur",            lat: 26.9167, lon: 75.8167 },
  { name: "Lucknow",           lat: 26.8500, lon: 80.9333 },
  { name: "Varanasi",          lat: 25.3167, lon: 83.0167 },
  { name: "Patna",             lat: 25.6167, lon: 85.1333 },
  { name: "Bhopal",            lat: 23.2667, lon: 77.4167 },
  { name: "Indore",            lat: 22.7167, lon: 75.8500 },
  { name: "Nagpur",            lat: 21.1500, lon: 79.0833 },
  { name: "Kanpur",            lat: 26.4667, lon: 80.3167 },
  { name: "Surat",             lat: 21.1667, lon: 72.8333 },
  { name: "Agra",              lat: 27.1833, lon: 78.0167 },
  { name: "Amritsar",          lat: 31.6333, lon: 74.8667 },
  { name: "Chandigarh",        lat: 30.7333, lon: 76.7833 },
  { name: "Dehradun",          lat: 30.3167, lon: 78.0333 },
  { name: "Jodhpur",           lat: 26.2833, lon: 73.0167 },
  { name: "Kochi",             lat:  9.9667, lon: 76.2833 },
  { name: "Thiruvananthapuram",lat:  8.5167, lon: 76.9667 },
  { name: "Coimbatore",        lat: 11.0167, lon: 76.9833 },
  { name: "Madurai",           lat:  9.9167, lon: 78.1167 },
  { name: "Visakhapatnam",     lat: 17.7000, lon: 83.3000 },
  { name: "Bhubaneswar",       lat: 20.2667, lon: 85.8333 },
  { name: "Guwahati",          lat: 26.1833, lon: 91.7333 },
  { name: "Raipur",            lat: 21.2333, lon: 81.6333 },
  { name: "Ranchi",            lat: 23.3667, lon: 85.3333 },
  { name: "Goa",               lat: 15.4833, lon: 73.8333 },
  { name: "Jammu",             lat: 32.7333, lon: 74.8667 },
  { name: "Srinagar",          lat: 34.0833, lon: 74.7833 },
  { name: "Shimla",            lat: 31.1000, lon: 77.1667 },
  { name: "Haridwar",          lat: 29.9167, lon: 78.1667 },
  { name: "Mathura",           lat: 27.5000, lon: 77.6833 },
  { name: "Prayagraj",         lat: 25.4500, lon: 81.8333 },
  { name: "Ujjain",            lat: 23.1833, lon: 75.7667 },
  { name: "Nashik",            lat: 19.9975, lon: 73.7898 },
  { name: "Vadodara",          lat: 22.3072, lon: 73.1812 },
  { name: "Rajkot",            lat: 22.3039, lon: 70.8022 },
  { name: "Meerut",            lat: 28.9845, lon: 77.7064 },
  { name: "Gurgaon",           lat: 28.4595, lon: 77.0266 },
  { name: "Noida",             lat: 28.5355, lon: 77.3910 },
  { name: "Faridabad",         lat: 28.4089, lon: 77.3178 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ASTRONOMICAL CALCULATIONS (Jean Meeus — "Astronomical Algorithms" 2nd Ed.)
// ═══════════════════════════════════════════════════════════════════════════════

const d2r = (d: number) => d * Math.PI / 180;
const r2d = (r: number) => r * 180 / Math.PI;
const norm = (a: number) => ((a % 360) + 360) % 360;
const sinD = (d: number) => Math.sin(d2r(d));
const cosD = (d: number) => Math.cos(d2r(d));
const tanD = (d: number) => Math.tan(d2r(d));

/** Julian Day Number — Meeus Ch.7 */
function julianDay(year: number, month: number, day: number, utHour: number): number {
  let Y = year, M = month;
  const D = day + utHour / 24.0;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

/** Julian centuries from J2000.0 */
const jcent = (jd: number) => (jd - 2451545.0) / 36525.0;

/**
 * Lahiri (Chitrapaksha) Ayanamsha — degrees
 * Reference epoch: J2000.0 value = 23.85422°, precession rate = 50.27"/yr
 */
function lahiriAyanamsha(t: number): number {
  return 23.85422 + t * 1.39552;
}

/** Mean obliquity of ecliptic — Meeus Ch.22 */
function obliquity(t: number): number {
  return 23.439291111
    - 0.013004167 * t
    - 0.0000001639 * t * t
    + 0.0000005036 * t * t * t;
}

/**
 * Sun's apparent tropical longitude — Meeus Ch.25
 * Accuracy: ~0.01°
 */
function sunLonTropical(t: number): number {
  const L0 = norm(280.46646 + 36000.76983 * t + 0.0003032 * t * t);
  const M  = norm(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
  const C  = (1.914602 - 0.004817 * t - 0.000014 * t * t) * sinD(M)
           + (0.019993 - 0.000101 * t) * sinD(2 * M)
           + 0.000289 * sinD(3 * M);
  const omega = norm(125.04 - 1934.136 * t);
  return norm(L0 + C - 0.00569 - 0.00478 * sinD(omega));
}

/**
 * Moon's tropical longitude — Meeus Ch.47 (60-term series)
 * Accuracy: ~0.3°
 */
function moonLonTropical(t: number): number {
  const Lp = norm(218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + t * t * t / 538841 - t * t * t * t / 65194000);
  const D  = norm(297.8501921 + 445267.1114034  * t - 0.0018819 * t * t + t * t * t / 545868  - t * t * t * t / 113065000);
  const M  = norm(357.5291092 + 35999.0502909   * t - 0.0001536 * t * t + t * t * t / 24490000);
  const Mp = norm(134.9633964 + 477198.8675055  * t + 0.0087414 * t * t + t * t * t / 69699   - t * t * t * t / 14712000);
  const F  = norm(93.2720950  + 483202.0175233  * t - 0.0036539 * t * t - t * t * t / 3526000 + t * t * t * t / 863310000);
  const E  = 1 - 0.002516 * t - 0.0000074 * t * t;
  const E2 = E * E;

  // Table 47.A — coefficients × 10⁻⁶ degrees
  const tA: number[][] = [
    [0,0,1,0,6288774],[2,0,-1,0,-1274027],[2,0,0,0,-658314],[0,0,2,0,213618],
    [0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],
    [2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],
    [0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],
    [4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
    [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],
    [2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],
    [2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],
    [0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],
    [2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
    [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],
    [2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],
    [4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],
    [1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],
    [0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294],[2,0,-1,-2,0],
  ];
  let sumL = 0;
  for (const [da,ma,mpa,fa,c] of tA) {
    const ef = Math.abs(ma) === 1 ? E : Math.abs(ma) === 2 ? E2 : 1;
    sumL += ef * c * sinD(da*D + ma*M + mpa*Mp + fa*F);
  }
  return norm(Lp + sumL / 1e6);
}

/** Mean longitude of Moon's ascending node (Rahu) — Meeus Ch.47 */
function rahuLonTropical(t: number): number {
  return norm(125.04452 - 1934.136261 * t + 0.0020708 * t * t + t * t * t / 450000);
}

/**
 * Planetary tropical longitude — mean motion + equation of center
 * Accurate to ~1–5° (correct rashi in >90% of cases for outer planets)
 * Meeus Table 31.a mean elements + Kepler equation of center
 */
function planetLonTropical(t: number, L0: number, Lrate: number, varpi: number, e: number): number {
  const L = norm(L0 + Lrate * t);
  const M = norm(L - varpi);
  const C = (2*e - e*e*e/4)    * sinD(M)
          + (1.25*e*e)          * sinD(2*M)
          + (13*e*e*e/12)       * sinD(3*M);
  return norm(L + C);
}

/** Greenwich Mean Sidereal Time in degrees — Meeus Ch.12 */
function gmstDeg(jd: number): number {
  const jd0 = Math.floor(jd - 0.5) + 0.5;          // JD at 0h UT
  const T0  = (jd0 - 2451545.0) / 36525.0;
  const theta0 = norm(
    100.4606184
    + 36000.77004 * T0
    + 0.000387933 * T0 * T0
    - T0 * T0 * T0 / 38710000
  );
  const ut = (jd - jd0) * 24;                        // UT in hours
  return norm(theta0 + 360.98564724 * ut / 24);
}

/**
 * Tropical longitude of the Ascendant
 * RAMC = Local Sidereal Time in degrees
 * eps  = obliquity of ecliptic
 * lat  = geographic latitude (degrees)
 */
function ascendantTropical(RAMC: number, eps: number, lat: number): number {
  const y = -cosD(RAMC);
  const x = sinD(RAMC) * cosD(eps) + tanD(lat) * sinD(eps);
  let asc = r2d(Math.atan2(y, x));
  if (x < 0) asc += 180;
  return norm(asc);
}

// ─── Planet mean-element table (Meeus Table 31.a) ────────────────────────────
const PLANET_TABLE = [
  { name: "Budh",   en: "Mercury", L0: 252.250906, Lrate: 149474.0722491, varpi:  77.4561, e: 0.20563 },
  { name: "Shukra", en: "Venus",   L0: 181.979801, Lrate:  58519.2130302, varpi: 131.5637, e: 0.00677 },
  { name: "Mangal", en: "Mars",    L0: 355.433275, Lrate:  19141.6964746, varpi: 336.0882, e: 0.09341 },
  { name: "Guru",   en: "Jupiter", L0:  34.351519, Lrate:   3036.3027748, varpi:  14.3312, e: 0.04854 },
  { name: "Shani",  en: "Saturn",  L0:  50.077444, Lrate:   1223.5110686, varpi:  93.0572, e: 0.05551 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

interface GrahaInfo {
  name: string; en: string;
  lonSid: number; rashi: number; degInRashi: number;
  retrograde?: boolean;
}

interface KundaliResult {
  sun: GrahaInfo; moon: GrahaInfo; lagna: GrahaInfo;
  rahu: GrahaInfo; ketu: GrahaInfo;
  planets: GrahaInfo[];
  nakshatraIdx: number; nakshatraPada: number; nakshatraDeg: number;
  dasha: { lord: string; balanceYr: number; balanceDy: number };
  currentDashaChain: { lord: string; years: number }[];
  ayanamsha: number; jd: number;
}

function graha(name: string, en: string, tropLon: number, ayan: number, retro = false): GrahaInfo {
  const sid = norm(tropLon - ayan);
  return { name, en, lonSid: sid, rashi: Math.floor(sid / 30), degInRashi: sid % 30, retrograde: retro };
}

function computeKundali(dateStr: string, timeStr: string, lat: number, lon: number): KundaliResult {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr ? timeStr.split(":").map(Number) : [6, 0];

  // IST → UT  (IST = UT + 5:30)
  const utHour = hh + mm / 60 - 5.5;
  // Handle rollover (utHour < 0 → previous day)
  let adjDay = day, adjMonth = month, adjYear = year;
  let finalUTHour = utHour;
  if (utHour < 0) {
    finalUTHour += 24;
    adjDay -= 1;
    if (adjDay < 1) {
      adjMonth -= 1;
      if (adjMonth < 1) { adjMonth = 12; adjYear -= 1; }
      const daysInMonth = new Date(adjYear, adjMonth, 0).getDate();
      adjDay = daysInMonth;
    }
  }

  const jd = julianDay(adjYear, adjMonth, adjDay, finalUTHour);
  const t  = jcent(jd);
  const ayan = lahiriAyanamsha(t);
  const eps  = obliquity(t);

  const sun   = graha("Surya",  "Sun",       sunLonTropical(t),   ayan);
  const moon  = graha("Chandra","Moon",      moonLonTropical(t),  ayan);
  const rahuT = rahuLonTropical(t);
  const rahu  = graha("Rahu",   "N.Node",    rahuT,               ayan, true);
  const ketuSid = norm(rahu.lonSid + 180);
  const ketu: GrahaInfo = { name:"Ketu", en:"S.Node", lonSid:ketuSid, rashi:Math.floor(ketuSid/30), degInRashi:ketuSid%30, retrograde:true };

  const RAMC  = norm(gmstDeg(jd) + lon);
  const ascT  = ascendantTropical(RAMC, eps, lat);
  const lagna = graha("Lagna",  "Ascendant", ascT,               ayan);

  const planets = PLANET_TABLE.map(p =>
    graha(p.name, p.en, planetLonTropical(t, p.L0, p.Lrate, p.varpi, p.e), ayan)
  );

  // Nakshatra — each = 360/27 = 13.3333°
  const NS = 360 / 27;
  const nakshatraIdx = Math.floor(moon.lonSid / NS);
  const nakshatraDeg = moon.lonSid % NS;
  const nakshatraPada = Math.floor(nakshatraDeg / (NS / 4)) + 1;
  const fracInNaksh = nakshatraDeg / NS;

  // Vimshottari Dasha balance at birth
  const birthLord = NAKSHATRAS[nakshatraIdx].lord;
  const balanceDays = (1 - fracInNaksh) * DASHA_YEARS[birthLord] * 365.25;
  const dasha = {
    lord: birthLord,
    balanceYr: Math.floor(balanceDays / 365.25),
    balanceDy: Math.round(balanceDays % 365.25),
  };

  // Build mahadasha chain (next 5 dashas from birth)
  const startIdx = DASHA_ORDER.indexOf(birthLord);
  const currentDashaChain = Array.from({ length: 6 }, (_, i) => {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    return { lord, years: DASHA_YEARS[lord] };
  });

  return { sun, moon, lagna, rahu, ketu, planets, nakshatraIdx, nakshatraPada, nakshatraDeg, dasha, currentDashaChain, ayanamsha: ayan, jd };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NORTH INDIAN KUNDALI CHART
// ═══════════════════════════════════════════════════════════════════════════════

function KundaliChart({ lagna, allGrahas }: { lagna: number; allGrahas: GrahaInfo[] }) {
  // House-to-grid mapping (North Indian style)
  const grid = [
    [12, 1,  2,  3],
    [11, -1, -1, 4],
    [10, -1, -1, 5],
    [9,  8,  7,  6],
  ];

  // Which grahas sit in each house (house 1 = lagna rashi)
  const houseGrahas: string[][] = Array.from({ length: 12 }, () => []);
  allGrahas.forEach(g => {
    if (g.name === "Lagna") return;
    const house = ((g.rashi - lagna + 12) % 12);
    houseGrahas[house].push(g.retrograde ? `${g.name}®` : g.name);
  });

  return (
    <div className="grid grid-cols-4 border border-violet-300 dark:border-violet-700 rounded-xl overflow-hidden text-[10px]">
      {grid.map((row, ri) =>
        row.map((cell, ci) => {
          if (cell === -1) {
            return (
              <div key={`${ri}-${ci}`}
                className="aspect-square bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800" />
            );
          }
          const houseNo = cell;
          const rashiIdx = (lagna + houseNo - 1) % 12;
          const isLagna = houseNo === 1;
          const gs = houseGrahas[houseNo - 1];
          return (
            <div key={`${ri}-${ci}`}
              className={`aspect-square flex flex-col items-center justify-center p-1 border border-violet-200 dark:border-violet-800 min-h-[56px]
                ${isLagna ? "bg-violet-100 dark:bg-violet-900/50" : "bg-white dark:bg-gray-900"}`}>
              <span className="text-violet-400 dark:text-violet-500 font-bold leading-none">
                {houseNo}{isLagna ? "▲" : ""}
              </span>
              <span className="text-gray-400">{RASHIS[rashiIdx].symbol}</span>
              {gs.length > 0 && (
                <span className="text-violet-700 dark:text-violet-300 font-semibold leading-tight text-center">
                  {gs.join(" ")}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEGREE FORMATTER
// ═══════════════════════════════════════════════════════════════════════════════

function fmtDeg(d: number): string {
  const deg = Math.floor(d);
  const minF = (d - deg) * 60;
  const min  = Math.floor(minF);
  const sec  = Math.round((minF - min) * 60);
  return `${deg}°${min}′${sec}″`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function KundaliGenerator() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<typeof CITIES[0] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [result, setResult] = useState<KundaliResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const filteredCities = useMemo(
    () => cityQuery.length >= 1
      ? CITIES.filter(c => c.name.toLowerCase().includes(cityQuery.toLowerCase())).slice(0, 8)
      : [],
    [cityQuery]
  );

  const handleGenerate = () => {
    setError("");
    if (!date) { setError("Janm tithi zaroori hai."); return; }
    if (!selectedCity) { setError("Janm sthan select karein."); return; }
    if (!time) { setError("Sahi lagna ke liye janm samay bhi daalein."); return; }
    try {
      const r = computeKundali(date, time, selectedCity.lat, selectedCity.lon);
      setResult(r);
    } catch {
      setError("Calculation mein error aaya. Date/time check karein.");
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const allG = [result.sun, result.moon, result.lagna, result.rahu, result.ketu, ...result.planets];
    const lines = [
      `Kundali — ${date} ${time} IST — ${selectedCity?.name}`,
      `Ayanamsha: Lahiri ${result.ayanamsha.toFixed(4)}°`,
      ``,
      `Janm Rashi (Moon): ${RASHIS[result.moon.rashi].name} ${RASHIS[result.moon.rashi].en} — ${fmtDeg(result.moon.degInRashi)}`,
      `Surya Rashi (Sun): ${RASHIS[result.sun.rashi].name} ${RASHIS[result.sun.rashi].en} — ${fmtDeg(result.sun.degInRashi)}`,
      `Lagna: ${RASHIS[result.lagna.rashi].name} — ${fmtDeg(result.lagna.degInRashi)}`,
      `Nakshatra: ${NAKSHATRAS[result.nakshatraIdx].name} Pada ${result.nakshatraPada} (lord: ${NAKSHATRAS[result.nakshatraIdx].lord})`,
      `Mahadasha at birth: ${result.dasha.lord} (balance ${result.dasha.balanceYr}y ${result.dasha.balanceDy}d)`,
      ``,
      `Graha Sthiti:`,
      ...allG.map(g => `  ${g.name.padEnd(7)}: ${RASHIS[g.rashi].name.padEnd(9)} ${fmtDeg(g.degInRashi)}${g.retrograde?" (R)":""}`),
    ].join("\n");
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const allGrahas = result
    ? [result.sun, result.moon, result.lagna, result.rahu, result.ketu, ...result.planets]
    : [];

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
          <Star className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Kundali Generator</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Meeus astronomical algorithms · Lahiri ayanamsha · Vimshottari dasha
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" /> Janm Tithi *
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          {/* Time */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5" /> Janm Samay (IST) *
            </label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          {/* City */}
          <div className="space-y-1 sm:col-span-2 relative">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5" /> Janm Sthan *
            </label>
            <input
              type="text"
              placeholder="Sheher ka naam likho (Delhi, Mumbai, Varanasi...)"
              value={cityQuery}
              onChange={e => { setCityQuery(e.target.value); setSelectedCity(null); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {selectedCity && (
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
                {selectedCity.name} — {selectedCity.lat.toFixed(4)}°N, {selectedCity.lon.toFixed(4)}°E
              </p>
            )}
            {showDropdown && filteredCities.length > 0 && !selectedCity && (
              <div className="absolute z-10 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-0.5 overflow-hidden">
                {filteredCities.map(c => (
                  <button key={c.name} onMouseDown={() => { setSelectedCity(c); setCityQuery(c.name); setShowDropdown(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 text-gray-800 dark:text-gray-200 flex justify-between">
                    <span>{c.name}</span>
                    <span className="text-xs text-gray-400">{c.lat.toFixed(2)}°N {c.lon.toFixed(2)}°E</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <button onClick={handleGenerate}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
          <Star className="w-4 h-4" /> Kundali Banao
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">

          {/* Key highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Janm Rashi", main: RASHIS[result.moon.rashi].symbol, sub: RASHIS[result.moon.rashi].name, detail: `${RASHIS[result.moon.rashi].en}` },
              { label: "Surya Rashi", main: RASHIS[result.sun.rashi].symbol, sub: RASHIS[result.sun.rashi].name, detail: RASHIS[result.sun.rashi].en },
              { label: "Lagna", main: RASHIS[result.lagna.rashi].symbol, sub: RASHIS[result.lagna.rashi].name, detail: RASHIS[result.lagna.rashi].en },
              { label: "Nakshatra", main: String(result.nakshatraIdx + 1), sub: NAKSHATRAS[result.nakshatraIdx].name, detail: `Pada ${result.nakshatraPada}` },
            ].map(c => (
              <div key={c.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400 mb-1">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none">{c.main}</p>
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-1">{c.sub}</p>
                <p className="text-[10px] text-gray-400">{c.detail}</p>
              </div>
            ))}
          </div>

          {/* Chart + Lagna details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 text-center">
                Uttar Bharat Kundali Chart
              </p>
              <KundaliChart lagna={result.lagna.rashi} allGrahas={allGrahas} />
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2.5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Rashi Vivaran</p>
              {[
                ["Lagna Rashi", `${RASHIS[result.lagna.rashi].name} (${RASHIS[result.lagna.rashi].en})`],
                ["Rashi Swami", RASHIS[result.lagna.rashi].lord],
                ["Tatva", RASHIS[result.lagna.rashi].element],
                ["Guna", RASHIS[result.lagna.rashi].quality],
                ["Nakshatra", NAKSHATRAS[result.nakshatraIdx].name],
                ["Nakshatra Devata", NAKSHATRAS[result.nakshatraIdx].devata],
                ["Nakshatra Swami", NAKSHATRAS[result.nakshatraIdx].lord],
                ["Pada", `${result.nakshatraPada}/4`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{k}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Planetary positions table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Graha Sthiti — Sidereal (Lahiri {result.ayanamsha.toFixed(2)}°)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-1.5 text-gray-400 font-medium">Graha</th>
                    <th className="text-left py-1.5 text-gray-400 font-medium">Rashi</th>
                    <th className="text-right py-1.5 text-gray-400 font-medium">Degree</th>
                    <th className="text-right py-1.5 text-gray-400 font-medium">Longitude</th>
                  </tr>
                </thead>
                <tbody>
                  {[result.sun, result.moon, result.lagna, ...result.planets, result.rahu, result.ketu].map(g => (
                    <tr key={g.name} className="border-b border-gray-50 dark:border-gray-800/50">
                      <td className="py-1.5 font-semibold text-gray-900 dark:text-gray-100">
                        {g.name}
                        {g.retrograde && <span className="text-red-400 ml-0.5 text-[9px]">®</span>}
                        <span className="text-[9px] text-gray-400 ml-1">{g.en}</span>
                      </td>
                      <td className="py-1.5 text-violet-600 dark:text-violet-400">
                        {RASHIS[g.rashi].symbol} {RASHIS[g.rashi].name}
                      </td>
                      <td className="py-1.5 text-right text-gray-700 dark:text-gray-300">
                        {fmtDeg(g.degInRashi)}
                      </td>
                      <td className="py-1.5 text-right text-gray-500">
                        {g.lonSid.toFixed(4)}°
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vimshottari Dasha */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Vimshottari Mahadasha Krama (janm se)
            </p>
            <div className="mb-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
              <p className="text-xs text-violet-500 dark:text-violet-400">Janm ke samay chalu dasha</p>
              <p className="font-bold text-violet-800 dark:text-violet-200 text-sm mt-0.5">
                {result.dasha.lord} Mahadasha
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Balance: {result.dasha.balanceYr} saal {result.dasha.balanceDy} din
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.currentDashaChain.map((d, i) => (
                <div key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium border
                  ${i === 0
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}>
                  {d.lord} <span className="opacity-70">({d.years}yr)</span>
                </div>
              ))}
              <div className="px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-700">
                ...repeats
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Kundali"}
            </button>
            <button onClick={() => { setResult(null); setDate(""); setTime(""); setCityQuery(""); setSelectedCity(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <span className="text-[10px] text-gray-400 ml-auto">JD {result.jd.toFixed(4)}</span>
          </div>

          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
            <strong>Accuracy:</strong> Sun ±0.01°, Moon ±0.3°, Lagna ±0.5° (accurate birth time zaroori), Planets ±1–5°.
            Ye calculations Jean Meeus algorithms par based hain bina Swiss Ephemeris ke.
            Professional jyotish ke liye trained jyotishi se consult karein.
          </p>
        </div>
      )}
    </div>
  );
}
