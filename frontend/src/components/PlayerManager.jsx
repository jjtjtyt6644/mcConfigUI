'use client';

import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Shield, UserX, Ban, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function PlayerManager({ isRunning, rconPort = 25575, rconPassword = 'aetheris_secure_rcon' }) {
  const [players, setPlayers] = useState([]);
  const [count, setCount]     = useState(0);
  const [input, setInput]     = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [actioning, setActioning]   = useState(null); // 'op'|'kick'|'ban'

  useEffect(() => {
    if (!isRunning) { setPlayers([]); setCount(0); return; }
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [isRunning]);

  async function load() {
    setRefreshing(true);
    try {
      const { data } = await api.getOnlinePlayers(rconPort, rconPassword);
      if (data.success) { setPlayers(data.players ?? []); setCount(data.count ?? 0); }
    } catch { /* server still booting */ }
    finally { setRefreshing(false); }
  }

  async function act(type, username) {
    if (!username) return;
    setActioning(type);
    try {
      if (type === 'op')   await api.opPlayer(username, rconPort, rconPassword);
      if (type === 'kick') await api.kickPlayer(username, 'Kicked via Aetheris', rconPort, rconPassword);
      if (type === 'ban')  await api.banPlayer(username, 'Banned via Aetheris', rconPort, rconPassword);
      await load();
      setInput('');
    } catch (e) { alert(`Action failed: ${e.message}`); }
    finally { setActioning(null); }
  }

  return (
    <div className="glass animate-slide-up-delay-2 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h3 className="label-xs text-slate-400">
            Player Admin
            <span className="ml-2 text-slate-300 font-bold">{count > 0 ? `${count} online` : ''}</span>
          </h3>
        </div>
        <button
          onClick={load}
          disabled={!isRunning || refreshing}
          className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Online player pills */}
      <div className="min-h-[52px] bg-black/30 border border-white/8 rounded-xl p-3 flex flex-wrap gap-2 items-start">
        {!isRunning ? (
          <span className="text-[11px] text-slate-600 italic">Server offline — no player data.</span>
        ) : players.length === 0 ? (
          <span className="text-[11px] text-slate-600 italic">
            {refreshing ? 'Fetching player list…' : 'No players online.'}
          </span>
        ) : (
          players.map(p => (
            <div
              key={p}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium animate-fade-in group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {p}
              {/* Quick kick on hover */}
              <button
                onClick={() => act('kick', p)}
                className="ml-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all"
                title={`Kick ${p}`}
              >
                <UserX className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Quick-action input */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Username…"
          disabled={!isRunning || !!actioning}
          className="input-base flex-1"
        />
        <div className="flex gap-2">
          {[
            { id: 'op',   label: 'OP',   icon: Shield,  cls: 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25' },
            { id: 'kick', label: 'Kick', icon: UserX,   cls: 'bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25' },
            { id: 'ban',  label: 'Ban',  icon: Ban,     cls: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20' },
          ].map(({ id, label, icon: Icon, cls }) => (
            <button
              key={id}
              onClick={() => act(id, input)}
              disabled={!isRunning || !input.trim() || !!actioning}
              className={`
                flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]
                disabled:opacity-40 disabled:pointer-events-none ${cls}
              `}
            >
              {actioning === id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
