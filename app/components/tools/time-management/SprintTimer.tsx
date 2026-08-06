"use client";
import React from 'react';
import { Gauge } from 'lucide-react';
import { TimeMgmtPlaceholder } from './placeholder';

export function SprintTimer() {
  return (
    <TimeMgmtPlaceholder
      name="Sprint Timer"
      desc="Agile sprint planning & retrospective timer — run standups, time-box discussions, track sprint velocity, and keep every meeting sharply on schedule."
      icon={<Gauge className="w-full h-full" />}
      accentFrom="from-amber-500"
      accentTo="to-orange-500"
      features={['Standup timer', 'Time-boxed agenda', 'Sprint velocity log', 'Retrospective mode', 'Team size presets']}
    />
  );
}

export default SprintTimer;
