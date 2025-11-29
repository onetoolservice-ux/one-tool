import NavbarTabs from "./components/NavbarTabs";

export const metadata = {
  title: "Budget Ultimate",
};
export default function BudgetUltimateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface dark:bg-slate-800 dark:bg-surface">
      <NavbarTabs />

      <div className="max-w-7xl mx-auto p-6">{children}</div>
    </div>
  );
}
