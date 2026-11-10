import React from 'react';
import { SUPPORTED_LANGUAGES } from '../languages';

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  exclude?: string[];
  includeAuto?: boolean;
  className?: string;
  dotColor?: string;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  value,
  onChange,
  exclude = [],
  includeAuto = false,
  className = '',
  dotColor,
}) => {
  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => !exclude.includes(lang.code) || lang.code === value
  );

  return (
    <div className={`relative inline-flex items-center space-x-2 ${className}`}>
      {dotColor && <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />}
      <select
        value={value}
        aria-label="Select translation language"
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-semibold text-sm focus:outline-none cursor-pointer text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition pr-2 py-0.5"
      >
        {includeAuto && <option value="auto" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">✨ Auto-Detect Language</option>}
        {availableLanguages.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
          >
            {lang.flag} {lang.name} ({lang.nativeName})
          </option>
        ))}
      </select>
    </div>
  );
};
