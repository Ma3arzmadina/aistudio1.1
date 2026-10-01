import React, { useState } from 'react';
import { Search, Replace, ArrowRight } from 'lucide-react';
import { ProjectFile } from '../../types';

interface SearchPanelProps {
  files: ProjectFile[];
  onSelectFile: (file: ProjectFile) => void;
  onUpdateFileContent: (fileId: string, content: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  files,
  onSelectFile,
  onUpdateFileContent,
}) => {
  const [query, setQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  interface SearchResult {
    file: ProjectFile;
    lineNum: number;
    lineText: string;
    index: number;
  }

  const results: SearchResult[] = [];
  if (query.trim()) {
    const qLower = query.toLowerCase();
    files.forEach((file) => {
      const lines = file.content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(qLower)) {
          results.push({
            file,
            lineNum: idx + 1,
            lineText: line.trim(),
            index: line.toLowerCase().indexOf(qLower),
          });
        }
      });
    });
  }

  const handleReplaceAll = () => {
    if (!query) return;
    files.forEach((file) => {
      if (file.content.includes(query)) {
        const updated = file.content.split(query).join(replaceQuery);
        onUpdateFileContent(file.id, updated);
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0e121a] select-none text-xs">
      <div className="p-3 border-b border-slate-800/80">
        <span className="font-semibold text-slate-300 tracking-wider text-[11px] uppercase">
          Search
        </span>
      </div>

      <div className="p-3 space-y-2 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in all files..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowReplace((prev) => !prev)}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            <Replace className="w-3 h-3" />
            <span>{showReplace ? 'Hide Replace' : 'Show Replace'}</span>
          </button>
        </div>

        {showReplace && (
          <div className="space-y-1.5 pt-1">
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace with..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
            />
            <button
              onClick={handleReplaceAll}
              disabled={!query}
              className="w-full py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-medium disabled:opacity-40"
            >
              Replace All in Workspace
            </button>
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {query && results.length === 0 && (
          <p className="text-center text-slate-500 py-6">No matching results found.</p>
        )}

        {results.map((res, i) => (
          <div
            key={i}
            onClick={() => onSelectFile(res.file)}
            className="p-2 rounded bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-[11px] text-indigo-400 font-mono mb-1">
              <span>{res.file.name}</span>
              <span className="text-slate-500">line {res.lineNum}</span>
            </div>
            <p className="font-mono text-slate-300 truncate text-[11px]">
              {res.lineText}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
