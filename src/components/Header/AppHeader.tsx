import React from 'react';
import {
  Code2,
  Download,
  Play,
  Settings,
  Sparkles,
  Terminal,
  Layers,
  CheckCircle2,
  Loader2,
  FolderArchive,
  ExternalLink,
  ShieldCheck,
  Rocket,
} from 'lucide-react';
import { ProjectFile } from '../../types';

interface AppHeaderProps {
  files: ProjectFile[];
  activeFile: ProjectFile | null;
  onExportZip: () => void;
  isExporting: boolean;
  onRunPreview: () => void;
  isAIPanelOpen: boolean;
  setIsAIPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isTerminalOpen: boolean;
  setIsTerminalOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onOpenSettings: () => void;
  selectedTemplate: string;
  onSelectTemplate: (templateKey: string) => void;
  onOpenPopoutPreview: () => void;
  filePermissionsGranted?: boolean;
  onTogglePermissions?: (val: boolean) => void;
  onOpenCreateScratch?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  files,
  activeFile,
  onExportZip,
  isExporting,
  onRunPreview,
  isAIPanelOpen,
  setIsAIPanelOpen,
  isTerminalOpen,
  setIsTerminalOpen,
  onOpenSettings,
  selectedTemplate,
  onSelectTemplate,
  onOpenPopoutPreview,
  filePermissionsGranted,
  onTogglePermissions,
  onOpenCreateScratch,
}) => {
  return (
    <header className="h-12 border-b border-slate-800/80 bg-[#0d1017] px-3 flex items-center justify-between text-xs select-none z-30">
      {/* Left: Branding & Templates */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
            OmniCode <span className="text-indigo-400 font-mono text-xs font-normal">Studio</span>
          </span>
        </div>

        {/* Template Selector dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-md px-2 py-1 text-slate-300">
          <Layers className="w-3 h-3 text-indigo-400" />
          <span className="text-[11px] text-slate-400 hidden sm:inline">Template:</span>
          <select
            value={selectedTemplate}
            onChange={(e) => onSelectTemplate(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs font-medium"
          >
            <option value="nebula" className="bg-[#0f1420] text-slate-200">
              Cosmic Nebula (3D Physics)
            </option>
            <option value="saas" className="bg-[#0f1420] text-slate-200">
              Tailwind SaaS Landing
            </option>
          </select>
        </div>

        {/* Active file indicator */}
        {activeFile && (
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/50 text-slate-400 text-[11px] font-mono border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{activeFile.name}</span>
          </div>
        )}

        {/* AI File Permissions Status Badge */}
        <div
          title="AI Assistant has direct write permissions to automatically fix and update project files"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[11px] font-medium"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>File Permissions: Granted</span>
        </div>
      </div>

      {/* Right: Actions (Run, Export ZIP, Terminal toggle, AI toggle, Settings) */}
      <div className="flex items-center gap-2">
        {/* Build From Scratch button */}
        {onOpenCreateScratch && (
          <button
            onClick={onOpenCreateScratch}
            title="Create an entire website or app from scratch with AI"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Build From Scratch</span>
          </button>
        )}

        {/* Run / Preview button */}
        <button
          onClick={onRunPreview}
          title="Run project & refresh live preview (Ctrl+Enter)"
          className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium transition cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
          <span className="hidden sm:inline">Run Code</span>
        </button>

        {/* Export ZIP Button */}
        <button
          onClick={onExportZip}
          disabled={isExporting}
          title="Download entire project as a clean .zip folder"
          className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-sm shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="hidden xs:inline sm:inline">Export</span>
          <span className="hidden sm:inline">.ZIP</span>
        </button>

        {/* Popout preview */}
        <button
          onClick={onOpenPopoutPreview}
          title="Open preview in new window"
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition hidden sm:flex cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* Terminal toggle (Desktop only, mobile uses bottom bar) */}
        <button
          onClick={() => setIsTerminalOpen((prev) => !prev)}
          className={`hidden md:flex items-center gap-1 px-2 py-1.5 rounded border transition cursor-pointer ${
            isTerminalOpen
              ? 'bg-slate-800 border-slate-700 text-indigo-300'
              : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Toggle Terminal & Console Logs"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Console</span>
        </button>

        {/* AI Workspace toggle (Desktop only, mobile uses bottom bar) */}
        <button
          onClick={() => setIsAIPanelOpen((prev) => !prev)}
          className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded border transition cursor-pointer font-medium ${
            isAIPanelOpen
              ? 'bg-purple-950/60 border-purple-700/60 text-purple-300 shadow-sm shadow-purple-900/30'
              : 'border-slate-800 text-slate-400 hover:text-purple-300 hover:bg-purple-950/20'
          }`}
          title="Toggle Multi-Model AI Assistant Panel"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>AI Panel</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Preferences & API Keys"
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
