const url = require('url');
const dockerService = require('../services/dockerService');

function setupTerminalSocket(wss) {
  wss.on('connection', async (ws, req) => {
    const parameters = url.parse(req.url, true);
    const serverId = parameters.query.serverId || 'default';

    ws.send(JSON.stringify({ type: 'stdout', data: `\r\n\x1b[36m[Aetheris Engine]\x1b[0m Connecting to server console (${serverId})...\r\n` }));

    try {
      const stream = await dockerService.attachTerminal(serverId);

      // Pipe Docker output to WebSocket client
      stream.on('data', (chunk) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'stdout',
            data: chunk.toString('utf8')
          }));
        }
      });

      stream.on('end', () => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'stdout', data: '\r\n\x1b[33m[Aetheris Engine]\x1b[0m Container stream ended.\r\n' }));
        }
      });

      // Pipe user input from Web Terminal to Docker stdin
      ws.on('message', (message) => {
        try {
          const parsed = JSON.parse(message);
          if (parsed.type === 'stdin' && parsed.command) {
            stream.write(`${parsed.command}\n`);
          }
        } catch (e) {
          // If raw text
          stream.write(`${message}\n`);
        }
      });

      ws.on('close', () => {
        try {
          stream.destroy();
        } catch (e) {}
      });

    } catch (err) {
      ws.send(JSON.stringify({
        type: 'error',
        data: `\r\n\x1b[31m[Aetheris Engine Error]\x1b[0m Could not connect to container: ${err.message}\r\n`
      }));
    }
  });
}

module.exports = { setupTerminalSocket };
