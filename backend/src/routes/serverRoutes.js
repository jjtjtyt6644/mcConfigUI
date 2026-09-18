const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');
const lifecycleService = require('../services/lifecycleService');

// Get server status
router.get('/:id/status', async (req, res) => {
  try {
    const status = await dockerService.getServerStatus(req.params.id);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Provision container
router.post('/provision', async (req, res) => {
  try {
    const { serverId, serverPort, rconPort, ramMb } = req.body;
    const container = await dockerService.createServerContainer({
      serverId,
      serverPort,
      rconPort,
      ramMb
    });
    res.json({ success: true, containerId: container.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server (with automated queue check)
router.post('/:id/start', async (req, res) => {
  try {
    const serverId = req.params.id;
    const { ramMb, rconPort, rconPassword } = req.body;
    const result = await lifecycleService.requestStart(serverId, { ramMb, rconPort, rconPassword });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stop server
router.post('/:id/stop', async (req, res) => {
  try {
    const result = await dockerService.stopServer(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Restart server
router.post('/:id/restart', async (req, res) => {
  try {
    const result = await dockerService.restartServer(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Force Kill
router.post('/:id/kill', async (req, res) => {
  try {
    const result = await dockerService.killServer(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Host and Queue Metrics (Oracle ARM Resource Gauge)
router.get('/metrics/host', (req, res) => {
  res.json({ success: true, metrics: lifecycleService.getMetrics() });
});

module.exports = router;
