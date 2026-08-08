"use client";
import { useState, useEffect } from "react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { getRecentlyUsed, recordVisit } from "@/app/lib/home-store";

const MAX_RECENT = 8;

/** React hook — returns recently-used tools from the canonical home-store */
export function useRecentTools() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(getRecentlyUsed(MAX_RECENT));

    // Re-sync whenever a tool visit is recorded
    const sync = () => setRecents(getRecentlyUsed(MAX_RECENT));
    window.addEventListener('onetool-home-updated', sync);
    return () => window.removeEventListener('onetool-home-updated', sync);
  }, []);

  const recentTools = ALL_TOOLS
    .filter(t => recents.includes(t.id))
    .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));

  /** Record a tool visit — writes to home-store (single source of truth) */
  const addRecent = (toolId: string) => recordVisit(toolId);

  return { recentTools, addRecent };
}
