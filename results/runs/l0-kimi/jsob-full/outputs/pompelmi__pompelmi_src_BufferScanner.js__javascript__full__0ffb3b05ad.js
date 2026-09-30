'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_verdicts = __commonJS({
  '../work/pompelmi__pompelmi/src/verdicts.js'(exports, module) {
    'use strict';
    var Verdict = Object.freeze({
      Clean: Symbol('Clean'),
      Malicious: Symbol('Malicious'),
      ScanError: Symbol('ScanError')
    });
    module.exports = { Verdict };
  }
});
var net = require('net');
var { Verdict } = require_verdicts();
var isBun = typeof Bun !== 'undefined';
var CLAMD_INSTREAM = Buffer.from('zINSTREAM\0');
var CHUNK_SIZE = 4096;
function parseClamdResponse(response) {
  const cleanResponse = 'stream: OK';
  const foundPrefix = 'stream:';
  const trimmed = response.toString().replace(/\0/g, '').trim();
  if (trimmed === cleanResponse) return Verdict.Clean;
  if (trimmed.startsWith(foundPrefix)) return Verdict.Malicious;
  return Verdict.ScanError;
}
function scanBufferViaClamd(buffer, options = {}) {
  const {
    retries = 3,
    retryDelay = 100,
    host = 'localhost',
    port = 3310,
    socket: socketPath,
    timeout = 30000
  } = options;
  function attemptScan(remainingRetries) {
    return new Promise((resolve, reject) => {
      const connectionOptions = socketPath ? { path: socketPath } : { host, port };
      const client = net.createConnection(connectionOptions);
      const chunks = [];
      let settled = false;
      function settle(err, result) {
        if (settled) return;
        settled = true;
        client.destroy();
        if (err) reject(err);
        else resolve(result);
      }
      client.setTimeout(timeout);
      client.on('timeout', () => settle(reject, new Error('Clamd connection timed out after ' + timeout + 'ms')));
      client.on('error', (err) => settle(reject, err));
      client.on('data', (data) => chunks.push(data));
      client.on('end', () => settle(resolve, parseClamdResponse(Buffer.concat(chunks))));
      client.on('connect', () => {
        client.write(CLAMD_INSTREAM);
        let offset = 0;
        while (offset < buffer.length) {
          const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
          const sizeBuffer = Buffer.alloc(4);
          sizeBuffer.writeUInt32BE(chunk.length, 0);
          client.write(sizeBuffer);
          client.write(chunk);
          offset += chunk.length;
        }
        client.write(Buffer.alloc(4));
        client.end();
      });
    });
  }
  async function retry(remaining) {
    try {
      return await attemptScan(remaining);
    } catch (err) {
      if (remaining === 0) throw err;
      await new Promise(r => setTimeout(r, retryDelay));
      return retry(remaining - 1);
    }
  }
  return retry(retries);
}
module.exports = { scanBufferViaClamd };
