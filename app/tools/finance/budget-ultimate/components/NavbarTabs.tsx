"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
const tabs = [
  { name: "Overview", path: "/tools/finance/budget-ultimate" },
  { name: "Transactions", path: "/tools/finance/budget-ultimate/transactions" },
  { name: "Analytics", path: "/tools/finance/budget-ultimate/analytics" },
  { name: "Categories", path: "/tools/finance/budget-ultimate/categories" },
  { name: "Planner", path: "/tools/finance/budget-ultimate/planner" },
  { name: "Settings", path: "/tools/finance/budget-ultimate/settings" },
];
export default function NavbarTabs() {
  const pathname = usePathname();
  return (
    <div className="w-full bg-surface dark:bg-slate-800 dark:bg-surface border-b">
      <div className="max-w-7xl mx-auto px-6 flex gap-6 h-12 items-center overflow-x-auto scrollbar-hide">
        {tabs.map((t) => {
          const active = pathname === t.path;
          return (
            <Link
              key={t.name}
              href={t.path}
              className={`text-sm px-2 pb-3 ${
                active
                  ? "font-semibold border-b-2 border-black"
                  : "text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-main dark:text-slate-300"
              }`}
            >
              {t.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
