import React, { useState } from 'react';
import {
  X,
  Clock,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Search,
  Download,
  Calendar,
} from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onLoadItem,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter(
    (item) =>
      item.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targets.some((t) => t.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `multitranslate-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Translation History
            </h2>
            <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {history.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportJson}
                  title="Export History JSON"
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClearHistory}
                  title="Clear All History"
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        {history.length > 0 && (
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search past translations..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Clock className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-medium">No translations recorded yet</p>
              <p className="text-xs mt-1 text-slate-400">
                Type in any panel to generate and save simultaneous translations!
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching translations found for "{searchTerm}"
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition group"
              >
                {/* Header info */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onLoadItem(item)}
                      title="Load into translator"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-0.5 text-[11px] font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      title="Delete entry"
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Source text */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Source:</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
                    {item.sourceText}
                  </p>
                </div>

                {/* Target outputs */}
                <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  {item.targets.map((tgt, i) => (
                    <div key={i} className="text-xs flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mr-1.5">
                          {tgt.langName || tgt.lang.toUpperCase()}:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{tgt.text}</span>
                        {tgt.romanization && (
                          <span className="block text-[10px] text-rose-500 dark:text-rose-400 font-mono">
                            {tgt.romanization}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopy(`${item.id}-${i}`, tgt.text)}
                        title="Copy translation"
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                      >
                        {copiedId === `${item.id}-${i}` ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
