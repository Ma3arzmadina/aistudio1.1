import React, { useState, useRef } from 'react';
import {
  FilePlus,
  FolderPlus,
  Upload,
  Download,
  Trash2,
  Edit2,
  FileCode,
  FileText,
  FileJson,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { ProjectFile } from '../../types';
import { getLanguageFromFilename } from '../../utils/fileTemplates';
import { ProjectStatsDashboardCard } from './ProjectStatsDashboardCard';

interface FileExplorerProps {
  files: ProjectFile[];
  activeFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  onCreateFile: (name: string, content?: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onUploadFiles: (uploadedFiles: FileList) => void;
  onExportZip: () => void;
  isExporting: boolean;
  lastModifiedTimestamp?: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onUploadFiles,
  onExportZip,
  isExporting,
  lastModifiedTimestamp,
}) => {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreatingFile(false);
    }
  };

  const handleRenameSubmit = (fileId: string) => {
    if (renameValue.trim()) {
      onRenameFile(fileId, renameValue.trim());
    }
    setRenamingFileId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
        return <span className="text-orange-400 font-bold text-xs">H5</span>;
      case 'css':
        return <span className="text-sky-400 font-bold text-xs">#</span>;
      case 'js':
      case 'mjs':
        return <span className="text-yellow-400 font-bold text-xs">JS</span>;
      case 'ts':
      case 'tsx':
        return <span className="text-blue-400 font-bold text-xs">TS</span>;
      case 'py':
        return <span className="text-emerald-400 font-bold text-xs">PY</span>;
      case 'json':
        return <FileJson className="w-3.5 h-3.5 text-amber-400" />;
      case 'md':
        return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      className={`h-full flex flex-col bg-[#0e121a] select-none text-xs ${
        isDraggingOver ? 'ring-2 ring-indigo-500 bg-indigo-950/20' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && onUploadFiles(e.target.files)}
        multiple
        className="hidden"
      />
      <input
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        ref={folderInputRef}
        onChange={(e) => e.target.files && onUploadFiles(e.target.files)}
        multiple
        className="hidden"
      />

      {/* Explorer Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        <span className="font-semibold text-slate-300 tracking-wider text-[11px] uppercase">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          {/* New file button */}
          <button
            onClick={() => setIsCreatingFile(true)}
            title="New File"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          {/* Upload files */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload Files"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          {/* Upload folder */}
          <button
            onClick={() => folderInputRef.current?.click()}
            title="Upload Folder"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dashboard Summary Card */}
      <div className="pt-2">
        <ProjectStatsDashboardCard
          files={files}
          activeFile={activeFile}
          lastModifiedTimestamp={lastModifiedTimestamp}
          isCollapsed={isDashboardCollapsed}
          onToggleCollapse={() => setIsDashboardCollapsed(!isDashboardCollapsed)}
        />
      </div>

      {/* Project Root Label */}
      <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/40 text-slate-400 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1 font-medium">
          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>PROJECT ROOT ({files.length})</span>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Inline file creation row */}
        {isCreatingFile && (
          <form onSubmit={handleCreateSubmit} className="px-3 py-1 flex items-center gap-1.5">
            <span className="text-indigo-400">📄</span>
            <input
              type="text"
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. app.js, style.css, script.py"
              onBlur={() => {
                if (!newFileName.trim()) setIsCreatingFile(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsCreatingFile(false);
              }}
              className="flex-1 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-slate-200 outline-none text-xs font-mono"
            />
          </form>
        )}

        {files.map((file) => {
          const isActive = activeFile?.id === file.id;
          const isRenaming = renamingFileId === file.id;

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file)}
              className={`group flex items-center justify-between px-3 py-1.5 cursor-pointer transition border-l-2 ${
                isActive
                  ? 'bg-indigo-950/40 border-indigo-500 text-slate-100 font-medium'
                  : 'border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-4 flex items-center justify-center">
                  {getFileIcon(file.name)}
                </div>

                {isRenaming ? (
                  <input
                    type="text"
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(file.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(file.id);
                      if (e.key === 'Escape') setRenamingFileId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-950 border border-indigo-500 rounded px-1 text-slate-100 outline-none text-xs font-mono w-full"
                  />
                ) : (
                  <span className="truncate font-mono text-[12px]">{file.name}</span>
                )}
              </div>

              {/* Hover actions (Rename, Delete) */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingFileId(file.id);
                    setRenameValue(file.name);
                  }}
                  title="Rename"
                  className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-slate-200"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${file.name}"?`)) {
                        onDeleteFile(file.id);
                      }
                    }}
                    title="Delete File"
                    className="p-1 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {files.length === 0 && (
          <div className="p-4 text-center text-slate-500">
            <p>No files in project.</p>
            <button
              onClick={() => onCreateFile('index.html', '<!DOCTYPE html><html><body><h1>Hello</h1></body></html>')}
              className="mt-2 text-indigo-400 hover:underline"
            >
              + Create index.html
            </button>
          </div>
        )}
      </div>

      {/* Drag & Drop Notice */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-center">
        <p className="text-[11px] text-slate-500 mb-2">
          Drop files or folders here to import
        </p>
        <button
          onClick={onExportZip}
          disabled={isExporting}
          className="w-full py-1.5 px-2 rounded bg-slate-800/80 hover:bg-slate-850 hover:text-indigo-300 text-slate-300 border border-slate-700/60 flex items-center justify-center gap-1.5 transition text-[11px] font-medium"
        >
          <Download className="w-3 h-3 text-indigo-400" />
          <span>Download Project .ZIP</span>
        </button>
      </div>
    </div>
  );
};
