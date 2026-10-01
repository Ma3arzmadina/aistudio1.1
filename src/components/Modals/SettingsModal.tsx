import React, { useState } from 'react';
import { X, Key, Sliders, Check, ShieldCheck, Cpu } from 'lucide-react';
import { UserSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  hasServerGeminiKey: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  hasServerGeminiKey,
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [activeTab, setActiveTab] = useState<'keys' | 'editor'>('keys');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#10141f] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 bg-[#0d1017] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Workspace Settings & API Keys
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'keys'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Model Keys & Engine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'editor'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Editor Preferences
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 space-y-4 text-xs">
          {activeTab === 'keys' && (
            <div className="space-y-4">
              {/* Server Key Status */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-slate-300">
                  <span className="font-semibold text-emerald-300">Server Gemini Integration:</span>{' '}
                  {hasServerGeminiKey ? (
                    <span className="text-emerald-400">Active & Ready via Cloud Environment</span>
                  ) : (
                    <span>Ready with Smart Fallback Engine</span>
                  )}
                  <p className="text-slate-400 mt-0.5">
                    You can optionally provide personal API keys below to unlock unlimited direct calls.
                  </p>
                </div>
              </div>

              {/* Gemini Key */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Custom Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  value={formData.geminiApiKey}
                  onChange={(e) =>
                    setFormData({ ...formData, geminiApiKey: e.target.value })
                  }
                  placeholder="AIzaSy... (Leave empty to use server default)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              {/* OpenAI Key */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Custom OpenAI Key for ChatGPT/Codex (Optional)
                </label>
                <input
                  type="password"
                  value={formData.openAiApiKey}
                  onChange={(e) =>
                    setFormData({ ...formData, openAiApiKey: e.target.value })
                  }
                  placeholder="sk-... (Leave empty to use specialized smart engine)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Font Size ({formData.fontSize}px)
                </label>
                <input
                  type="range"
                  min="11"
                  max="18"
                  value={formData.fontSize}
                  onChange={(e) =>
                    setFormData({ ...formData, fontSize: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tab Indentation Size
                </label>
                <select
                  value={formData.tabSize}
                  onChange={(e) =>
                    setFormData({ ...formData, tabSize: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                >
                  <option value={2}>2 Spaces (Recommended)</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-300">Live Auto-Preview Reload</span>
                <input
                  type="checkbox"
                  checked={formData.autoPreview}
                  onChange={(e) =>
                    setFormData({ ...formData, autoPreview: e.target.checked })
                  }
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/30"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
