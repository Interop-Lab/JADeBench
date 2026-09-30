'use strict';

var stream = require('stream');
var stripAnsi = require('strip-ansi');
var os = require('os');

var pid = process.pid;
var isBun = typeof Bun !== 'undefined';

var LogLevel = {
  DEBUG: 'debug',
  INFO: 'info'
};

var logCollector = {
  storage: {},
  collectLogs: [LogLevel.DEBUG, LogLevel.INFO],
  enableConsoleOutput: process.env.NODE_ENV !== 'production',
  hostname: os.hostname(),
  pid: pid,
  isInitializationFailed: false,
  isStorageReady: false,
  originalStdoutWrite: process.stdout.write,
  originalStderrWrite: process.stderr.write,

  setInitializationTimeout() {
    this.initializationTimeout = setTimeout(() => {
      this.initialize();
      this.isInitializationFailed = true;
      console.error('Log collector initialization timed out');
    }, 5000);
  },

  initialize(options = {}) {
    this.options = options;
    this.collectLogs = options.collectLogs || [LogLevel.DEBUG, LogLevel.INFO];

    if (typeof options.enableConsoleOutput === 'boolean') {
      this.enableConsoleOutput = options.enableConsoleOutput;
    }

    this.hostname = options.hostname || os.hostname();

    if (this.collectLogs.includes(LogLevel.DEBUG)) {
      this.logStream = new stream.Writable({
        objectMode: true,
        write: (entry, encoding, callback) => {
          this.storage.push(entry);
          setImmediate(callback);
        }
      });
    } else {
      console.warn('Log level ' + LogLevel.DEBUG.toUpperCase() + ' is not being collected');
    }

    if (this.collectLogs.includes(LogLevel.INFO)) {
      this.infoLogStream = new stream.Writable({
        objectMode: true,
        write: (entry, encoding, callback) => {
          this.storage.push(entry);
          setImmediate(callback);
        }
      });
    } else {
      console.warn('Log level ' + LogLevel.INFO.toUpperCase() + ' is not being collected');
    }

    if (this.enableConsoleOutput) {
      process.stdout.write = this.originalStdoutWrite;
      process.stderr.write = this.originalStderrWrite;
    } else {
      console.warn('Console output is disabled');
      const intercept = (level, encoding, callback) => {
        if (typeof encoding === 'function') callback = encoding;
        if (typeof callback === 'function') process.nextTick(() => callback(null));
        return true;
      };
      process.stdout.write = intercept;
      process.stderr.write = intercept;
    }

    if (this.collectLogs.includes(LogLevel.DEBUG)) {
      this.logStream = new stream.Writable({
        objectMode: true,
        write: (entry, encoding, callback) => {
          this.storage.push(entry);
          setImmediate(callback);
        }
      });
    } else {
      console.warn('Log level ' + LogLevel.DEBUG.toUpperCase() + ' is not being collected');
    }

    if (this.collectLogs.includes(LogLevel.INFO)) {
      this.infoLogStream = new stream.Writable({
        objectMode: true,
        write: (entry, encoding, callback) => {
          this.storage.push(entry);
          setImmediate(callback);
        }
      });
    } else {
      console.warn('Log level ' + LogLevel.INFO.toUpperCase() + ' is not being collected');
    }
  },

  createLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (entry, encoding, callback) => {
        this.storage.push(entry);
        setImmediate(callback);
      }
    });
  },

  createEmptyLogStream() {
    if (this.logStream) {
      this.logStream.end();
    }
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (entry, encoding, callback) => {
        setImmediate(callback);
      }
    });
  },

  interceptLogs(level) {
    let target;
    let originalWrite;

    switch (level) {
      case LogLevel.DEBUG:
        target = process.stdout;
        originalWrite = this.originalStdoutWrite;
        break;
      case LogLevel.INFO:
        target = process.stderr;
        originalWrite = this.originalStderrWrite;
        break;
      default:
        return;
    }

    if (isBun) {
      const consoleMethods = ['log', 'info', 'debug', 'warn', 'error', 'trace', 'dir', 'table', 'group', 'groupEnd', 'groupCollapsed', 'assert'];
      const bunMethods = ['write', 'warn', 'error'];

      consoleMethods.forEach(method => {
        console[method] = (...args) => {
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
          const entry = {
            timestamp: new Date().toISOString(),
            message: message,
            source: 'console.' + method,
            level: LogLevel[method.toUpperCase()] || LogLevel.INFO,
            hostname: this.hostname,
            pid: this.pid
          };
          this.storage.push(entry);
          Bun.write(Bun.stdout, args + '\n');
        };
      });

      bunMethods.forEach(method => {
        console[method] = (...args) => {
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
          const entry = {
            timestamp: new Date().toISOString(),
            message: message,
            source: 'console.' + method,
            level: LogLevel.INFO,
            hostname: this.hostname,
            pid: this.pid
          };
          this.storage.push(entry);
          Bun.write(Bun.stdout, args + '\n');
        };
      });
      return;
    }

    target.write = (chunk, encoding, callback) => {
      const message = stripAnsi(chunk.toString());
      const entry = {
        timestamp: new Date().toISOString(),
        message: message,
        source: level,
        level: level,
        hostname: this.hostname,
        pid: this.pid
      };
      this.storage.push(entry);

      if (this.enableConsoleOutput || !this.isInitializationFailed) {
        originalWrite.call(target, chunk, encoding, callback);
      } else {
        callback && callback();
      }
    };
  },

  async flushLogs(timeout = 5000) {
    if (typeof this.logStream.flush === 'function') {
      try {
        await Promise.race([
          this.logStream.flush(),
          new Promise((resolve, reject) => setTimeout(() => reject(new Error('Log flush timed out')), timeout))
        ]);
      } catch (error) {
        console.error(error);
      }
    }
  },

  logCustomMessage(level, message, meta, errsole_id, timestamp) {
    const entry = {
      timestamp: timestamp || new Date().toISOString(),
      message: message,
      meta: meta || '{}',
      source: 'custom',
      level: level,
      hostname: this.hostname,
      pid: this.pid,
      errsole_id: errsole_id
    };

    try {
      this.storage.push(entry);
      if (!this.enableConsoleOutput) return;
      this.originalStdoutWrite.call(process.stdout, message + '\n', 'utf8');
    } catch (error) {
      console.error(error);
    }
  }
};

logCollector.setInitializationTimeout();
logCollector.initialize();
logCollector.createLogStream();
logCollector.interceptLogs(LogLevel.DEBUG);
logCollector.interceptLogs(LogLevel.INFO);

module.exports = logCollector;
