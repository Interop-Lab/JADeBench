'use strict';

const stream = require('stream');
const stripAnsi = require('strip-ansi');
const os = require('os');

const LogLevel = {
  INFO: 'info',
  ERROR: 'error',
};

const isBun = typeof Bun !== 'undefined';

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
      console.error('Error: Unable to initialize Errsole');
    }, 30_000);
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
      console.log('Note: Terminal output will be disabled after initial logs.');

      const discardOutput = (chunk, encoding, callback) => {
        if (typeof encoding === 'function') callback = encoding;
        if (typeof callback === 'function') {
          process.nextTick(() => callback(null));
        }
        return true;
      };

      process.stdout.write = discardOutput;
      process.stderr.write = discardOutput;
    }

    if (this.collectLogs.includes(LogLevel.INFO)) {
      this.interceptLogs(LogLevel.INFO);
      console.log('Errsole is capturing INFO logs.');
    } else {
      console.log('Errsole is NOT capturing INFO logs.');
    }

    if (this.collectLogs.includes(LogLevel.ERROR)) {
      this.interceptLogs(LogLevel.ERROR);
      console.log('Errsole is capturing ERROR logs.');
    } else {
      console.log('Errsole is NOT capturing ERROR logs.');
    }
  },

  createLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (log, encoding, callback) => {
        this.storage.postLogs([log]);
        setImmediate(callback);
      },
    });
  },

  createEmptyLogStream() {
    if (this.logStream) this.logStream.destroy();

    this.logStream = new stream.Writable({
      objectMode: true,
      write: (log, encoding, callback) => {
        setImmediate(callback);
      },
    });
  },

  interceptLogs(level) {
    let output;
    let originalWrite;

    switch (level) {
      case LogLevel.INFO:
        output = process.stdout;
        originalWrite = this.originalStdoutWrite;
        break;
      case LogLevel.ERROR:
        output = process.stderr;
        originalWrite = this.originalStderrWrite;
        break;
      default:
        return;
    }

    if (isBun) {
      const infoMethods = [
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
      ];
      const errorMethods = ['error', 'warn', 'trace'];

      infoMethods.forEach(method => {
        console[method] = (...args) => {
          const message = args
            .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
            .join(' ');
          const log = {
            timestamp: new Date().toISOString(),
            message,
            source: 'console',
            level: LogLevel[method.toUpperCase()] || LogLevel.INFO,
            hostname: this.hostname,
            pid: this.pid,
          };

          this.logStream.write(log);
          Bun.write(Bun.stdout, `${args}\n`);
        };
      });

      errorMethods.forEach(method => {
        console[method] = (...args) => {
          const message = args
            .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
            .join(' ');
          const log = {
            timestamp: new Date().toISOString(),
            message,
            source: 'console',
            level: LogLevel.ERROR,
            hostname: this.hostname,
            pid: this.pid,
          };

          this.logStream.write(log);
          Bun.write(Bun.stderr, `${args}\n`);
        };
      });
      return;
    }

    output.write = (chunk, encoding, callback) => {
      const log = {
        timestamp: new Date().toISOString(),
        message: stripAnsi(chunk.toString()),
        source: 'console',
        level,
        hostname: this.hostname,
        pid: this.pid,
      };

      this.logStream.write(log);

      if (this.enableConsoleOutput || !this.isStorageReady) {
        originalWrite.call(output, chunk, encoding, callback);
      } else if (callback) {
        callback();
      }
    };
  },

  async flushLogs(timeout = 5_000) {
    if (typeof this.storage.flushLogs === 'function') {
      try {
        await Promise.race([
          this.storage.flushLogs(),
          new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('flushLogs timed out')), timeout);
          }),
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
