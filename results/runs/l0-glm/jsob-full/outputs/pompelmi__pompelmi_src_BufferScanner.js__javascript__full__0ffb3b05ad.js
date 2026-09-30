'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames,
    __commonJS = (cb, mod) => function __require() {
  if (!mod) {
    mod = {exports: {}};
    cb(__getOwnPropNames(mod), mod);
  }
  return mod.exports;
};

var require_verdicts = __commonJS({
  '../work/pompelmi__pompelmi/src/verdicts.js'(exports, module) {
    'use strict';
    var Verdict = Object.freeze({
      Clean: Symbol('Clean'),
      Malicious: Symbol('Malicious'),
      ScanError: Symbol('ScanError')
    });
    var verdicts = {};
    verdicts.Verdict = Verdict;
    module.exports = verdicts;
  }
});

var net = require('net');

var {Verdict} = require_verdicts();

var isBun = typeof Bun !== 'undefined';

var CLAMD_INSTREAM = Buffer.from('zINSTREAM\0');

var CHUNK_SIZE = 64 * 1024;

function parseClamdResponse(response) {
  const trimmed = response.toString('utf8').replace(/\0/g, '').trim();
  if (trimmed === 'stream: OK') return Verdict.Clean;
  if (trimmed.includes('FOUND')) return Verdict.Malicious;
  return Verdict.ScanError;
}

function scanBufferViaClamd(buffer, options = {}) {
  const {
    retries = 0,
    retryDelay = 1000,
    host = 'localhost',
    port = 3310,
    socket,
    timeout = 30000
  } = options;

  function attempt() {
    return new Promise((resolve, reject) => {
      const connectOptions = socket ? {path: socket} : {host, port};
      const clamdSocket = net.createConnection(connectOptions);
      const chunks = [];
      let settled = false;

      function settle(fn, value) {
        if (settled) return;
        settled = true;
        clamdSocket.destroy();
        fn(value);
      }

      clamdSocket.setTimeout(timeout);
      clamdSocket.on('timeout', () => settle(reject, new Error('clamd timed out after ' + timeout + 'ms')));
      clamdSocket.on('error', err => settle(reject, err));
      clamdSocket.on('data', data => chunks.push(data));
      clamdSocket.on('connect', () => {
        clamdSocket.write(CLAMD_INSTREAM);
        let offset = 0;
        while (offset < buffer.length) {
          const chunk = buffer.subarray(offset, offset + CHUNK_SIZE);
          const lengthBuffer = Buffer.alloc(4);
          lengthBuffer.writeUInt32BE(chunk.length, 0);
          clamdSocket.write(lengthBuffer);
          clamdSocket.write(chunk);
          offset += chunk.length;
        }
        clamdSocket.write(Buffer.from([0, 0, 0, 0]));
        clamdSocket.end();
      });
      clamdSocket.on('end', () => settle(resolve, parseClamdResponse(Buffer.concat(chunks))));
    });
  }

  function retry(attemptNumber) {
    return attempt().catch(async error => {
      if (attemptNumber === 0) throw error;
      await new Promise(r => setTimeout(r, retryDelay));
      return retry(attemptNumber - 1);
    });
  }

  return retry(retries);
}

var exportsObj = {};
exportsObj.scanBufferViaClamd = scanBufferViaClamd;
module.exports = exportsObj;
