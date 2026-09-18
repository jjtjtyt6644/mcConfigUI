const express = require('express');
const router = express.Router();
const rconService = require('../services/rconService');
const config = require('../config');

// Helper to extract port & pass
const getRconCredentials = (req) => {
  return {
    port: parseInt(req.query.rconPort || req.body.rconPort || config.DEFAULT_RCON_PORT, 10),
    password: req.query.rconPassword || req.body.rconPassword || config.DEFAULT_RCON_PASSWORD
  };
};

// Get online players
router.get('/online', async (req, res) => {
  try {
    const { port, password } = getRconCredentials(req);
    const result = await rconService.getOnlinePlayers(port, password);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run OP command
router.post('/op', async (req, res) => {
  try {
    const { port, password } = getRconCredentials(req);
    const { username } = req.body;
    const response = await rconService.opPlayer(port, password, username);
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// De-OP command
router.post('/deop', async (req, res) => {
  try {
    const { port, password } = getRconCredentials(req);
    const { username } = req.body;
    const response = await rconService.deopPlayer(port, password, username);
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Kick player
router.post('/kick', async (req, res) => {
  try {
    const { port, password } = getRconCredentials(req);
    const { username, reason } = req.body;
    const response = await rconService.kickPlayer(port, password, username, reason);
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ban player
router.post('/ban', async (req, res) => {
  try {
    const { port, password } = getRconCredentials(req);
    const { username, reason } = req.body;
    const response = await rconService.banPlayer(port, password, username, reason);
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send custom RCON command
router.post('/command', async (req, res) => {
  try {
    const { port, password } = getRconCredentials(req);
    const { command } = req.body;
    const response = await rconService.sendCommand(port, password, command);
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
