'use strict';

const net = require('net');

const Verdict = Object.freeze({
  Clean: Symbol('Clean'),
  Malicious: Symbol('Malicious'),
  ScanError: Symbol('ScanError'),
});

const CLAMD_INSTREAM = Buffer.from('zINSTREAM\0');
const CHUNK_SIZE = 64 * 1024;

function parseClamdResponse(response) {
  const message = response.toString('utf8').replace(/\0/g, '').trim();

  if (message === 'stream: OK') {
    return Verdict.Clean;
  }
  if (message.endsWith(' FOUND')) {
    return Verdict.Malicious;
  }
  return Verdict.ScanError;
}

function scanBufferViaClamd(buffer, options = {}) {
  const {
    retries = 0,
    retryDelay = 1000,
    host = '127.0.0.1',
    port = 3310,
    socket: socketPath,
    timeout = 15000,
  } = options;

  function scanOnce() {
    return new Promise((resolve, reject) => {
      const connectionOptions = socketPath
        ? { path: socketPath }
        : { host, port };
      const socket = net.createConnection(connectionOptions);
      const responseChunks = [];
      let settled = false;

      function settle(callback, value) {
        if (settled) return;
        settled = true;
        socket.destroy();
        callback(value);
      }

      socket.setTimeout(timeout);
      socket.on('timeout', () => {
        settle(
          reject,
          new Error(`clamd connection timed out after ${timeout}ms`),
        );
      });
      socket.on('error', error => settle(reject, error));
      socket.on('data', chunk => responseChunks.push(chunk));
      socket.on('end', () => {
        settle(resolve, parseClamdResponse(Buffer.concat(responseChunks)));
      });

      socket.on('connect', () => {
        socket.write(CLAMD_INSTREAM);

        let offset = 0;
        while (offset < buffer.length) {
          const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
          const length = Buffer.allocUnsafe(4);
          length.writeUInt32BE(chunk.length, 0);
          socket.write(length);
          socket.write(chunk);
          offset += chunk.length;
        }

        socket.write(Buffer.alloc(4));
        socket.end();
      });
    });
  }

  async function scanWithRetries(retriesRemaining) {
    try {
      return await scanOnce();
    } catch (error) {
      if (retriesRemaining <= 0) throw error;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return scanWithRetries(retriesRemaining - 1);
    }
  }

  return scanWithRetries(retries);
}

module.exports = { scanBufferViaClamd };
