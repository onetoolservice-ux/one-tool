"use client";
import { useState, useEffect } from "react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { safeLocalStorage } from "@/app/lib/utils/storage";

const STORAGE_KEY = "onetool-recents";
const MAX_RECENT = 8;

/** Non-hook helper — call from tool-loader on mount */
export function recordToolUse(toolId: string) {
  const current = safeLocalStorage.getItem<string[]>(STORAGE_KEY, []) ?? [];
  const updated = [toolId, ...current.filter((x: string) => x !== toolId)].slice(0, MAX_RECENT);
  safeLocalStorage.setItem(STORAGE_KEY, updated);
}

/** React hook — returns recent tools + addRecent setter */
export function useRecentTools() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    const saved = safeLocalStorage.getItem<string[]>(STORAGE_KEY, []);
    setRecents(saved ?? []);
  }, []);

  const addRecent = (id: string) => {
    const current = safeLocalStorage.getItem<string[]>(STORAGE_KEY, []) ?? [];
    const updated = [id, ...current.filter((x: string) => x !== id)].slice(0, MAX_RECENT);
    if (safeLocalStorage.setItem(STORAGE_KEY, updated)) {
      setRecents(updated);
    }
  };

  const recentTools = ALL_TOOLS.filter(t => recents.includes(t.id))
    .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));

  return { recentTools, addRecent };
}
