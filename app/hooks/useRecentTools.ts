"use client";
import { useState, useEffect } from "react";
import { ALL_TOOLS } from "@/app/lib/tools-data";

export function useRecentTools() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("onetool-recents");
      if (saved) setRecents(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const addRecent = (id: string) => {
    try {
      const current = JSON.parse(localStorage.getItem("onetool-recents") || "[]");
      // Remove if exists, then add to front (LRU cache style)
      const updated = [id, ...current.filter((x: string) => x !== id)].slice(0, 4);
      localStorage.setItem("onetool-recents", JSON.stringify(updated));
      setRecents(updated);
    } catch (e) {}
  };

  const recentTools = ALL_TOOLS.filter(t => recents.includes(t.id))
    .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));

  return { recentTools, addRecent };
}
