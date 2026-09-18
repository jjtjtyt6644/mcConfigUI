'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Save, Check, Loader2, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';

/* Animated Toggle Switch */
function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={onChange}
      className={`toggle-track ${value ? 'on' : 'off'}`}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

const TOGGLE_FIELDS = [
  { key: 'pvp',                  label: 'PVP',           desc: 'Player vs Player combat' },
  { key: 'enable-command-block', label: 'Command Blocks', desc: 'Allow command block usage' },
  { key: 'allow-flight',         label: 'Allow Flight',  desc: 'Permit flying in survival' },
  { key: 'white-list',           label: 'Whitelist',     desc: 'Only whitelisted players' },
  { key: 'online-mode',          label: 'Online Mode',   desc: 'Mojang authentication' },
];

export default function Configurator({ serverId = 'default' }) {
  const DEFAULT_CONFIG = {
    gamemode: 'survival', difficulty: 'easy',
    pvp: true, 'enable-command-block': true,
    'allow-flight': false, 'spawn-protection': 16,
    'max-players': 10, 'white-list': false, 'online-mode': true,
    motd: 'A Minecraft Server on Aetheris Cloud',
  };

  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    api.getConfig(serverId)
      .then(({ data }) => {
        if (data.success) setCfg(prev => ({ ...prev, ...data.properties }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [serverId]);

  const set = (key, val) => setCfg(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    setSaving(true); setSaved(false);
    try {
      await api.updateConfig(serverId, cfg);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert(`Save failed: ${e.message}`); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="glass rounded-2xl p-5">
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 rounded-lg animate-shimmer" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="glass animate-slide-up-delay-3 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="label-xs text-slate-400">server.properties</h3>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
            transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]
            disabled:opacity-50
            ${saved ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/15 text-slate-200'}
          `}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {/* MOTD */}
      <div className="space-y-1">
        <label className="label-xs">Server MOTD</label>
        <input
          type="text"
          value={cfg.motd}
          onChange={e => set('motd', e.target.value)}
          className="input-base"
          placeholder="Your server's message of the day…"
        />
      </div>

      {/* Gamemode + Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'gamemode',   label: 'Game Mode',  opts: ['survival','creative','adventure','spectator'] },
          { key: 'difficulty', label: 'Difficulty',  opts: ['peaceful','easy','normal','hard'] },
        ].map(({ key, label, opts }) => (
          <div key={key} className="space-y-1">
            <label className="label-xs">{label}</label>
            <div className="relative">
              <select
                value={cfg[key]}
                onChange={e => set(key, e.target.value)}
                className="input-base pr-8 appearance-none capitalize cursor-pointer"
              >
                {opts.map(o => <option key={o} value={o} className="capitalize">{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Max Players Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="label-xs">Max Players</label>
          <span className="text-xs font-bold text-cyan-400">{cfg['max-players']}</span>
        </div>
        <input
          type="range" min={1} max={50}
          value={cfg['max-players']}
          onChange={e => set('max-players', +e.target.value)}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-[10px] text-slate-700">
          <span>1</span><span>25</span><span>50</span>
        </div>
      </div>

      {/* Boolean Toggles */}
      <div className="space-y-2.5">
        <label className="label-xs">Feature Flags</label>
        {TOGGLE_FIELDS.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8 hover:border-white/12 transition-colors"
          >
            <div>
              <p className="text-xs font-semibold text-slate-200">{label}</p>
              <p className="text-[10px] text-slate-600">{desc}</p>
            </div>
            <Toggle value={!!cfg[key]} onChange={() => set(key, !cfg[key])} />
          </div>
        ))}
      </div>
    </div>
  );
}
