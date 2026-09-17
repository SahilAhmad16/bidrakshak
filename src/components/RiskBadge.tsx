import React from 'react';
import { RiskLevel } from '@/types';

interface RiskBadgeProps {
  level?: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const normalized = (level || '').toUpperCase().trim();

  let displayText = level || 'Pending';
  let containerClass = 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60';
  let dotColor = 'bg-slate-400 dark:bg-slate-500';
  let dotGlow = '';

  if (normalized === 'LOW' || normalized === 'LOW RISK') {
    displayText = 'LOW RISK';
    containerClass = 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
    dotColor = 'bg-emerald-500 dark:bg-emerald-400';
    dotGlow = 'shadow-[0_0_6px_rgba(16,185,129,0.5)]';
  } else if (normalized === 'MEDIUM' || normalized === 'MEDIUM RISK') {
    displayText = 'MEDIUM RISK';
    containerClass = 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
    dotColor = 'bg-amber-500 dark:bg-amber-400';
    dotGlow = 'shadow-[0_0_6px_rgba(245,158,11,0.5)]';
  } else if (normalized === 'HIGH' || normalized === 'HIGH RISK') {
    displayText = 'HIGH RISK';
    containerClass = 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30';
    dotColor = 'bg-rose-500 dark:bg-rose-400';
    dotGlow = 'shadow-[0_0_6px_rgba(239,68,68,0.5)]';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  }[size];

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border tracking-wide uppercase shadow-2xs ${containerClass} ${sizeClasses}`}
    >
      <span className={`rounded-full shrink-0 ${dotColor} ${dotGlow} ${dotSize}`} />
      {displayText}
    </span>
  );
}
