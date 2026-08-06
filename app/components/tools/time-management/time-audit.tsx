"use client";
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { TimeMgmtPlaceholder } from './placeholder';

export function TimeAudit() {
  return (
    <TimeMgmtPlaceholder
      name="Time Audit"
      desc="Daily time log & productivity analyser — log how you spend each hour, spot time leaks, and get weekly reports showing where your time actually goes."
      icon={<BarChart3 className="w-full h-full" />}
      accentFrom="from-teal-500"
      accentTo="to-cyan-500"
      features={['Hourly time log', 'Category breakdown', 'Weekly trends', 'Time leak detection', 'Productivity score']}
    />
  );
}

export default TimeAudit;
