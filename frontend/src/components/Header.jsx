'use client';

import React from 'react';
import { Zap, Activity, HardDrive, Clock, Cpu, Server } from 'lucide-react';

function RamBar({ used, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  const color =
    pct > 85 ? 'from-rose-500 to-rose-400' :
    pct > 60 ? 'from-amber-500 to-amber-400' :
               'from-cyan-500 to-cyan-400';

  return (
    <div className="flex flex-col gap-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="label-xs">Oracle ARM RAM</span>
        <span className="text-[11px] font-semibold text-slate-300">
          {(used / 1024).toFixed(1)} / {(max / 1024).toFixed(0)} GB
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} animate-bar-fill transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[10px] text-slate-600">{pct}% allocated</div>
    </div>
  );
}

export default function Header({ hostMetrics = {}, serverStatus = {} }) {
  const { allocatedRamMb = 0, maxRamMb = 20480, activeServersCount = 0, queueLength = 0 } = hostMetrics;
  const isOnline = serverStatus?.running;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5">
      {/* Blur bg */}
      <div className="absolute inset-0 bg-base/80 backdrop-blur-xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ─── */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-glow">
              <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="leading-none">
            <span className="text-gradient-cyan font-extrabold text-lg tracking-tight block">Aetheris</span>
            <span className="text-[10px] text-slate-500 font-medium">Minecraft Cloud Engine</span>
          </div>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            ARM64 Bare Metal
          </span>
        </div>

        {/* ── Centre Metrics ─── */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Active Servers */}
          <div className="flex items-center gap-2 text-slate-400">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs">Active:</span>
            <span className="text-xs font-bold text-white">{activeServersCount}</span>
          </div>

          {/* CPU threads visual */}
          <div className="flex items-center gap-2 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs">4 OCPUs</span>
          </div>

          {/* Queue badge */}
          {queueLength > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 animate-fade-in">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] font-semibold text-amber-400">{queueLength} in queue</span>
            </div>
          )}

          {/* RAM bar */}
          <RamBar used={allocatedRamMb} max={maxRamMb} />
        </div>

        {/* ── Server Status Pill ─── */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-500 ${
          isOnline
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            : 'bg-slate-800/60 border-slate-700 text-slate-500'
        }`}>
          <span className="relative flex h-2 w-2">
            {isOnline && (
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          </span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
}
