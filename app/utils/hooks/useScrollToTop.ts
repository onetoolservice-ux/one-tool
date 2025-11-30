"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scrolls the main window to the top on route change
    window.scrollTo(0, 0);
  }, [pathname]);
}
