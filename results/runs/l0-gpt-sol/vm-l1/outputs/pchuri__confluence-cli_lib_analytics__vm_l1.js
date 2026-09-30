const fs = require("fs");
const path = require("path");
const { getConfigDir } = require("./config");

class Analytics {
  constructor() {
    this.statsPath = path.join(getConfigDir(), "analytics.json");
  }

  track(command) {
    const stats = this.getStats();
    const name = String(command);

    if (!stats.commands || typeof stats.commands !== "object") {
      stats.commands = {};
    }

    stats.commands[name] = (stats.commands[name] || 0) + 1;
    stats.total = (stats.total || 0) + 1;

    fs.mkdirSync(path.dirname(this.statsPath), { recursive: true });
    fs.writeFileSync(this.statsPath, JSON.stringify(stats, null, 2));
  }

  getStats() {
    try {
      return JSON.parse(fs.readFileSync(this.statsPath, "utf8"));
    } catch {
      return {
        commands: {},
        total: 0
      };
    }
  }

  showStats() {
    const stats = this.getStats();
    console.log(JSON.stringify(stats, null, 2));
  }
}

module.exports = Analytics;
