const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  
  // Oracle Cloud VM (4 OCPUs, 24GB RAM) Host Safeguards
  HOST_MAX_ALLOCATED_RAM_MB: parseInt(process.env.HOST_MAX_ALLOCATED_RAM_MB, 10) || 20480,
  DEFAULT_SERVER_RAM_MB: parseInt(process.env.DEFAULT_SERVER_RAM_MB, 10) || 2048,
  DEFAULT_SERVER_CPU_THREADS: parseFloat(process.env.DEFAULT_SERVER_CPU_THREADS) || 1.0,
  
  // Volume storage
  STORAGE_ROOT: path.resolve(process.env.STORAGE_ROOT || path.join(__dirname, '../data/servers')),
  
  // Docker connection
  DOCKER_SOCKET_PATH: process.env.DOCKER_SOCKET_PATH || (process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock'),
  
  // Base Docker Image for Minecraft on ARM64 / x86_64
  MINECRAFT_BASE_IMAGE: process.env.MINECRAFT_BASE_IMAGE || 'eclipse-temurin:21-jre-alpine',
  
  // Inactivity Killswitch (minutes)
  INACTIVITY_TIMEOUT_MINUTES: parseInt(process.env.INACTIVITY_TIMEOUT_MINUTES, 10) || 5,

  DEFAULT_RCON_PORT: parseInt(process.env.DEFAULT_RCON_PORT, 10) || 25575,
  DEFAULT_RCON_PASSWORD: process.env.DEFAULT_RCON_PASSWORD || 'aetheris_secure_rcon'
};
