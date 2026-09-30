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
      console.error('Errsole storage initialization timed out.');
    }, 30000);
  },

  initialize(options = {}) {
    if (options.storage) this.storage = options.storage;
    if (options.collectLogs) this.collectLogs = options.collectLogs;
    if (typeof options.enableConsoleOutput === 'boolean') {
      this.enableConsoleOutput = options.enableConsoleOutput;
    }
    if (options.serverName) this.hostname = options.serverName;

    if (this.storage && typeof this.storage.once === 'function') {
      this.storage.once('ready', () => {
        clearTimeout(this.initializationTimeoutId);
        this.isStorageReady = true;
        this.logStream.uncork();
      });
    }

    if (!this.enableConsoleOutput) {
      console.log('Note: Terminal output will be disabled after initial logs.');
    }
    console.log(`Errsole is ${this.collectLogs.includes(LogLevel.INFO) ? '' : 'NOT '}capturing INFO logs.`);
    console.log(`Errsole is ${this.collectLogs.includes(LogLevel.ERROR) ? '' : 'NOT '}capturing ERROR logs.`);
  },

  createLogStream() {
    return new stream.Writable({
      objectMode: true,
      write: (log, _encoding, callback) => {
        if (!this.isStorageReady || !this.storage || typeof this.storage.postLogs !== 'function') {
          return callback();
        }
        try {
          Promise.resolve(this.storage.postLogs([log])).then(
            () => callback(),
            callback,
          );
        } catch (error) {
          callback(error);
        }
      },
    });
  },

  createEmptyLogStream() {
    if (this.logStream && typeof this.logStream.destroy === 'function') this.logStream.destroy();
    this.logStream = new stream.Writable({
      objectMode: true,
      write(_log, _encoding, callback) {
        callback();
      },
    });
  },

  interceptLogs(level) {
    const output = level === LogLevel.INFO ? process.stdout : process.stderr;
    const originalWrite = level === LogLevel.INFO
      ? this.originalStdoutWrite
      : this.originalStderrWrite;

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
      if (callback) setImmediate(callback);
      return true;
    };
  },

  async flushLogs(timeout = 5000) {
    if (!this.storage || typeof this.storage.flushLogs !== 'function') return;
    try {
      await Promise.race([
        this.storage.flushLogs(),
        new Promise((_resolve, reject) => setTimeout(
          () => reject(new Error('Log flushing timed out.')),
          timeout,
        )),
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

    try {
      this.logStream.write(log);
      if (!this.enableConsoleOutput) return;
      this.originalStdoutWrite.call(process.stdout, `${message}\n`, 'utf8');
    } catch (error) {
      console.error(error);
    }
  },
};

logCollector.resetConsoleOutput = function resetConsoleOutput() {
  this.logStream.uncork();
  if (!this.isStorageReady) {
    process.stdout.write = this.originalStdoutWrite;
    process.stderr.write = this.originalStderrWrite;
  }
};

logCollector.setInitializationTimeout();
logCollector.logStream = logCollector.createLogStream();
logCollector.logStream.cork();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);

module.exports = logCollector;
