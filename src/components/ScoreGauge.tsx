'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  title?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function ScoreGauge({ score, size = 180, strokeWidth = 14, title, riskLevel: propRiskLevel }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const normalizedScore = Math.max(0, Math.min(100, score));

  // Risk Logic strictly adhering to guidelines:
  // 80–100 = LOW RISK
  // 65–79 = MEDIUM RISK
  // 0–64 = HIGH RISK
  const computedLevel: 'LOW' | 'MEDIUM' | 'HIGH' =
    propRiskLevel ||
    (normalizedScore >= 80 ? 'LOW' : normalizedScore >= 65 ? 'MEDIUM' : 'HIGH');

  const isLowRisk = computedLevel === 'LOW';
  const isMediumRisk = computedLevel === 'MEDIUM';
  const isHighRisk = computedLevel === 'HIGH';

  const strokeColor = isLowRisk
    ? '#059669' // Emerald
    : isMediumRisk
    ? '#d97706' // Amber
    : '#dc2626'; // Rose/Red

  const glowColor = isLowRisk
    ? 'rgba(16, 185, 129, 0.35)'
    : isMediumRisk
    ? 'rgba(245, 158, 11, 0.35)'
    : 'rgba(239, 68, 68, 0.35)';

  const textColor = isLowRisk
    ? 'text-emerald-600 dark:text-emerald-400'
    : isMediumRisk
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400';

  const label = isLowRisk
    ? 'LOW RISK'
    : isMediumRisk
    ? 'MEDIUM RISK'
    : 'HIGH RISK';

  const labelBg = isLowRisk
    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
    : isMediumRisk
    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400'
    : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400';

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (displayScore / 100) * circumference;

  // Animated count-up
  useEffect(() => {
    setMounted(true);
    const duration = 1200;
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * normalizedScore));
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    const delay = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(delay);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [normalizedScore]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {title && (
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
      )}

      {/* SVG Circular Gauge */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Radar scanning pulse rings */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 0.88,
            height: size * 0.88,
            border: `1px solid ${glowColor}`,
            animation: 'radarSweep 3s ease-out infinite',
          }}
        />

        <svg
          width={size}
          height={size}
          className="transform -rotate-90 absolute"
          style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            className="text-slate-200 dark:text-blue-950/60"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={targetOffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`font-extrabold tracking-tight leading-none ${textColor}`}
            style={{
              fontSize: size * 0.25,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {displayScore}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Risk Verdict Badge */}
      <div className="flex flex-col items-center gap-1.5">
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-xs font-bold tracking-wider uppercase shadow-2xs ${labelBg}`}>
          <span
            className="w-2 h-2 rounded-full status-blink shrink-0"
            style={{ background: strokeColor }}
          />
          {label}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center max-w-[150px] leading-tight">
          {isLowRisk
            ? 'Compliant with benchmarks'
            : isMediumRisk
            ? 'Requires scrutiny & clarification'
            : 'Critical compliance failures detected'}
        </div>
      </div>
    </div>
  );
}
