import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n, Language } from '../services/i18n';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage } = useI18n();

  return (
    <div
      className={`inline-flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-0.5 shadow-xs ${className}`}
      role="group"
      aria-label="Sélecteur de langue / اختيار اللغة"
    >
      <button
        type="button"
        onClick={() => setLanguage('fr')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
          language === 'fr'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Français"
      >
        <span className="font-semibold text-[11px]">FR</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
          language === 'ar'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="العربية"
      >
        <span className="font-semibold text-[11px]">العربية</span>
      </button>
    </div>
  );
};
