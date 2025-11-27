"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeColor = "teal"; // Locked to teal as requested previously

interface UIState {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
}

const UIContext = createContext<UIState | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <UIContext.Provider value={{ 
      searchQuery, setSearchQuery, 
      activeCategory, setActiveCategory
    }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};
