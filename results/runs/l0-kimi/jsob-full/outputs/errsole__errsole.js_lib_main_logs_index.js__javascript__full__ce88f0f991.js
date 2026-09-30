'use strict';
var stream = require('stream'), stripAnsi = require('strip-ansi'), os = require('os');
var pid = process.pid, isBun = typeof Bun !== 'undefined';
var LogLevel = { INFO: 'info', ERROR: 'error' };
var logCollector = {
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
    this.initializationTimeout = setTimeout(() => {
      this.handleInitializationFailure();
      this.isInitializationFailed = true;
      console.error('Log collector initialization timed out');
    }, 5000);
  },
  initialize(options = {}) {
    this.storage = options.storage;
    this.collectLogs = options.collectLogs || [LogLevel.INFO, LogLevel.ERROR];
    if (typeof options.enableConsoleOutput !== 'undefined') {
      this.enableConsoleOutput = options.enableConsoleOutput;
    }
    this.hostname = options.hostname || os.hostname();
    if (this.storage) {
      this.storage.once('ready', () => {
        clearTimeout(this.initializationTimeout);
        if (this.isInitializationFailed) {
          console.error('Log collector initialization failed');
        } else {
          this.isStorageReady = true;
          this.storage.emit('ready');
        }
      });
    }
    if (this.enableConsoleOutput) {
      process.stdout.write = this.originalStdoutWrite;
      process.stderr.write = this.originalStderrWrite;
    } else {
      console.log('Console output disabled');
      const noopWrite = (chunk, encoding, callback) => {
        if (typeof encoding === 'function') callback = encoding;
        if (typeof callback === 'function') process.nextTick(() => callback(null));
        return true;
      };
      process.stdout.write = noopWrite;
      process.stderr.write = noopWrite;
    }
    if (this.collectLogs.includes(LogLevel.INFO)) {
      this.createLogStream();
      console.log('Log collector initialized for level: ' + LogLevel.INFO.toUpperCase());
    } else {
      console.log('Log collector not collecting INFO logs');
    }
    if (this.collectLogs.includes(LogLevel.ERROR)) {
      this.createEmptyLogStream();
      console.log('Log collector initialized for level: ' + LogLevel.ERROR.toUpperCase());
    } else {
      console.log('Log collector not collecting ERROR logs');
    }
  },
  createLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (chunk, encoding, callback) => {
        this.storage.store([chunk]);
        setImmediate(callback);
      }
    });
  },
  createEmptyLogStream() {
    this.logStream && this.logStream.end();
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (chunk, encoding, callback) => {
        setImmediate(callback);
      }
    });
  },
  interceptLogs(level) {
    let targetStream, originalWrite;
    switch (level) {
      case LogLevel.INFO:
        targetStream = process.stdout;
        originalWrite = this.originalStdoutWrite;
        break;
      case LogLevel.ERROR:
        targetStream = process.stderr;
        originalWrite = this.originalStderrWrite;
        break;
      default:
        return;
    }
    if (isBun) {
      const bunMethods = ['log', 'info', 'warn', 'error', 'debug', 'trace', 'assert', 'clear', 'count', 'countReset', 'group', 'groupCollapsed', 'groupEnd', 'table', 'time', 'timeEnd', 'timeLog', 'profile', 'profileEnd'];
      const bunLevels = [LogLevel.INFO, LogLevel.ERROR, LogLevel.WARN];
      bunMethods.forEach(method => {
        console[method] = (...args) => {
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
          const logEntry = {
            timestamp: new Date().toISOString(),
            message: message,
            source: 'console',
            level: LogLevel[method.toUpperCase()] || LogLevel.INFO,
            hostname: this.hostname,
            pid: this.pid
          };
          this.logStream.write(logEntry);
          Bun.write(Bun.stdout, args + '\n');
        };
      });
      bunLevels.forEach(level => {
        console[level] = (...args) => {
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
          const logEntry = {
            timestamp: new Date().toISOString(),
            message: message,
            source: 'console',
            level: LogLevel[level.toUpperCase()],
            hostname: this.hostname,
            pid: this.pid
          };
          this.logStream.write(logEntry);
          Bun.write(Bun.stdout, args + '\n');
        };
      });
      return;
    }
    targetStream.write = (chunk, encoding, callback) => {
      const cleanMessage = stripAnsi(chunk.toString());
      const logEntry = {
        timestamp: new Date().toISOString(),
        message: cleanMessage,
        source: 'stdout',
        level: level,
        hostname: this.hostname,
        pid: this.pid
      };
      this.logStream.write(logEntry);
      if (this.enableConsoleOutput || !this.isStorageReady) {
        originalWrite.call(targetStream, chunk, encoding, callback);
      } else if (callback) {
        callback();
      }
    };
  },
  async flushLogs(timeout = 10000) {
    if (typeof this.storage.flush === 'function') {
      try {
        await Promise.race([
          this.storage.flush(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Flush operation timed out')), timeout))
        ]);
      } catch (error) {
        console.error(error);
      }
    }
  },
  logCustomMessage(level, message, meta, errsoleId, timestamp) {
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      message: message,
      meta: meta || '{}',
      source: 'custom',
      level: level,
      hostname: this.hostname,
      pid: this.pid,
      errsole_id: errsoleId
    };
    try {
      this.logStream.write(logEntry);
      if (!this.enableConsoleOutput || !this.isStorageReady) return;
      this.originalStdoutWrite.call(process.stdout, message + '\n', 'utf8');
    } catch (error) {
      console.error(error);
    }
  }
};
logCollector.setInitializationTimeout();
logCollector.initialize();
logCollector.logStream.end();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);
module.exports = logCollector;
