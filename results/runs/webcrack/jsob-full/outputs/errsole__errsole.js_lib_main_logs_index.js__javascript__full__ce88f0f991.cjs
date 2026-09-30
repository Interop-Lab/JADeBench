'use strict';

var stream = require("stream");
var stripAnsi = require("strip-ansi");
var os = require("os");
var pid = process.pid;
var isBun = typeof Bun !== "undefined";
var LogLevel = {
  INFO: "info",
  ERROR: "error"
};
var logCollector = {
  storage: {},
  collectLogs: [LogLevel.INFO, LogLevel.ERROR],
  enableConsoleOutput: process.env.NODE_ENV !== "production",
  hostname: os.hostname(),
  pid: pid,
  isInitializationFailed: false,
  isStorageReady: false,
  originalStdoutWrite: process.stdout.write,
  originalStderrWrite: process.stderr.write,
  setInitializationTimeout() {
    this.initializationTimeoutId = setTimeout(() => {
      this.createEmptyLogStream();
      this.isInitializationFailed = true;
      console.error("Error: Unable to initialize Errsole");
    }, 30000);
  },
  initialize(_0x1d21f8 = {}) {
    this.storage = _0x1d21f8.storage;
    this.collectLogs = _0x1d21f8.collectLogs || [LogLevel.INFO, LogLevel.ERROR];
    if (typeof _0x1d21f8.enableConsoleOutput !== "undefined") {
      this.enableConsoleOutput = _0x1d21f8.enableConsoleOutput;
    }
    this.hostname = _0x1d21f8.serverName || os.hostname();
    if (this.storage.once) {
      this.storage.once("ready", () => {
        clearTimeout(this.initializationTimeoutId);
        if (this.isInitializationFailed) {
          this.createLogStream();
          this.isInitializationFailed = false;
        } else {
          this.logStream.uncork();
        }
        this.isStorageReady = true;
      });
    }
    if (this.enableConsoleOutput) {
      process.stdout.write = this.originalStdoutWrite;
      process.stderr.write = this.originalStderrWrite;
    } else {
      console.log("Note: Terminal output will be disabled after initial logs.");
      const _0x3de7b0 = (_0x5c555c, _0x3280aa, _0x37df82) => {
        if (typeof _0x3280aa === "function") {
          _0x37df82 = _0x3280aa;
        }
        if (typeof _0x37df82 === "function") {
          process.nextTick(() => _0x37df82(null));
        }
        return true;
      };
      process.stdout.write = _0x3de7b0;
      process.stderr.write = _0x3de7b0;
    }
    if (this.collectLogs.includes(LogLevel.INFO)) {
      this.interceptLogs(LogLevel.INFO);
      console.log("Errsole is capturing " + LogLevel.INFO.toUpperCase() + " logs.");
    } else {
      console.log("Errsole is NOT capturing " + LogLevel.INFO.toUpperCase() + " logs.");
    }
    if (this.collectLogs.includes(LogLevel.ERROR)) {
      this.interceptLogs(LogLevel.ERROR);
      console.log("Errsole is capturing " + LogLevel.ERROR.toUpperCase() + " logs.");
    } else {
      console.log("Errsole is NOT capturing " + LogLevel.ERROR.toUpperCase() + " logs.");
    }
  },
  createLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (_0x4e1273, _0x5daca3, _0x10b4eb) => {
        this.storage.postLogs([_0x4e1273]);
        setImmediate(_0x10b4eb);
      }
    });
  },
  createEmptyLogStream() {
    if (this.logStream) {
      this.logStream.destroy();
    }
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (_0x4dfa05, _0x4f4f3c, _0x3b0a00) => {
        setImmediate(_0x3b0a00);
      }
    });
  },
  interceptLogs(_0xd11064) {
    let _0x1f706a;
    let _0x1ad25f;
    switch (_0xd11064) {
      case LogLevel.INFO:
        _0x1f706a = process.stdout;
        _0x1ad25f = this.originalStdoutWrite;
        break;
      case LogLevel.ERROR:
        _0x1f706a = process.stderr;
        _0x1ad25f = this.originalStderrWrite;
        break;
      default:
        return;
    }
    if (isBun) {
      const _0x4325e3 = ["log", "info", "debug", "dir", "table", "count", "countReset", "time", "timeLog", "timeEnd", "group", "groupEnd"];
      const _0x413342 = ["error", "warn", "trace"];
      _0x4325e3.forEach(_0xd23417 => {
        console[_0xd23417] = (..._0x1c750c) => {
          const _0x151217 = _0x1c750c.map(_0x2b8cdc => typeof _0x2b8cdc === "object" ? JSON.stringify(_0x2b8cdc) : _0x2b8cdc).join(" ");
          const _0x51a099 = {
            timestamp: new Date().toISOString(),
            message: _0x151217,
            source: "console",
            level: LogLevel[_0xd23417.toUpperCase()] || LogLevel.INFO,
            hostname: this.hostname,
            pid: this.pid
          };
          this.logStream.write(_0x51a099);
          Bun.write(Bun.stdout, _0x1c750c + "\n");
        };
      });
      _0x413342.forEach(_0x4c9159 => {
        console[_0x4c9159] = (..._0x2e634a) => {
          const _0x5c9328 = _0x2e634a.map(_0x1a9984 => typeof _0x1a9984 === "object" ? JSON.stringify(_0x1a9984) : _0x1a9984).join(" ");
          const _0x14d059 = {
            timestamp: new Date().toISOString(),
            message: _0x5c9328,
            source: "console",
            level: LogLevel.ERROR,
            hostname: this.hostname,
            pid: this.pid
          };
          this.logStream.write(_0x14d059);
          Bun.write(Bun.stderr, _0x2e634a + "\n");
        };
      });
      return;
    }
    _0x1f706a.write = (_0x5cf477, _0x36ae17, _0x2017ee) => {
      const _0x3d6ff9 = stripAnsi(_0x5cf477.toString());
      const _0x3abce0 = {
        timestamp: new Date().toISOString(),
        message: _0x3d6ff9,
        source: "console",
        level: _0xd11064,
        hostname: this.hostname,
        pid: this.pid
      };
      this.logStream.write(_0x3abce0);
      if (this.enableConsoleOutput || !this.isStorageReady) {
        _0x1ad25f.call(_0x1f706a, _0x5cf477, _0x36ae17, _0x2017ee);
      } else if (_0x2017ee) {
        _0x2017ee();
      }
    };
  },
  async flushLogs(_0x3870d4 = 5000) {
    if (typeof this.storage.flushLogs === "function") {
      try {
        await Promise.race([this.storage.flushLogs(), new Promise((_0x529bf4, _0x40ff73) => setTimeout(() => _0x40ff73(new Error("flushLogs timed out")), _0x3870d4))]);
      } catch (_0x2aaa8b) {
        console.error(_0x2aaa8b);
      }
    }
  },
  logCustomMessage(_0x1aa0cd, _0x35012d, _0x4ea2e8, _0x13d995, _0x225b17) {
    const _0x931ea5 = {
      timestamp: _0x225b17 || new Date().toISOString(),
      message: _0x35012d,
      meta: _0x4ea2e8 || "{}",
      source: "errsole",
      level: _0x1aa0cd,
      hostname: this.hostname,
      pid: this.pid,
      errsole_id: _0x13d995
    };
    try {
      this.logStream.write(_0x931ea5);
      if (!this.enableConsoleOutput) {
        return;
      }
      this.originalStdoutWrite.call(process.stdout, _0x35012d + "\n", "utf8");
    } catch (_0x2624f3) {
      console.error(_0x2624f3);
    }
  }
};
logCollector.resetConsoleOutput = function () {
  this.logStream.uncork();
  if (!this.enableConsoleOutput) {
    this.enableConsoleOutput = true;
    process.stdout.write = this.originalStdoutWrite;
    process.stderr.write = this.originalStderrWrite;
  }
};
logCollector.setInitializationTimeout();
logCollector.createLogStream();
logCollector.logStream.cork();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);
module.exports = logCollector;