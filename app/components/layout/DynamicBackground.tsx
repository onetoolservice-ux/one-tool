"use client";

import { usePathname } from "next/navigation";
import { getTheme } from "@/app/lib/theme-config";
import { useEffect, useState } from "react";

export default function DynamicBackground() {
  const pathname = usePathname();
  const [category, setCategory] = useState("default");

  useEffect(() => {
    if (!pathname) return;
    
    // Extract category from URL (e.g., /tools/finance/smart-budget -> finance)
    const parts = pathname.split("/");
    if (parts[1] === "tools" && parts[2]) {
      setCategory(parts[2]);
    } else {
      setCategory("default");
    }
  }, [pathname]);

  const theme = getTheme(category);

  return (
    <div className="fixed inset-0 -z-50 transition-all duration-1000 ease-in-out">
      <div className={"absolute inset-0 bg-gradient-to-br " + theme.bgGradient} />
      
      {/* Optional: Ambient Mesh Gradients for extra 'Enterprise' feel */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-50" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 opacity-50" />
    </div>
  );
}
