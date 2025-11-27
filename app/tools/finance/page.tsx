import Link from "next/link";
export default function FinanceIndex(){
  return <main className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-sm text-[#64748B]">Budgeting and money tools</p>
      </div>
      <Link href="/tools" className="text-sm text-[#64748B]">All categories</Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
      <Link href="/tools/finance/budget-tracker">
        <div className="ots-card cursor-pointer">
          <h3 className="font-semibold">Budget Tracker</h3>
          <p className="text-sm text-[#64748B] mt-1">Manage income & expense</p>
        </div>
      </Link>
      <Link href="/tools/finance/debt-planner">
        <div className="ots-card cursor-pointer">
          <h3 className="font-semibold">Debt Planner</h3>
          <p className="text-sm text-[#64748B] mt-1">Loan & EMI calculator</p>
        </div>
      </Link>
    </div>
  </main>;
}
