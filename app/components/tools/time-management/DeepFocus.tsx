"use client";
import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { TimeMgmtPlaceholder } from './placeholder';

export function DeepFocus() {
  return (
    <TimeMgmtPlaceholder
      name="Deep Focus"
      desc="Advanced distraction-free work session timer — customise focus intervals, track flow streaks, and get session analytics to build your best deep work habit."
      icon={<BrainCircuit className="w-full h-full" />}
      accentFrom="from-sky-500"
      accentTo="to-indigo-500"
      features={['Custom session lengths', 'Flow streak tracker', 'Ambient sound mixer', 'Session analytics', 'Do-not-disturb mode']}
    />
  );
}

export default DeepFocus;
