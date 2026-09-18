const dockerService = require('./dockerService');
const rconService = require('./rconService');
const config = require('../config');

class LifecycleService {
  constructor() {
    this.activeServers = new Map(); // serverId -> { port, rconPort, rconPass, lastActive, allocatedRamMb }
    this.waitingQueue = []; // [{ serverId, resolve, reject }]
    this.monitorInterval = null;
  }

  startWorker() {
    if (this.monitorInterval) return;
    console.log('[LifecycleService] Started Oracle ARM Inactivity & Queue monitor');

    // Run health check and auto-shutdown evaluation every 30 seconds
    this.monitorInterval = setInterval(async () => {
      await this.checkInactivity();
      await this.processQueue();
    }, 30000);
  }

  stopWorker() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  /**
   * Calculate total RAM allocated across running containers
   */
  getTotalAllocatedRam() {
    let total = 0;
    for (const data of this.activeServers.values()) {
      total += data.allocatedRamMb || config.DEFAULT_SERVER_RAM_MB;
    }
    return total;
  }

  /**
   * Request to start server with automated queueing if host RAM threshold is reached
   */
  async requestStart(serverId, serverMeta = {}) {
    const requestedRam = serverMeta.ramMb || config.DEFAULT_SERVER_RAM_MB;
    const currentUsage = this.getTotalAllocatedRam();

    if (currentUsage + requestedRam > config.HOST_MAX_ALLOCATED_RAM_MB) {
      console.warn(`[Queue] Host RAM near limit (${currentUsage}/${config.HOST_MAX_ALLOCATED_RAM_MB}MB). Queuing server ${serverId}`);
      return new Promise((resolve, reject) => {
        this.waitingQueue.push({ serverId, serverMeta, resolve, reject, queuedAt: Date.now() });
      });
    }

    return this.executeStart(serverId, serverMeta);
  }

  async executeStart(serverId, serverMeta = {}) {
    await dockerService.startServer(serverId);
    this.activeServers.set(serverId, {
      ...serverMeta,
      lastActive: Date.now(),
      zeroPlayerSince: null,
      allocatedRamMb: serverMeta.ramMb || config.DEFAULT_SERVER_RAM_MB
    });
    return { success: true, queued: false, serverId };
  }

  /**
   * Monitor online players; if 0 players for > INACTIVITY_TIMEOUT_MINUTES, stop gracefully
   */
  async checkInactivity() {
    const now = Date.now();
    const timeoutMs = config.INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

    for (const [serverId, info] of this.activeServers.entries()) {
      try {
        const { running } = await dockerService.getServerStatus(serverId);
        if (!running) {
          this.activeServers.delete(serverId);
          continue;
        }

        const rconResult = await rconService.getOnlinePlayers(
          info.rconPort || config.DEFAULT_RCON_PORT,
          info.rconPassword || config.DEFAULT_RCON_PASSWORD
        );

        if (rconResult.count === 0) {
          if (!info.zeroPlayerSince) {
            info.zeroPlayerSince = now;
          } else if (now - info.zeroPlayerSince >= timeoutMs) {
            console.log(`[Auto-Shutdown] Server ${serverId} has been idle for 5+ min. Stopping container.`);
            try {
              await rconService.broadcast(info.rconPort, info.rconPassword, 'Auto-shutdown triggered due to inactivity.');
              await rconService.sendCommand(info.rconPort, info.rconPassword, 'stop');
            } catch (e) {}

            setTimeout(async () => {
              await dockerService.stopServer(serverId);
              this.activeServers.delete(serverId);
              this.processQueue();
            }, 3000);
          }
        } else {
          info.zeroPlayerSince = null;
          info.lastActive = now;
        }
      } catch (err) {
        // RCON might not be ready yet while booting
      }
    }
  }

  /**
   * Process pending queued requests when RAM frees up
   */
  async processQueue() {
    if (this.waitingQueue.length === 0) return;

    const availableRam = config.HOST_MAX_ALLOCATED_RAM_MB - this.getTotalAllocatedRam();
    const nextInQueue = this.waitingQueue[0];

    const requiredRam = nextInQueue.serverMeta?.ramMb || config.DEFAULT_SERVER_RAM_MB;
    if (availableRam >= requiredRam) {
      const item = this.waitingQueue.shift();
      try {
        const res = await this.executeStart(item.serverId, item.serverMeta);
        item.resolve(res);
      } catch (e) {
        item.reject(e);
      }
    }
  }

  getMetrics() {
    return {
      allocatedRamMb: this.getTotalAllocatedRam(),
      maxRamMb: config.HOST_MAX_ALLOCATED_RAM_MB,
      activeServersCount: this.activeServers.size,
      queueLength: this.waitingQueue.length
    };
  }
}

module.exports = new LifecycleService();
