const path = require('path');
const fs = require('fs');

const __getOwnPropNames = Object.getOwnPropertyNames;

function getConfigDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  const configDir = path.join(home, '.confluence-cli');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  return configDir;
}

class Analytics {
  constructor() {
    this.stats = {};
    this.configDir = getConfigDir();
    this.statsFile = path.join(this.configDir, 'stats.json');
    this.loadStats();
  }

  track(event) {
    if (!this.stats[event]) {
      this.stats[event] = 0;
    }
    this.stats[event]++;
    this.saveStats();
  }

  getStats() {
    return this.stats;
  }

  showStats() {
    console.log('Analytics Statistics:');
    for (const [event, count] of Object.entries(this.stats)) {
      console.log(`  ${event}: ${count}`);
    }
  }

  loadStats() {
    try {
      if (fs.existsSync(this.statsFile)) {
        const data = fs.readFileSync(this.statsFile, 'utf8');
        this.stats = JSON.parse(data);
      }
    } catch (e) {
      this.stats = {};
    }
  }

  saveStats() {
    try {
      fs.writeFileSync(this.statsFile, JSON.stringify(this.stats, null, 2));
    } catch (e) {
      // ignore
    }
  }
}

module.exports = { Analytics, getConfigDir };
