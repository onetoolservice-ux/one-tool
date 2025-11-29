"use client";

import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";
import Card from "../components/Card";
export default function PlannerComingSoon() {
  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="max-w-lg w-full text-center py-12">
        <div className="flex justify-center mb-4">
          <Clock className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          Planner Module — Coming Soon
        </h1>
        <p className="text-muted dark:text-muted/70 dark:text-muted/70 mb-6 leading-relaxed">
          We’re building a powerful planning engine for OneTool Budget Ultimate.
          <br />
          Goals • Savings Plans • Recurring Tasks • Monthly Targets • AI
          Suggestions Stay tuned — launching soon!
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/tools/finance/budget-ultimate"
            className="px-4 py-2 border rounded-md flex items-center gap-2 hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617]"
          >
            <ArrowLeft size={16} />
            Back to Budget Ultimate
          </Link>
          <button
            className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-lg shadow-slate-200/50 dark:shadow-none hover:bg-blue-700"
            disabled
            In
            Development
          ></button>
        </div>
      </Card>
    </div>
  );
}
