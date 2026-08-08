// ─── Mathematical helpers ─────────────────────────────────────────────────────
export const d2r = (d: number) => d * Math.PI / 180;
export const r2d = (r: number) => r * 180 / Math.PI;
export const norm = (a: number) => ((a % 360) + 360) % 360;
export const sinD = (d: number) => Math.sin(d2r(d));
export const cosD = (d: number) => Math.cos(d2r(d));
export const tanD = (d: number) => Math.tan(d2r(d));

// ─── Julian Day (Meeus Ch.7) ──────────────────────────────────────────────────
export function julianDay(year: number, month: number, day: number, utHour = 0): number {
  let Y = year, M = month;
  const D = day + utHour / 24.0;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

export const jcent = (jd: number) => (jd - 2451545.0) / 36525.0;

/** Julian Day → calendar date (UT) */
export function jdToDateParts(jd: number): { year: number; month: number; day: number; hour: number } {
  const jd0 = Math.floor(jd - 0.5) + 0.5;
  const Z   = Math.floor(jd0 + 0.5);
  const F   = jd + 0.5 - Z;
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day   = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year  = month > 2 ? C - 4716 : C - 4715;
  return { year, month, day, hour: F * 24 };
}

/** Convert JD to JS Date (UTC) */
export function jdToDate(jd: number): Date {
  const { year, month, day, hour } = jdToDateParts(jd);
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return new Date(Date.UTC(year, month - 1, day, h, m));
}

// ─── Ayanamsha ────────────────────────────────────────────────────────────────
/** Lahiri (Chitrapaksha) ayanamsha — degrees */
export function lahiriAyanamsha(t: number): number {
  return 23.85422 + t * 1.39552;
}

// ─── Obliquity ────────────────────────────────────────────────────────────────
export function obliquity(t: number): number {
  return 23.439291111 - 0.013004167*t - 0.0000001639*t*t + 0.0000005036*t*t*t;
}

// ─── Sun (Meeus Ch.25, ±0.01°) ───────────────────────────────────────────────
export function sunLonTropical(t: number): number {
  const L0    = norm(280.46646  + 36000.76983 * t + 0.0003032 * t*t);
  const M     = norm(357.52911  + 35999.05029 * t - 0.0001537 * t*t);
  const C     = (1.914602 - 0.004817*t - 0.000014*t*t) * sinD(M)
              + (0.019993 - 0.000101*t) * sinD(2*M)
              +  0.000289 * sinD(3*M);
  const omega = norm(125.04 - 1934.136 * t);
  return norm(L0 + C - 0.00569 - 0.00478 * sinD(omega));
}

// ─── Moon (Meeus Ch.47 — 60-term series, ±0.3°) ──────────────────────────────
export function moonLonTropical(t: number): number {
  const Lp = norm(218.3164477 + 481267.88123421*t - 0.0015786*t*t + t*t*t/538841   - t*t*t*t/65194000);
  const D  = norm(297.8501921 + 445267.1114034 *t - 0.0018819*t*t + t*t*t/545868   - t*t*t*t/113065000);
  const M  = norm(357.5291092 + 35999.0502909  *t - 0.0001536*t*t + t*t*t/24490000);
  const Mp = norm(134.9633964 + 477198.8675055 *t + 0.0087414*t*t + t*t*t/69699    - t*t*t*t/14712000);
  const F  = norm(93.2720950  + 483202.0175233 *t - 0.0036539*t*t - t*t*t/3526000  + t*t*t*t/863310000);
  const E  = 1 - 0.002516*t - 0.0000074*t*t;
  const E2 = E * E;
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

/** Moon latitude — needed for eclipse check (±0.3°) */
export function moonLatTropical(t: number): number {
  const D  = norm(297.8501921 + 445267.1114034 *t);
  const M  = norm(357.5291092 + 35999.0502909  *t);
  const Mp = norm(134.9633964 + 477198.8675055 *t);
  const F  = norm(93.2720950  + 483202.0175233 *t);
  const E  = 1 - 0.002516*t;
  const tB: number[][] = [
    [0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],
    [2,0,-1,1,-55413],[2,0,-1,-1,-46271],[2,0,0,1,-33228],[0,0,2,1,15200],
    [2,0,1,-1,9266],[0,0,2,-1,8822],[2,-1,0,-1,8216],[2,0,-2,-1,4324],
    [2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],[2,-1,0,1,2211],
    [2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],
    [0,0,0,3,-1749],[0,1,-1,1,-1565],[1,0,0,1,-1491],[0,1,1,1,-1475],
    [0,1,1,-1,-1410],[0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107],
    [4,0,0,-1,1021],[4,0,-1,1,833],
  ];
  let sumB = 0;
  for (const [da,ma,mpa,fa,c] of tB) {
    const ef = Math.abs(ma) === 1 ? E : 1;
    sumB += ef * c * sinD(da*D + ma*M + mpa*Mp + fa*F);
  }
  return sumB / 1e6; // degrees
}

// ─── Rahu/Ketu (mean node, ±0.2°) ────────────────────────────────────────────
export function rahuLonTropical(t: number): number {
  return norm(125.04452 - 1934.136261*t + 0.0020708*t*t + t*t*t/450000);
}

// ─── Planets (mean elements + equation of center, ±1–5°) ─────────────────────
export const PLANET_ELEMS = [
  { name:"Budh",   en:"Mercury", L0:252.250906, Lr:149474.0722491, varpi: 77.4561, e:0.20563 },
  { name:"Shukra", en:"Venus",   L0:181.979801, Lr: 58519.2130302, varpi:131.5637, e:0.00677 },
  { name:"Mangal", en:"Mars",    L0:355.433275, Lr: 19141.6964746, varpi:336.0882, e:0.09341 },
  { name:"Guru",   en:"Jupiter", L0: 34.351519, Lr:  3036.3027748, varpi: 14.3312, e:0.04854 },
  { name:"Shani",  en:"Saturn",  L0: 50.077444, Lr:  1223.5110686, varpi: 93.0572, e:0.05551 },
];

export function planetLonTropical(t: number, L0: number, Lr: number, varpi: number, e: number): number {
  const L = norm(L0 + Lr * t);
  const M = norm(L - varpi);
  const C = (2*e - e*e*e/4)*sinD(M) + (1.25*e*e)*sinD(2*M) + (13*e*e*e/12)*sinD(3*M);
  return norm(L + C);
}

// ─── GMST + Ascendant ─────────────────────────────────────────────────────────
export function gmstDeg(jd: number): number {
  const jd0 = Math.floor(jd - 0.5) + 0.5;
  const T0  = (jd0 - 2451545.0) / 36525.0;
  const θ0  = norm(100.4606184 + 36000.77004*T0 + 0.000387933*T0*T0 - T0*T0*T0/38710000);
  const ut  = (jd - jd0) * 24;
  return norm(θ0 + 360.98564724 * ut / 24);
}

export function ascendantTropical(RAMC: number, eps: number, lat: number): number {
  const y = -cosD(RAMC);
  const x =  sinD(RAMC) * cosD(eps) + tanD(lat) * sinD(eps);
  let asc = r2d(Math.atan2(y, x));
  if (x < 0) asc += 180;
  return norm(asc);
}

// ─── Convenience: IST → UT adjustment with date rollover ─────────────────────
export function istToUtComponents(year: number, month: number, day: number, istHour: number, istMin: number) {
  let utH = istHour + istMin / 60 - 5.5;
  let d = day, mo = month, yr = year;
  if (utH < 0)  { utH += 24; d -= 1; if (d < 1) { mo -= 1; if (mo < 1) { mo = 12; yr -= 1; } d = new Date(yr, mo, 0).getDate(); } }
  if (utH >= 24) { utH -= 24; d += 1; if (d > new Date(yr, mo, 0).getDate()) { d = 1; mo += 1; if (mo > 12) { mo = 1; yr += 1; } } }
  return { year: yr, month: mo, day: d, utHour: utH };
}
