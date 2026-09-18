const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('../config');
const configService = require('../services/configService');

// Get server.properties for a server
router.get('/:id', async (req, res) => {
  try {
    const serverId = req.params.id;
    const configPath = path.join(config.STORAGE_ROOT, serverId, 'server.properties');
    const properties = await configService.readConfig(configPath);
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update server.properties
router.put('/:id', async (req, res) => {
  try {
    const serverId = req.params.id;
    const configPath = path.join(config.STORAGE_ROOT, serverId, 'server.properties');
    const updated = await configService.writeConfig(configPath, req.body.properties || {});
    res.json({ success: true, properties: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
