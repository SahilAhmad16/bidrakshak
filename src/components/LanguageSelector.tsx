'use client';

import React from 'react';
import { useLanguage, Language } from '@/lib/i18n';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'minimal' | 'badge';
}

export function LanguageSelector({ className = '', variant = 'minimal' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
          language === 'hi'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-cyan-400'
        } ${className}`}
        title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{language === 'en' ? 'EN | हिंदी' : 'हिंदी | EN'}</span>
      </button>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={toggleLanguage}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-blue-500/30 bg-white/70 dark:bg-slate-900/60 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 dark:hover:border-cyan-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors shadow-xs cursor-pointer"
        title="Toggle Language / भाषा बदलें"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
        <span className="font-semibold">{language === 'en' ? 'English' : 'हिंदी'}</span>
        <span className="text-[10px] text-slate-400 uppercase ml-0.5">({language === 'en' ? 'HI' : 'EN'})</span>
      </button>
    </div>
  );
}
