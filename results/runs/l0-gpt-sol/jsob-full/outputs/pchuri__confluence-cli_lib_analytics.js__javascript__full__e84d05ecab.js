"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

function resolveConfigDir() {
  if (process.env.CONFLUENCE_CONFIG_DIR) {
    return process.env.CONFLUENCE_CONFIG_DIR;
  }

  const legacyDir = path.join(os.homedir(), ".confluence-cli");
  const xdgConfigHome =
    process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  const configDir = path.join(xdgConfigHome, "confluence-cli");

  if (fs.existsSync(legacyDir) && !fs.existsSync(configDir)) {
    return legacyDir;
  }

  return configDir;
}

const configDir = resolveConfigDir();

class Analytics {
  constructor() {
    this.enabled = process.env.CONFLUENCE_CLI_ANALYTICS !== "false";
    this.configDir = configDir;
    this.file = path.join(this.configDir, "analytics.json");
  }

  track(command, success = true) {
    if (!this.enabled) {
      return;
    }

    try {
      let analytics = {};

      if (fs.existsSync(this.file)) {
        analytics = JSON.parse(fs.readFileSync(this.file, "utf8"));
      }

      if (!analytics.stats) {
        analytics.stats = {};
      }

      if (!analytics.created) {
        analytics.created = new Date().toISOString();
      }

      analytics.updated = new Date().toISOString();

      const key = `${command}_${success ? "success" : "failure"}`;
      analytics.stats[key] = (analytics.stats[key] || 0) + 1;

      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }

      fs.writeFileSync(this.file, JSON.stringify(analytics, null, 2));
    } catch (_) {
      // Analytics must never interfere with normal command execution.
    }
  }

  getStats() {
    if (!fs.existsSync(this.file)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(this.file, "utf8"));
    } catch (_) {
      return null;
    }
  }

  printStats() {
    const analytics = this.getStats();

    if (!analytics) {
      console.log("No analytics data available.");
      return;
    }

    console.log("Analytics Statistics");
    console.log(
      "Created: " + new Date(analytics.created).toLocaleString()
    );
    console.log(
      "Updated: " + new Date(analytics.updated).toLocaleString()
    );
    console.log("Command usage:");

    Object.entries(analytics.stats).forEach(([name, count]) => {
      console.log(`  ${name}: ${count} times`);
    });
  }
}

module.exports = Analytics;
