import React, { useState } from 'react';
import { Sparkles, X, Rocket, Wand2, Gamepad2, Timer, CheckSquare, Calculator, CloudSun, Briefcase } from 'lucide-react';

interface CreateFromScratchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateApp: (prompt: string) => void;
}

const TEMPLATES = [
  {
    id: 'snake',
    name: 'Neon CyberSnake Game',
    icon: <Gamepad2 className="w-5 h-5 text-pink-400" />,
    description: 'Retro 80s arcade game with Web Audio synth sound effects, high score tracking, and touch D-pad.',
    prompt: 'Create a complete Retro Neon CyberSnake 2D Arcade Game from scratch with score tracking, sound effects, and smooth canvas graphics.',
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro Focus Timer',
    icon: <Timer className="w-5 h-5 text-indigo-400" />,
    description: 'Aesthetic productivity timer with circular SVG progress animation, sound chimes, and session counter.',
    prompt: 'Create a complete Pomodoro Productivity Focus App from scratch with circular countdown animation, audio chimes, and session statistics.',
  },
  {
    id: 'kanban',
    name: 'FlowBoard Kanban App',
    icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
    description: 'Visual task management board with priority tagging, status columns, and localStorage persistence.',
    prompt: 'Create a complete interactive Kanban Task Board application from scratch with columns, task creation, priority badges, and localStorage.',
  },
  {
    id: 'calculator',
    name: 'Glassmorphism Calculator',
    icon: <Calculator className="w-5 h-5 text-amber-400" />,
    description: 'Modern scientific & basic calculator with calculations history tape, memory, and keyboard input.',
    prompt: 'Create a modern glassmorphism Calculator web app from scratch with keyboard support, calculation history, and clean dark UI.',
  },
  {
    id: 'weather',
    name: 'Dynamic Weather Station',
    icon: <CloudSun className="w-5 h-5 text-cyan-400" />,
    description: 'Live interactive weather dashboard with animated weather icons, 5-day forecast, and metric toggle.',
    prompt: 'Create an interactive Weather Station Dashboard app from scratch with animated weather condition graphics, 5-day forecasts, and metric toggles.',
  },
  {
    id: 'portfolio',
    name: 'Developer Portfolio Landing',
    icon: <Briefcase className="w-5 h-5 text-purple-400" />,
    description: 'Sleek portfolio with interactive project showcase cards, skill badges, and contact form.',
    prompt: 'Create a modern, stunning Developer Portfolio website from scratch with interactive project cards, skills section, and responsive design.',
  },
];

export const CreateFromScratchModal: React.FC<CreateFromScratchModalProps> = ({
  isOpen,
  onClose,
  onGenerateApp,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      onGenerateApp(`Create this app from scratch with complete, production-grade code: ${customPrompt.trim()}`);
      onClose();
    }
  };

  const handleSelectTemplate = (prompt: string) => {
    onGenerateApp(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-[#0f131d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#121724]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">Create Site or App From Scratch</h2>
              <p className="text-xs text-slate-400">Describe any idea or choose a preset — AI writes all code & files</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Custom Prompt Box */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-200">
              Custom Prompt (Describe anything to create)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="E.g., Build a cyberpunk synth drum pad machine with audio oscillators, a recipe finder with search and filters, or a personal habit tracker..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
              />
              <button
                type="submit"
                disabled={!customPrompt.trim()}
                className="absolute right-3 bottom-3 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Build From Scratch</span>
              </button>
            </div>
          </form>

          {/* Preset Starters */}
          <div>
            <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Or Instant Starter Blueprints
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectTemplate(item.prompt)}
                  className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/60 transition flex flex-col gap-1.5 text-left group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      {item.icon}
                    </div>
                    <span className="font-semibold text-slate-200 text-xs group-hover:text-indigo-400 transition">
                      {item.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0e121a] flex justify-between items-center text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Direct File Write & Live Preview Activated
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
