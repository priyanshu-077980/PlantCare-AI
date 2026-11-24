import React from 'react';
import { X, Layers, FileText, CheckCircle2 } from 'lucide-react';

export default function ContextDrawer({ isOpen, onClose, context, sources = [] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-campus-500/10 text-campus-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Retrieved Handbook Context</h3>
              <p className="text-xs text-slate-400">Official college document excerpts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sources List */}
        {sources && sources.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs">
            <span className="text-slate-400 shrink-0">Source PDFs:</span>
            {sources.map((src, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800 text-campus-300 border border-slate-700/60 font-mono text-[11px]"
              >
                <FileText className="w-3 h-3 text-campus-400" />
                <span>{src}</span>
              </span>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
            {context || "No context retrieved."}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
