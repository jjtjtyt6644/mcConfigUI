'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Send, Trash2, ChevronRight, Wifi, WifiOff } from 'lucide-react';

// Colorise common Minecraft log prefixes
function colorLine(text) {
  if (!text) return null;
  if (/\[INFO\]|\[Server\]/.test(text)) return 'text-slate-300';
  if (/\[WARN\]/.test(text))  return 'text-amber-400';
  if (/\[ERROR\]/.test(text)) return 'text-rose-400';
  if (/joined the game|left the game/.test(text)) return 'text-emerald-400';
  if (/Done/.test(text))      return 'text-cyan-400 font-semibold';
  return 'text-slate-400';
}

export default function WebTerminal({ serverId = 'default', isRunning }) {
  const [logs, setLogs] = useState([
    { ts: '', text: '  ___       __  __                  _     ', cls: 'text-cyan-500/70' },
    { ts: '', text: ' / _ \\  ___/ /_/ /_  ___ ____  ___ (_)__ ', cls: 'text-cyan-500/70' },
    { ts: '', text: '/ __ / / __/ __/ __ \\/ -_) __/ (_-</ (_-<', cls: 'text-cyan-500/70' },
    { ts: '', text: '/_/ |_|/___/\\__/_/ /_/\\__/_/    /___/_/___/', cls: 'text-cyan-500/70' },
    { ts: '', text: 'Aetheris Engine — waiting for server stream...', cls: 'text-slate-600 italic mt-2' },
  ]);
  const [cmd, setCmd] = useState('');
  const [connected, setConnected] = useState(false);
  const logsEnd = useRef(null);
  const wsRef   = useRef(null);
  const cmdRef  = useRef(null);

  const push = useCallback((text, cls) => {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [...prev.slice(-500), { ts, text, cls }]);
  }, []);

  useEffect(() => {
    const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    const ws = new WebSocket(`${WS_BASE}/ws/terminal?serverId=${serverId}`);
    wsRef.current = ws;

    ws.onopen  = () => { setConnected(true);  push('[Aetheris] Stream connected.', 'text-cyan-400'); };
    ws.onclose = () => { setConnected(false); push('[Aetheris] Stream disconnected.', 'text-slate-600'); };
    ws.onerror = () => push('[Aetheris] WebSocket error — is the backend running?', 'text-rose-400');

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        const raw = (msg.data || '').replace(/\x1b\[[0-9;]*m/g, ''); // strip ANSI
        raw.split('\n').filter(Boolean).forEach(line => push(line, colorLine(line)));
      } catch { push(e.data, 'text-slate-300'); }
    };

    return () => ws.close();
  }, [serverId, push]);

  useEffect(() => {
    logsEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const sendCmd = (e) => {
    e.preventDefault();
    if (!cmd.trim() || !wsRef.current) return;
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stdin', command: cmd.trim() }));
      push(`> ${cmd}`, 'text-cyan-300 font-medium');
    }
    setCmd('');
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="glass glass-glow animate-slide-up-delay-1 rounded-2xl flex flex-col" style={{ height: 500 }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* macOS-style dots */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <Terminal className="w-4 h-4 text-cyan-400 ml-1" />
          <span className="label-xs">Live Console</span>

          {/* Connection indicator */}
          <div className={`flex items-center gap-1 text-[10px] font-medium ${connected ? 'text-emerald-400' : 'text-slate-600'}`}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <button
          onClick={clearLogs}
          className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-300 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      {/* Log output area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-px bg-black/20">
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-2 whitespace-pre-wrap break-all ${log.cls || 'text-slate-400'}`}>
            {log.ts && <span className="text-slate-700 shrink-0 select-none">{log.ts}</span>}
            <span>{log.text}</span>
          </div>
        ))}
        <div ref={logsEnd} />
      </div>

      {/* Command input */}
      <form
        onSubmit={sendCmd}
        className="flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-black/30 shrink-0"
      >
        <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0" />
        <input
          ref={cmdRef}
          type="text"
          value={cmd}
          onChange={e => setCmd(e.target.value)}
          disabled={!isRunning}
          placeholder={isRunning ? 'Type a server command…  (e.g. op Steve, time set day)' : 'Server offline'}
          className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-700 focus:outline-none disabled:opacity-40"
        />
        {/* Blinking cursor */}
        {isRunning && cmd === '' && <span className="w-[2px] h-4 bg-cyan-500 animate-blink" />}
        <button
          type="submit"
          disabled={!isRunning || !cmd.trim()}
          className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
