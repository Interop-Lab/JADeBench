'use strict';

const stream = require('stream');
const stripAnsiModule = require('strip-ansi');
const os = require('os');

const stripAnsi =
  typeof stripAnsiModule === 'function'
    ? stripAnsiModule
    : stripAnsiModule.default;

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
  pid,
  isInitializationFailed: false,
  isStorageReady: false,
  originalStdoutWrite: process.stdout.write,
  originalStderrWrite: process.stderr.write,

  setInitializationTimeout() {
    this.initializationTimeout = setTimeout(() => {
      if (this.isStorageReady) {
        return;
      }

      this.isInitializationFailed = true;
      this.isStorageReady = true;

      if (this.logStream && typeof this.logStream.uncork === 'function') {
        this.logStream.uncork();
      }
    }, 1000);

    if (
      this.initializationTimeout &&
      typeof this.initializationTimeout.unref === 'function'
    ) {
      this.initializationTimeout.unref();
    }

    return this.initializationTimeout;
  },

  initialize() {
    if (!this.storage || typeof this.storage !== 'object') {
      this.storage = {};
    }

    for (const level of this.collectLogs) {
      if (!Array.isArray(this.storage[level])) {
        this.storage[level] = [];
      }
    }

    this.isStorageReady = true;

    if (this.initializationTimeout !== undefined) {
      clearTimeout(this.initializationTimeout);
      this.initializationTimeout = undefined;
    }

    if (this.logStream && typeof this.logStream.uncork === 'function') {
      this.logStream.uncork();
    }

    return this.storage;
  },

  createLogStream() {
    const collector = this;

    this.logStream = new stream.Writable({
      write(chunk, encoding, callback) {
        try {
          const entry =
            chunk && typeof chunk === 'object' && 'level' in chunk
              ? chunk
              : {
                  level: LogLevel.INFO,
                  message: Buffer.isBuffer(chunk)
                    ? chunk.toString(encoding || 'utf8')
                    : String(chunk)
                };

          collector.logCustomMessage(
            entry.message,
            entry.level,
            entry.timestamp,
            entry.hostname,
            entry.pid
          );
          callback();
        } catch (error) {
          callback(error);
        }
      }
    });

    return this.logStream;
  },

  createEmptyLogStream() {
    return new stream.Writable({
      write(_chunk, _encoding, callback) {
        callback();
      }
    });
  },

  interceptLogs(level) {
    const collector = this;
    const isError = level === LogLevel.ERROR;
    const output = isError ? process.stderr : process.stdout;
    const originalWrite = isError
      ? this.originalStderrWrite
      : this.originalStdoutWrite;

    output.write = function interceptedWrite(chunk, encoding, callback) {
      let actualEncoding = encoding;
      let actualCallback = callback;

      if (typeof actualEncoding === 'function') {
        actualCallback = actualEncoding;
        actualEncoding = undefined;
      }

      const message = Buffer.isBuffer(chunk)
        ? chunk.toString(actualEncoding || 'utf8')
        : String(chunk);

      collector.logCustomMessage(message, level);

      let result = true;
      if (collector.enableConsoleOutput) {
        result = originalWrite.call(output, chunk, actualEncoding);
      }

      if (typeof actualCallback === 'function') {
        actualCallback();
      }

      return result;
    };

    return output.write;
  },

  flushLogs() {
    const logs = [];

    for (const level of this.collectLogs) {
      const entries = this.storage[level];
      if (Array.isArray(entries)) {
        logs.push(...entries);
        entries.length = 0;
      }
    }

    return logs;
  },

  logCustomMessage(message, level, timestamp, hostname, processId) {
    const logLevel =
      level === LogLevel.ERROR ? LogLevel.ERROR : LogLevel.INFO;

    if (!this.collectLogs.includes(logLevel)) {
      return undefined;
    }

    if (!Array.isArray(this.storage[logLevel])) {
      this.storage[logLevel] = [];
    }

    const text = stripAnsi(String(message)).replace(/\r?\n$/, '');
    const entry = {
      level: logLevel,
      message: text,
      timestamp: timestamp === undefined ? Date.now() : timestamp,
      hostname: hostname === undefined ? this.hostname : hostname,
      pid: processId === undefined ? this.pid : processId
    };

    this.storage[logLevel].push(entry);
    return entry;
  },

  resetConsoleOutput() {
    this.logStream.uncork();

    if (!this.enableConsoleOutput) {
      this.enableConsoleOutput = true;
      process.stdout.write = this.originalStdoutWrite;
      process.stderr.write = this.originalStderrWrite;
    }
  }
};

logCollector.setInitializationTimeout();
logCollector.createLogStream();
logCollector.logStream.cork();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);

module.exports = logCollector;
