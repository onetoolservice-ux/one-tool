"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeEngine() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    
    // DEFAULT (Home Page) - Tuned for Dark Mode
    // Using a lower opacity (0.08) prevents the "milky" look
    let accentColor = "99 102 241"; // Indigo
    let bgGradient = "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 70%)";

    // Category Specific (Keep these as they are "Perfect")
    if (pathname.includes("/finance")) {
      accentColor = "16 185 129"; // Emerald
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.1), transparent 60%)";
    } else if (pathname.includes("/developer")) {
      accentColor = "59 130 246"; // Blue
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1), transparent 60%)";
    } else if (pathname.includes("/health")) {
      accentColor = "244 63 94"; // Rose
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.1), transparent 60%)";
    } else if (pathname.includes("/documents")) {
      accentColor = "245 158 11"; // Amber
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.08), transparent 60%)";
    } else if (pathname.includes("/ai")) {
      accentColor = "139 92 246"; // Violet
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1), transparent 60%)";
    }

    root.style.setProperty("--primary-rgb", accentColor);
    document.body.style.backgroundImage = bgGradient;
    document.body.style.backgroundAttachment = "fixed";
    
  }, [pathname]);

  return null;
}
