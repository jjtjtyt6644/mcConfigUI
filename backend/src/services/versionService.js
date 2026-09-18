const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class VersionService {
  /**
   * Get supported software types
   */
  getSupportedSoftware() {
    return [
      { id: 'paper', name: 'PaperMC', description: 'High performance Spigot fork with bug fixes & optimizations' },
      { id: 'purpur', name: 'Purpur', description: 'Drop-in replacement for Paper with extreme gameplay customization' },
      { id: 'fabric', name: 'Fabric', description: 'Lightweight, modular modding engine for modern Minecraft' },
      { id: 'vanilla', name: 'Vanilla', description: 'Official unmodified Mojang server software' }
    ];
  }

  /**
   * Fetch available Minecraft versions for a given software
   * @param {string} software - paper | purpur | fabric | vanilla
   */
  async getVersions(software = 'paper') {
    switch (software.toLowerCase()) {
      case 'paper': {
        const res = await axios.get('https://api.papermc.io/v2/projects/paper');
        return res.data.versions.reverse(); // Latest versions first
      }
      case 'purpur': {
        const res = await axios.get('https://api.purpurmc.org/v2/purpur');
        return res.data.versions.reverse();
      }
      case 'fabric': {
        const res = await axios.get('https://meta.fabricmc.net/v2/versions/game');
        // Filter stable releases
        return res.data
          .filter(v => v.stable)
          .map(v => v.version);
      }
      case 'vanilla': {
        const res = await axios.get('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
        return res.data.versions
          .filter(v => v.type === 'release')
          .slice(0, 30)
          .map(v => v.id);
      }
      default:
        return ['1.20.4', '1.20.2', '1.19.4', '1.16.5'];
    }
  }

  /**
   * Download the selected software build jar to destination path
   * @param {string} software - paper | purpur | fabric | vanilla
   * @param {string} version - e.g. "1.20.4"
   * @param {string} destPath - Destination file path (e.g. server.jar)
   */
  async downloadBuild(software, version, destPath) {
    await fs.ensureDir(path.dirname(destPath));
    let downloadUrl = '';

    if (software === 'paper') {
      const buildsRes = await axios.get(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`);
      const builds = buildsRes.data.builds;
      const latestBuild = builds[builds.length - 1];
      const jarName = latestBuild.downloads.application.name;
      downloadUrl = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${latestBuild.build}/downloads/${jarName}`;
    } else if (software === 'purpur') {
      const buildsRes = await axios.get(`https://api.purpurmc.org/v2/purpur/${version}`);
      const latestBuild = buildsRes.data.builds.latest;
      downloadUrl = `https://api.purpurmc.org/v2/purpur/${version}/${latestBuild}/download`;
    } else if (software === 'fabric') {
      // Fetch latest loader and installer
      const loaderRes = await axios.get('https://meta.fabricmc.net/v2/versions/loader');
      const latestLoader = loaderRes.data[0].version;
      const installerRes = await axios.get('https://meta.fabricmc.net/v2/versions/installer');
      const latestInstaller = installerRes.data[0].version;

      downloadUrl = `https://meta.fabricmc.net/v2/versions/loader/${version}/${latestLoader}/${latestInstaller}/server/jar`;
    } else {
      // Vanilla fallback
      const manifestRes = await axios.get('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
      const targetVersion = manifestRes.data.versions.find(v => v.id === version);
      if (targetVersion) {
        const versionDetails = await axios.get(targetVersion.url);
        downloadUrl = versionDetails.data.downloads.server.url;
      }
    }

    if (!downloadUrl) {
      throw new Error(`Unable to resolve download URL for ${software} ${version}`);
    }

    // Stream download to destination
    const writer = fs.createWriteStream(destPath);
    const response = await axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(destPath));
      writer.on('error', reject);
    });
  }
}

module.exports = new VersionService();
