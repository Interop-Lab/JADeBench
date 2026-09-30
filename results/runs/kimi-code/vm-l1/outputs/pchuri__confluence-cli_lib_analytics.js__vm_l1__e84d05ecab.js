const fs = require('fs');
const os = require('os');
const path = require('path');

function getConfigDir() {
  if (process.env.CONFLUENCE_CONFIG_DIR) {
    return process.env.CONFLUENCE_CONFIG_DIR;
  }

  const configHome = process.env.XDG_CONFIG_HOME
    || path.join(os.homedir(), '.config');
  return path.join(configHome, 'confluence-cli');
}

class Analytics {
  constructor() {
    this.enabled = true;
    this.configDir = getConfigDir();
    this.statsFile = path.join(this.configDir, 'stats.json');
  }

  track(command, success = true) {
    if (!this.enabled) {
      return;
    }

    try {
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }

      let stats = {
        commands: {},
        firstUsed: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      };

      if (fs.existsSync(this.statsFile)) {
        stats = JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
      }

      const status = success ? 'success' : 'error';
      const key = `${command}_${status}`;
      stats.commands[key] = (stats.commands[key] || 0) + 1;
      stats.lastUsed = new Date().toISOString();

      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch {}
  }

  getStats() {
    if (!fs.existsSync(this.statsFile)) {
      return null;
    }

    try {
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

    for (const [command, count] of Object.entries(stats.commands)) {
      console.log(`  ${command}: ${count} times`);
    }
  }
}

module.exports = Analytics;
