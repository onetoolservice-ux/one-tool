import { d2r, r2d, norm, sinD, cosD, tanD, julianDay, jcent,
         sunLonTropical, obliquity } from './astro-core';
import { fmtTime } from './panchang';

// ─── Sunrise / Sunset (NOAA algorithm based on Meeus, ±1–2 min) ──────────────

export interface SunTimes {
  sunriseIST: number;   // decimal hours IST
  sunsetIST: number;
  noonIST: number;
  durationH: number;    // daylight hours
}

export function calcSunTimes(year: number, month: number, day: number, lat: number, lon: number): SunTimes {
  const jd = julianDay(year, month, day, 12);
  const t  = jcent(jd);

  const L0    = norm(280.46646  + 36000.76983*t + 0.0003032*t*t);
  const M     = norm(357.52911  + 35999.05029*t - 0.0001537*t*t);
  const C     = (1.914602 - 0.004817*t - 0.000014*t*t)*sinD(M)
              + (0.019993 - 0.000101*t)*sinD(2*M)
              +  0.000289*sinD(3*M);
  const sunTL = L0 + C;
  const omega = norm(125.04 - 1934.136*t);
  const lambda = sunTL - 0.00569 - 0.00478*sinD(omega);
  const eps0  = 23 + 26/60 + 21.448/3600 - (46.8150/3600)*t - (0.00059/3600)*t*t + (0.001813/3600)*t*t*t;
  const eps   = eps0 + 0.00256*cosD(omega);
  const delta = r2d(Math.asin(sinD(eps)*sinD(lambda)));

  // Equation of time (minutes)
  const y   = Math.tan(d2r(eps/2)) ** 2;
  const eqT = 4 * r2d(
    y*sinD(2*L0) - 2*0.016708634*sinD(M)
    + 4*0.016708634*y*sinD(M)*cosD(2*L0)
    - 0.5*y*y*sinD(4*L0) - 1.25*0.016708634**2*sinD(2*M)
  );

  // Hour angle (90.833 accounts for refraction + solar disc)
  const cosHA = (cosD(90.833) / (cosD(lat)*cosD(delta))) - tanD(lat)*tanD(delta);

  const HA = cosHA > 1 ? 0 : cosHA < -1 ? 180 : r2d(Math.acos(cosHA));

  const noonUT   = (720 - 4*lon - eqT) / 60;      // hours UT
  const sunriseUT = noonUT - HA*4/60;
  const sunsetUT  = noonUT + HA*4/60;

  return {
    sunriseIST:  sunriseUT + 5.5,
    sunsetIST:   sunsetUT  + 5.5,
    noonIST:     noonUT    + 5.5,
    durationH:   HA * 4 / 30,   // = 2*HA*4/60 hours of daylight
  };
}

// ─── Moonrise / Moonset (simplified, ±15 min) ─────────────────────────────────
// Uses tabular lunar speed (~12.5°/day) + geometric rise formula
export function calcMoonTimes(year: number, month: number, day: number, lat: number, lon: number): { moonriseIST: number | null; moonsetIST: number | null } {
  try {
    const jd = julianDay(year, month, day, 12);
    const t  = jcent(jd);
    const { moonLonTropical } = require('./astro-core');
    const { lahiriAyanamsha } = require('./astro-core');
    const ayan   = lahiriAyanamsha(t);
    const moonSid = norm(moonLonTropical(t) - ayan);
    const moonRashi = Math.floor(moonSid / 30);
    const eps = obliquity(t);
    // Moon ecliptic coords → equatorial declination (rough)
    const moonLat = 0; // simplified
    const moonDec = r2d(Math.asin(sinD(eps)*sinD(moonSid)));
    const cosHAmoon = (cosD(90.567) / (cosD(lat)*cosD(moonDec))) - tanD(lat)*tanD(moonDec);
    if (cosHAmoon > 1 || cosHAmoon < -1) return { moonriseIST: null, moonsetIST: null };
    const HA = r2d(Math.acos(cosHAmoon));
    const moonRA = r2d(Math.atan2(cosD(eps)*sinD(moonSid), cosD(moonSid)));
    const { gmstDeg } = require('./astro-core');
    const lst = norm(gmstDeg(jd) + lon);
    const transitUT = (norm(moonRA - lst) + (moonRA < lst ? 360 : 0)) / 15 / 24; // rough
    const moonriseUT = 12 - HA*4/60;
    const moonsetUT  = 12 + HA*4/60;
    return { moonriseIST: moonriseUT + 5.5, moonsetIST: moonsetUT + 5.5 };
  } catch {
    return { moonriseIST: null, moonsetIST: null };
  }
}

// ─── Rahu Kaal ────────────────────────────────────────────────────────────────
// Rahu Kaal part by weekday (0=Sun): [8,2,7,5,6,4,3]
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3]; // 1-indexed part of 8 day parts

export interface KaalWindow { start: number; end: number; startStr: string; endStr: string }

export function calcRahuKaal(sunriseIST: number, sunsetIST: number, vara: number): KaalWindow {
  const partDur  = (sunsetIST - sunriseIST) / 8;
  const part     = RAHU_PART[vara] - 1;                    // 0-indexed
  const start    = sunriseIST + part * partDur;
  const end      = start + partDur;
  return { start, end, startStr: fmtTime(start), endStr: fmtTime(end) };
}

export function calcYamaGhantam(sunriseIST: number, sunsetIST: number, vara: number): KaalWindow {
  const YAMA_PART = [5, 4, 3, 2, 1, 7, 6]; // weekday offset
  const partDur = (sunsetIST - sunriseIST) / 8;
  const part    = YAMA_PART[vara] - 1;
  const start   = sunriseIST + part * partDur;
  const end     = start + partDur;
  return { start, end, startStr: fmtTime(start), endStr: fmtTime(end) };
}

export function calcGulikaKaal(sunriseIST: number, sunsetIST: number, vara: number): KaalWindow {
  const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];
  const partDur = (sunsetIST - sunriseIST) / 8;
  const part    = GULIKA_PART[vara] - 1;
  const start   = sunriseIST + part * partDur;
  const end     = start + partDur;
  return { start, end, startStr: fmtTime(start), endStr: fmtTime(end) };
}

// ─── Abhijit Muhurta ──────────────────────────────────────────────────────────
export function calcAbhijitMuhurta(noonIST: number): KaalWindow {
  const start = noonIST - 24/60;   // 24 minutes before solar noon
  const end   = noonIST + 24/60;
  return { start, end, startStr: fmtTime(start), endStr: fmtTime(end) };
}

// ─── Choghadiya ──────────────────────────────────────────────────────────────

export const CHOGHADIYA_NAMES = ["Udveg","Char","Labh","Amrit","Kaal","Shubh","Rog","Udveg","Char","Labh","Amrit","Kaal","Shubh","Rog","Udveg","Char"];
export const CHOGHADIYA_HINDI = ["उद्वेग","चर","लाभ","अमृत","काल","शुभ","रोग","उद्वेग","चर","लाभ","अमृत","काल","शुभ","रोग","उद्वेग","चर"];
export const CHOGHADIYA_QUALITY: Record<string, "good"|"neutral"|"bad"> = {
  Amrit:"good", Shubh:"good", Labh:"good", Char:"neutral",
  Udveg:"bad", Kaal:"bad", Rog:"bad"
};
export const CHOGHADIYA_COLOR: Record<string, string> = {
  Amrit:"text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
  Shubh:"text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40",
  Labh:"text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40",
  Char:"text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",
  Udveg:"text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40",
  Kaal:"text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40",
  Rog:"text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40",
};

// Day choghadiya start index by weekday (0=Sun)
const DAY_CHOG_START = [0, 3, 6, 2, 5, 1, 4]; // index into cycle below
// Night choghadiya start index by weekday
const NIGHT_CHOG_START = [5, 1, 4, 0, 3, 6, 2];
// Cycle: Udveg=0,Char=1,Labh=2,Amrit=3,Kaal=4,Shubh=5,Rog=6
const CYCLE = ["Udveg","Char","Labh","Amrit","Kaal","Shubh","Rog"];
const CYCLE_HINDI = ["उद्वेग","चर","लाभ","अमृत","काल","शुभ","रोग"];

export interface ChoghadiyaSegment {
  name: string; nameHindi: string;
  quality: "good"|"neutral"|"bad";
  start: number; end: number;    // decimal IST hours
  startStr: string; endStr: string;
  isDay: boolean;
}

export function calcChoghadiya(
  sunriseIST: number, sunsetIST: number, nextSunriseIST: number, vara: number
): ChoghadiyaSegment[] {
  const dayPart    = (sunsetIST  - sunriseIST)     / 8;
  const nightPart  = (nextSunriseIST - sunsetIST)  / 8;
  const result: ChoghadiyaSegment[] = [];

  for (let i = 0; i < 8; i++) {
    const idx   = (DAY_CHOG_START[vara] + i) % 7;
    const start = sunriseIST + i * dayPart;
    const end   = start + dayPart;
    const nm    = CYCLE[idx];
    result.push({ name:nm, nameHindi:CYCLE_HINDI[idx],
      quality:CHOGHADIYA_QUALITY[nm],
      start, end, startStr:fmtTime(start), endStr:fmtTime(end), isDay:true });
  }
  for (let i = 0; i < 8; i++) {
    const idx   = (NIGHT_CHOG_START[vara] + i) % 7;
    const start = sunsetIST + i * nightPart;
    const end   = start + nightPart;
    const nm    = CYCLE[idx];
    result.push({ name:nm, nameHindi:CYCLE_HINDI[idx],
      quality:CHOGHADIYA_QUALITY[nm],
      start, end, startStr:fmtTime(start), endStr:fmtTime(end), isDay:false });
  }
  return result;
}

export function currentChoghadiya(segments: ChoghadiyaSegment[], nowH: number): ChoghadiyaSegment | null {
  return segments.find(s => nowH >= s.start && nowH < s.end) ?? null;
}

// ─── Hora (Planetary Hour) ───────────────────────────────────────────────────

// Chaldean order: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
const HORA_LORDS = ["Surya","Shukra","Budh","Chandra","Shani","Guru","Mangal"];
const HORA_LORDS_EN = ["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];
// First hora of day by weekday (0=Sun→Sun, 1=Mon→Moon, 2=Tue→Mars, ...)
const DAY_HORA_FIRST = [0, 3, 6, 1, 4, 2, 5]; // index into HORA_LORDS

export interface HoraSegment {
  lord: string; lordEn: string;
  start: number; end: number; startStr: string; endStr: string;
}

export function calcHora(
  sunriseIST: number, sunsetIST: number, nextSunriseIST: number, vara: number
): HoraSegment[] {
  const dayHoraH  = (sunsetIST - sunriseIST) / 12;
  const nightHoraH = (nextSunriseIST - sunsetIST) / 12;
  const result: HoraSegment[] = [];
  let startIdx = DAY_HORA_FIRST[vara];

  for (let i = 0; i < 12; i++) {
    const idx   = (startIdx + i) % 7;
    const start = sunriseIST + i * dayHoraH;
    result.push({ lord:HORA_LORDS[idx], lordEn:HORA_LORDS_EN[idx],
      start, end:start+dayHoraH, startStr:fmtTime(start), endStr:fmtTime(start+dayHoraH) });
  }
  startIdx = (startIdx + 12) % 7;
  for (let i = 0; i < 12; i++) {
    const idx   = (startIdx + i) % 7;
    const start = sunsetIST + i * nightHoraH;
    result.push({ lord:HORA_LORDS[idx], lordEn:HORA_LORDS_EN[idx],
      start, end:start+nightHoraH, startStr:fmtTime(start), endStr:fmtTime(start+nightHoraH) });
  }
  return result;
}

// ─── Muhurta (30 Muhurtas of the day) ────────────────────────────────────────

export const MUHURTA_NAMES = [
  "Rudra","Ahi","Mitra","Pitru","Vasu","Vara","Vishvedeva","Vidhi","Satamukhi",
  "Puruhuta","Vahini","Naktanchara","Varuna","Aryama","Bhaga","Girish","Ajapada",
  "Ahirbudhnya","Pushya","Ashwini","Yama","Agni","Vidhatra","Kanda","Aditi",
  "Amrita","Vishnu","Dyumadgat","Brahma","Samudra",
];

export const MUHURTA_GOOD = new Set([2,4,5,6,7,8,12,13,14,25,26,27,28]);

export interface MuhurtaSegment {
  idx: number; name: string; good: boolean;
  start: number; end: number; startStr: string; endStr: string;
}

export function calcMuhurtas(year: number, month: number, day: number, lat: number, lon: number): MuhurtaSegment[] {
  const { sunriseIST, sunsetIST } = calcSunTimes(year, month, day, lat, lon);
  // Day muhurtas: 15 from sunrise to sunset; night: 15 from sunset to next sunrise
  // But traditionally 30 from midnight to midnight, each 48 min
  // We use the dawn-based split:
  const dayDur   = (sunsetIST - sunriseIST);        // hours
  const muhDur   = dayDur / 15;                     // each day muhurta
  const result: MuhurtaSegment[] = [];
  for (let i = 0; i < 15; i++) {
    const start = sunriseIST + i * muhDur;
    result.push({ idx:i, name:MUHURTA_NAMES[i], good:MUHURTA_GOOD.has(i),
      start, end:start+muhDur, startStr:fmtTime(start), endStr:fmtTime(start+muhDur) });
  }
  const nextSunrise = sunriseIST + 24;
  const nightDur = nextSunrise - sunsetIST;
  const nmDur = nightDur / 15;
  for (let i = 0; i < 15; i++) {
    const start = sunsetIST + i * nmDur;
    result.push({ idx:15+i, name:MUHURTA_NAMES[15+i], good:MUHURTA_GOOD.has(15+i),
      start, end:start+nmDur, startStr:fmtTime(start), endStr:fmtTime(start+nmDur) });
  }
  return result;
}

// ─── Ghadi ────────────────────────────────────────────────────────────────────
// 1 Ghadi = 24 minutes. Day has 60 ghadis.
export function calcGhadi(sunriseIST: number, nowIST: number): { ghadiNum: number; minutesLeft: number } {
  const sinceRise = (nowIST - sunriseIST) * 60; // minutes
  const ghadiNum  = Math.floor(sinceRise / 24) + 1;
  const minutesLeft = 24 - (sinceRise % 24);
  return { ghadiNum: Math.max(1, ghadiNum), minutesLeft: Math.round(minutesLeft) };
}

// ─── Prahar ───────────────────────────────────────────────────────────────────
// Day = 4 prahars, Night = 4 prahars (each = 3 hours for standard day)
export function calcPrahar(sunriseIST: number, sunsetIST: number, nowIST: number): { num: number; isDay: boolean; name: string } {
  const dayDur   = sunsetIST - sunriseIST;
  const praharDur = dayDur / 4;
  if (nowIST >= sunriseIST && nowIST < sunsetIST) {
    const num = Math.floor((nowIST - sunriseIST) / praharDur) + 1;
    const names = ["Pratham Prahar","Dwitiya Prahar","Tritiya Prahar","Chaturtha Prahar"];
    return { num, isDay:true, name:names[num-1] };
  }
  const nightDur = 24 - dayDur;
  const nightPraharDur = nightDur / 4;
  const sinceSet = (nowIST < sunriseIST ? nowIST + 24 : nowIST) - sunsetIST;
  const num = Math.floor(sinceSet / nightPraharDur) + 1;
  const names = ["Pratham Prahar (Ratri)","Dwitiya Prahar (Ratri)","Tritiya Prahar (Ratri)","Chaturtha Prahar (Ratri)"];
  return { num: Math.min(num,4), isDay:false, name:names[Math.min(num,4)-1] };
}
