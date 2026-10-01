import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  Copy,
  Check,
  Code2,
  FileCode,
  CheckCircle2,
  Wand2,
  X,
  FileCheck,
  PlusSquare,
  Zap,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { AIModel, ChatMessage, ProjectFile } from '../../types';
import { ModelSelector } from './ModelSelector';

interface AIAssistantPanelProps {
  activeModel: AIModel;
  onSelectModel: (model: AIModel) => void;
  messages: ChatMessage[];
  onSendMessage: (content: string, taskType?: string) => Promise<string | void>;
  isLoading: boolean;
  onClearChat: () => void;
  activeFile: ProjectFile | null;
  onApplyCodeToFile: (code: string, mode?: 'replace' | 'insert') => void;
  onClose: () => void;
  autoFixEnabled: boolean;
  onToggleAutoFix: (val: boolean) => void;
  filePermissionsGranted: boolean;
  onTogglePermissions: (val: boolean) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  activeModel,
  onSelectModel,
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
  activeFile,
  onApplyCodeToFile,
  onClose,
  autoFixEnabled,
  onToggleAutoFix,
  filePermissionsGranted,
  onTogglePermissions,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<string | null>(null);
  const [appliedSnippetIdx, setAppliedSnippetIdx] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPrompt.trim() && !isLoading) {
      onSendMessage(inputPrompt.trim());
      setInputPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetIdx(id);
    setTimeout(() => setCopiedSnippetIdx(null), 1500);
  };

  const handleApply = (code: string, id: string, mode: 'replace' | 'insert' = 'replace') => {
    onApplyCodeToFile(code, mode);
    setAppliedSnippetIdx(`${id}-${mode}`);
    setTimeout(() => setAppliedSnippetIdx(null), 2000);
  };

  // Helper to parse message content and render markdown code blocks
  const renderMessageContent = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const firstLineEnd = part.indexOf('\n');
        const lang = part.substring(3, firstLineEnd).trim() || 'javascript';
        const code = part.substring(firstLineEnd + 1, part.length - 3);
        const snippetKey = `${msgId}-code-${index}`;

        return (
          <div
            key={index}
            className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#07090f] shadow-xl font-mono text-xs"
          >
            {/* Code Block Header */}
            <div className="bg-[#121624] px-3 py-2 flex flex-wrap items-center justify-between border-b border-slate-800 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="uppercase font-semibold text-indigo-400 font-mono tracking-wider">
                  {lang}
                </span>
                {autoFixEnabled && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Auto-Applied
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Copy button */}
                <button
                  onClick={() => handleCopyCode(code, snippetKey)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                >
                  {copiedSnippetIdx === snippetKey ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedSnippetIdx === snippetKey ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Insert into File */}
                {activeFile && (
                  <button
                    onClick={() => handleApply(code, snippetKey, 'insert')}
                    title={`Insert snippet into ${activeFile.name}`}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
                  >
                    <PlusSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Insert</span>
                  </button>
                )}

                {/* Replace File */}
                {activeFile && (
                  <button
                    onClick={() => handleApply(code, snippetKey, 'replace')}
                    title={`Update ${activeFile.name} with this code`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-sm shadow-indigo-600/30 cursor-pointer"
                  >
                    {appliedSnippetIdx === `${snippetKey}-replace` ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                    )}
                    <span>
                      {appliedSnippetIdx === `${snippetKey}-replace` ? 'Applied!' : 'Replace File'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Complete, unabbreviated code content */}
            <pre className="p-3 overflow-x-auto text-slate-200 select-text leading-5 max-h-[500px]">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Normal text with bold / headers
      return (
        <div key={index} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </div>
      );
    });
  };

  const PROMPT_SUGGESTIONS = [
    {
      label: '✨ Build App From Scratch',
      prompt: 'Create a complete interactive web app from scratch with full modern styling, interactive state, and responsive design.',
    },
    {
      label: '⚡ Fix Code',
      prompt: 'Fix the code in the active file and apply the solution directly.',
    },
    {
      label: '🚀 Add Feature',
      prompt: 'Add an interactive feature or enhancement to this file with complete code.',
    },
    {
      label: '🧹 Refactor & Clean',
      prompt: 'Refactor this code to follow modern best practices, removing redundancies and improving structure.',
    },
    {
      label: '🛡️ SecOps Audit',
      prompt: 'Perform a security and vulnerability audit on this file and patch any issues.',
    },
    {
      label: '🔄 To Python',
      prompt: 'Convert the logic in this file cleanly into idiomatic Python 3.12.',
    },
  ];

  return (
    <aside className="w-full md:w-96 bg-[#0c0f17] border-l border-slate-800/80 flex flex-col h-full select-none text-xs z-30">
      {/* Top Header */}
      <div className="h-10 bg-[#0f121a] border-b border-slate-800/80 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-slate-200 text-sm">
            AI Assistant Panel
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            title="Clear Chat History"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close AI Panel"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visible File Permissions & Auto-Fix Status Banner */}
      <div
        className={`px-3 py-2 border-b flex items-center justify-between text-[11px] transition ${
          filePermissionsGranted
            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
            : 'bg-amber-950/40 border-amber-800/40 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {filePermissionsGranted ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span className="font-medium">
            File Permissions: {filePermissionsGranted ? 'GRANTED' : 'READ-ONLY'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-[10px] cursor-pointer">
            <input
              type="checkbox"
              checked={autoFixEnabled}
              onChange={(e) => onToggleAutoFix(e.target.checked)}
              className="w-3 h-3 accent-emerald-500 rounded cursor-pointer"
            />
            <span className="font-medium text-slate-200">Auto-Fix</span>
          </label>
        </div>
      </div>

      {/* Model Selector Card */}
      <ModelSelector
        activeModel={activeModel}
        onSelectModel={onSelectModel}
      />

      {/* Context Pill */}
      {activeFile && (
        <div className="px-3 py-1.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">
              Target File: <span className="text-slate-200 font-mono">{activeFile.name}</span>
            </span>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Direct Write Granted
          </span>
        </div>
      )}

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 select-text">
        {messages.length === 0 ? (
          <div className="text-center py-8 px-4 text-slate-500 space-y-3">
            <div className="w-10 h-10 rounded-full bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 text-lg">
              {activeModel.avatar}
            </div>
            <h4 className="text-sm font-semibold text-slate-300">
              {activeModel.name} Ready
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask normal questions, get explanations, or ask to fix code. With full file permissions active, code fixes are automatically applied directly to your files!
            </p>

            {/* Starter chips */}
            <div className="pt-2 flex flex-wrap gap-1.5 justify-center">
              {PROMPT_SUGGESTIONS.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-[11px] transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1 px-1">
                  <span>{isUser ? 'You' : activeModel.name}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.isLive && (
                    <span className="px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px]">
                      LIVE API
                    </span>
                  )}
                </div>

                <div
                  className={`p-3 rounded-2xl max-w-[95%] text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    renderMessageContent(msg.content, msg.id)
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>{activeModel.name} is fixing code & applying changes...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-3 py-1.5 border-t border-slate-800/60 bg-[#0a0d14] overflow-x-auto flex gap-1.5 no-scrollbar">
        {PROMPT_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(item.prompt)}
            disabled={isLoading}
            className="px-2 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] whitespace-nowrap transition cursor-pointer disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-[#0f121a]">
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask to fix code, add features, or ask normal questions... (Enter to send)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pr-10 text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 text-xs resize-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="absolute right-2 bottom-2.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-40 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>
    </aside>
  );
};
