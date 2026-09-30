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

      const disabledWrite = (_chunk, encoding, callback) => {
        let completionCallback = callback;
        if (typeof encoding === 'function') {
          completionCallback = encoding;
        }
        if (typeof completionCallback === 'function') {
          process.nextTick(() => completionCallback(null));
        }
        return true;
      };

      process.stdout.write = disabledWrite;
      process.stderr.write = disabledWrite;
    }

    if (this.collectLogs.includes(LogLevel.INFO)) {
      this.interceptLogs(LogLevel.INFO);
      console.log(`Errsole is capturing ${LogLevel.INFO.toUpperCase()} logs.`);
    } else {
      console.log(`Errsole is NOT capturing ${LogLevel.INFO.toUpperCase()} logs.`);
    }

    if (this.collectLogs.includes(LogLevel.ERROR)) {
      this.interceptLogs(LogLevel.ERROR);
      console.log(`Errsole is capturing ${LogLevel.ERROR.toUpperCase()} logs.`);
    } else {
      console.log(`Errsole is NOT capturing ${LogLevel.ERROR.toUpperCase()} logs.`);
    }
  },

  createLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (log, _encoding, callback) => {
        this.storage.postLogs([log]);
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
      write: (_log, _encoding, callback) => {
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
      const collector = this;

      infoMethods.forEach((methodName) => {
        console[methodName] = (...args) => {
          const message = args
            .map((value) => (typeof value === 'object' ? JSON.stringify(value) : value))
            .join(' ');
          const log = {
            timestamp: new Date().toISOString(),
            message,
            source: 'console',
            level: LogLevel[level.toUpperCase()] || LogLevel.INFO,
            hostname: collector.hostname,
            pid: collector.pid,
          };

          collector.logStream.write(log);
          Bun.write(Bun.stdout, `${args}\n`);
        };
      });

      errorMethods.forEach((methodName) => {
        console[methodName] = (...args) => {
          const message = args
            .map((value) => (typeof value === 'object' ? JSON.stringify(value) : value))
            .join(' ');
          const log = {
            timestamp: new Date().toISOString(),
            message,
            source: 'console',
            level: LogLevel.ERROR,
            hostname: collector.hostname,
            pid: collector.pid,
          };

          collector.logStream.write(log);
          Bun.write(Bun.stderr, `${args}\n`);
        };
      });
      return;
    }

    output.write = (chunk, encoding, callback) => {
      const message = stripAnsi(chunk.toString());
      const log = {
        timestamp: new Date().toISOString(),
        message,
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
          new Promise((_resolve, reject) =>
            setTimeout(() => reject(new Error('flushLogs timed out')), timeout),
          ),
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

      if (!this.enableConsoleOutput) {
        return;
      }

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
