"use client";
import React from 'react';
import { AlarmClock } from 'lucide-react';
import { TimeMgmtPlaceholder } from './placeholder';

export function DeadlineBoard() {
  return (
    <TimeMgmtPlaceholder
      name="Deadline Board"
      desc="Multi-project deadline & countdown tracker — visualise upcoming deadlines, set alerts, and never miss a due date across all your projects and tasks."
      icon={<AlarmClock className="w-full h-full" />}
      accentFrom="from-rose-500"
      accentTo="to-pink-500"
      features={['Live countdown timers', 'Priority flags', 'Browser notifications', 'Overdue alerts', 'Project grouping']}
    />
  );
}

export default DeadlineBoard;
