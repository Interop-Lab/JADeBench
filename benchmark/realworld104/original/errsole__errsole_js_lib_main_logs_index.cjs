"use strict";

// ../work/errsole__errsole.js/lib/main/logs/index.js
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
  pid,
  isInitializationFailed: false,
  isStorageReady: false,
  originalStdoutWrite: process.stdout.write,
  originalStderrWrite: process.stderr.write,
  setInitializationTimeout() {
    this.initializationTimeoutId = setTimeout(() => {
      this.createEmptyLogStream();
      this.isInitializationFailed = true;
      console.error("Error: Unable to initialize Errsole");
    }, 3e4);
  },
  initialize(options = {}) {
    this.storage = options.storage;
    this.collectLogs = options.collectLogs || [LogLevel.INFO, LogLevel.ERROR];
    if (typeof options.enableConsoleOutput !== "undefined") {
      this.enableConsoleOutput = options.enableConsoleOutput;
    }
    this.hostname = options.serverName || os.hostname();
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
      const swallowWrite = (chunk, encoding, cb) => {
        if (typeof encoding === "function") cb = encoding;
        if (typeof cb === "function") process.nextTick(() => cb(null));
        return true;
      };
      process.stdout.write = swallowWrite;
      process.stderr.write = swallowWrite;
    }
    if (this.collectLogs.includes(LogLevel.INFO)) {
      this.interceptLogs(LogLevel.INFO);
      console.log(`Errsole is capturing ${LogLevel.INFO.toUpperCase()} logs.`);
    } else {
      console.log(`Errsole is NOT capturing ${LogLevel.INFO.toUpperCase()} logs.`);
    }
    if (this.collectLogs.includes(LogLevel.ERROR)) {
      this.interceptLogs(LogLevel.ERROR);
      console.log(`Errsole is capturing ${LogLevel.ERROR.toUpperCase()} logs.`);
    } else {
      console.log(`Errsole is NOT capturing ${LogLevel.ERROR.toUpperCase()} logs.`);
    }
  },
  createLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (logEntry, encoding, callback) => {
        this.storage.postLogs([logEntry]);
        setImmediate(callback);
      }
    });
  },
  createEmptyLogStream() {
    if (this.logStream) {
      this.logStream.destroy();
    }
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (logEntry, encoding, callback) => {
        setImmediate(callback);
      }
    });
  },
  interceptLogs(level) {
    let logStream;
    let originalWrite;
    switch (level) {
      case LogLevel.INFO:
        logStream = process.stdout;
        originalWrite = this.originalStdoutWrite;
        break;
      case LogLevel.ERROR:
        logStream = process.stderr;
        originalWrite = this.originalStderrWrite;
        break;
      default:
        return;
    }
    if (isBun) {
      const stdoutMethods = [
        "log",
        "info",
        "debug",
        "dir",
        "table",
        "count",
        "countReset",
        "time",
        "timeLog",
        "timeEnd",
        "group",
        "groupEnd"
      ];
      const stderrMethods = ["error", "warn", "trace"];
      stdoutMethods.forEach((method) => {
        console[method] = (...args) => {
          const message = args.map(
            (arg) => typeof arg === "object" ? JSON.stringify(arg) : arg
          ).join(" ");
          const logEntry = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            message,
            source: "console",
            level: LogLevel[method.toUpperCase()] || LogLevel.INFO,
            hostname: this.hostname,
            pid: this.pid
          };
          this.logStream.write(logEntry);
          Bun.write(Bun.stdout, `${args}
`);
        };
      });
      stderrMethods.forEach((method) => {
        console[method] = (...args) => {
          const message = args.map(
            (arg) => typeof arg === "object" ? JSON.stringify(arg) : arg
          ).join(" ");
          const logEntry = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            message,
            source: "console",
            level: LogLevel.ERROR,
            hostname: this.hostname,
            pid: this.pid
          };
          this.logStream.write(logEntry);
          Bun.write(Bun.stderr, `${args}
`);
        };
      });
      return;
    }
    logStream.write = (chunk, encoding, done) => {
      const cleanedChunk = stripAnsi(chunk.toString());
      const logEntry = {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        message: cleanedChunk,
        source: "console",
        level,
        hostname: this.hostname,
        pid: this.pid
      };
      this.logStream.write(logEntry);
      if (this.enableConsoleOutput || !this.isStorageReady) {
        originalWrite.call(logStream, chunk, encoding, done);
      } else if (done) {
        done();
      }
    };
  },
  async flushLogs(timeout = 5e3) {
    if (typeof this.storage.flushLogs === "function") {
      try {
        await Promise.race([
          this.storage.flushLogs(),
          new Promise((resolve, reject) => setTimeout(() => reject(new Error("flushLogs timed out")), timeout))
        ]);
      } catch (err) {
        console.error(err);
      }
    }
  },
  logCustomMessage(level, message, metadata, errsoleId, timestamp) {
    const logEntry = {
      timestamp: timestamp || (/* @__PURE__ */ new Date()).toISOString(),
      message,
      meta: metadata || "{}",
      source: "errsole",
      level,
      hostname: this.hostname,
      pid: this.pid,
      errsole_id: errsoleId
    };
    try {
      this.logStream.write(logEntry);
      if (!this.enableConsoleOutput) {
        return;
      }
      this.originalStdoutWrite.call(process.stdout, `${message}
`, "utf8");
    } catch (err) {
      console.error(err);
    }
  }
};
logCollector.resetConsoleOutput = function() {
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
