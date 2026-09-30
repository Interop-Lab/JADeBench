'use strict';

const net = require('net');

const Verdict = Object.freeze({
  Clean: Symbol('Clean'),
  Malicious: Symbol('Malicious'),
  ScanError: Symbol('ScanError')
});

const CLAMD_INSTREAM = Buffer.from('zINSTREAM\0');
const CHUNK_SIZE = 96 * 1024;

function parseClamdResponse(response) {
  const result = response.split(': ')[1].replace(/\0/g, '').trim();

  if (result === 'OK') {
    return Verdict.Clean;
  }

  if (result.includes('FOUND')) {
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
    timeout = 15000
  } = options;

  function scanAttempt() {
    return new Promise((resolve, reject) => {
      const connectionOptions = socketPath
        ? { path: socketPath }
        : { host, port };

      const socket = net.createConnection(connectionOptions);
      const responseChunks = [];
      let settled = false;

      function finish(callback, value) {
        if (settled) {
          return;
        }

        settled = true;
        socket.destroy();
        callback(value);
      }

      socket.setTimeout(timeout);

      socket.on('timeout', () => {
        finish(
          reject,
          new Error(`Clamd connection timeout after ${timeout}ms`)
        );
      });

      socket.on('error', error => {
        finish(reject, error);
      });

      socket.on('data', chunk => {
        responseChunks.push(chunk);
      });

      socket.on('connect', () => {
        socket.write(CLAMD_INSTREAM);

        let offset = 0;
        while (offset < buffer.length) {
          const chunk = buffer.subarray(
            offset,
            Math.min(offset + CHUNK_SIZE, buffer.length)
          );
          const size = Buffer.alloc(4);
          size.writeUInt32BE(chunk.length, 0);
          socket.write(size);
          socket.write(chunk);
          offset += chunk.length;
        }

        socket.write(Buffer.alloc(4));
        socket.end();
      });

      socket.on('end', () => {
        finish(
          resolve,
          parseClamdResponse(Buffer.concat(responseChunks))
        );
      });
    });
  }

  async function scanWithRetries(attempt) {
    try {
      return await scanAttempt();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return scanWithRetries(attempt + 1);
    }
  }

  return scanWithRetries(0);
}

module.exports = {
  scanBufferViaClamd
};
