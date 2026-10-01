import React from 'react';
import { X, Plus, FileCode, Circle } from 'lucide-react';
import { ProjectFile } from '../../types';

interface EditorTabsProps {
  openFiles: ProjectFile[];
  activeFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  onCloseFile: (fileId: string) => void;
  onNewFileClick: () => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  openFiles,
  activeFile,
  onSelectFile,
  onCloseFile,
  onNewFileClick,
}) => {
  return (
    <div className="h-9 bg-[#0b0e14] border-b border-slate-800/80 flex items-center px-1 select-none overflow-x-auto">
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {openFiles.map((file) => {
          const isActive = activeFile?.id === file.id;
          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-t text-xs font-mono cursor-pointer border-t-2 transition ${
                isActive
                  ? 'bg-[#10141f] border-indigo-500 text-slate-100 font-medium'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-850/50 hover:text-slate-200'
              }`}
            >
              <span className="truncate max-w-[140px]">{file.name}</span>

              {/* Close Tab / Modified Dot */}
              <div className="flex items-center">
                {file.isModified && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 group-hover:hidden mr-0.5"></span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.id);
                  }}
                  className={`p-0.5 rounded hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 ${
                    file.isModified ? 'hidden group-hover:block' : ''
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add new file button */}
      <button
        onClick={onNewFileClick}
        title="Create New File"
        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition ml-1"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
