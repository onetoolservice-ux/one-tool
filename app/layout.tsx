import "./globals.css";
import Navbar from "./shared/Navbar";

export const metadata = {
  title: "One Tool Solutions",
  description: "One unified toolbox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F9FBFF] text-[#1E293B]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
