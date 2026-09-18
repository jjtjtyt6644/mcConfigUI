const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('../config');
const versionService = require('../services/versionService');

// Get supported engines
router.get('/software', (req, res) => {
  res.json({ success: true, software: versionService.getSupportedSoftware() });
});

// Get versions for software
router.get('/versions/:software', async (req, res) => {
  try {
    const versions = await versionService.getVersions(req.params.software);
    res.json({ success: true, versions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Download and install software build into server storage
router.post('/install', async (req, res) => {
  try {
    const { serverId, software, version } = req.body;
    if (!serverId || !software || !version) {
      return res.status(400).json({ success: false, error: 'Missing serverId, software, or version' });
    }

    const destPath = path.join(config.STORAGE_ROOT, serverId, 'server.jar');
    await versionService.downloadBuild(software, version, destPath);

    res.json({ success: true, message: `Installed ${software} ${version} to server ${serverId}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
