"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UIState {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const UIContext = createContext<UIState | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load Theme
  useEffect(() => {
    const saved = localStorage.getItem("onetool-theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("onetool-theme", newTheme);
    if (newTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  return (
    <UIContext.Provider value={{ searchQuery, setSearchQuery, activeCategory, setActiveCategory, theme, toggleTheme }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};
