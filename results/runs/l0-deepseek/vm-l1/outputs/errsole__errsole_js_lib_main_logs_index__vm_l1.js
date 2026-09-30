'use strict';

const stream = require('stream');
const stripAnsi = require('strip-ansi');
const os = require('os');

const pid = process.pid;
const isBun = typeof Bun !== 'undefined';

const LogLevel = {
  INFO: 'INFO',
  ERROR: 'ERROR'
};

const logCollector = {
  storage: {},
  collectLogs: [LogLevel.INFO, LogLevel.ERROR],
  enableConsoleOutput: process.env.NODE_ENV !== 'production',
  hostname: os.hostname(),
  pid: pid,
  isInitializationFailed: false,
  isStorageReady: false,
  originalStdoutWrite: process.stdout.write,
  originalStderrWrite: process.stderr.write,

  setInitializationTimeout() {
    this.storage.cork();
    if (!this.isInitializationFailed) {
      this.isInitializationFailed = true;
      process.stdout.write = this.originalStdoutWrite;
      process.stderr.write = this.originalStderrWrite;
    }
  },

  initialize() {
    this.setInitializationTimeout();
  },

  createLogStream() {
    return new stream.PassThrough();
  },

  createEmptyLogStream() {
    return new stream.PassThrough();
  },

  interceptLogs(stream) {
    this.storage.cork();
    this.storage.pipe(stream);
  },

  flushLogs() {
    this.storage.uncork();
  },

  logCustomMessage(level, message, data, error, timestamp) {
    if (!this.collectLogs.includes(level)) return;
    const entry = {
      level,
      message,
      data,
      error,
      timestamp: timestamp || new Date().toISOString()
    };
    this.storage.write(JSON.stringify(entry) + '\n');
  }
};

logCollector.initialize();
logCollector.setInitializationTimeout();
logCollector.storage.cork();
logCollector.logCustomMessage(LogLevel.INFO);
logCollector.logCustomMessage(LogLevel.ERROR);

module.exports = logCollector;
