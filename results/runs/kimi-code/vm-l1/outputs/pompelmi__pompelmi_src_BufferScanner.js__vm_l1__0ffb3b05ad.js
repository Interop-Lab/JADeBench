'use strict';

const net = require('net');

const Verdict = Object.freeze({
  Clean: 0,
  Malicious: 1,
  ScanError: 2,
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

function scanOnce(buffer, options) {
  return new Promise((resolve, reject) => {
    const connectionOptions = options.socket
      ? { path: options.socket }
      : { host: options.host, port: options.port };
    const connection = net.createConnection(connectionOptions);
    const responseChunks = [];
    let settled = false;

    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      connection.destroy();
      callback(value);
    };

    connection.setTimeout(options.timeout);
    connection.on('timeout', () => {
      settle(reject, new Error(`clamd connection timed out after ${options.timeout}ms`));
    });
    connection.on('error', error => {
      settle(reject, error);
    });
    connection.on('data', chunk => {
      responseChunks.push(chunk);
    });
    connection.on('end', () => {
      settle(resolve, parseClamdResponse(Buffer.concat(responseChunks)));
    });
    connection.on('connect', () => {
      connection.write(CLAMD_INSTREAM);

      for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        const length = Buffer.allocUnsafe(4);
        length.writeUInt32BE(chunk.length);
        connection.write(length);
        connection.write(chunk);
      }

      connection.end(Buffer.alloc(4));
    });
  });
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function scanBufferViaClamd(buffer, {
  retryDelay = 1000,
  host = '127.0.0.1',
  port = 3310,
  socket,
  timeout = 15000,
  retries = 1,
} = {}) {
  const options = { host, port, socket, timeout };

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await scanOnce(buffer, options);
    } catch (error) {
      if (attempt >= retries) {
        return Verdict.ScanError;
      }
      await delay(retryDelay);
    }
  }
}

module.exports = { scanBufferViaClamd };
