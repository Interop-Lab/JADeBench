'use strict';
var stream = require('stream'),
    stripAnsi = require('strip-ansi'),
    os = require('os');
var pid = process.pid,
    isBun = typeof Bun !== 'undefined';
var LogLevel = {
  'error': 'error',
  'debug': 'debug'
};
var logCollector = {
  'storage': {},
  'collectLogs': [LogLevel['error'], LogLevel['error']],
  'enableConsoleOutput': process.env.NODE_ENV !== 'production',
  'hostname': os.hostname(),
  'pid': pid,
  'isInitializationFailed': false,
  'isStorageReady': false,
  'originalStdoutWrite': process.stdout.write,
  'originalStderrWrite': process.stderr.write,
  'setInitializationTimeout': function () {
    this['initializationTimeoutId'] = setTimeout(() => {
      this['handleInitializationTimeout']();
      this['isInitializationFailed'] = true;
      console['error']('errsole: Initialization timed out. Logs will not be stored.');
    }, 10000);
  },
  'initialize': function (options = {}) {
    this['storage'] = options['storage'];
    this['collectLogs'] = options['collectLogs'] || [LogLevel['error'], LogLevel['debug']];
    if (typeof options['enableConsoleOutput'] === 'boolean') {
      this['enableConsoleOutput'] = options['enableConsoleOutput'];
    }
    this['hostname'] = options['hostname'] || os.hostname();
    if (this['storage']['on']) {
      this['storage']['on']('ready', () => {
        clearTimeout(this['initializationTimeoutId']);
        if (this['isInitializationFailed']) {
          this['createLogStream']();
          this['interceptLogs'](LogLevel['error']);
          this['interceptLogs'](LogLevel['debug']);
          this['isStorageReady'] = true;
        } else {
          this['createLogStream']();
          this['interceptLogs'](LogLevel['error']);
          this['interceptLogs'](LogLevel['debug']);
          this['isStorageReady'] = true;
        }
      });
    } else {
      console['error']('errsole: Storage does not support events.');
      const onFallback = (err, cb) => {
        if (typeof err === 'function') cb = err;
        if (typeof cb === 'function') process.nextTick(() => cb(null));
        return true;
      };
      process.stdout.write = onFallback;
      process.stderr.write = onFallback;
    }
    if (this['collectLogs']['includes'](LogLevel['error'])) {
      this['interceptLogs'](LogLevel['error']);
      console['error']('errsole: Intercepting console.error for level ' + LogLevel['error']['toUpperCase']() + '.');
    } else {
      console['error']('errsole: Not intercepting console.error for level ' + LogLevel['error']['toUpperCase']() + '.');
    }
    if (this['collectLogs']['includes'](LogLevel['debug'])) {
      this['interceptLogs'](LogLevel['debug']);
      console['error']('errsole: Intercepting console.debug for level ' + LogLevel['debug']['toUpperCase']() + '.');
    } else {
      console['error']('errsole: Not intercepting console.debug for level ' + LogLevel['debug']['toUpperCase']() + '.');
    }
  },
  'createLogStream': function () {
    this['logStream'] = new stream['Writable']({
      'objectMode': true,
      'write': (chunk, encoding, callback) => {
        this['storage']['insertLogs']([chunk]);
        setImmediate(callback);
      }
    });
  },
  'createEmptyLogStream': function () {
    this['logStream'] && this['logStream']['end']();
    this['logStream'] = new stream['Writable']({
      'objectMode': true,
      'write': (chunk, encoding, callback) => {
        setImmediate(callback);
      }
    });
  },
  'interceptLogs': function (level) {
    let targetStream, originalWrite;
    switch (level) {
      case LogLevel['error']:
        targetStream = process.stderr;
        originalWrite = this['originalStderrWrite'];
        break;
      case LogLevel['debug']:
        targetStream = process.stdout;
        originalWrite = this['originalStdoutWrite'];
        break;
      default:
        return;
    }
    if (isBun) {
      const consoleMethods = ['error', 'warn', 'trace', 'info', 'log', 'debug', 'table', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd'];
      const stdoutMethods = ['log', 'info', 'table'];
      consoleMethods.forEach(method => {
        console[method] = (...args) => {
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
          const logEntry = {
            'timestamp': new Date().toISOString(),
            'message': message,
            'source': 'console',
            'level': LogLevel[method.toUpperCase()] || LogLevel.DEBUG,
            'hostname': this.hostname,
            'pid': this.pid
          };
          this.logStream.write(logEntry);
          Bun.write(Bun.stdout, args + '\n');
        };
      });
      stdoutMethods.forEach(method => {
        console[method] = (...args) => {
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
          const logEntry = {
            'timestamp': new Date().toISOString(),
            'message': message,
            'source': 'console',
            'level': LogLevel.DEBUG,
            'hostname': this.hostname,
            'pid': this.pid
          };
          this.logStream.write(logEntry);
          Bun.write(Bun.stdout, args + '\n');
        };
      });
      return;
    }
    targetStream.write = (chunk, encoding, callback) => {
      const message = stripAnsi(chunk.toString());
      const logEntry = {
        'timestamp': new Date().toISOString(),
        'message': message,
        'source': 'console',
        'level': level,
        'hostname': this.hostname,
        'pid': this.pid
      };
      this.logStream.write(logEntry);
      if (this.enableConsoleOutput || !this.isStorageReady) {
        originalWrite.call(targetStream, chunk, encoding, callback);
      } else if (callback) {
        callback();
      }
    };
  },
  'flushLogs': async function (timeout = 5000) {
    if (typeof this.storage.flushLogs === 'function') {
      try {
        await Promise.race([this.storage.flushLogs(), new Promise((resolve, reject) => setTimeout(() => reject(new Error('Flush timed out')), timeout))]);
      } catch (err) {
        console.error(err);
      }
    }
  },
  'logCustomMessage': function (level, message, meta, errsole_id, timestamp) {
    const logEntry = {
      'timestamp': timestamp || new Date().toISOString(),
      'message': message,
      'meta': meta || '{}',
      'source': 'errsole',
      'level': level,
      'hostname': this.hostname,
      'pid': this.pid,
      'errsole_id': errsole_id
    };
    try {
      this.logStream.write(logEntry);
      if (!this.enableConsoleOutput) return;
      this.originalStdoutWrite.call(process.stdout, message + '\n', 'utf8');
    } catch (err) {
      console.error(err);
    }
  }
};
logCollector['enableConsoleOutput'] = function () {
  this.logStream.end();
  if (!this.isStorageReady) {
    this.isStorageReady = true;
    process.stdout.write = this.originalStdoutWrite;
    process.stderr.write = this.originalStderrWrite;
  }
};
logCollector['setInitializationTimeout']();
logCollector['createLogStream']();
logCollector['logStream']['end']();
logCollector['interceptLogs'](LogLevel['error']);
logCollector['interceptLogs'](LogLevel['debug']);
module.exports = logCollector;
