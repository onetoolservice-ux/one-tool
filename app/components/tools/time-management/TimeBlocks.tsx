"use client";
import React from 'react';
import { Columns3 } from 'lucide-react';
import { TimeMgmtPlaceholder } from './placeholder';

export function TimeBlocks() {
  return (
    <TimeMgmtPlaceholder
      name="Time Blocks"
      desc="Visual daily time blocking planner — drag and drop your day into focused blocks to maximise deep work and minimise context switching."
      icon={<Columns3 className="w-full h-full" />}
      accentFrom="from-indigo-500"
      accentTo="to-violet-500"
      features={['Drag & drop blocks', 'Recurring schedules', 'Daily templates', 'Focus vs shallow work split', 'Export to calendar']}
    />
  );
}

export default TimeBlocks;
