'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Download, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';

const SOFTWARE = [
  { id: 'paper',   name: 'PaperMC',  tag: 'Fast & Optimised',     color: 'from-cyan-600 to-cyan-500',    ring: 'border-cyan-500/40' },
  { id: 'purpur',  name: 'Purpur',   tag: 'Max Customisation',    color: 'from-purple-600 to-purple-500', ring: 'border-purple-500/40' },
  { id: 'fabric',  name: 'Fabric',   tag: 'Lightweight Mods',     color: 'from-amber-600 to-amber-500',   ring: 'border-amber-500/40' },
  { id: 'vanilla', name: 'Vanilla',  tag: 'Official Mojang',      color: 'from-emerald-600 to-emerald-500', ring: 'border-emerald-500/40' },
];

export default function VersionSelector({ serverId = 'default', isRunning, onInstalled }) {
  const [selected, setSelected] = useState('paper');
  const [versions, setVersions] = useState([]);
  const [version, setVersion]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [installing, setInstalling] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { fetchVersions(selected); }, [selected]);

  async function fetchVersions(sw) {
    setLoading(true);
    setVersions([]);
    try {
      const { data } = await api.getVersions(sw);
      if (data.success) {
        setVersions(data.versions);
        setVersion(data.versions[0] ?? '');
      }
    } catch { /* network error */ }
    finally { setLoading(false); }
  }

  async function handleInstall() {
    if (!version) return;
    setInstalling(true); setDone(false);
    try {
      await api.installVersion(serverId, selected, version);
      setDone(true);
      onInstalled?.(selected, version);
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      alert(`Install failed: ${err?.response?.data?.error || err.message}`);
    } finally { setInstalling(false); }
  }

  const disabled = isRunning || installing || loading;

  return (
    <div className="glass animate-slide-up-delay-2 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-cyan-400" />
        <h3 className="label-xs text-slate-400 tracking-wider">Software & Version</h3>
      </div>

      {/* Software cards */}
      <div className="grid grid-cols-2 gap-2">
        {SOFTWARE.map(({ id, name, tag, color, ring }) => {
          const active = selected === id;
          return (
            <button
              key={id}
              onClick={() => setSelected(id)}
              disabled={disabled}
              className={`
                relative p-3 rounded-xl border text-left
                transition-all duration-200
                hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50
                ${active
                  ? `bg-gradient-to-br ${color} bg-opacity-10 border-white/20 shadow-lg`
                  : 'bg-white/5 border-white/8 hover:border-white/15'
                }
              `}
            >
              {active && (
                <div className={`absolute inset-0 rounded-xl border ${ring} pointer-events-none`} />
              )}
              <p className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-300'}`}>{name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{tag}</p>
              {active && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white animate-ping-slow" />
              )}
            </button>
          );
        })}
      </div>

      {/* Version picker + install */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={version}
            onChange={e => setVersion(e.target.value)}
            disabled={disabled || versions.length === 0}
            className="input-base pr-8 appearance-none cursor-pointer"
          >
            {loading
              ? <option>Fetching versions…</option>
              : versions.map(v => <option key={v} value={v}>Minecraft {v}</option>)
            }
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        </div>

        <button
          onClick={handleInstall}
          disabled={disabled || !version}
          className={`
            flex items-center gap-2 px-4 rounded-xl text-xs font-semibold
            transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]
            disabled:opacity-40 disabled:pointer-events-none
            ${done ? 'bg-emerald-600 shadow-lg shadow-emerald-600/25 text-white'
                   : 'bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-600/25 text-white'}
          `}
        >
          {installing
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : done
              ? <CheckCircle className="w-3.5 h-3.5" />
              : <Download className="w-3.5 h-3.5" />
          }
          <span className="hidden sm:inline">{installing ? 'Downloading…' : done ? 'Installed!' : 'Install'}</span>
        </button>
      </div>

      {isRunning && (
        <p className="text-[11px] text-amber-500/70 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping-slow" />
          Stop server first to switch version.
        </p>
      )}
    </div>
  );
}
