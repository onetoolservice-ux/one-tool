import { norm, julianDay, jcent, lahiriAyanamsha, sunLonTropical, moonLonTropical } from './astro-core';

// ─── Static Data ──────────────────────────────────────────────────────────────

export const TITHI_NAMES = [
  "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami",
  "Shashthi","Saptami","Ashtami","Navami","Dashami",
  "Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima",
];
export const TITHI_HINDI = [
  "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी",
  "षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
  "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा",
];

export const NAKSHATRA_DATA = [
  { name:"Ashwini",          hindi:"अश्विनी",    lord:"Ketu",    devata:"Ashwini Kumars" },
  { name:"Bharani",          hindi:"भरणी",       lord:"Shukra",  devata:"Yama" },
  { name:"Krittika",         hindi:"कृत्तिका",   lord:"Surya",   devata:"Agni" },
  { name:"Rohini",           hindi:"रोहिणी",     lord:"Chandra", devata:"Brahma" },
  { name:"Mrigashira",       hindi:"मृगशिरा",    lord:"Mangal",  devata:"Soma" },
  { name:"Ardra",            hindi:"आर्द्रा",    lord:"Rahu",    devata:"Rudra" },
  { name:"Punarvasu",        hindi:"पुनर्वसु",   lord:"Guru",    devata:"Aditi" },
  { name:"Pushya",           hindi:"पुष्य",      lord:"Shani",   devata:"Brihaspati" },
  { name:"Ashlesha",         hindi:"आश्लेषा",    lord:"Budh",    devata:"Sarpa" },
  { name:"Magha",            hindi:"मघा",        lord:"Ketu",    devata:"Pitru" },
  { name:"Purva Phalguni",   hindi:"पूर्व फाल्गुनी",lord:"Shukra",devata:"Bhaga" },
  { name:"Uttara Phalguni",  hindi:"उत्तर फाल्गुनी",lord:"Surya", devata:"Aryaman" },
  { name:"Hasta",            hindi:"हस्त",       lord:"Chandra", devata:"Savitar" },
  { name:"Chitra",           hindi:"चित्रा",     lord:"Mangal",  devata:"Vishwakarma" },
  { name:"Swati",            hindi:"स्वाती",     lord:"Rahu",    devata:"Vayu" },
  { name:"Vishakha",         hindi:"विशाखा",     lord:"Guru",    devata:"Indra-Agni" },
  { name:"Anuradha",         hindi:"अनुराधा",    lord:"Shani",   devata:"Mitra" },
  { name:"Jyeshtha",         hindi:"ज्येष्ठा",   lord:"Budh",    devata:"Indra" },
  { name:"Mula",             hindi:"मूल",        lord:"Ketu",    devata:"Nirrti" },
  { name:"Purva Ashadha",    hindi:"पूर्वाषाढ़", lord:"Shukra",  devata:"Apas" },
  { name:"Uttara Ashadha",   hindi:"उत्तराषाढ़", lord:"Surya",   devata:"Vishvedeva" },
  { name:"Shravana",         hindi:"श्रवण",      lord:"Chandra", devata:"Vishnu" },
  { name:"Dhanishtha",       hindi:"धनिष्ठा",   lord:"Mangal",  devata:"Ashta Vasus" },
  { name:"Shatabhisha",      hindi:"शतभिषा",    lord:"Rahu",    devata:"Varuna" },
  { name:"Purva Bhadrapada", hindi:"पूर्व भाद्रपद",lord:"Guru",  devata:"Aja Ekapad" },
  { name:"Uttara Bhadrapada",hindi:"उत्तर भाद्रपद",lord:"Shani", devata:"Ahir Budhnya" },
  { name:"Revati",           hindi:"रेवती",      lord:"Budh",    devata:"Pushan" },
];

export const YOGA_NAMES = [
  "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma",
  "Dhriti","Shoola","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra",
  "Siddhi","Vyatipata","Variyan","Parigha","Shiva","Siddha","Sadhya","Shubha",
  "Shukla","Brahma","Indra","Vaidhriti",
];

export const YOGA_HINDI = [
  "विष्कम्भ","प्रीति","आयुष्मान","सौभाग्य","शोभन","अतिगण्ड","सुकर्मा",
  "धृति","शूल","गण्ड","वृद्धि","ध्रुव","व्याघात","हर्षण","वज्र",
  "सिद्धि","व्यतीपात","वरीयान","परिघ","शिव","सिद्ध","साध्य","शुभ",
  "शुक्ल","ब्रह्म","इन्द्र","वैधृति",
];

// Inauspicious yogas
export const INAUSPICIOUS_YOGA = new Set([0,5,8,9,12,14,16,18,26]); // Vishkambha,Atiganda,Shoola,Ganda,Vyaghata,Vajra,Vyatipata,Parigha,Vaidhriti

export const KARANA_NAMES = [
  "Kinstughna","Bava","Balava","Kaulava","Taitila","Gara","Vanij","Vishti",
  "Bava","Balava","Kaulava","Taitila","Gara","Vanij","Vishti",
  "Bava","Balava","Kaulava","Taitila","Gara","Vanij","Vishti",
  "Bava","Balava","Kaulava","Taitila","Gara","Vanij","Vishti",
  "Bava","Balava","Kaulava","Taitila","Gara","Vanij","Vishti",
  "Bava","Balava","Kaulava","Taitila","Gara","Vanij","Vishti",
  "Bava","Balava","Kaulava","Taitila","Gara","Vanij","Vishti",
  "Bava","Balava","Kaulava","Taitila","Gara","Vanij","Vishti",
  "Shakuni","Chatushpada","Naga",
];

export const VARA_NAMES = ["Ravivaar","Somvaar","Mangalvaar","Budhvaar","Guruvaar","Shukravaar","Shanivaar"];
export const VARA_HINDI = ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"];
export const VARA_LORDS = ["Surya","Chandra","Mangal","Budh","Guru","Shukra","Shani"];

export const LUNAR_MONTHS = [
  "Chaitra","Vaisakha","Jyeshtha","Ashadha","Shravana","Bhadrapada",
  "Ashvina","Kartika","Margashirsha","Pausha","Magha","Phalguna",
];
export const LUNAR_MONTHS_HINDI = [
  "चैत्र","वैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्रपद",
  "आश्विन","कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन",
];

export const RASHI_DATA = [
  { name:"Mesh",     en:"Aries",       symbol:"♈", lord:"Mangal",  element:"Agni",    quality:"Char" },
  { name:"Vrishabh", en:"Taurus",      symbol:"♉", lord:"Shukra",  element:"Prithvi", quality:"Sthir" },
  { name:"Mithun",   en:"Gemini",      symbol:"♊", lord:"Budh",    element:"Vayu",    quality:"Dwiswabhav" },
  { name:"Karka",    en:"Cancer",      symbol:"♋", lord:"Chandra", element:"Jal",     quality:"Char" },
  { name:"Simha",    en:"Leo",         symbol:"♌", lord:"Surya",   element:"Agni",    quality:"Sthir" },
  { name:"Kanya",    en:"Virgo",       symbol:"♍", lord:"Budh",    element:"Prithvi", quality:"Dwiswabhav" },
  { name:"Tula",     en:"Libra",       symbol:"♎", lord:"Shukra",  element:"Vayu",    quality:"Char" },
  { name:"Vrischik", en:"Scorpio",     symbol:"♏", lord:"Mangal",  element:"Jal",     quality:"Sthir" },
  { name:"Dhanu",    en:"Sagittarius", symbol:"♐", lord:"Guru",    element:"Agni",    quality:"Dwiswabhav" },
  { name:"Makar",    en:"Capricorn",   symbol:"♑", lord:"Shani",   element:"Prithvi", quality:"Char" },
  { name:"Kumbh",    en:"Aquarius",    symbol:"♒", lord:"Shani",   element:"Vayu",    quality:"Sthir" },
  { name:"Meen",     en:"Pisces",      symbol:"♓", lord:"Guru",    element:"Jal",     quality:"Dwiswabhav" },
];

export const DASHA_ORDER = ["Ketu","Shukra","Surya","Chandra","Mangal","Rahu","Guru","Shani","Budh"];
export const DASHA_YEARS: Record<string,number> = {
  Ketu:7, Shukra:20, Surya:6, Chandra:10, Mangal:7, Rahu:18, Guru:16, Shani:19, Budh:17
};

// ─── Panchang calculation ─────────────────────────────────────────────────────

export interface PanchangData {
  tithi: number;           // 0-29 (0=Shukla Pratipada, 14=Purnima, 15=Krishna Pratipada, 29=Amavasya)
  tithiName: string;
  tithiHindi: string;
  paksha: "Shukla" | "Krishna";
  pakshaHindi: "शुक्ल" | "कृष्ण";
  tithiEnd: number;        // approx hours until tithi ends

  nakshatraIdx: number;    // 0-26
  nakshatraName: string;
  nakshatraHindi: string;
  nakshatraPada: number;   // 1-4
  nakshatraLord: string;
  nakshatraEnd: number;    // hours until nakshatra ends

  yogaIdx: number;
  yogaName: string;
  yogaHindi: string;
  yogaGood: boolean;

  karanaIdx: number;
  karanaName: string;

  vara: number;            // 0=Sun..6=Sat
  varaName: string;
  varaHindi: string;
  varaLord: string;

  lunarMonthIdx: number;
  lunarMonth: string;
  lunarMonthHindi: string;

  vikramSamvat: number;
  shakaSamvat: number;

  sunLonSid: number;
  moonLonSid: number;
  moonRashi: number;
  ayanamsha: number;
}

export function calcPanchang(
  year: number, month: number, day: number,
  utHour: number
): PanchangData {
  const jd   = julianDay(year, month, day, utHour);
  const t    = jcent(jd);
  const ayan = lahiriAyanamsha(t);

  const sunT  = sunLonTropical(t);
  const moonT = moonLonTropical(t);

  const sunSid  = norm(sunT  - ayan);
  const moonSid = norm(moonT - ayan);

  // ── Tithi ────────────────────────────────────────────────────────────────
  const diff = norm(moonSid - sunSid);
  const tithi = Math.floor(diff / 12); // 0-29
  const paksha: "Shukla"|"Krishna" = tithi < 15 ? "Shukla" : "Krishna";
  const pakshaHindi: "शुक्ल"|"कृष्ण" = tithi < 15 ? "शुक्ल" : "कृष्ण";
  const tithiInPaksha = tithi % 15; // 0-14
  const tithiName = tithiInPaksha === 14
    ? (paksha === "Shukla" ? "Purnima" : "Amavasya")
    : TITHI_NAMES[tithiInPaksha];
  const tithiHindi = tithiInPaksha === 14
    ? (paksha === "Shukla" ? "पूर्णिमा" : "अमावस्या")
    : TITHI_HINDI[tithiInPaksha];

  // Moon moves ~12.19°/day relative to sun → 12° per tithi ≈ 24.7 hrs
  const tithiDegRemaining = 12 - (diff % 12);
  const tithiEnd = tithiDegRemaining / (12.19 - 0.985); // hours remaining

  // ── Nakshatra ────────────────────────────────────────────────────────────
  const NS = 360 / 27;
  const nakshatraIdx  = Math.floor(moonSid / NS);
  const nakshatraDeg  = moonSid % NS;
  const nakshatraPada = Math.floor(nakshatraDeg / (NS / 4)) + 1;
  const nkData = NAKSHATRA_DATA[nakshatraIdx];
  // Moon moves ~13.17°/day in nakshatra frame
  const nakEnd = (NS - nakshatraDeg) / 13.17 * 24; // hours remaining

  // ── Yoga ─────────────────────────────────────────────────────────────────
  const yogaDeg = norm(sunSid + moonSid) % (360 / 27);
  const yogaIdx = Math.floor(norm(sunSid + moonSid) / (360 / 27));
  const yogaGood = !INAUSPICIOUS_YOGA.has(yogaIdx);

  // ── Karana ───────────────────────────────────────────────────────────────
  const karanaIdx = Math.floor(diff / 6) % 60;

  // ── Vara ─────────────────────────────────────────────────────────────────
  const vara = Math.floor(jd + 1.5) % 7; // 0=Sun

  // ── Lunar month (approximation: sun rashi at solar ingress) ──────────────
  const sunRashi = Math.floor(sunSid / 30);
  // Lunar month named after next purnima's nakshatra — simplified: map sun rashi
  const lunarMonthIdx = sunRashi % 12;

  // ── Samvat ───────────────────────────────────────────────────────────────
  // VS year changes at Chaitra Shukla Pratipada (~March/April)
  const vikramSamvat = month >= 4 ? year + 57 : year + 56;
  const shakaSamvat  = month >= 4 ? year - 78 : year - 79;

  return {
    tithi, tithiName, tithiHindi, paksha, pakshaHindi, tithiEnd,
    nakshatraIdx, nakshatraName: nkData.name, nakshatraHindi: nkData.hindi,
    nakshatraPada, nakshatraLord: nkData.lord, nakshatraEnd: nakEnd,
    yogaIdx, yogaName: YOGA_NAMES[yogaIdx], yogaHindi: YOGA_HINDI[yogaIdx], yogaGood,
    karanaIdx,
    karanaName: KARANA_NAMES[Math.min(karanaIdx, KARANA_NAMES.length - 1)],
    vara, varaName: VARA_NAMES[vara], varaHindi: VARA_HINDI[vara], varaLord: VARA_LORDS[vara],
    lunarMonthIdx, lunarMonth: LUNAR_MONTHS[lunarMonthIdx], lunarMonthHindi: LUNAR_MONTHS_HINDI[lunarMonthIdx],
    vikramSamvat, shakaSamvat,
    sunLonSid: sunSid, moonLonSid: moonSid,
    moonRashi: Math.floor(moonSid / 30), ayanamsha: ayan,
  };
}

/** Format decimal hours → "HH:MM" */
export function fmtTime(h: number): string {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
}

/** Format degrees → "DD°MM′SS″" */
export function fmtDeg(d: number): string {
  const deg = Math.floor(d);
  const mF  = (d - deg) * 60;
  const min = Math.floor(mF);
  const sec = Math.round((mF - min) * 60);
  return `${deg}°${min}′${sec}″`;
}
