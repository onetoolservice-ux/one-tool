"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, ChevronDown, Loader2, Search } from "lucide-react";

const STORAGE_KEY = "otsd-astro-city";

export interface City {
  name: string;
  lat: number;
  lon: number;
  state: string;
}

// Popular quick-select cities with precise coordinates
const POPULAR: City[] = [
  { name: "Delhi",          lat: 28.6315, lon: 77.2167, state: "Delhi" },
  { name: "Mumbai",         lat: 19.0760, lon: 72.8777, state: "Maharashtra" },
  { name: "Bengaluru",      lat: 12.9716, lon: 77.5946, state: "Karnataka" },
  { name: "Kolkata",        lat: 22.5726, lon: 88.3639, state: "West Bengal" },
  { name: "Chennai",        lat: 13.0827, lon: 80.2707, state: "Tamil Nadu" },
  { name: "Hyderabad",      lat: 17.3850, lon: 78.4867, state: "Telangana" },
  { name: "Ahmedabad",      lat: 23.0225, lon: 72.5714, state: "Gujarat" },
  { name: "Pune",           lat: 18.5204, lon: 73.8567, state: "Maharashtra" },
  { name: "Jaipur",         lat: 26.9124, lon: 75.7873, state: "Rajasthan" },
  { name: "Lucknow",        lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh" },
  { name: "Varanasi",       lat: 25.3176, lon: 82.9739, state: "Uttar Pradesh" },
  { name: "Patna",          lat: 25.5941, lon: 85.1376, state: "Bihar" },
  { name: "Bhopal",         lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh" },
  { name: "Chandigarh",     lat: 30.7333, lon: 76.7794, state: "Chandigarh" },
  { name: "Amritsar",       lat: 31.6340, lon: 74.8723, state: "Punjab" },
];

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    state_district?: string;
    county?: string;
  };
}

function parseNominatim(r: NominatimResult): City {
  const addr = r.address;
  const name = addr.city || addr.town || addr.village ||
               r.display_name.split(",")[0].trim();
  const state = addr.state || addr.state_district || addr.county || "India";
  return {
    name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    state,
  };
}

export function useSavedCity(): [City | null, (c: City) => void] {
  const [city, setCity] = useState<City | null>(null);
  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setCity(JSON.parse(s));
    } catch { /* ignore */ }
  }, []);
  const save = (c: City) => {
    setCity(c);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch { /* ignore */ }
  };
  return [city, save];
}

interface Props {
  city: City | null;
  onSelect: (c: City) => void;
  compact?: boolean;
}

export function CityPicker({ city, onSelect, compact = false }: Props) {
  const [query, setQuery]       = useState("");
  const [open, setOpen]         = useState(false);
  const [results, setResults]   = useState<City[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef             = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchNominatim = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    setError("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ", India")}&format=json&addressdetails=1&limit=8&countrycodes=in&accept-language=en`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "en", "User-Agent": "OneTool-Astrology/1.0" }
      });
      if (!res.ok) throw new Error("Network error");
      const data: NominatimResult[] = await res.json();
      setResults(data.map(parseNominatim));
    } catch {
      setError("Search failed. Check internet connection.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => searchNominatim(val), 400);
  };

  const handleSelect = (c: City) => {
    onSelect(c);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const displayList = query.length >= 2 ? results : [];

  // ── Compact mode (city already selected) ────────────────────────────────────
  if (compact && city) return (
    <div className="relative" ref={dropdownRef}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => e.key === "Enter" && setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer select-none"
      >
        <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0" />
        <span className="max-w-[120px] truncate">{city.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 z-30 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            {loading
              ? <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin shrink-0" />
              : <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
            <input
              autoFocus
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Koi bhi sheher, kasba, gaon..."
              className="flex-1 text-sm bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Results or popular */}
          <div className="max-h-60 overflow-y-auto">
            {error && (
              <p className="px-3 py-2 text-xs text-red-500">{error}</p>
            )}
            {!loading && query.length >= 2 && results.length === 0 && !error && (
              <p className="px-3 py-2 text-xs text-gray-400">Koi result nahi mila</p>
            )}
            {displayList.map((c, i) => (
              <button
                key={i}
                onMouseDown={() => handleSelect(c)}
                className="w-full px-3 py-2.5 text-left text-sm flex items-start gap-2 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{c.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{c.state}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{c.lat.toFixed(2)}°N</span>
              </button>
            ))}
            {query.length < 2 && (
              <>
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Popular Cities</p>
                {POPULAR.map(c => (
                  <button
                    key={c.name}
                    onMouseDown={() => handleSelect(c)}
                    className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                  >
                    <span className="text-gray-800 dark:text-gray-200">{c.name}</span>
                    <span className="text-xs text-gray-400">{c.state}</span>
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-400">Powered by OpenStreetMap Nominatim</p>
          </div>
        </div>
      )}
    </div>
  );

  // ── Full picker mode (no city selected yet) ──────────────────────────────────
  return (
    <div className="bg-white dark:bg-gray-900 border border-violet-200 dark:border-violet-800 rounded-2xl p-5 space-y-4" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-violet-500" />
        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Apna Sheher Chunein</p>
        <span className="text-xs text-gray-400 ml-auto">Sunrise/sunset ke liye zaroori</span>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-violet-500">
          {loading
            ? <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
            : <Search className="w-4 h-4 text-gray-400 shrink-0" />}
          <input
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Koi bhi sheher, kasba, gaon, tirth — likho (Delhi, Kedarnath...)"
            className="flex-1 text-sm bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Live dropdown */}
        {query.length >= 2 && (
          <div className="absolute top-full left-0 mt-1 z-20 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            {loading && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Dhundh raha hai...
              </div>
            )}
            {error && <p className="px-4 py-3 text-sm text-red-500">{error}</p>}
            {!loading && results.length === 0 && !error && (
              <p className="px-4 py-3 text-sm text-gray-400">Koi result nahi mila. Doosra naam try karein.</p>
            )}
            {results.map((c, i) => (
              <button
                key={i}
                onMouseDown={() => handleSelect(c)}
                className="w-full px-4 py-3 text-left text-sm flex items-start gap-3 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
              >
                <MapPin className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{c.state}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-gray-400">{c.lat.toFixed(4)}°N</p>
                  <p className="text-[11px] text-gray-400">{c.lon.toFixed(4)}°E</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick select chips */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Popular Cities</p>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR.map(c => (
            <button
              key={c.name}
              onClick={() => handleSelect(c)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-gray-400">
        🌐 Powered by OpenStreetMap Nominatim · Koi bhi sheher/kasba/gaon type karein
      </p>
    </div>
  );
}
