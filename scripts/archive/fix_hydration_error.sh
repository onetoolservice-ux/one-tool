#!/bin/bash

echo "í²§ Fixing Hydration Mismatch in useLocalStorage hook..."

# We are updating the hook to be "SSR Safe".
# It will force the initial render to match the server, 
# and then "hydrate" the data in a useEffect.

cat > app/hooks/useLocalStorage.ts << 'HOOK_EOF'
"use client";
import { useState, useEffect } from "react";

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
      console.error("Error reading localStorage key:", key, error);
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
      console.error("Error setting localStorage key:", key, error);
    }
  };

  return [storedValue, setValue] as const;
}
HOOK_EOF

echo "âœ… useLocalStorage hook patched."
echo "í±‰ Refresh your browser. The error should be gone."
