import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Copy,
  Check,
  Trash2,
  Sparkles,
  BookOpen,
  Info,
  Loader2,
} from 'lucide-react';
import { LanguageSelect } from './LanguageSelect';
import { speakText } from '../languages';
import { TranslationResult, VocabularyItem } from '../types';

export interface PanelState {
  id: number;
  lang: string;
  text: string;
  romanization?: string;
  vocabulary?: VocabularyItem[];
  linguisticNote?: string;
  dotColor: string;
}

interface InteractiveMatrixProps {
  panels: PanelState[];
  onPanelTextChange: (id: number, newText: string) => void;
  onPanelLangChange: (id: number, newLang: string) => void;
  onClearPanel: (id: number) => void;
  onSwapPanels?: (idA: number, idB: number) => void;
  isTranslating: boolean;
  activeSourceId: number | null;
  fontSize: number;
  onSelectVocabulary: (item: VocabularyItem, sentence: string, targetLang: string) => void;
}

export const InteractiveMatrix: React.FC<InteractiveMatrixProps> = ({
  panels,
  onPanelTextChange,
  onPanelLangChange,
  onClearPanel,
  isTranslating,
  activeSourceId,
  fontSize,
  onSelectVocabulary,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const panel1 = panels[0];
  const panel2 = panels[1];
  const panel3 = panels[2];

  const renderPanel = (panel: PanelState, isTop: boolean = false) => {
    const isSource = activeSourceId === panel.id;
    const isTargetWaiting = isTranslating && !isSource;

    return (
      <div
        key={panel.id}
        className={`flex flex-col bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
          isSource
            ? 'border-indigo-400/80 dark:border-indigo-500/60 ring-2 ring-indigo-500/10'
            : 'border-slate-200 dark:border-slate-800'
        } ${isTop ? 'min-h-[220px]' : 'min-h-[260px]'}`}
      >
        {/* Panel Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <LanguageSelect
              value={panel.lang}
              onChange={(newLang) => onPanelLangChange(panel.id, newLang)}
              dotColor={panel.dotColor}
            />
            {isSource && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full">
                Active Source
              </span>
            )}
            {isTargetWaiting && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-full animate-pulse">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                <span>Translating...</span>
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            {/* Audio Speech */}
            <button
              onClick={() => speakText(panel.text, panel.lang)}
              disabled={!panel.text.trim()}
              title="Listen to pronunciation"
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Copy button */}
            <button
              onClick={() => handleCopy(panel.id, panel.text)}
              disabled={!panel.text.trim()}
              title="Copy to clipboard"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none relative"
            >
              {copiedId === panel.id ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Clear button */}
            <button
              onClick={() => onClearPanel(panel.id)}
              disabled={!panel.text.trim()}
              title="Clear text"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-4 flex flex-col relative">
          <textarea
            value={panel.text}
            onChange={(e) => onPanelTextChange(panel.id, e.target.value)}
            placeholder={
              isTop
                ? 'Type here in any language (Swedish, English, Chinese...)...'
                : `Type in or auto-translate to ${panel.lang.toUpperCase()}...`
            }
            style={{ fontSize: `${fontSize}px` }}
            className="w-full flex-1 bg-transparent resize-none focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 leading-relaxed font-normal min-h-[100px]"
          />

          {/* Romanization / Pinyin Display (essential for Chinese / Japanese) */}
          {panel.romanization && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-start space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded shrink-0">
                Pinyin / Reading
              </span>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-mono select-all">
                {panel.romanization}
              </p>
            </div>
          )}

          {/* Vocabulary chips */}
          {panel.vocabulary && panel.vocabulary.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center space-x-1">
                <BookOpen className="w-2.5 h-2.5" />
                <span>Vocabulary:</span>
              </span>
              {panel.vocabulary.map((vocab, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectVocabulary(vocab, panel.text, panel.lang)}
                  className="px-2 py-0.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700/80 transition flex items-center space-x-1 group"
                  title="Click to view deep dive explanation"
                >
                  <span className="font-medium">{vocab.translated}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-indigo-400">
                    ({vocab.original})
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Linguistic nuance note */}
          {panel.linguisticNote && (
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-start space-x-1.5 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>{panel.linguisticNote}</span>
            </div>
          )}

          {/* Footer inside panel */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{panel.text.length} characters</span>
            {isSource && (
              <span className="text-indigo-500 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Live Gemini translation active</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Top: Panel 1 (Master / Primary Input) */}
      <div>
        {panel1 && renderPanel(panel1, true)}
      </div>

      {/* Bottom Row: Panel 2 & Panel 3 (Side-by-Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {panel2 && renderPanel(panel2, false)}
        {panel3 && renderPanel(panel3, false)}
      </div>
    </div>
  );
};
