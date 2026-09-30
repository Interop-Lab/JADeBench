'use strict';

const stream = require('stream');
const stripAnsi = require('strip-ansi');
const os = require('os');

const LogLevel = {
  INFO: 'info',
  ERROR: 'error',
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
      this.createEmptyLogStream();
      this.isInitializationFailed = true;
    }, 5000);
  },

  initialize(options = {}) {
    this.storage = options.storage || this.storage;
    this.collectLogs = options.collectLogs || this.collectLogs;
    this.enableConsoleOutput = options.enableConsoleOutput ?? this.enableConsoleOutput;
    this.hostname = options.serverName || this.hostname;

    if (this.storage && typeof this.storage.once === 'function') {
      this.storage.once('ready', () => {
        this.isStorageReady = true;
        this.createLogStream();
        clearTimeout(this.initializationTimeoutId);
      });
    }
    return this;
  },

  createLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (record, encoding, callback) => {
        this.storage.insert([record]);
        setImmediate(callback);
      },
    });
  },

  createEmptyLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write(record, encoding, callback) {
        setImmediate(callback);
      },
    });
  },

  interceptLogs(level) {
    const collector = this;
    const output = level === LogLevel.ERROR ? process.stderr : process.stdout;
    const originalWrite = level === LogLevel.ERROR ? this.originalStderrWrite : this.originalStdoutWrite;
    output.write = function interceptedWrite(chunk, encoding, callback) {
      capture(collector, level, chunk);
      if (collector.enableConsoleOutput) return originalWrite.call(output, chunk, encoding, callback);
      if (typeof callback === 'function') callback();
      return true;
    };
  },

  async flushLogs(timeout = 3000) {
    if (!this.logStream || typeof this.logStream.flush !== 'function') return;
    try {
      await Promise.race([
        this.logStream.flush(),
        new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('Log flush timed out')), timeout);
        }),
      ]);
    } catch (error) {
      console.error(error);
    }
  },

  logCustomMessage(level, message, meta, errsoleId, timestamp) {
    const record = {
      timestamp: timestamp || new Date().toISOString(),
      message,
      meta: meta || '{}',
      source: 'custom',
      level,
      hostname: this.hostname,
      pid: this.pid,
      errsole_id: errsoleId,
    };
    try {
      this.logStream.write(record);
      if (this.enableConsoleOutput) this.originalStdoutWrite.call(process.stdout, `${message}\n`, 'utf8');
    } catch (error) {
      console.error(error);
    }
  },

  resetConsoleOutput() {
    this.logStream.end();
    if (!this.enableConsoleOutput) {
      this.enableConsoleOutput = true;
      process.stdout.write = this.originalStdoutWrite;
      process.stderr.write = this.originalStderrWrite;
    }
  },
};

function capture(collector, level, chunk) {
  if (!collector.collectLogs.includes(level) || !collector.logStream) return;
  const message = stripAnsi(Buffer.isBuffer(chunk) ? chunk.toString() : String(chunk)).trimEnd();
  if (!message) return;
  collector.logStream.write({
    timestamp: new Date().toISOString(),
    message,
    source: 'console',
    level,
    hostname: collector.hostname,
    pid: collector.pid,
  });
}

logCollector.setInitializationTimeout();
logCollector.createEmptyLogStream();
logCollector.logStream.end();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);

module.exports = logCollector;
