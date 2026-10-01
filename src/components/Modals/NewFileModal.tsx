import React, { useState } from 'react';
import { X, FilePlus } from 'lucide-react';

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (fileName: string, content?: string) => void;
}

export const NewFileModal: React.FC<NewFileModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim()) {
      onCreate(fileName.trim());
      setFileName('');
      onClose();
    }
  };

  const PRESETS = [
    { name: 'app.js', label: 'JavaScript' },
    { name: 'styles.css', label: 'CSS' },
    { name: 'index.html', label: 'HTML' },
    { name: 'script.py', label: 'Python' },
    { name: 'data.json', label: 'JSON' },
    { name: 'README.md', label: 'Markdown' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#10141f] border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2 text-slate-100 font-semibold">
            <FilePlus className="w-4 h-4 text-indigo-400" />
            <span>Create New File</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-400 mb-1">File Name & Extension</label>
            <input
              type="text"
              autoFocus
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. simulation.js, styles.css, model.py"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <span className="block text-slate-500 text-[11px] mb-1.5">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setFileName(p.name)}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px] transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!fileName.trim()}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition disabled:opacity-40"
            >
              Create File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
