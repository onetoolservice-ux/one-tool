"use client";
import { useState, useEffect } from "react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { safeLocalStorage } from "@/app/lib/utils/storage";

export function useRecentTools() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    const saved = safeLocalStorage.getItem<string[]>("onetool-recents", []);
    setRecents(saved);
  }, []);

  const addRecent = (id: string) => {
    const current = safeLocalStorage.getItem<string[]>("onetool-recents", []);
    // Remove if exists, then add to front (LRU cache style)
    const updated = [id, ...current.filter((x: string) => x !== id)].slice(0, 4);
    if (safeLocalStorage.setItem("onetool-recents", updated)) {
      setRecents(updated);
    }
  };

  const recentTools = ALL_TOOLS.filter(t => recents.includes(t.id))
    .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));

  return { recentTools, addRecent };
}
