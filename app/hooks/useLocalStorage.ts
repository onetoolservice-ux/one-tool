"use client";
import { useState, useEffect } from "react";
import { logger } from "@/app/lib/utils/logger";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 1. Always initialize with the default value first (SSR Safe)
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 2. Load from LocalStorage ONLY after the component has mounted (Client side)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      logger.error("Error reading localStorage key:", key, error);
    }
  }, [key]);

  // 3. Wrapper to update both State and LocalStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      logger.error("Error setting localStorage key:", key, error);
    }
  };

  return [storedValue, setValue] as const;
}
