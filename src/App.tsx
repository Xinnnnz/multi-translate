/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { InteractiveMatrix, PanelState } from './components/InteractiveMatrix';
import { HistoryDrawer } from './components/HistoryDrawer';
import { VocabularyModal } from './components/VocabularyModal';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';
import { SUPPORTED_LANGUAGES } from './languages';
import {
  HistoryItem,
  TranslationResponse,
  TranslationResult,
  TranslationTone,
  VocabularyItem,
} from './types';
import { Sparkles, Zap, AlertCircle, RefreshCw } from 'lucide-react';

const STORAGE_KEY_HISTORY = 'multitranslate_history_v1';
const STORAGE_KEY_THEME = 'multitranslate_theme';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDark]);

  // Configuration
  const [tone, setTone] = useState<TranslationTone>('natural');
  const [fontSize, setFontSize] = useState<number>(16);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<{
    item: VocabularyItem;
    sentence: string;
    targetLang: string;
  } | null>(null);

  // Error & Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeSourceId, setActiveSourceId] = useState<number | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveHistoryItem = (item: HistoryItem) => {
    setHistory((prev) => {
      // Avoid duplicate consecutive entries
      const filtered = prev.filter((h) => h.sourceText !== item.sourceText);
      const next = [item, ...filtered].slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save history to storage:', err);
      }
      return next;
    });
  };

  // Matrix Panels State (Swedish, English, Chinese by default)
  const [matrixPanels, setMatrixPanels] = useState<PanelState[]>([
    {
      id: 1,
      lang: 'sv',
      text: '',
      dotColor: 'bg-emerald-500',
    },
    {
      id: 2,
      lang: 'en',
      text: '',
      dotColor: 'bg-blue-500',
    },
    {
      id: 3,
      lang: 'zh',
      text: '',
      dotColor: 'bg-rose-500',
    },
  ]);


  // Translation Debounce Ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Perform translation call to /api/translate
  const performTranslation = async (
    text: string,
    sourceLang: string,
    targetLangs: string[],
    onSuccess: (data: TranslationResponse) => void
  ) => {
    if (!text.trim()) {
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLangs,
          tone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Translation request failed (${response.status})`);
      }

      const data: TranslationResponse = await response.json();
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);

      onSuccess(data);

      // Record in history
      saveHistoryItem({
        id: Date.now().toString(),
        timestamp: Date.now(),
        sourceLang,
        sourceText: text,
        targets: data.results.map((r) => ({
          lang: r.targetLang,
          langName: r.targetLangName,
          text: r.translatedText,
          romanization: r.romanization,
        })),
      });
    } catch (err: any) {
      console.error('Translation error:', err);
      setErrorMessage(err?.message || 'Failed to complete translation.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Matrix Text Change Handler
  const handleMatrixTextChange = (sourceId: number, newText: string) => {
    setActiveSourceId(sourceId);

    // Update the changed panel text immediately
    setMatrixPanels((prev) =>
      prev.map((p) => (p.id === sourceId ? { ...p, text: newText } : p))
    );

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!newText.trim()) {
      // Clear target panels if source is empty
      setMatrixPanels((prev) =>
        prev.map((p) =>
          p.id !== sourceId
            ? { ...p, text: '', romanization: undefined, vocabulary: undefined, linguisticNote: undefined }
            : p
        )
      );
      return;
    }

    // Debounce translation by 500ms
    debounceTimerRef.current = setTimeout(() => {
      const currentPanels = matrixPanels;
      const sourcePanel = currentPanels.find((p) => p.id === sourceId);
      if (!sourcePanel) return;

      const targetPanels = currentPanels.filter((p) => p.id !== sourceId);
      const targetLangCodes = targetPanels.map((p) => p.lang);

      performTranslation(newText, sourcePanel.lang, targetLangCodes, (data) => {
        setMatrixPanels((prev) =>
          prev.map((panel) => {
            if (panel.id === sourceId) return panel;
            const res = data.results.find((r) => r.targetLang === panel.lang);
            if (!res) return panel;
            return {
              ...panel,
              text: res.translatedText,
              romanization: res.romanization,
              vocabulary: res.vocabulary,
              linguisticNote: res.linguisticNote,
            };
          })
        );
      });
    }, 550);
  };

  // Matrix Language Change Handler
  const handleMatrixLangChange = (id: number, newLang: string) => {
    setMatrixPanels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, lang: newLang } : p))
    );

    // If there is existing text in another panel, retranslate
    const otherPanelWithText = matrixPanels.find((p) => p.id !== id && p.text.trim());
    if (otherPanelWithText) {
      handleMatrixTextChange(otherPanelWithText.id, otherPanelWithText.text);
    }
  };

  // Clear Matrix Panel
  const handleClearMatrixPanel = (id: number) => {
    setMatrixPanels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, text: '', romanization: undefined, vocabulary: undefined, linguisticNote: undefined } : p))
    );
  };

  // Swap Panels in Matrix
  const handleSwapPanels = (idA: number, idB: number) => {
    setMatrixPanels((prev) => {
      const panelA = prev.find((p) => p.id === idA);
      const panelB = prev.find((p) => p.id === idB);
      if (!panelA || !panelB) return prev;

      return prev.map((p) => {
        if (p.id === idA) {
          return {
            ...p,
            lang: panelB.lang,
            text: panelB.text,
            romanization: panelB.romanization,
            vocabulary: panelB.vocabulary,
            linguisticNote: panelB.linguisticNote,
          };
        }
        if (p.id === idB) {
          return {
            ...p,
            lang: panelA.lang,
            text: panelA.text,
            romanization: panelA.romanization,
            vocabulary: panelA.vocabulary,
            linguisticNote: panelA.linguisticNote,
          };
        }
        return p;
      });
    });
  };

  // Restore history item
  const handleRestoreHistory = (item: HistoryItem) => {
    setMatrixPanels((prev) =>
      prev.map((p, idx) => {
        if (idx === 0) {
          return { ...p, lang: item.sourceLang, text: item.sourceText };
        }
        const target = item.targets[idx - 1];
        if (target) {
          return {
            ...p,
            lang: target.lang,
            text: target.text,
            romanization: target.romanization,
          };
        }
        return p;
      })
    );
    setIsHistoryOpen(false);
  };


  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        tone={tone}
        onToneChange={(newTone) => {
          setTone(newTone);
          const active = matrixPanels.find((p) => p.text.trim());
          if (active) handleMatrixTextChange(active.id, active.text);
        }}
        fontSize={fontSize}
        onFontSizeChange={(delta) => setFontSize((prev) => Math.min(24, Math.max(13, prev + delta)))}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onExport={() => setIsExportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-5">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 p-4 rounded-2xl flex items-center justify-between space-x-3 text-amber-900 dark:text-amber-200 text-xs shadow-xs animate-in fade-in">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-semibold block text-sm">Translation Notice</span>
                <span>{errorMessage}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  setErrorMessage(null);
                  const active = matrixPanels.find((p) => p.text.trim());
                  if (active) handleMatrixTextChange(active.id, active.text);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-xs transition flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-amber-700 dark:text-amber-300 hover:text-amber-900 px-2 py-1 font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Active translation status */}
        {(isTranslating || latencyMs !== null) && (
          <div className="flex items-center justify-end px-2 -mb-2">
            {isTranslating ? (
              <span className="flex items-center space-x-1.5 text-xs text-indigo-500 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Translating with Gemini...</span>
              </span>
            ) : latencyMs !== null ? (
              <span className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Translated in {latencyMs}ms</span>
              </span>
            ) : null}
          </div>
        )}

        {/* Main Work Area: 3-Panel Tri-Sync Matrix */}
        <InteractiveMatrix
          panels={matrixPanels}
          onPanelTextChange={handleMatrixTextChange}
          onPanelLangChange={handleMatrixLangChange}
          onClearPanel={handleClearMatrixPanel}
          isTranslating={isTranslating}
          activeSourceId={activeSourceId}
          fontSize={fontSize}
          onSelectVocabulary={(item, sentence, targetLang) =>
            setSelectedVocab({ item, sentence, targetLang })
          }
        />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MultiTranslate AI &bull; Simultaneous Multi-Language Neural Translation</span>
          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition underline underline-offset-2"
            >
              How it works
            </button>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Powered by Gemini 3.8 Flash
            </span>
          </div>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadItem={handleRestoreHistory}
        onClearHistory={() => {
          setHistory([]);
          localStorage.removeItem(STORAGE_KEY_HISTORY);
        }}
        onDeleteHistoryItem={(id) => {
          setHistory((prev) => {
            const next = prev.filter((item) => item.id !== id);
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(next));
            return next;
          });
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        panels={matrixPanels}
      />

      <VocabularyModal
        item={selectedVocab?.item || null}
        sentence={selectedVocab?.sentence}
        targetLang={selectedVocab?.targetLang}
        onClose={() => setSelectedVocab(null)}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
