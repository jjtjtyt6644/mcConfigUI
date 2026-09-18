const Docker = require('dockerode');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

class DockerService {
  constructor() {
    this.docker = new Docker({ socketPath: config.DOCKER_SOCKET_PATH });
  }

  /**
   * Provision or fetch container instance for a specific server
   * Enforces Oracle ARM memory limits (e.g. 2GB RAM cap) and CPU pinning
   */
  async createServerContainer({ serverId, serverPort = 25565, rconPort = 25575, ramMb = config.DEFAULT_SERVER_RAM_MB, cpuCores = config.DEFAULT_SERVER_CPU_THREADS }) {
    const containerName = `aetheris-mc-${serverId}`;
    const serverDir = path.join(config.STORAGE_ROOT, serverId);
    await fs.ensureDir(serverDir);

    // Accept EULA automatically
    await fs.writeFile(path.join(serverDir, 'eula.txt'), 'eula=true\n', 'utf8');

    // Remove existing container if stale
    try {
      const existing = this.docker.getContainer(containerName);
      const inspect = await existing.inspect();
      if (inspect) {
        if (inspect.State.Running) {
          await existing.stop();
        }
        await existing.remove();
      }
    } catch (err) {
      // Not found, proceed
    }

    const memoryBytes = ramMb * 1024 * 1024;
    const nanoCpus = Math.floor(cpuCores * 1e9);

    const container = await this.docker.createContainer({
      Image: config.MINECRAFT_BASE_IMAGE,
      name: containerName,
      Tty: true,
      OpenStdin: true,
      StdinOnce: false,
      WorkingDir: '/data',
      Cmd: [
        'java',
        `-Xms${Math.floor(ramMb * 0.75)}M`,
        `-Xmx${ramMb}M`,
        '-XX:+UseG1GC',
        '-XX:+ParallelRefProcEnabled',
        '-XX:MaxGCPauseMillis=200',
        '-jar',
        'server.jar',
        'nogui'
      ],
      ExposedPorts: {
        '25565/tcp': {},
        '25575/tcp': {}
      },
      HostConfig: {
        Binds: [`${path.resolve(serverDir)}:/data`],
        PortBindings: {
          '25565/tcp': [{ HostPort: String(serverPort) }],
          '25575/tcp': [{ HostPort: String(rconPort) }]
        },
        Memory: memoryBytes,
        NanoCpus: nanoCpus,
        RestartPolicy: { Name: 'no' }
      }
    });

    return container;
  }

  async startServer(serverId) {
    const containerName = `aetheris-mc-${serverId}`;
    const container = this.docker.getContainer(containerName);
    await container.start();
    return { status: 'running', serverId };
  }

  async stopServer(serverId) {
    const containerName = `aetheris-mc-${serverId}`;
    const container = this.docker.getContainer(containerName);
    // Graceful stop with 15s timeout
    await container.stop({ t: 15 });
    return { status: 'stopped', serverId };
  }

  async restartServer(serverId) {
    const containerName = `aetheris-mc-${serverId}`;
    const container = this.docker.getContainer(containerName);
    await container.restart({ t: 10 });
    return { status: 'restarted', serverId };
  }

  async killServer(serverId) {
    const containerName = `aetheris-mc-${serverId}`;
    const container = this.docker.getContainer(containerName);
    await container.kill();
    return { status: 'killed', serverId };
  }

  async getServerStatus(serverId) {
    try {
      const containerName = `aetheris-mc-${serverId}`;
      const container = this.docker.getContainer(containerName);
      const data = await container.inspect();
      return {
        id: serverId,
        running: data.State.Running,
        status: data.State.Status,
        startedAt: data.State.StartedAt,
        memoryLimitMB: Math.round(data.HostConfig.Memory / (1024 * 1024))
      };
    } catch (err) {
      return { id: serverId, running: false, status: 'not_found' };
    }
  }

  /**
   * Attach directly to the container stream for Web Terminal
   */
  async attachTerminal(serverId) {
    const containerName = `aetheris-mc-${serverId}`;
    const container = this.docker.getContainer(containerName);
    const stream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true
    });
    return stream;
  }
}

module.exports = new DockerService();
