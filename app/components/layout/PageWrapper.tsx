"use client";
import { usePathname } from "next/navigation";
import Footer from "@/app/shared/layout/Footer";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div 
      className={`
        flex flex-col min-h-screen pt-16 transition-all duration-300 ease-in-out
        ${isHome ? 'w-full' : 'lg:ml-64'} 
      `}
    >
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
         {/* Content grows to fill space, pushing footer down */}
         <div className="flex-grow">
            {children}
         </div>
         
         {/* Footer sits at the bottom of the flow */}
         <Footer />
      </main>
    </div>
  );
}
