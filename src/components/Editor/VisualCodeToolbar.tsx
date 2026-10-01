import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  FileQuestion,
  ShieldAlert,
  ArrowRightLeft,
  Copy,
  Check,
  Send,
  X,
  Loader2,
} from 'lucide-react';
import { AIModel } from '../../types';

interface VisualCodeToolbarProps {
  selectedText: string;
  selectedLinesRange: { start: number; end: number };
  activeModel: AIModel;
  onAskAI: (prompt: string, taskType: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const VisualCodeToolbar: React.FC<VisualCodeToolbarProps> = ({
  selectedText,
  selectedLinesRange,
  activeModel,
  onAskAI,
  onClose,
  isLoading,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleQuickAction = (taskType: string, defaultPrompt: string) => {
    onAskAI(defaultPrompt, taskType);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim() && !isLoading) {
      onAskAI(customPrompt.trim(), 'inline-edit');
      setCustomPrompt('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="absolute top-12 right-6 z-40 bg-[#121624] border border-indigo-500/40 rounded-xl shadow-2xl shadow-indigo-950/60 p-2 text-xs backdrop-blur-md max-w-md w-full animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px]">
        <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Visual Code / Chat-to-Code</span>
          <span className="text-slate-500 font-mono">
            (Lines {selectedLinesRange.start}–{selectedLinesRange.end})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40">
            {activeModel.name.split(' ')[0]}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Quick AI Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
        <button
          onClick={() =>
            handleQuickAction('inline-edit', 'Refactor and optimize this highlighted code block with clean modern syntax.')
          }
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-800/40 transition cursor-pointer text-left disabled:opacity-50"
        >
          <Wand2 className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="truncate">Refactor</span>
        </button>

        <button
          onClick={() =>
            handleQuickAction('explain', 'Explain what this specific logic block does step by step.')
          }
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition cursor-pointer text-left disabled:opacity-50"
        >
          <FileQuestion className="w-3 h-3 text-sky-400 shrink-0" />
          <span className="truncate">Explain</span>
        </button>

        <button
          onClick={() =>
            handleQuickAction(
              'security',
              'Audit this code selection for security flaws, memory leaks, or unhandled errors.'
            )
          }
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition cursor-pointer text-left disabled:opacity-50"
        >
          <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">SecOps Check</span>
        </button>

        <button
          onClick={() =>
            handleQuickAction(
              'inline-edit',
              'Add defensive try-catch error handling and validation guards.'
            )
          }
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition cursor-pointer text-left disabled:opacity-50"
        >
          <span className="text-emerald-400 font-bold shrink-0">🛡️</span>
          <span className="truncate">Error Guards</span>
        </button>

        <button
          onClick={() =>
            handleQuickAction(
              'convert-syntax',
              'Convert this logic cleanly into idiomatic Python 3 code.'
            )
          }
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition cursor-pointer text-left disabled:opacity-50"
        >
          <ArrowRightLeft className="w-3 h-3 text-purple-400 shrink-0" />
          <span className="truncate">To Python</span>
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer text-left"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
          ) : (
            <Copy className="w-3 h-3 text-slate-400 shrink-0" />
          )}
          <span className="truncate">{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Custom Prompt Box */}
      <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5">
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={`Prompt ${activeModel.name.split(' ')[0]} on selection...`}
          disabled={isLoading}
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
        />
        <button
          type="submit"
          disabled={!customPrompt.trim() || isLoading}
          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-40 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
    </div>
  );
};
