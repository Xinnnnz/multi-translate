import React from 'react';
import { X, CheckCircle2, AlertTriangle, Sparkles, Languages, ArrowRight } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                MultiTranslate AI Architecture
              </h3>
              <p className="text-[11px] text-slate-500">
                Diagnosis & Upgraded Gemini 3.8 Flash Engine
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

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-600 dark:text-slate-300">
          {/* Issue Explanation */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-900 dark:text-amber-200 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Why the previous version only repeated words:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300 text-xs">
              <li>
                <strong>Language codes were inverted:</strong> In the original HTML, <code>&lt;option value="en"&gt;Swedish&lt;/option&gt;</code> had the language tags swapped.
              </li>
              <li>
                <strong>Unused Gemini API Key:</strong> The original code contained a modal for Gemini, but <code>translateFrom()</code> actually made calls to an unauthenticated third-party service (<code>MyMemory API</code>).
              </li>
              <li>
                <strong>MyMemory fallback:</strong> When MyMemory hits its rate limit or fails to find a translation for whole sentences, it returns the input word unchanged.
              </li>
            </ul>
          </div>

          {/* Solution Explanation */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 font-bold text-emerald-900 dark:text-emerald-200 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>How this upgraded MultiTranslate works:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-emerald-800 dark:text-emerald-300 text-xs">
              <li>
                <strong>Real Server-Side Gemini 3.8 Flash:</strong> Performs genuine contextual translation across Swedish, English, Chinese, and many more languages in a single high-speed inference.
              </li>
              <li>
                <strong>Pinyin & Romanization:</strong> Automatically provides accurate Pinyin with tone marks for Chinese (e.g., <code>nǐ hǎo</code>) and Romanization for other non-Latin scripts.
              </li>
              <li>
                <strong>Tri-Directional Sync:</strong> You can type into <em>any</em> of the three panels. The other two will automatically translate into their respective languages with debounced typing.
              </li>
              <li>
                <strong>Interactive Vocabulary & Nuance Notes:</strong> Highlights key terms and gives cultural/linguistic explanations.
              </li>
              <li>
                <strong>Audio Speech:</strong> Web Speech Synthesis with language-specific voice accents.
              </li>
            </ul>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition"
            >
              Got it, let's translate!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
