"use client";
import { useState, useEffect } from "react";

export function useHistory() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    // Load from local storage on mount
    try {
      const saved = localStorage.getItem("onetool-history");
      if (saved) setRecentIds(JSON.parse(saved));
    } catch (e) { console.error("History load error", e); }
  }, []);

  const addToHistory = (id: string) => {
    // Remove id if exists, add to front, keep max 4
    const newHistory = [id, ...recentIds.filter(x => x !== id)].slice(0, 4);
    setRecentIds(newHistory);
    localStorage.setItem("onetool-history", JSON.stringify(newHistory));
  };

  return { recentIds, addToHistory };
}
