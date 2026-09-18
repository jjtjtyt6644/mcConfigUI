'use client';

import React from 'react';
import { Hourglass, X } from 'lucide-react';

export default function QueueModal({ isOpen, onDismiss }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onDismiss} />

      {/* Card */}
      <div className="relative glass-glow rounded-2xl max-w-sm w-full p-6 text-center space-y-5 animate-slide-up shadow-2xl shadow-cyan-500/10">
        {/* Close */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center animate-glow">
          <Hourglass className="w-7 h-7 text-cyan-400 animate-float" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Host Capacity Reached</h3>
          <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
            The Oracle ARM VM is currently at maximum active RAM allocation (20&nbsp;GB). Your server has been added to the waiting queue.
          </p>
        </div>

        {/* Status row */}
        <div className="bg-black/40 border border-white/8 rounded-xl p-4 space-y-1">
          <p className="label-xs text-slate-600">Queue Status</p>
          <p className="text-sm font-semibold text-cyan-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping-slow" />
            Waiting for an idle server to stop…
          </p>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed">
          Servers automatically stop after 5 minutes with zero players online to ensure fair resource sharing across all users.
        </p>
      </div>
    </div>
  );
}
