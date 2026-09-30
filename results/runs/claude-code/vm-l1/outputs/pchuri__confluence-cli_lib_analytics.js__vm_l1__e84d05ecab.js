'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function getConfigDir() {
  if (process.env.CONFLUENCE_CONFIG_DIR) {
    return process.env.CONFLUENCE_CONFIG_DIR;
  }

  const legacyDirectory = path.join(os.homedir(), '.confluence-cli');
  const standardDirectory = path.join(
    process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'),
    'confluence-cli',
  );

  return fs.existsSync(legacyDirectory) && !fs.existsSync(standardDirectory)
    ? legacyDirectory
    : standardDirectory;
}

class Analytics {
  constructor() {
    this.enabled = process.env.CONFLUENCE_CLI_ANALYTICS !== 'false';
    this.configDir = getConfigDir();
    this.statsFile = path.join(this.configDir, 'stats.json');
  }

  track(command) {
    if (!this.enabled) return;

    let stats = {};
    try {
      if (fs.existsSync(this.statsFile)) {
        stats = JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
      }
    } catch {
      stats = {};
    }

    stats.commands ||= {};
    const now = new Date().toISOString();
    stats.firstUsed ||= now;
    stats.lastUsed = now;

    const outcome = arguments[1] ? 'success' : 'error';
    const statistic = `${command}_${outcome}`;
    stats.commands[statistic] = (stats.commands[statistic] || 0) + 1;

    try {
      fs.mkdirSync(this.configDir, { recursive: true });
      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch {
      // Analytics must never prevent the command from completing.
    }
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
