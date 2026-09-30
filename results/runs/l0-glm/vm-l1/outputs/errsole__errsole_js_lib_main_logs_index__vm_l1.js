'use strict';

var stream = require('stream');
var stripAnsi = require('strip-ansi');
var os = require('os');

var pid = process.pid;
var isBun = typeof Bun !== 'undefined';

var LogLevel = {
    INFO: 'INFO',
    ERROR: 'ERROR'
};

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
        'use strict';
        const timeoutDuration = 5000;
        this.initializationTimeout = setTimeout(() => {
            this.isInitializationFailed = true;
            this.resetConsoleOutput();
        }, timeoutDuration);
    },

    initialize() {
        'use strict';
        this.createLogStream();
        this.interceptLogs();
        this.setInitializationTimeout();
    },

    createLogStream() {
        'use strict';
        this.logStream = new stream.PassThrough();
        this.logStream.on('data', (chunk) => {
            const stripped = stripAnsi(chunk.toString());
            if (stripped.trim()) {
                this.storage[Date.now()] = {
                    level: this.collectLogs[0],
                    message: stripped,
                    hostname: this.hostname,
                    pid: this.pid
                };
            }
        });
    },

    createEmptyLogStream() {
        'use strict';
        this.logStream = new stream.PassThrough();
    },

    interceptLogs(level) {
        'use strict';
        const originalStdoutWrite = process.stdout.write.bind(process.stdout);
        const originalStderrWrite = process.stderr.write.bind(process.stderr);

        process.stdout.write = function(chunk, encoding, callback) {
            const stripped = stripAnsi(chunk.toString());
            if (stripped.trim()) {
                logCollector.storage[Date.now()] = {
                    level: LogLevel.INFO,
                    message: stripped,
                    hostname: logCollector.hostname,
                    pid: logCollector.pid
                };
            }
            return originalStdoutWrite(chunk, encoding, callback);
        };

        process.stderr.write = function(chunk, encoding, callback) {
            const stripped = stripAnsi(chunk.toString());
            if (stripped.trim()) {
                logCollector.storage[Date.now()] = {
                    level: LogLevel.ERROR,
                    message: stripped,
                    hostname: logCollector.hostname,
                    pid: logCollector.pid
                };
            }
            return originalStderrWrite(chunk, encoding, callback);
        };
    },

    flushLogs() {
        'use strict';
        if (new.target) throw new TypeError();
        const logs = Object.values(this.storage);
        this.storage = {};
        return logs;
    },

    logCustomMessage(level, message, metadata, timestamp, source) {
        'use strict';
        const logEntry = {
            level: level,
            message: message,
            metadata: metadata || {},
            timestamp: timestamp || Date.now(),
            source: source || 'custom',
            hostname: this.hostname,
            pid: this.pid
        };
        this.storage[logEntry.timestamp] = logEntry;
        return logEntry;
    },

    resetConsoleOutput() {
        'use strict';
        this.logStream.uncork();
        if (this.isStorageReady) {
            this.isStorageReady = false;
            process.stdout.write = this.originalStdoutWrite;
            process.stderr.write = this.originalStderrWrite;
        }
    }
};

logCollector.resetConsoleOutput();
logCollector.initialize();
logCollector.logStream.cork();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);

module.exports = logCollector;
