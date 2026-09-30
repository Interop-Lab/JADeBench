'use strict';

const stream = require('stream');
const stripAnsiModule = require('strip-ansi');
const os = require('os');

const stripAnsi = stripAnsiModule.default || stripAnsiModule;
const LogLevel = { INFO: 'info', ERROR: 'error' };

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
      console.error('Error: Unable to initialize Errsole');
      this.isInitializationFailed = true;
    }, 30_000);
  },

  initialize(options = {}) {
    this.storage = options.storage || this.storage;
    this.collectLogs = options.collectLogs || this.collectLogs;
    if (options.enableConsoleOutput !== undefined) {
      this.enableConsoleOutput = options.enableConsoleOutput;
    }
    this.hostname = options.serverName || this.hostname;

    this.storage.once('ready', () => {
      this.isStorageReady = true;
      this.isInitializationFailed = false;
      clearTimeout(this.initializationTimeoutId);
      this.flushLogs();
    });

    if (!this.enableConsoleOutput) {
      this.originalStdoutWrite.call(
        process.stdout,
        'Note: Terminal output will be disabled after initial logs.\n',
      );
    }

    const infoMessage = `Errsole is ${this.collectLogs.includes(LogLevel.INFO) ? '' : 'NOT '}capturing INFO logs.\n`;
    const errorMessage = `Errsole is ${this.collectLogs.includes(LogLevel.ERROR) ? '' : 'NOT '}capturing ERROR logs.\n`;
    this.originalStdoutWrite.call(process.stdout, infoMessage);
    this.originalStdoutWrite.call(process.stdout, errorMessage);
    this.logStream.write({
      timestamp: new Date(),
      message: infoMessage,
      source: 'console',
      level: LogLevel.INFO,
      hostname: this.hostname,
      pid: this.pid,
    });
    this.logStream.write({
      timestamp: new Date(),
      message: errorMessage,
      source: 'console',
      level: LogLevel.INFO,
      hostname: this.hostname,
      pid: this.pid,
    });
  },

  createLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (log, encoding, callback) => {
        this.storage.postLogs([log]);
        callback();
      },
    });
  },

  createEmptyLogStream() {
    this.logStream = new stream.Writable({
      objectMode: true,
      write(log, encoding, callback) {
        callback();
      },
    });
  },

  interceptLogs(level) {
    if (level !== LogLevel.INFO && level !== LogLevel.ERROR) return;

    const output = level === LogLevel.ERROR ? process.stderr : process.stdout;
    output.write = chunk => {
      const record = {
        timestamp: new Date(),
        message: stripAnsi(String(chunk)),
        source: 'console',
        level,
        hostname: this.hostname,
        pid: this.pid,
      };
      this.logStream.write(record);
    };
  },

  async flushLogs() {},

  logCustomMessage(level, message, meta, errsoleId, timestamp) {
    this.originalStdoutWrite.call(process.stdout, `${message}`);
    if (!message || !level) return;

    const record = {
      timestamp: timestamp || new Date(),
      message: stripAnsi(String(message)),
      meta: meta || '{}',
      source: 'errsole',
      level,
      hostname: this.hostname,
      pid: this.pid,
    };
    if (errsoleId) record.errsole_id = errsoleId;
    this.logStream.write(record);
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
