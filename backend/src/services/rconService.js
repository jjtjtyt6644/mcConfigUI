const { Rcon } = require('rcon-client');
const config = require('../config');

class RconService {
  constructor() {
    this.connections = new Map();
  }

  /**
   * Connect or retrieve cached RCON client
   * @param {string} host
   * @param {number} port
   * @param {string} password
   */
  async getClient(host = '127.0.0.1', port = config.DEFAULT_RCON_PORT, password = config.DEFAULT_RCON_PASSWORD) {
    const key = `${host}:${port}`;
    let rcon = this.connections.get(key);

    if (!rcon || !rcon.authenticated) {
      try {
        rcon = await Rcon.connect({
          host,
          port,
          password,
          timeout: 5000
        });
        this.connections.set(key, rcon);
      } catch (err) {
        this.connections.delete(key);
        throw new Error(`RCON connection failed to ${key}: ${err.message}`);
      }
    }
    return rcon;
  }

  /**
   * Execute raw RCON command
   */
  async sendCommand(port, password, command) {
    const rcon = await this.getClient('127.0.0.1', port, password);
    const response = await rcon.send(command);
    return response;
  }

  /**
   * Player management helpers
   */
  async getOnlinePlayers(port, password) {
    try {
      const res = await this.sendCommand(port, password, 'list');
      // Format: "There are 0 of a max of 20 players online: ..."
      const match = res.match(/There are (\d+) of a max/);
      const count = match ? parseInt(match[1], 10) : 0;

      const colonIdx = res.indexOf(':');
      let players = [];
      if (colonIdx !== -1 && count > 0) {
        players = res.substring(colonIdx + 1).split(',').map(p => p.trim()).filter(Boolean);
      }

      return { count, players, raw: res };
    } catch (e) {
      return { count: 0, players: [], error: e.message };
    }
  }

  async opPlayer(port, password, username) {
    return this.sendCommand(port, password, `op ${username}`);
  }

  async deopPlayer(port, password, username) {
    return this.sendCommand(port, password, `deop ${username}`);
  }

  async kickPlayer(port, password, username, reason = 'Kicked by administrator') {
    return this.sendCommand(port, password, `kick ${username} ${reason}`);
  }

  async banPlayer(port, password, username, reason = 'Banned by operator') {
    return this.sendCommand(port, password, `ban ${username} ${reason}`);
  }

  async setGamemode(port, password, gamemode, target = '@a') {
    return this.sendCommand(port, password, `gamemode ${gamemode} ${target}`);
  }

  async broadcast(port, password, message) {
    return this.sendCommand(port, password, `say [Aetheris] ${message}`);
  }

  disconnect(port) {
    const key = `127.0.0.1:${port}`;
    const rcon = this.connections.get(key);
    if (rcon) {
      try { rcon.end(); } catch (e) { }
      this.connections.delete(key);
    }
  }
}

module.exports = new RconService();
