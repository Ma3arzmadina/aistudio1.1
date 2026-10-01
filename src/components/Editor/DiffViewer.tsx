import React from 'react';
import { Check, X, ArrowRight, Wand2 } from 'lucide-react';
import { DiffProposal } from '../../types';

interface DiffViewerProps {
  diff: DiffProposal;
  onApply: () => void;
  onDiscard: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  diff,
  onApply,
  onDiscard,
}) => {
  if (!diff.active) return null;

  return (
    <div className="absolute inset-x-4 top-14 z-50 bg-[#0f1422] border-2 border-indigo-500 rounded-xl shadow-2xl shadow-black/80 overflow-hidden max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Top Banner */}
      <div className="p-3 bg-indigo-950/80 border-b border-indigo-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-sm text-slate-100">
            AI Proposed Code Replacement
          </span>
          <span className="text-xs text-indigo-300 font-mono">
            (Lines {diff.startLine}–{diff.endLine})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDiscard}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>
          <button
            onClick={onApply}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-md shadow-emerald-900/40 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>

      {diff.explanation && (
        <div className="px-4 py-2 bg-slate-900/60 text-xs text-slate-300 border-b border-slate-800">
          💡 <span className="font-medium text-indigo-300">AI Notes:</span> {diff.explanation}
        </div>
      )}

      {/* Side-by-side or stacked diff */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 font-mono text-xs">
        {/* Original */}
        <div className="p-3 bg-[#130f14]/50">
          <div className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
            <span>- Current Code</span>
          </div>
          <pre className="text-rose-200/90 whitespace-pre-wrap bg-rose-950/20 p-2.5 rounded border border-rose-900/40 select-text">
            {diff.originalSnippet}
          </pre>
        </div>

        {/* Proposed */}
        <div className="p-3 bg-[#0d1617]/50">
          <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
            <span>+ Proposed Replacement</span>
          </div>
          <pre className="text-emerald-200 whitespace-pre-wrap bg-emerald-950/20 p-2.5 rounded border border-emerald-900/40 select-text">
            {diff.proposedSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
