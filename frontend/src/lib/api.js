import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
});

export const api = {
  // Server controls
  getServerStatus: (id) => client.get(`/servers/${id}/status`),
  startServer: (id, options) => client.post(`/servers/${id}/start`, options),
  stopServer: (id) => client.post(`/servers/${id}/stop`),
  restartServer: (id) => client.post(`/servers/${id}/restart`),
  killServer: (id) => client.post(`/servers/${id}/kill`),
  getHostMetrics: () => client.get('/servers/metrics/host'),

  // Configurator
  getConfig: (id) => client.get(`/config/${id}`),
  updateConfig: (id, properties) => client.put(`/config/${id}`, { properties }),

  // Versions
  getSupportedSoftware: () => client.get('/versions/software'),
  getVersions: (software) => client.get(`/versions/versions/${software}`),
  installVersion: (serverId, software, version) => client.post('/versions/install', { serverId, software, version }),

  // Players & RCON
  getOnlinePlayers: (rconPort, rconPassword) => client.get('/players/online', { params: { rconPort, rconPassword } }),
  opPlayer: (username, rconPort, rconPassword) => client.post('/players/op', { username, rconPort, rconPassword }),
  deopPlayer: (username, rconPort, rconPassword) => client.post('/players/deop', { username, rconPort, rconPassword }),
  kickPlayer: (username, reason, rconPort, rconPassword) => client.post('/players/kick', { username, reason, rconPort, rconPassword }),
  banPlayer: (username, reason, rconPort, rconPassword) => client.post('/players/ban', { username, reason, rconPort, rconPassword }),
  sendCommand: (command, rconPort, rconPassword) => client.post('/players/command', { command, rconPort, rconPassword })
};
