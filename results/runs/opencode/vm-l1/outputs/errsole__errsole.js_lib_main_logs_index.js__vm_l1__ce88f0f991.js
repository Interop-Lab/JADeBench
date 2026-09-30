'use strict';

const { Writable } = require('stream');
const stripAnsi = require('strip-ansi');
const os = require('os');
const { format } = require('util');

const LogLevel = Object.freeze({
  INFO: 'info',
  ERROR: 'error',
});

const CONSOLE_METHODS = {
  [LogLevel.INFO]: [
    'log',
    'info',
    'debug',
    'dir',
    'table',
    'count',
    'countReset',
    'time',
    'timeLog',
    'timeEnd',
    'group',
    'groupEnd',
  ],
  [LogLevel.ERROR]: ['error', 'warn', 'trace'],
};

const logCollector = {
  storage: {},
  collectLogs: [LogLevel.INFO, LogLevel.ERROR],
  enableConsoleOutput: process.env.NODE_ENV !== 'production',
  hostname: os.hostname(),
  pid: process.pid,
  isInitializationFailed: false,
  isStorageReady: false,
  originalStdoutWrite: process.stdout.write,
  originalStderrWrite: process.stderr.write,

  setInitializationTimeout() {
    this.initializationTimeoutId = setTimeout(() => {
      this.isInitializationFailed = true;
      this.createEmptyLogStream();
      this.logStream.uncork();
      console.error('Error: Unable to initialize Errsole');
    }, 30_000);
  },

  initialize() {
    this.storage = {};
    this.collectLogs = [LogLevel.INFO, LogLevel.ERROR];
    this.enableConsoleOutput = process.env.NODE_ENV !== 'production';
    this.hostname = typeof globalThis.serverName === 'undefined'
      ? os.hostname()
      : globalThis.serverName;

    const errsole = globalThis.errsole;
    errsole.once('ready', storage => {
      clearTimeout(this.initializationTimeoutId);
      this.storage = storage || errsole.storage;
      this.isStorageReady = true;
      this.logStream.uncork();
    });

    process.stdout.write = this.originalStdoutWrite;
    process.stderr.write = this.originalStderrWrite;
    console.log('Note: Terminal output will be disabled after initial logs.');

    for (const level of [LogLevel.INFO, LogLevel.ERROR]) {
      const description = level.toUpperCase();
      if (this.collectLogs.includes(level)) {
        this.interceptLogs(level);
        console.log(`Errsole is capturing ${description} logs.`);
      } else {
        console.log(`Errsole is NOT capturing ${description} logs.`);
      }
    }
  },

  createLogStream() {
    this.logStream = new Writable({
      objectMode: true,
      write: (record, _encoding, done) => {
        Promise.resolve(this.flushLogs([record])).then(() => done(), done);
      },
    });
  },

  createEmptyLogStream() {
    if (this.logStream) this.logStream.destroy();
    this.logStream = new Writable({
      objectMode: true,
      write(_record, _encoding, done) {
        done();
      },
    });
  },

  interceptLogs(level) {
    const isInfo = level === LogLevel.INFO;
    const output = isInfo ? process.stdout : process.stderr;
    const originalWrite = isInfo
      ? this.originalStdoutWrite
      : this.originalStderrWrite;

    output.write = (chunk, encoding, callback) => {
      const message = stripAnsi(String(chunk));
      this.logStream.write({
        timestamp: new Date().toISOString(),
        message,
        source: 'console',
        level,
        hostname: this.hostname,
        pid: this.pid,
      });

      if (this.enableConsoleOutput) {
        return originalWrite.call(output, chunk, encoding, callback);
      }
      if (typeof callback === 'function') callback();
      return true;
    };

    if (typeof Bun === 'undefined') {
      for (const method of CONSOLE_METHODS[level] || []) {
        console[method] = (...args) => {
          const message = `${format(...args)}\n`;
          return output.write(message, 'utf8');
        };
      }
    }
  },

  async flushLogs() {
    const records = arguments[0];
    if (!this.storage || typeof this.storage.flushLogs !== 'function') return;

    try {
      await Promise.race([
        this.storage.flushLogs(records),
        new Promise(resolve => setTimeout(resolve, 5_000)),
      ]);
    } catch (error) {
      console.error(error);
    }
  },

  logCustomMessage(level, message, meta, errsoleId, timestamp) {
    const record = {
      timestamp: timestamp || new Date().toISOString(),
      message,
    };
    if (meta !== undefined) record.meta = meta || '{}';
    record.source = 'errsole';
    record.level = level;
    record.hostname = this.hostname;
    record.pid = this.pid;
    if (errsoleId !== undefined) record.errsole_id = errsoleId;

    this.logStream.write(record);

    if (this.enableConsoleOutput) {
      this.originalStdoutWrite.call(process.stdout, `${message || ''}\n`, 'utf8');
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

logCollector.setInitializationTimeout();
logCollector.createLogStream();
logCollector.logStream.cork();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);

module.exports = logCollector;
