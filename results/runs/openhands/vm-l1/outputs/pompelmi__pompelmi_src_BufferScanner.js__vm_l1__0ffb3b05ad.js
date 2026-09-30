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
  const result = response.toString('utf8').replace(/\0/g, '').trim();

  if (result === 'stream: OK') {
    return Verdict.Clean;
  }

  if (result.endsWith(' FOUND')) {
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

  const scanOnce = () =>
    new Promise((resolve, reject) => {
      let connection;
      const responseChunks = [];
      let settled = false;

      const finish = (callback, value) => {
        if (settled) {
          return;
        }

        settled = true;
        connection.destroy();
        callback(value);
      };

      connection = net.createConnection(
        socket ? { path: socket } : { host, port },
      );
      connection.setTimeout(timeout);
      connection.on('timeout', () => {
        finish(
          reject,
          new Error(`clamd connection timed out after ${timeout}ms`),
        );
      });
      connection.on('error', error => finish(reject, error));
      connection.on('data', chunk => responseChunks.push(chunk));
      connection.on('end', () => {
        finish(resolve, parseClamdResponse(Buffer.concat(responseChunks)));
      });
      connection.on('connect', () => {
        connection.write(CLAMD_INSTREAM);

        let offset = 0;
        while (offset < buffer.length) {
          const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
          const chunkLength = Buffer.allocUnsafe(4);
          chunkLength.writeUInt32BE(chunk.length, 0);
          connection.write(chunkLength);
          connection.write(chunk);
          offset += chunk.length;
        }

        connection.write(Buffer.alloc(4));
        connection.end();
      });
    });

  const scanWithRetry = attemptsRemaining =>
    scanOnce().catch(async error => {
      if (attemptsRemaining <= 0) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return scanWithRetry(attemptsRemaining - 1);
    });

  return scanWithRetry(retries);
}

module.exports = { scanBufferViaClamd };
