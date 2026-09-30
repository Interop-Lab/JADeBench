const path = require('path');
const fs = require('fs');

function getConfigDir() {
  const configRoot = process.env.XDG_CONFIG_HOME
    || path.join(process.env.HOME || '', '.config');
  return path.join(configRoot, 'confluence-cli');
}

const CONFIG_DIR = getConfigDir();

class Analytics {
  constructor() {
    this.enabled = true;
    this.configDir = CONFIG_DIR;
    this.statsFile = path.join(this.configDir, 'stats.json');
  }

  track(command, success = true) {
    if (!this.enabled) return;

    try {
      let stats = this.getStats();
      if (stats) {
        stats.lastUsed = new Date().toISOString();
      } else {
        stats = {
          commands: {},
          firstUsed: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
        };
      }

      const event = `${command}_${success ? 'success' : 'error'}`;
      stats.commands[event] = (stats.commands[event] || 0) + 1;

      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch {
      // Analytics must never interfere with the command being measured.
    }
  }

  getStats() {
    if (!this.enabled || !fs.existsSync(this.statsFile)) return null;

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
