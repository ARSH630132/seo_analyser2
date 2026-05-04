'use client';

import React from 'react';

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreCircle({ score, size = 160, strokeWidth = 12 }: ScoreCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Ensure score is within 0-100 range for calculation
  const safeScore = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (safeScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getBgColor = (s: number) => {
    if (s >= 80) return 'stroke-emerald-100';
    if (s >= 50) return 'stroke-amber-100';
    return 'stroke-rose-100';
  };

  return (
    <div className="relative flex items-center justify-center shrink-0 group" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 drop-shadow-sm" width={size} height={size}>
        {/* Background Track */}
        <circle
          className={`${getBgColor(score)} transition-colors duration-500`}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Path with transition */}
        <circle
          className={`${getColor(score)} transition-all duration-1000 ease-in-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      
      {/* Central Score Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
        <div className="flex items-baseline">
          <span className={`text-5xl font-black ${getColor(score)} tabular-nums tracking-tighter`}>
            {Math.round(score)}
          </span>
          <span className={`text-sm font-bold opacity-40 ${getColor(score)} ml-0.5`}>%</span>
        </div>
        <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-[0.2em] mt-1">
          SEO Health
        </span>
      </div>
    </div>
  );
}