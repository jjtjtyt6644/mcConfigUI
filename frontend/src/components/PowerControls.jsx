'use client';

import React from 'react';
import { Play, Square, RotateCcw, Flame, Loader2, AlertTriangle } from 'lucide-react';

const ACTIONS = [
  {
    id: 'start',
    label: 'Start Server',
    icon: Play,
    className: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25',
    disabledWhen: (running) => running,
    iconFill: true,
  },
  {
    id: 'restart',
    label: 'Restart',
    icon: RotateCcw,
    className: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25',
    disabledWhen: (running) => !running,
  },
  {
    id: 'stop',
    label: 'Stop',
    icon: Square,
    className: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20',
    disabledWhen: (running) => !running,
    iconFill: true,
  },
];

export default function PowerControls({ isRunning, loadingAction, onAction }) {
  return (
    <div className="glass animate-slide-up rounded-2xl overflow-hidden">
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Status blurb */}
        <div>
          <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            Power Controls
            {isRunning && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping-slow" />
                Running
              </span>
            )}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Auto-shutdown fires after 5 min of zero players online
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {ACTIONS.map(({ id, label, icon: Icon, className, disabledWhen, iconFill }) => {
            const disabled = disabledWhen(isRunning) || !!loadingAction;
            const spinning = loadingAction === id;
            return (
              <button
                key={id}
                onClick={() => onAction(id)}
                disabled={disabled}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                  transition-all duration-200
                  hover:scale-[1.04] active:scale-[0.97]
                  disabled:opacity-40 disabled:pointer-events-none
                  ${className}
                `}
              >
                {spinning
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Icon className="w-4 h-4" fill={iconFill && !spinning ? 'currentColor' : 'none'} />
                }
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}

          {/* Separator */}
          <div className="w-px h-8 bg-white/10" />

          {/* Emergency Kill */}
          <button
            onClick={() => onAction('kill')}
            disabled={!isRunning || !!loadingAction}
            title="Emergency Force Kill — does NOT save world data"
            className="
              flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
              bg-rose-500/10 border border-rose-500/25 text-rose-400
              hover:bg-rose-500/20 hover:border-rose-500/40
              transition-all duration-200
              hover:scale-[1.04] active:scale-[0.97]
              disabled:opacity-30 disabled:pointer-events-none
            "
          >
            {loadingAction === 'kill'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Flame className="w-4 h-4" />
            }
            <span className="hidden sm:inline">Force Kill</span>
          </button>
        </div>
      </div>

      {/* Warning strip when running */}
      {!isRunning && !loadingAction && (
        <div className="border-t border-white/5 px-5 py-2 flex items-center gap-2 bg-slate-900/40">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[11px] text-slate-600">Server is stopped. Install a version and click Start to boot.</span>
        </div>
      )}
    </div>
  );
}
