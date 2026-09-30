'use strict';

const stream = require('stream');
const stripAnsi = require('strip-ansi');
const os = require('os');

const LogLevel = {
  INFO: 'info',
  ERROR: 'error'
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
    this.initializationTimeout = setTimeout(() => {
      this.createEmptyLogStream();
      this.isInitializationFailed = true;
      console.error(
        'Errsole initialization timed out. Please ensure that the storage adapter is configured correctly.'
      );
    }, 30000);
  },

  initialize(options = {}) {
    this.storage = options.storage;
    this.collectLogs = options.collectLogs || [
      LogLevel.INFO,
      LogLevel.ERROR
    ];

    if (typeof options.enableConsoleOutput === 'boolean') {
      this.enableConsoleOutput = options.enableConsoleOutput;
    }

    this.hostname = options.hostname || os.hostname();

    if (this.storage && typeof this.storage.on === 'function') {
      this.storage.on('ready', () => {
        clearTimeout(this.initializationTimeout);

        if (this.isInitializationFailed) {
          this.createLogStream();
          this.isInitializationFailed = false;
        } else {
          this.createLogStream();
        }

        this.isStorageReady = true;
      });
    }

    if (this.collectLogs.includes(LogLevel.INFO)) {
      this.interceptLogs(LogLevel.INFO);
    } else {
      process.stdout.write = this.originalStdoutWrite;
    }

    if (this.collectLogs.includes(LogLevel.ERROR)) {
      this.interceptLogs(LogLevel.ERROR);
    } else {
      process.stderr.write = this.originalStderrWrite;
    }
  },

  createLogStream() {
    if (this.logStream) {
      this.logStream.destroy();
    }

    this.logStream = new stream.Writable({
      objectMode: true,
      write: (log, encoding, callback) => {
        this.storage.push([log]);
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
      write: (log, encoding, callback) => {
        setImmediate(callback);
      }
    });
  },

  interceptLogs(level) {
    let output;
    let originalWrite;

    switch (level) {
      case LogLevel.ERROR:
        output = process.stderr;
        originalWrite = this.originalStderrWrite;
        break;
      case LogLevel.INFO:
        output = process.stdout;
        originalWrite = this.originalStdoutWrite;
        break;
      default:
        return;
    }

    if (typeof Bun !== 'undefined') {
      const methods = level === LogLevel.ERROR
        ? ['error', 'warn', 'assert']
        : [
            'log',
            'info',
            'debug',
            'trace',
            'table',
            'dir',
            'dirxml',
            'group',
            'groupCollapsed',
            'groupEnd',
            'timeLog'
          ];

      const bunOutput = level === LogLevel.ERROR ? Bun.stderr : Bun.stdout;

      methods.forEach(method => {
        console[method] = (...args) => {
          const message = args
            .map(value =>
              typeof value === 'object' ? JSON.stringify(value) : value
            )
            .join(' ');

          this.logStream.write({
            timestamp: new Date().toISOString(),
            message,
            source: 'console',
            level:
              LogLevel[String(method).toUpperCase()] || level,
            hostname: this.hostname,
            pid: this.pid
          });

          if (
            this.isInitializationFailed ||
            !this.isStorageReady ||
            this.enableConsoleOutput
          ) {
            Bun.write(bunOutput, `${args}\n`);
          }
        };
      });

      return;
    }

    output.write = (chunk, encoding, callback) => {
      const message = stripAnsi(chunk.toString());

      this.logStream.write({
        timestamp: new Date().toISOString(),
        message,
        source: 'console',
        level,
        hostname: this.hostname,
        pid: this.pid
      });

      if (
        this.isInitializationFailed ||
        !this.isStorageReady ||
        this.enableConsoleOutput
      ) {
        return originalWrite.call(output, chunk, encoding, callback);
      }

      if (typeof encoding === 'function') {
        callback = encoding;
      }

      if (typeof callback === 'function') {
        setImmediate(callback);
      }

      return true;
    };
  },

  async flushLogs(timeout = 5000) {
    if (
      this.storage &&
      typeof this.storage.flushLogs === 'function'
    ) {
      try {
        await Promise.race([
          this.storage.flushLogs(),
          new Promise((resolve, reject) => {
            setTimeout(
              () => reject(new Error('Timed out while flushing logs')),
              timeout
            );
          })
        ]);
      } catch (error) {
        console.error(error);
      }
    }
  },

  logCustomMessage(level, message, meta, errsoleId, timestamp) {
    const log = {
      timestamp: timestamp || new Date().toISOString(),
      message,
      meta: meta || '{}',
      source: 'custom',
      level,
      hostname: this.hostname,
      pid: this.pid,
      errsole_id: errsoleId
    };

    try {
      this.logStream.write(log);

      if (!this.enableConsoleOutput) {
        return;
      }

      this.originalStdoutWrite.call(process.stdout, `${message}\n`);
    } catch (error) {
      console.error(error);
    }
  },

  restoreConsoleOutput() {
    this.logStream.end();

    if (!this.isInitializationFailed) {
      this.isInitializationFailed = true;
      process.stdout.write = this.originalStdoutWrite;
      process.stderr.write = this.originalStderrWrite;
    }
  }
};

logCollector.setInitializationTimeout();
logCollector.createEmptyLogStream();
logCollector.logStream.resume();
logCollector.interceptLogs(LogLevel.ERROR);
logCollector.interceptLogs(LogLevel.INFO);

module.exports = logCollector;
