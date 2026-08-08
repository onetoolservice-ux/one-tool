import { julianDay, jcent, lahiriAyanamsha, sunLonTropical, moonLonTropical, norm } from './astro-core';
import { calcPanchang } from './panchang';

export interface Festival {
  date: Date;
  name: string;
  hindi: string;
  type: "major" | "ekadashi" | "purnima" | "amavasya" | "pradosh" | "chaturthi" | "other";
  fast: boolean;
  description: string;
}

// Tithi check constants
const SHUKLA = "Shukla", KRISHNA = "Krishna";

function matchesFestival(
  tithi: number,
  paksha: string,
  vara: number,
  solarMonth: number, // 0-11 based on sun's rashi
  nakshatraIdx: number
): Festival | null {
  const pak  = tithi < 15 ? SHUKLA : KRISHNA;
  const tInP = tithi % 15; // 0-14 within paksha

  // ─ Fixed solar festivals ──────────────────────────────────────────────
  // handled separately (Makar Sankranti etc.)

  // ─ Monthly recurring ─────────────────────────────────────────────────
  if (pak === SHUKLA && tInP === 10) return {
    date:new Date(), name:"Ekadashi (Shukla)", hindi:"एकादशी (शुक्ल)",
    type:"ekadashi", fast:true, description:"Bhagwan Vishnu ki aradhana"
  };
  if (pak === KRISHNA && tInP === 10) return {
    date:new Date(), name:"Ekadashi (Krishna)", hindi:"एकादशी (कृष्ण)",
    type:"ekadashi", fast:true, description:"Bhagwan Vishnu ki aradhana"
  };
  if (pak === SHUKLA && tInP === 14) return {
    date:new Date(), name:"Purnima", hindi:"पूर्णिमा",
    type:"purnima", fast:true, description:"Chandrama puja — shubh din"
  };
  if (pak === KRISHNA && tInP === 14) return {
    date:new Date(), name:"Amavasya", hindi:"अमावस्या",
    type:"amavasya", fast:true, description:"Pitru tarpan — purvaj smarana"
  };
  if (pak === KRISHNA && tInP === 12) return {
    date:new Date(), name:"Pradosh (Krishna)", hindi:"प्रदोष (कृष्ण)",
    type:"pradosh", fast:true, description:"Shiv puja — sandes ki shubh bela"
  };
  if (pak === SHUKLA && tInP === 12) return {
    date:new Date(), name:"Pradosh (Shukla)", hindi:"प्रदोष (शुक्ल)",
    type:"pradosh", fast:true, description:"Shiv puja"
  };
  if (pak === KRISHNA && tInP === 3) return {
    date:new Date(), name:"Sankashti Chaturthi", hindi:"संकष्टी चतुर्थी",
    type:"chaturthi", fast:true, description:"Ganesh ji ki aradhana — sankat haran"
  };

  // ─ Annual festivals by solar month ───────────────────────────────────
  // Chaitra (solarMonth≈0, approx Mar-Apr)
  if (pak===SHUKLA && tInP===0 && solarMonth===0) return {
    date:new Date(), name:"Navratri Aarambh (Chaitra)", hindi:"नवरात्रि आरम्भ (चैत्र)",
    type:"major", fast:true, description:"Nav din ki Devi aradhana"
  };
  if (pak===SHUKLA && tInP===8 && solarMonth===0) return {
    date:new Date(), name:"Ram Navami", hindi:"राम नवमी",
    type:"major", fast:true, description:"Bhagwan Shri Ram ka prakat divas"
  };
  if (pak===SHUKLA && tInP===14 && solarMonth===0) return {
    date:new Date(), name:"Hanuman Jayanti", hindi:"हनुमान जयंती",
    type:"major", fast:false, description:"Shri Hanuman ji ka janm utsav"
  };

  // Vaisakha (solarMonth≈1, Apr-May)
  if (pak===SHUKLA && tInP===2 && solarMonth===1) return {
    date:new Date(), name:"Akshaya Tritiya", hindi:"अक्षय तृतीया",
    type:"major", fast:false, description:"Sone ki khareedari aur shubh karyon ka uttam samay"
  };

  // Ashadha (solarMonth≈3, Jun-Jul)
  if (pak===SHUKLA && tInP===14 && solarMonth===3) return {
    date:new Date(), name:"Guru Purnima", hindi:"गुरु पूर्णिमा",
    type:"major", fast:false, description:"Guru ko pranaam — Vyas Purnima"
  };

  // Shravana (solarMonth≈4, Jul-Aug)
  if (pak===KRISHNA && tInP===7 && solarMonth===4) return {
    date:new Date(), name:"Janmashtami", hindi:"जन्माष्टमी",
    type:"major", fast:true, description:"Bhagwan Shri Krishna ka janm utsav"
  };
  if (pak===SHUKLA && tInP===4 && solarMonth===4) return {
    date:new Date(), name:"Nag Panchami", hindi:"नाग पंचमी",
    type:"major", fast:false, description:"Naag devta ki puja"
  };
  if (pak===SHUKLA && tInP===14 && solarMonth===4) return {
    date:new Date(), name:"Raksha Bandhan", hindi:"रक्षा बंधन",
    type:"major", fast:false, description:"Bhai-bahan ka pavitra bandhan"
  };

  // Bhadrapada (solarMonth≈5, Aug-Sep)
  if (pak===SHUKLA && tInP===3 && solarMonth===5) return {
    date:new Date(), name:"Ganesh Chaturthi", hindi:"गणेश चतुर्थी",
    type:"major", fast:false, description:"Ganpati Bappa ka janm utsav — 10 din utsav"
  };

  // Ashvina (solarMonth≈6, Sep-Oct)
  if (pak===SHUKLA && tInP===0 && solarMonth===6) return {
    date:new Date(), name:"Navratri Aarambh (Sharad)", hindi:"नवरात्रि आरम्भ (शारद)",
    type:"major", fast:true, description:"Sharad Navratri — Devi ki nav-roop aradhana"
  };
  if (pak===SHUKLA && tInP===7 && solarMonth===6) return {
    date:new Date(), name:"Maha Ashtami", hindi:"महा अष्टमी",
    type:"major", fast:true, description:"Navratri ki Ashtami — Kanya puja"
  };
  if (pak===SHUKLA && tInP===8 && solarMonth===6) return {
    date:new Date(), name:"Maha Navami", hindi:"महा नवमी",
    type:"major", fast:true, description:"Navratri ki antim puja"
  };
  if (pak===SHUKLA && tInP===9 && solarMonth===6) return {
    date:new Date(), name:"Vijayadashami (Dussehra)", hindi:"विजयदशमी (दशहरा)",
    type:"major", fast:false, description:"Asatya par satya ki vijay"
  };
  if (pak===SHUKLA && tInP===14 && solarMonth===6) return {
    date:new Date(), name:"Sharad Purnima", hindi:"शरद पूर्णिमा",
    type:"major", fast:false, description:"Chandrama amrit varsha ki raat — Kojagiri Purnima"
  };

  // Kartika (solarMonth≈7, Oct-Nov)
  if (pak===KRISHNA && tInP===3 && solarMonth===7) return {
    date:new Date(), name:"Karva Chauth", hindi:"करवा चौथ",
    type:"major", fast:true, description:"Suhagan stripurusha ke liye pati ki lambi umra ka vrat"
  };
  if (pak===KRISHNA && tInP===12 && solarMonth===7) return {
    date:new Date(), name:"Dhanteras", hindi:"धनतेरस",
    type:"major", fast:false, description:"Dhan aur swasthya ki puja — bartan khareedne ka shubh din"
  };
  if (pak===KRISHNA && tInP===13 && solarMonth===7) return {
    date:new Date(), name:"Chhoti Diwali (Naraka Chaturdashi)", hindi:"छोटी दिवाली",
    type:"major", fast:false, description:"Naraka vadh ki khushi — diye jalao"
  };
  if (pak===KRISHNA && tInP===14 && solarMonth===7) return {
    date:new Date(), name:"Diwali (Lakshmi Puja)", hindi:"दीपावली — लक्ष्मी पूजा",
    type:"major", fast:false, description:"Deepon ka tyohar — Maa Lakshmi ka svaagat"
  };
  if (pak===SHUKLA && tInP===0 && solarMonth===7) return {
    date:new Date(), name:"Govardhan Puja", hindi:"गोवर्धन पूजा",
    type:"major", fast:false, description:"Annakoot — Govardhan parvat ki puja"
  };
  if (pak===SHUKLA && tInP===1 && solarMonth===7) return {
    date:new Date(), name:"Bhai Dooj", hindi:"भाई दूज",
    type:"major", fast:false, description:"Bhai-bahan ka pyar ka utsav"
  };
  if (pak===SHUKLA && tInP===5 && solarMonth===7) return {
    date:new Date(), name:"Chhath Puja", hindi:"छठ पूजा",
    type:"major", fast:true, description:"Surya devata ki aradhana — Bihar ka maha parv"
  };

  // Margashirsha (solarMonth≈8, Nov-Dec)
  if (pak===SHUKLA && tInP===10 && solarMonth===8) return {
    date:new Date(), name:"Vaikunta Ekadashi", hindi:"वैकुण्ठ एकादशी",
    type:"ekadashi", fast:true, description:"Sarvauttam Ekadashi — Vishnu mandir dvaar khulte hain"
  };

  // Magha (solarMonth≈10, Jan-Feb)
  if (pak===SHUKLA && tInP===4 && solarMonth===10) return {
    date:new Date(), name:"Vasant Panchami", hindi:"वसन्त पंचमी",
    type:"major", fast:false, description:"Maa Saraswati puja — Basant Ritu ka svaagat"
  };
  if (pak===SHUKLA && tInP===14 && solarMonth===10) return {
    date:new Date(), name:"Maghi Purnima", hindi:"माघी पूर्णिमा",
    type:"purnima", fast:true, description:"Triveni snan ka maha phal"
  };

  // Phalguna (solarMonth≈11, Feb-Mar)
  if (pak===KRISHNA && tInP===13 && solarMonth===11) return {
    date:new Date(), name:"Mahashivratri", hindi:"महाशिवरात्रि",
    type:"major", fast:true, description:"Shiv-Parvati vivah — raatr jaagran"
  };
  if (pak===SHUKLA && tInP===14 && solarMonth===11) return {
    date:new Date(), name:"Holi (Holika Dahan)", hindi:"होली — होलिका दहन",
    type:"major", fast:false, description:"Burai par achchhai ki vijay — rang utsav"
  };

  return null;
}

/** Scan a date range and return all festivals */
export function getFestivals(startDate: Date, endDate: Date): Festival[] {
  const results: Festival[] = [];
  const cur = new Date(startDate);
  cur.setHours(6, 0, 0, 0); // sunrise approx for tithi

  while (cur <= endDate) {
    const y = cur.getFullYear();
    const m = cur.getMonth() + 1;
    const d = cur.getDate();
    const pg = calcPanchang(y, m, d, 0.5); // 6 AM IST = 0.5 UT

    const fest = matchesFestival(pg.tithi, pg.paksha, pg.vara, pg.lunarMonthIdx, pg.nakshatraIdx);
    if (fest) {
      results.push({ ...fest, date: new Date(cur) });
    }

    // Fixed solar festivals
    if (m === 1 && d === 14) results.push({
      date: new Date(cur), name:"Makar Sankranti", hindi:"मकर संक्रान्ति",
      type:"major", fast:false, description:"Surya ka Makar rashi mein pravesh — til gur ka parv"
    });
    if (m === 3 && d === 22) results.push({
      date: new Date(cur), name:"Gudi Padwa / Ugadi", hindi:"गुड़ी पड़वा / उगादि",
      type:"major", fast:false, description:"Hindu Nav Varsha aarambh"
    });

    // Pushya nakshatra alert (shopping)
    if (pg.nakshatraIdx === 7) results.push({
      date: new Date(cur), name:"Pushya Nakshatra", hindi:"पुष्य नक्षत्र",
      type:"other", fast:false, description:"Khareedari ke liye sarvashreshtha — sone-chaandi khareedein"
    });

    cur.setDate(cur.getDate() + 1);
  }

  return results;
}

/** Get today's vrats */
export function getTodayVrats(year: number, month: number, day: number): Festival[] {
  const start = new Date(year, month-1, day);
  const end   = new Date(year, month-1, day);
  return getFestivals(start, end);
}
