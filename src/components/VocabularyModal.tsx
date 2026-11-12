import React, { useState, useEffect } from 'react';
import { X, BookOpen, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { VocabularyItem } from '../types';
import { speakText } from '../languages';
import { safeFetchJson } from '../api';

interface VocabularyModalProps {
  item: VocabularyItem | null;
  sentence?: string;
  targetLang?: string;
  onClose: () => void;
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({
  item,
  sentence,
  targetLang = 'en',
  onClose,
}) => {
  const [deepDive, setDeepDive] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) {
      setDeepDive(null);
      return;
    }

    // Automatically fetch deeper linguistic insight using Gemini
    let isMounted = true;
    setLoading(true);

    safeFetchJson<{ explanation?: string }>('/api/explain-term', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        term: item.translated,
        contextSentence: sentence,
        targetLang,
      }),
    })
      .then((data) => {
        if (isMounted) {
          setDeepDive(data.explanation || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching deep dive:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item, sentence, targetLang]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Vocabulary Breakdown
              </h3>
              <p className="text-[11px] text-slate-500">
                Linguistic analysis powered by Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Display */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {item.translated}
                </span>
                {item.partOfSpeech && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                    {item.partOfSpeech}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Original Term: <span className="font-medium text-slate-700 dark:text-slate-200">{item.original}</span>
              </p>
            </div>

            <button
              onClick={() => speakText(item.translated, targetLang)}
              title="Pronounce word"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 shadow-xs transition"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Quick note */}
          {item.note && (
            <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-0.5">
                Note & Usage:
              </span>
              {item.note}
            </div>
          )}

          {/* Sentence Context */}
          {sentence && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-[11px] uppercase tracking-wider block mb-1">
                Context in text:
              </span>
              <p className="italic bg-slate-100/70 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                "{sentence}"
              </p>
            </div>
          )}

          {/* Gemini Deep Dive Insight */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini Linguistic Insights</span>
            </div>

            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span className="text-xs">Analyzing word nuances and etymology...</span>
              </div>
            ) : deepDive ? (
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 font-normal">
                {deepDive}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
