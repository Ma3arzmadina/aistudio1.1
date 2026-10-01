import React from 'react';

interface MobileCodeAccessoryBarProps {
  onInsertSymbol: (symbol: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const MobileCodeAccessoryBar: React.FC<MobileCodeAccessoryBarProps> = ({
  onInsertSymbol,
  onUndo,
  onRedo,
}) => {
  const SYMBOLS = [
    '{', '}', '(', ')', '[', ']',
    '<', '>', '=', ';', ':', '"',
    "'", '`', '/', '\\', '$', '!',
    '?', '+', '-', '*', '.', 'TAB'
  ];

  const handleSymbolClick = (sym: string) => {
    if (sym === 'TAB') {
      onInsertSymbol('  ');
    } else {
      onInsertSymbol(sym);
    }
  };

  return (
    <div className="md:hidden h-9 bg-[#0e121a] border-t border-slate-800/80 px-2 flex items-center overflow-x-auto gap-1 select-none z-30 shrink-0">
      {onUndo && (
        <button
          onClick={onUndo}
          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono shrink-0 hover:bg-slate-800"
        >
          ↶
        </button>
      )}
      {onRedo && (
        <button
          onClick={onRedo}
          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono shrink-0 hover:bg-slate-800"
        >
          ↷
        </button>
      )}

      {SYMBOLS.map((sym, idx) => (
        <button
          key={idx}
          onClick={() => handleSymbolClick(sym)}
          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono shrink-0 active:bg-indigo-600 active:text-white transition"
        >
          {sym}
        </button>
      ))}
    </div>
  );
};
