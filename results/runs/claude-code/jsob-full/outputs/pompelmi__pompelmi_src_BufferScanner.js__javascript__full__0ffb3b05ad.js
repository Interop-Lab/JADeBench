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
    socket,
    timeout = 15000,
  } = options;

  function scanOnce() {
    return new Promise((resolve, reject) => {
      const connectionOptions = socket ? { path: socket } : { host, port };
      const connection = net.createConnection(connectionOptions);
      const responseChunks = [];
      let settled = false;

      function settle(callback, value) {
        if (settled) return;
        settled = true;
        connection.destroy();
        callback(value);
      }

      connection.setTimeout(timeout);
      connection.on('timeout', () => {
        settle(reject, new Error(`clamd connection timed out after ${timeout}ms`));
      });
      connection.on('error', (error) => settle(reject, error));
      connection.on('data', (chunk) => responseChunks.push(chunk));
      connection.on('end', () => {
        settle(resolve, parseClamdResponse(Buffer.concat(responseChunks)));
      });
      connection.on('connect', () => {
        connection.write(CLAMD_INSTREAM);

        for (let offset = 0; offset < buffer.length; ) {
          const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
          const length = Buffer.allocUnsafe(4);
          length.writeUInt32BE(chunk.length, 0);
          connection.write(length);
          connection.write(chunk);
          offset += chunk.length;
        }

        connection.write(Buffer.alloc(4));
        connection.end();
      });
    });
  }

  async function scanWithRetry(attempt) {
    try {
      return await scanOnce();
    } catch (error) {
      if (attempt >= retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return scanWithRetry(attempt + 1);
    }
  }

  return scanWithRetry(0);
}

module.exports = { scanBufferViaClamd };
