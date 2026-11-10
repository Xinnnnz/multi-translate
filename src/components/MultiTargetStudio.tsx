import React, { useState } from 'react';
import {
  Volume2,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Info,
  Loader2,
  RefreshCw,
  X,
  Languages,
} from 'lucide-react';
import { LanguageSelect } from './LanguageSelect';
import { speakText, SUPPORTED_LANGUAGES } from '../languages';
import { TranslationResult, VocabularyItem } from '../types';

interface MultiTargetStudioProps {
  sourceLang: string;
  onSourceLangChange: (lang: string) => void;
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  detectedSourceLang?: string;
  targetLangs: string[];
  onAddTargetLang: (lang: string) => void;
  onRemoveTargetLang: (lang: string) => void;
  onTargetLangChange: (oldLang: string, newLang: string) => void;
  results: Record<string, TranslationResult>;
  isTranslating: boolean;
  onTranslate: () => void;
  onClearSource: () => void;
  fontSize: number;
  onSelectVocabulary: (item: VocabularyItem, sentence: string, targetLang: string) => void;
}

export const MultiTargetStudio: React.FC<MultiTargetStudioProps> = ({
  sourceLang,
  onSourceLangChange,
  sourceText,
  onSourceTextChange,
  detectedSourceLang,
  targetLangs,
  onAddTargetLang,
  onRemoveTargetLang,
  onTargetLangChange,
  results,
  isTranslating,
  onTranslate,
  onClearSource,
  fontSize,
  onSelectVocabulary,
}) => {
  const [copiedLang, setCopiedLang] = useState<string | null>(null);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  const handleCopy = (lang: string, text: string) => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  const unusedLanguages = SUPPORTED_LANGUAGES.filter(
    (l) => !targetLangs.includes(l.code) && l.code !== sourceLang
  );

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Master Source Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-sm overflow-hidden ring-2 ring-indigo-500/10">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source:</span>
            <LanguageSelect
              value={sourceLang}
              onChange={onSourceLangChange}
              includeAuto={true}
              dotColor="bg-indigo-500"
            />
            {detectedSourceLang && sourceLang === 'auto' && (
              <span className="text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                Detected: {detectedSourceLang}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => speakText(sourceText, sourceLang === 'auto' ? 'en' : sourceLang)}
              disabled={!sourceText.trim()}
              title="Listen to source speech"
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClearSource}
              disabled={!sourceText.trim()}
              title="Clear input"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <textarea
            value={sourceText}
            onChange={(e) => onSourceTextChange(e.target.value)}
            placeholder="Type or paste text in any language to translate to multiple languages simultaneously..."
            style={{ fontSize: `${fontSize}px` }}
            className="w-full h-32 bg-transparent resize-none focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 leading-relaxed font-normal"
          />

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs text-slate-400">{sourceText.length} characters</span>

            <button
              onClick={onTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20 transition flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Translate All Targets</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Target Languages Header & Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Languages className="w-4 h-4 text-indigo-500" />
            <span>Target Translations ({targetLangs.length})</span>
          </h2>
          <span className="text-xs text-slate-400">• Simultaneous multi-language outputs</span>
        </div>

        {/* Add Target Language Dropdown */}
        <div className="relative">
          {unusedLanguages.length > 0 && (
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-500" />
              <span>Add Target Language</span>
            </button>
          )}

          {showAddDropdown && (
            <div className="absolute right-0 mt-2 w-56 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 p-1.5">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate-400">
                Select language to add:
              </div>
              {unusedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onAddTargetLang(lang.code);
                    setShowAddDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>
                    {lang.flag} {lang.name}
                  </span>
                  <span className="text-[11px] text-slate-400">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {targetLangs.map((langCode) => {
          const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
          const result = results[langCode];
          const hasContent = Boolean(result?.translatedText);

          return (
            <div
              key={langCode}
              className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition"
            >
              {/* Target Card Header */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
                <div className="flex items-center space-x-2">
                  <span className="text-base">{langMeta?.flag}</span>
                  <LanguageSelect
                    value={langCode}
                    onChange={(newCode) => onTargetLangChange(langCode, newCode)}
                  />
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => speakText(result?.translatedText || '', langCode)}
                    disabled={!hasContent}
                    title="Pronounce"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopy(langCode, result?.translatedText || '')}
                    disabled={!hasContent}
                    title="Copy translation"
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {copiedLang === langCode ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {targetLangs.length > 1 && (
                    <button
                      onClick={() => onRemoveTargetLang(langCode)}
                      title="Remove language"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Translation Text & Linguistic details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {isTranslating ? (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      <span className="text-xs">Generating translation...</span>
                    </div>
                  ) : hasContent ? (
                    <div className="space-y-3">
                      <p
                        style={{ fontSize: `${fontSize}px` }}
                        className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed select-text"
                      >
                        {result.translatedText}
                      </p>

                      {/* Romanization / Pinyin */}
                      {result.romanization && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start space-x-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded shrink-0">
                            Pinyin / Phonetic
                          </span>
                          <span className="text-xs text-rose-600 dark:text-rose-400 font-mono select-all">
                            {result.romanization}
                          </span>
                        </div>
                      )}

                      {/* Alternative phrasings */}
                      {result.alternatives && result.alternatives.length > 0 && (
                        <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                            Alternative phrasings:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] italic">
                            {result.alternatives.map((alt, i) => (
                              <li key={i}>{alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Vocabulary breakdown */}
                      {result.vocabulary && result.vocabulary.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 w-full flex items-center space-x-1">
                            <BookOpen className="w-2.5 h-2.5" />
                            <span>Key Terms:</span>
                          </span>
                          {result.vocabulary.map((vocab, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                onSelectVocabulary(vocab, result.translatedText, langCode)
                              }
                              className="px-2 py-0.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700/80 transition flex items-center space-x-1"
                              title="Click for deep-dive explanation"
                            >
                              <span className="font-semibold">{vocab.translated}</span>
                              <span className="text-[10px] text-slate-400">({vocab.original})</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Linguistic note */}
                      {result.linguisticNote && (
                        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-start space-x-1.5 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{result.linguisticNote}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      Translation for {langMeta?.name} will appear here...
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
