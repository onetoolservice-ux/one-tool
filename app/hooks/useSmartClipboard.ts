"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export type ToolSuggestion = {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  href: string;
  action: string;
  data: string;
} | null;

export function useSmartClipboard() {
  const router = useRouter();
  const [suggestion, setSuggestion] = useState<ToolSuggestion>(null);

  const analyzeClipboard = useCallback(async () => {
    try {
      // 1. Read Clipboard
      const text = await navigator.clipboard.readText();
      if (!text || text.length > 100000) return; // Ignore huge blocks

      const trimmed = text.trim();
      let match: ToolSuggestion = null;

      // 2. PATTERN MATCHING ENGINE

      // JSON Detection
      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
          JSON.parse(trimmed); // Verify validity
          match = {
            id: "smart-json",
            name: "JSON Formatter",
            icon: "Braces",
            href: "/tools/documents/json/formatter",
            action: "Format detected JSON",
            data: text
          };
        } catch (e) {}
      }

      // SQL Detection
      else if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/i.test(trimmed)) {
        match = {
          id: "smart-sql",
          name: "SQL Formatter",
          icon: "Database",
          href: "/tools/developer/smart-sql",
          action: "Format detected SQL",
          data: text
        };
      }

      // Color Detection (Hex/RGB)
      else if (/^#([0-9A-F]{3}){1,2}$/i.test(trimmed) || /^rgb\(\d+,\s*\d+,\s*\d+\)$/i.test(trimmed)) {
        match = {
          id: "color-picker",
          name: "Color Picker",
          icon: "Pipette",
          href: "/tools/design/picker",
          action: "View detected Color",
          data: text
        };
      }

      // JWT Detection (Header.Payload.Signature)
      else if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(trimmed)) {
        match = {
          id: "smart-jwt",
          name: "JWT Debugger",
          icon: "Key",
          href: "/tools/developer/smart-jwt",
          action: "Decode detected JWT",
          data: text
        };
      }

      // 3. SET SUGGESTION
      if (match) {
        setSuggestion(match);
      }
    } catch (error) {
      // Clipboard permission denied or empty
      console.log("Clipboard access denied or empty");
    }
  }, []);

  const executeSuggestion = () => {
    if (!suggestion) return;
    
    // Save data to a temporary "Clipboard Handover" slot in localStorage
    // The target tool will read this when it opens.
    localStorage.setItem(`onetool_${suggestion.id}_input`, suggestion.data);
    
    // Navigate
    router.push(suggestion.href);
  };

  return { suggestion, analyzeClipboard, executeSuggestion };
}
