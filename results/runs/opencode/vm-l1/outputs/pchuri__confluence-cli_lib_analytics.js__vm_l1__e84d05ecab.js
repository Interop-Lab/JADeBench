"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Return the directory used by confluence-cli for user data.
 *
 * The application historically stored its files in ~/.confluence-cli. Keep
 * using that directory when it exists; new installations use the XDG-style
 * location under ~/.config.
 */
function getConfigDir() {
  const legacyDirectory = path.join(os.homedir(), ".confluence-cli");
  if (fs.existsSync(legacyDirectory)) {
    return legacyDirectory;
  }

  return path.join(os.homedir(), ".config", "confluence-cli");
}

class Analytics {
  constructor() {
    this.enabled = true;
    this.configDir = getConfigDir();
    this.statsFile = path.join(this.configDir, "stats.json");
  }

  track(command, successful = true) {
    if (!this.enabled) return;

    try {
      const now = new Date().toISOString();
      const stats = this.getStats() || {
        commands: {},
        firstUsed: now,
        lastUsed: now,
      };

      const outcome = successful ? "success" : "error";
      const key = `${command}_${outcome}`;
      stats.commands[key] = (stats.commands[key] || 0) + 1;
      stats.lastUsed = now;

      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch {
      // Analytics must never interfere with the command being measured.
    }
  }

  getStats() {
    if (!fs.existsSync(this.statsFile)) return null;

    try {
      return JSON.parse(fs.readFileSync(this.statsFile, "utf8"));
    } catch {
      return null;
    }
  }

  showStats() {
    const stats = this.getStats();
    if (!stats) {
      console.log("No usage statistics available.");
      return;
    }

    console.log("📊 Usage Statistics:");
    console.log(`First used: ${new Date(stats.firstUsed).toLocaleDateString()}`);
    console.log(`Last used: ${new Date(stats.lastUsed).toLocaleDateString()}`);
    console.log("\nCommand usage:");
    for (const [command, count] of Object.entries(stats.commands)) {
      console.log(`  ${command}: ${count} times`);
    }
  }
}

module.exports = Analytics;
