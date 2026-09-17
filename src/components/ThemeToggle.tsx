'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isDark
          ? 'bg-[#0a1628] border-blue-500/25 text-amber-300 hover:text-amber-200 hover:bg-[#0e1e38] shadow-[0_0_12px_rgba(245,158,11,0.15)]'
          : 'bg-slate-100/90 border-slate-300/80 text-slate-700 hover:text-slate-900 hover:bg-slate-200 shadow-xs'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 text-indigo-600" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
