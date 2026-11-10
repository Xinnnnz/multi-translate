import {
  Languages,
  Sparkles,
  History,
  Download,
  Type as TypeIcon,
  HelpCircle,
} from 'lucide-react';
import { TranslationTone } from '../types';

interface HeaderProps {
  tone: TranslationTone;
  onToneChange: (tone: TranslationTone) => void;
  fontSize: number;
  onFontSizeChange: (delta: number) => void;
  historyCount: number;
  onOpenHistory: () => void;
  onExport: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tone,
  onToneChange,
  fontSize,
  onFontSizeChange,
  historyCount,
  onOpenHistory,
  onExport,
  onOpenHelp,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                MultiTranslate AI
              </h1>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <Sparkles className="w-3 h-3" />
                <span>Gemini 3.8 Flash</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden xs:block">
              Simultaneous Multi-Language AI Polyglot
            </p>
          </div>
        </div>

        {/* Center / Tone style selector */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Style:</span>
          <select
            value={tone}
            aria-label="Translation style and tone"
            onChange={(e) => onToneChange(e.target.value as TranslationTone)}
            className="bg-transparent font-medium cursor-pointer focus:outline-none"
          >
            <option value="natural" className="bg-white dark:bg-slate-900">Natural & Idiomatic</option>
            <option value="conversational" className="bg-white dark:bg-slate-900">Casual & Conversational</option>
            <option value="formal" className="bg-white dark:bg-slate-900">Formal & Polite</option>
            <option value="technical" className="bg-white dark:bg-slate-900">Technical & Precise</option>
            <option value="creative" className="bg-white dark:bg-slate-900">Expressive & Literary</option>
          </select>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Font Size controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onFontSizeChange(-1)}
              disabled={fontSize <= 13}
              className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition disabled:opacity-40"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="px-1 text-[11px] font-mono text-slate-400">{fontSize}</span>
            <button
              onClick={() => onFontSizeChange(1)}
              disabled={fontSize >= 24}
              className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition disabled:opacity-40"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Export */}
          <button
            onClick={onExport}
            title="Export translations (TXT / JSON / CSV)"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            title="Translation History"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Help Info */}
          <button
            onClick={onOpenHelp}
            title="How MultiTranslate AI works"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile sub-bar for tone */}
      <div className="sm:hidden px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50">
        <span className="text-xs text-slate-400 font-medium">Style:</span>
        <select
          value={tone}
          aria-label="Translation style"
          onChange={(e) => onToneChange(e.target.value as TranslationTone)}
          className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium"
        >
          <option value="natural">Natural Style</option>
          <option value="conversational">Casual</option>
          <option value="formal">Formal</option>
          <option value="technical">Technical</option>
          <option value="creative">Creative</option>
        </select>
      </div>
    </header>
  );
};
