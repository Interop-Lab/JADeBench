'use strict';

const { Writable } = require('stream');
const stripAnsi = require('strip-ansi');
const os = require('os');

const LogLevel = { INFO: 'info', ERROR: 'error' };
const isBun = typeof Bun !== 'undefined';

function formatMessage(parts) {
  return parts
    .map((part) => (typeof part === 'object' ? JSON.stringify(part) : part))
    .join(' ');
}

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
    this.initializationTimeout = setTimeout(() => {
      this.createEmptyLogStream();
      this.isInitializationFailed = true;
      console.error('Error: Unable to initialize Errsole');
    }, 30000);
  },

  initialize(options = {}) {
    this.storage = options.storage;
    this.collectLogs = options.collectLogs || [LogLevel.INFO, LogLevel.ERROR];
    if (typeof options.enableConsoleOutput !== 'undefined') {
      this.enableConsoleOutput = options.enableConsoleOutput;
    }
    this.hostname = options.serverName || os.hostname();

    if (this.storage.once) {
      this.storage.once('ready', () => {
        clearTimeout(this.initializationTimeout);
        if (this.isInitializationFailed) {
          this.createLogStream();
          this.isInitializationFailed = false;
        } else {
          this.logStream.uncork();
        }
        this.isStorageReady = true;
      });
    }

    if (!this.enableConsoleOutput) {
      console.log('Note: Terminal output will be disabled after initial logs.');
      const discardOutput = (chunk, encoding, callback) => {
        if (typeof encoding === 'function') callback = encoding;
        if (typeof callback === 'function') process.nextTick(() => callback(null));
        return true;
      };
      process.stdout.write = discardOutput;
      process.stderr.write = discardOutput;
    }

    for (const level of [LogLevel.INFO, LogLevel.ERROR]) {
      if (this.collectLogs.includes(level)) {
        this.interceptLogs(level);
        console.log(`Errsole is capturing ${level.toUpperCase()} logs.`);
      } else {
        console.log(`Errsole is NOT capturing ${level.toUpperCase()} logs.`);
      }
    }
  },

  createLogStream() {
    this.logStream = new Writable({
      objectMode: true,
      write: (entry, encoding, callback) => {
        this.storage.postLogs([entry]);
        setImmediate(callback);
      },
    });
  },

  createEmptyLogStream() {
    if (this.logStream) this.logStream.end();
    this.logStream = new Writable({
      objectMode: true,
      write(entry, encoding, callback) {
        setImmediate(callback);
      },
    });
  },

  interceptLogs(level) {
    let output;
    let originalWrite;
    if (level === LogLevel.INFO) {
      output = process.stdout;
      originalWrite = this.originalStdoutWrite;
    } else if (level === LogLevel.ERROR) {
      output = process.stderr;
      originalWrite = this.originalStderrWrite;
    } else {
      return;
    }

    if (isBun) {
      const methods = level === LogLevel.INFO
        ? ['log', 'info', 'debug', 'trace', 'dir', 'table', 'time', 'timeEnd', 'group', 'groupEnd', 'count', 'countReset']
        : ['error', 'warn', 'assert'];
      for (const method of methods) {
        console[method] = (...parts) => {
          this.logStream.write({
            timestamp: new Date().toISOString(),
            message: formatMessage(parts),
            source: 'console',
            level: LogLevel[method.toUpperCase()] || level,
            hostname: this.hostname,
            pid: this.pid,
          });
          Bun.write(level === LogLevel.INFO ? Bun.stdout : Bun.stderr, `${parts}\n`);
        };
      }
      return;
    }

    output.write = (chunk, encoding, callback) => {
      this.logStream.write({
        timestamp: new Date().toISOString(),
        message: stripAnsi(chunk.toString()),
        source: 'console',
        level,
        hostname: this.hostname,
        pid: this.pid,
      });
      if (this.isInitializationFailed || !this.isStorageReady) {
        return originalWrite.call(output, chunk, encoding, callback);
      }
      if (typeof callback === 'function') setImmediate(callback);
      return true;
    };
  },

  async flushLogs(timeout = 5000) {
    if (typeof this.storage.flushLogs !== 'function') return;
    try {
      await Promise.race([
        this.storage.flushLogs(),
        new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('Flush logs timeout')), timeout);
        }),
      ]);
    } catch (error) {
      console.error(error);
    }
  },

  logCustomMessage(level, message, meta, errsoleId, timestamp) {
    const entry = {
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
      this.logStream.write(entry);
      if (this.enableConsoleOutput) {
        this.originalStdoutWrite.call(process.stdout, `${message}\n`, 'utf8');
      }
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

logCollector.setInitializationTimeout();
logCollector.createLogStream();
logCollector.logStream.cork();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);

module.exports = logCollector;
