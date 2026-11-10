import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, Code2, Table } from 'lucide-react';
import { PanelState } from './InteractiveMatrix';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  panels: PanelState[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, panels }) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'json' | 'csv'>('txt');

  if (!isOpen) return null;

  const generateContent = () => {
    if (exportFormat === 'json') {
      const exportObj = {
        exportedAt: new Date().toISOString(),
        engine: 'Gemini 3.8 Flash',
        translations: panels.map((p) => ({
          languageCode: p.lang,
          text: p.text,
          romanization: p.romanization || null,
          vocabulary: p.vocabulary || [],
          linguisticNote: p.linguisticNote || null,
        })),
      };
      return JSON.stringify(exportObj, null, 2);
    }

    if (exportFormat === 'csv') {
      const header = 'Language,Text,Romanization,LinguisticNote\n';
      const rows = panels
        .map(
          (p) =>
            `"${p.lang}","${p.text.replace(/"/g, '""')}","${(p.romanization || '').replace(
              /"/g,
              '""'
            )}","${(p.linguisticNote || '').replace(/"/g, '""')}"`
        )
        .join('\n');
      return header + rows;
    }

    // Default TXT
    return panels
      .map(
        (p) =>
          `[${p.lang.toUpperCase()}]\n${p.text}${
            p.romanization ? `\n(Romanization: ${p.romanization})` : ''
          }${p.linguisticNote ? `\nNote: ${p.linguisticNote}` : ''}\n`
      )
      .join('\n----------------------------------------\n\n');
  };

  const content = generateContent();

  const handleDownload = () => {
    const mimeTypes = {
      txt: 'text/plain',
      json: 'application/json',
      csv: 'text/csv',
    };
    const blob = new Blob([content], { type: `${mimeTypes[exportFormat]};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-export-${Date.now()}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Export Translation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Format selection */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Format:</span>
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setExportFormat('txt')}
                className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition ${
                  exportFormat === 'txt'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text (.txt)</span>
              </button>
              <button
                onClick={() => setExportFormat('json')}
                className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition ${
                  exportFormat === 'json'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON (.json)</span>
              </button>
              <button
                onClick={() => setExportFormat('csv')}
                className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition ${
                  exportFormat === 'csv'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Preview box */}
          <div className="relative">
            <textarea
              readOnly
              value={content}
              rows={8}
              className="w-full bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center space-x-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Content</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
