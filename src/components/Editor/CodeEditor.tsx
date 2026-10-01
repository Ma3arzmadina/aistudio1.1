import React, { useState, useRef, useEffect } from 'react';
import { ProjectFile, AIModel, DiffProposal, UserSettings } from '../../types';
import { EditorTabs } from './EditorTabs';
import { VisualCodeToolbar } from './VisualCodeToolbar';
import { DiffViewer } from './DiffViewer';
import { highlightLine, getTokenClass } from '../../utils/syntaxHighlighter';
import { Sparkles, Search, Check, Copy } from 'lucide-react';

interface CodeEditorProps {
  openFiles: ProjectFile[];
  activeFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  onCloseFile: (fileId: string) => void;
  onNewFileClick: () => void;
  onUpdateContent: (fileId: string, content: string) => void;
  activeModel: AIModel;
  onAskAI: (prompt: string, taskType: string, customContext?: any) => Promise<string | void>;
  diffProposal: DiffProposal;
  onApplyDiff: () => void;
  onDiscardDiff: () => void;
  settings: UserSettings;
  onRunCode: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  openFiles,
  activeFile,
  onSelectFile,
  onCloseFile,
  onNewFileClick,
  onUpdateContent,
  activeModel,
  onAskAI,
  diffProposal,
  onApplyDiff,
  onDiscardDiff,
  settings,
  onRunCode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const syntaxOverlayRef = useRef<HTMLDivElement>(null);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [selectedText, setSelectedText] = useState('');
  const [selectedLinesRange, setSelectedLinesRange] = useState({ start: 1, end: 1 });
  const [isVisualToolbarOpen, setIsVisualToolbarOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Synchronize scroll between textarea, line numbers, and syntax overlay
  const handleScroll = () => {
    if (!textareaRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;
    if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = scrollTop;
    if (syntaxOverlayRef.current) {
      syntaxOverlayRef.current.scrollTop = scrollTop;
      syntaxOverlayRef.current.scrollLeft = scrollLeft;
    }
  };

  // Cursor and Selection tracking
  const updateCursorAndSelection = () => {
    if (!textareaRef.current || !activeFile) return;
    const text = activeFile.content;
    const selStart = textareaRef.current.selectionStart;
    const selEnd = textareaRef.current.selectionEnd;

    // Line and Column
    const textBeforeCursor = text.substring(0, selStart);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    setCursorPos({ line: currentLine, col: currentCol });

    // Selection
    if (selEnd > selStart) {
      const selected = text.substring(selStart, selEnd);
      setSelectedText(selected);

      const startLine = text.substring(0, selStart).split('\n').length;
      const endLine = text.substring(0, selEnd).split('\n').length;
      setSelectedLinesRange({ start: startLine, end: endLine });

      // Automatically show floating Visual Code toolbar if selection is non-empty
      if (selected.trim().length > 3) {
        setIsVisualToolbarOpen(true);
      }
    } else {
      setSelectedText('');
    }
  };

  // Handle Tab key and shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!activeFile || !textareaRef.current) return;

    // Ctrl+Enter: Run code / refresh preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRunCode();
      return;
    }

    // Ctrl+S / Cmd+S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      // Code is already live-synced
      return;
    }

    // Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const spaces = ' '.repeat(settings.tabSize || 2);
      const newContent =
        activeFile.content.substring(0, start) +
        spaces +
        activeFile.content.substring(end);

      onUpdateContent(activeFile.id, newContent);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
            start + spaces.length;
        }
      }, 0);
    }
  };

  const handleAskAIOnSelection = async (prompt: string, taskType: string) => {
    if (!activeFile || !selectedText) return;
    setIsAILoading(true);
    try {
      await onAskAI(prompt, taskType, {
        fileName: activeFile.name,
        fileLanguage: activeFile.language,
        highlightedCode: selectedText,
        startLine: selectedLinesRange.start,
        endLine: selectedLinesRange.end,
      });
    } finally {
      setIsAILoading(false);
    }
  };

  const handleCopyAll = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1017] text-slate-500 p-6 select-none">
        <Sparkles className="w-12 h-12 text-indigo-500/40 mb-3 animate-pulse" />
        <h3 className="text-lg font-semibold text-slate-300 mb-1">
          No File Open
        </h3>
        <p className="text-xs text-slate-400 mb-4 text-center max-w-sm">
          Select a file from the explorer or create a new one to begin editing with AI assistance.
        </p>
        <button
          onClick={onNewFileClick}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer"
        >
          + Create File
        </button>
      </div>
    );
  }

  const lines = activeFile.content.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1017] overflow-hidden relative">
      {/* Editor Tab Bar */}
      <EditorTabs
        openFiles={openFiles}
        activeFile={activeFile}
        onSelectFile={onSelectFile}
        onCloseFile={onCloseFile}
        onNewFileClick={onNewFileClick}
      />

      {/* Floating Visual Code / Chat-to-Code Toolbar */}
      {isVisualToolbarOpen && selectedText && (
        <VisualCodeToolbar
          selectedText={selectedText}
          selectedLinesRange={selectedLinesRange}
          activeModel={activeModel}
          onAskAI={handleAskAIOnSelection}
          onClose={() => setIsVisualToolbarOpen(false)}
          isLoading={isAILoading}
        />
      )}

      {/* AI Diff Proposal Viewer */}
      {diffProposal.active && (
        <DiffViewer
          diff={diffProposal}
          onApply={onApplyDiff}
          onDiscard={onDiscardDiff}
        />
      )}

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-[#090b10] border-r border-slate-800/80 text-slate-600 font-mono text-[12px] py-3 text-right pr-3 select-none overflow-hidden shrink-0"
        >
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isCurrent = lineNum === cursorPos.line;
            return (
              <div
                key={i}
                className={`leading-6 ${
                  isCurrent ? 'text-indigo-400 font-bold' : ''
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Code Canvas Container */}
        <div className="flex-1 relative overflow-hidden">
          {/* Syntax Highlighted Underlay (Read Only background for crisp rendering) */}
          <div
            ref={syntaxOverlayRef}
            className="absolute inset-0 p-3 font-mono text-[13px] leading-6 overflow-hidden pointer-events-none whitespace-pre select-none"
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            {lines.map((line, idx) => {
              const tokens = highlightLine(line, activeFile.language);
              const isCurrent = idx + 1 === cursorPos.line;
              return (
                <div
                  key={idx}
                  className={`leading-6 h-6 ${
                    isCurrent ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  {tokens.map((token, tIdx) => (
                    <span key={tIdx} className={getTokenClass(token.type)}>
                      {token.text}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Interactive Textarea Layer */}
          <textarea
            ref={textareaRef}
            value={activeFile.content}
            onChange={(e) => onUpdateContent(activeFile.id, e.target.value)}
            onScroll={handleScroll}
            onSelect={updateCursorAndSelection}
            onClick={updateCursorAndSelection}
            onKeyUp={updateCursorAndSelection}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="absolute inset-0 p-3 font-mono text-[13px] leading-6 bg-transparent text-transparent caret-indigo-400 outline-none resize-none overflow-auto whitespace-pre z-10 selection:bg-indigo-600/35 selection:text-transparent"
            style={{ fontSize: `${settings.fontSize}px` }}
          />
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 bg-[#090b10] border-t border-slate-800/80 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none shrink-0">
        <div className="flex items-center gap-4">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          {selectedText && (
            <span className="text-indigo-400 font-semibold">
              ({selectedText.length} chars selected)
            </span>
          )}
          <span className="hidden sm:inline text-slate-500">
            {lines.length} lines
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyAll}
            title="Copy full file content"
            className="hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <span className="text-slate-500">Spaces: {settings.tabSize}</span>
          <span className="text-slate-500">UTF-8</span>
          <span className="uppercase font-semibold text-indigo-400">
            {activeFile.language}
          </span>
        </div>
      </div>
    </div>
  );
};
