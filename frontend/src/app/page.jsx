'use client';

import React, { useState, useEffect } from 'react';
import Header      from '../components/Header';
import PowerControls from '../components/PowerControls';
import WebTerminal from '../components/WebTerminal';
import VersionSelector from '../components/VersionSelector';
import Configurator from '../components/Configurator';
import PlayerManager from '../components/PlayerManager';
import QueueModal  from '../components/QueueModal';
import { api } from '../lib/api';

const SERVER_ID = 'default';

export default function Dashboard() {
  const [serverStatus, setServerStatus]   = useState({ running: false, status: 'offline' });
  const [hostMetrics,  setHostMetrics]    = useState({ allocatedRamMb: 0, maxRamMb: 20480, activeServersCount: 0, queueLength: 0 });
  const [loadingAction, setLoadingAction] = useState(null);
  const [queued, setQueued] = useState(false);

  // Poll status & host metrics every 5s
  useEffect(() => {
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  async function tick() {
    try {
      const [statusRes, metricsRes] = await Promise.allSettled([
        api.getServerStatus(SERVER_ID),
        api.getHostMetrics(),
      ]);
      if (statusRes.status  === 'fulfilled') setServerStatus(statusRes.value.data.status  ?? {});
      if (metricsRes.status === 'fulfilled') setHostMetrics(metricsRes.value.data.metrics ?? {});
    } catch { /* backend offline */ }
  }

  async function handleAction(action) {
    setLoadingAction(action);
    try {
      if (action === 'start') {
        const { data } = await api.startServer(SERVER_ID, { ramMb: 2048 });
        if (data.queued) setQueued(true);
      }
      else if (action === 'stop')    await api.stopServer(SERVER_ID);
      else if (action === 'restart') await api.restartServer(SERVER_ID);
      else if (action === 'kill')    await api.killServer(SERVER_ID);
      await tick();
    } catch (e) {
      alert(`Action "${action}" failed: ${e?.response?.data?.error || e.message}`);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navigation ── */}
      <Header hostMetrics={hostMetrics} serverStatus={serverStatus} />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Power strip */}
        <PowerControls
          isRunning={serverStatus?.running}
          loadingAction={loadingAction}
          onAction={handleAction}
        />

        {/* Two-column dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Console + Player Manager */}
          <div className="lg:col-span-7 space-y-5">
            <WebTerminal serverId={SERVER_ID} isRunning={serverStatus?.running} />
            <PlayerManager isRunning={serverStatus?.running} />
          </div>

          {/* Right: Version + Config */}
          <div className="lg:col-span-5 space-y-5">
            <VersionSelector serverId={SERVER_ID} isRunning={serverStatus?.running} />
            <Configurator serverId={SERVER_ID} />
          </div>
        </div>
      </main>

      {/* Queue modal (Host RAM gate) */}
      <QueueModal isOpen={queued} onDismiss={() => setQueued(false)} />
    </div>
  );
}
