const fs = require('fs');
const os = require('os');
const path = require('path');

let cachedConfigDir;

function getConfigDir() {
  if (!cachedConfigDir) {
    const configRoot = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
    cachedConfigDir = process.env.CONFLUENCE_CONFIG_DIR || path.join(configRoot, 'confluence-cli');
  }

  return cachedConfigDir;
}

class Analytics {
  constructor() {
    this.enabled = process.env.CONFLUENCE_CLI_ANALYTICS !== 'false';
    this.configDir = getConfigDir();
    this.statsFile = path.join(this.configDir, 'stats.json');
  }

  track(command, success = true) {
    if (!this.enabled) return;

    try {
      let stats;
      if (fs.existsSync(this.statsFile)) {
        stats = JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
      } else {
        stats = {
          commands: {},
          firstUsed: new Date().toISOString(),
        };
      }

      if (!stats.commands) stats.commands = {};

      const commandKey = `${command}_${success ? 'success' : 'error'}`;
      stats.commands[commandKey] = (stats.commands[commandKey] || 0) + 1;
      stats.lastUsed = new Date().toISOString();

      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch {}
  }

  getStats() {
    try {
      if (!fs.existsSync(this.statsFile)) return null;
      return JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
    } catch {
      return null;
    }
  }

  showStats() {
    const stats = this.getStats();
    if (!stats) {
      console.log('No usage statistics available.');
      return;
    }

    console.log('📊 Usage Statistics:');
    console.log(`First used: ${new Date(stats.firstUsed).toLocaleDateString()}`);
    console.log(`Last used: ${new Date(stats.lastUsed).toLocaleDateString()}`);
    console.log('\nCommand usage:');
    Object.entries(stats.commands).forEach(([command, count]) => {
      console.log(`  ${command}: ${count} times`);
    });
  }
}

module.exports = Analytics;
