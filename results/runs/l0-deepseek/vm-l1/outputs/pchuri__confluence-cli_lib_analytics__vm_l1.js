const globalObject = typeof globalThis !== 'undefined' ? globalThis :
  typeof global !== 'undefined' ? global :
  typeof window !== 'undefined' ? window :
  typeof self !== 'undefined' ? self : void 0;

const moduleCache = globalObject.__moduleCache || (globalObject.__moduleCache = {});

(function() {
  if (!moduleCache.module) {
    try { moduleCache.module = module; } catch (_) {}
  }
  if (!moduleCache.exports) {
    try { moduleCache.exports = exports; } catch (_) {}
  }
  if (!moduleCache.require) {
    try { moduleCache.require = require; } catch (_) {}
  }
  if (!moduleCache.__dirname) {
    try { moduleCache.__dirname = __dirname; } catch (_) {}
  }
  if (!moduleCache.__filename) {
    try { moduleCache.__filename = __filename; } catch (_) {}
  }
})();

const path = require('path');
const fs = require('fs');

const { getConfigDir } = moduleCache.require_config();

class Analytics {
  constructor() {
    this.configDir = getConfigDir();
    this.statsFile = path.join(this.configDir, 'analytics.json');
    this.stats = this._loadStats();
  }

  track(event) {
    if (!process.env.CONFLUENCE_CLI_ANALYTICS) return;
    const stats = this.stats;
    const key = event;
    stats[key] = (stats[key] || 0) + 1;
    this._saveStats();
  }

  getStats() {
    return this.stats;
  }

  showStats() {
    const stats = this.getStats();
    const entries = Object.entries(stats);
    if (entries.length === 0) {
      console.log('No analytics data recorded.');
      return;
    }
    console.log('Analytics:');
    for (const [event, count] of entries) {
      console.log(`  ${event}: ${count}`);
    }
  }

  _loadStats() {
    try {
      if (fs.existsSync(this.statsFile)) {
        const raw = fs.readFileSync(this.statsFile, 'utf8');
        return JSON.parse(raw);
      }
    } catch (_) {}
    return {};
  }

  _saveStats() {
    try {
      fs.mkdirSync(this.configDir, { recursive: true });
      fs.writeFileSync(this.statsFile, JSON.stringify(this.stats, null, 2));
    } catch (_) {}
  }
}

moduleCache.Analytics = Analytics;
globalObject.Analytics = Analytics;

module.exports = Analytics;
