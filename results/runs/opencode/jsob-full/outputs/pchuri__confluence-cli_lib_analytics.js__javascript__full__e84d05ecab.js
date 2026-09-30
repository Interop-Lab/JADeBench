'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function getConfigDir() {
  if (process.env.CONFLUENCE_CONFIG_DIR) {
    return process.env.CONFLUENCE_CONFIG_DIR;
  }

  const configHome =
    process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(configHome, 'confluence-cli');
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
      let stats = {};
      if (fs.existsSync(this.statsFile)) {
        stats = JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
      }

      if (!stats.commands) stats.commands = {};
      if (!stats.firstUsed) stats.firstUsed = new Date().toISOString();
      stats.lastUsed = new Date().toISOString();

      const key = `${command}_${success ? 'success' : 'error'}`;
      stats.commands[key] = (stats.commands[key] || 0) + 1;

      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch (_) {
      // Analytics must never interfere with the command being measured.
    }
  }

  getStats() {
    if (!fs.existsSync(this.statsFile)) return null;

    try {
      return JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
    } catch (_) {
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
