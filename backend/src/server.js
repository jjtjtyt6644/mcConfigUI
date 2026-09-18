const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const config = require('./config');

const serverRoutes = require('./routes/serverRoutes');
const configRoutes = require('./routes/configRoutes');
const versionRoutes = require('./routes/versionRoutes');
const playerRoutes = require('./routes/playerRoutes');
const lifecycleService = require('./services/lifecycleService');
const { setupTerminalSocket } = require('./sockets/terminalSocket');

const app = express();
const server = http.createServer(app);

// Setup WebSocket Server for Live Terminal
const wss = new WebSocketServer({ server, path: '/ws/terminal' });
setupTerminalSocket(wss);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl) or matching allowed origins
    if (!origin || config.ALLOWED_ORIGINS.includes('*') || config.ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly permissive CORS
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/servers', serverRoutes);
app.use('/api/config', configRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/players', playerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Aetheris Engine',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Start Oracle ARM Inactivity & Queue background worker
lifecycleService.startWorker();

server.listen(config.PORT, () => {
  console.log(`\n======================================================`);
  console.log(`⚡ Aetheris Backend API & Game Engine Daemon`);
  console.log(`📡 Listening on port: ${config.PORT}`);
  console.log(`🖥️ WebSocket Terminal ready at: ws://localhost:${config.PORT}/ws/terminal`);
  console.log(`🚀 Host Max Allocated RAM: ${config.HOST_MAX_ALLOCATED_RAM_MB} MB`);
  console.log(`======================================================\n`);
});
