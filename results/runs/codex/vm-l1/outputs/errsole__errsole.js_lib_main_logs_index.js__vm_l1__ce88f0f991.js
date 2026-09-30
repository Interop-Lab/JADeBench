'use strict';

const stream = require('stream');
const stripAnsi = require('strip-ansi');
const os = require('os');

const pid = process.pid;
const isBun = typeof Bun !== 'undefined';
const LogLevel = {
  INFO: 'info',
  ERROR: 'error',
};

const logCollector = {
  storage: {},
  collectLogs: [LogLevel.INFO, LogLevel.ERROR],
  enableConsoleOutput: process.env.NODE_ENV !== 'production',
  hostname: os.hostname(),
  pid,
  isInitializationFailed: false,
  isStorageReady: false,
  originalStdoutWrite: process.stdout.write,
  originalStderrWrite: process.stderr.write,

  setInitializationTimeout() {
    this.initializationTimeoutId = setTimeout(() => {
      if (!this.isStorageReady) {
        this.isInitializationFailed = true;
        this.createEmptyLogStream();
      }
    }, 30000);
  },

  initialize() {
    const options = arguments[0];
    this.storage = options.storage;
    this.collectLogs = options.collectLogs || [LogLevel.INFO, LogLevel.ERROR];
    this.enableConsoleOutput = options.enableConsoleOutput === undefined
      ? this.enableConsoleOutput
      : options.enableConsoleOutput;
    this.hostname = options.serverName || os.hostname();

    this.storage.once('ready', () => {
      this.isStorageReady = true;
      clearTimeout(this.initializationTimeoutId);
      this.logStream.uncork();

      if (!this.enableConsoleOutput) {
        process.stdout.write = this.originalStdoutWrite;
        process.stderr.write = this.originalStderrWrite;
      } else {
        console.log('Note: Terminal output will be disabled after initial logs.');
      }

      this.collectLogs.forEach((level) => this.interceptLogs(level));
    });

    [LogLevel.INFO, LogLevel.ERROR].forEach((level) => {
      if (this.collectLogs.includes(level)) {
        this.interceptLogs(level);
        console.log(`Errsole is capturing ${level.toUpperCase()} logs.`);
      } else {
        console.log(`Errsole is NOT capturing ${level.toUpperCase()} logs.`);
      }
    });
  },

  createLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (log, encoding, callback) => this.storage.write(log, callback),
    });
  },

  createEmptyLogStream() {
    if (this.logStream) this.logStream.destroy();
    this.logStream = new stream.Writable({
      objectMode: true,
      write(log, encoding, callback) {
        callback();
      },
    });
  },

  interceptLogs(level) {
    if (level !== LogLevel.INFO && level !== LogLevel.ERROR) return;

    if (isBun) {
      const methods = level === LogLevel.INFO
        ? ['log', 'info', 'debug', 'dir', 'table', 'count', 'countReset', 'time', 'timeLog', 'timeEnd', 'group', 'groupEnd']
        : ['error', 'warn', 'trace'];
      methods.forEach((method) => {
        console[method] = (...args) => {
          const message = args.map((value) => typeof value === 'string' ? value : JSON.stringify(value)).join(' ');
          this.logCustomMessage(level, message);
        };
      });
      return;
    }

    const output = level === LogLevel.INFO ? process.stdout : process.stderr;
    const originalWrite = level === LogLevel.INFO ? this.originalStdoutWrite : this.originalStderrWrite;
    output.write = (chunk, encoding, callback) => {
      const message = stripAnsi(String(chunk)).replace(/\n$/, '');
      if (message) this.logCustomMessage(level, message);
      if (this.enableConsoleOutput) return originalWrite.call(output, chunk, encoding, callback);
      if (typeof callback === 'function') callback();
      return true;
    };
  },

  async flushLogs() {
    if (typeof this.storage.flushLogs !== 'function') return;
    try {
      await Promise.race([
        this.storage.flushLogs(),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    } catch (error) {
      console.error(error);
    }
  },

  logCustomMessage(level, message, meta, errsoleId, timestamp) {
    const log = {
      timestamp: timestamp || new Date().toISOString(),
      message,
      meta: meta || '{}',
      source: 'errsole',
      level,
      hostname: this.hostname,
      pid: this.pid,
      errsole_id: errsoleId,
    };

    this.logStream.write(log);

    if (this.enableConsoleOutput) {
      this.originalStdoutWrite.call(process.stdout, `${message}\n`, 'utf8', () => {});
    }
  },
};

logCollector.resetConsoleOutput = function resetConsoleOutput() {
  this.logStream.uncork();
  if (!this.enableConsoleOutput) {
    this.enableConsoleOutput = true;
    process.stdout.write = this.originalStdoutWrite;
    process.stderr.write = this.originalStderrWrite;
  }
};

globalThis.stream = stream;
globalThis.stripAnsi = stripAnsi;
globalThis.os = os;
globalThis.pid = pid;
globalThis.isBun = isBun;
globalThis.LogLevel = LogLevel;
globalThis.logCollector = logCollector;

logCollector.setInitializationTimeout();
logCollector.createLogStream();
logCollector.logStream.cork();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);

module.exports = logCollector;
