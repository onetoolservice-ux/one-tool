import { useState, useEffect } from 'react';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { safeLocalStorage } from '@/app/lib/utils/storage';

export const useSmartHistory = () => {
  const [recentTools, setRecentTools] = useState<any[]>([]);
  const [favoriteTools, setFavoriteTools] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load Favorites
    const favIds = safeLocalStorage.getItem<string[]>("onetool-favorites", []);
    const favs = ALL_TOOLS.filter(t => favIds.includes(t.id));
    setFavoriteTools(favs);

    // Load Recents (We will save these when a user clicks a tool)
    const recentIds = safeLocalStorage.getItem<string[]>("onetool-recents", []);
    // Filter out duplicates and limit to 4
    const recents = recentIds
      .map((id: string) => ALL_TOOLS.find(t => t.id === id))
      .filter(Boolean)
      .slice(0, 4);
    setRecentTools(recents);
  }, []);

  return { recentTools, favoriteTools, mounted };
};
