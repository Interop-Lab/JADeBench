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

const INFO_CONSOLE_METHODS = [
  'log', 'info', 'debug', 'dir', 'table', 'count', 'countReset',
  'time', 'timeLog', 'timeEnd', 'group', 'groupEnd',
];
const ERROR_CONSOLE_METHODS = ['error', 'warn', 'trace'];

function serializeConsoleArgument(value) {
  return typeof value === 'object' ? JSON.stringify(value) : value;
}

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
      this.createEmptyLogStream();
      this.isInitializationFailed = true;
      console.error('Error: Unable to initialize Errsole');
    }, 30000);
  },

  initialize(options = {}) {
    this.storage = options.storage;
    this.collectLogs = options.collectLogs || [LogLevel.INFO, LogLevel.ERROR];

    if (options.enableConsoleOutput !== undefined) {
      this.enableConsoleOutput = options.enableConsoleOutput;
    }

    this.hostname = options.serverName || os.hostname();

    this.storage.once('ready', () => {
      clearTimeout(this.initializationTimeoutId);
      if (this.isInitializationFailed) {
        this.createLogStream();
        this.isInitializationFailed = false;
      }
      this.logStream.uncork();
      this.isStorageReady = true;
    });

    if (!this.enableConsoleOutput) {
      process.stdout.write = () => true;
      process.stderr.write = () => true;
    } else {
      console.log('Note: Terminal output will be disabled after initial logs.');
    }

    for (const level of [LogLevel.INFO, LogLevel.ERROR]) {
      if (this.collectLogs.includes(level)) {
        this.interceptLogs(level);
        console.log('Errsole is capturing ' + level.toUpperCase() + ' logs.');
      } else {
        console.log('Errsole is NOT capturing ' + level.toUpperCase() + ' logs.');
      }
    }
  },

  createLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (log, _encoding, callback) => {
        this.storage.postLogs(log);
        setImmediate(callback);
      },
    });
  },

  createEmptyLogStream() {
    if (this.logStream) {
      this.logStream.destroy();
    }

    this.logStream = new stream.Writable({
      objectMode: true,
      write(_log, _encoding, callback) {
        process.nextTick(callback);
      },
    });
  },

  interceptLogs(level) {
    const isInfo = level === LogLevel.INFO;
    const isError = level === LogLevel.ERROR;
    if (!isInfo && !isError) return;

    const output = isInfo ? process.stdout : process.stderr;
    const originalWrite = isInfo ? this.originalStdoutWrite : this.originalStderrWrite;
    const methods = isInfo ? INFO_CONSOLE_METHODS : ERROR_CONSOLE_METHODS;

    output.write = (chunk, encoding, callback) => {
      const message = stripAnsi(chunk.toString());
      this.logStream.write({
        timestamp: new Date().toISOString(),
        message,
        source: 'console',
        level,
        hostname: this.hostname,
        pid: this.pid,
      });

      if (this.enableConsoleOutput || !this.isStorageReady) {
        return originalWrite.call(output, chunk, encoding, callback);
      }
      if (typeof callback === 'function') callback();
      return true;
    };

    if (isBun) return;

    methods.forEach(method => {
      console[method] = (...args) => {
        const message = Array.prototype.slice.call(args)
          .map(serializeConsoleArgument)
          .join(' ');
        this.logStream.write({
          timestamp: new Date().toISOString(),
          message,
          source: 'console',
          level,
          hostname: this.hostname,
          pid: this.pid,
        });

        if (this.enableConsoleOutput) {
          originalWrite.call(output, message + '\n');
        }
      };
    });
  },

  async flushLogs() {
    try {
      if (typeof this.storage.flushLogs !== 'function') return;

      await Promise.race([
        this.storage.flushLogs(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('flushLogs timed out')), 5000);
        }),
      ]);
    } catch (error) {
      console.error(error);
    }
  },

  logCustomMessage(level, message, meta, errsoleId, callback) {
    const log = {
      timestamp: new Date().toISOString(),
      message,
      meta: meta || '{}',
      source: 'errsole',
      level,
      hostname: this.hostname,
      pid: this.pid,
      errsole_id: errsoleId,
    };

    try {
      this.logStream.write(log, callback);
      if (this.enableConsoleOutput) {
        this.originalStdoutWrite.call(process.stdout, (message || '') + '\n', 'utf8');
      }
    } catch (error) {
      console.error(error);
    }
  },

  resetConsoleOutput() {
    this.logStream.uncork();
    if (!this.enableConsoleOutput) {
      this.enableConsoleOutput = true;
      process.stdout.write = this.originalStdoutWrite;
      process.stderr.write = this.originalStderrWrite;
    }
  },
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
