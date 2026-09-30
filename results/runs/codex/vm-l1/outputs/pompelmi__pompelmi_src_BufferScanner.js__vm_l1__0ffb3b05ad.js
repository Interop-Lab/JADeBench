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
  const message = response
    .toString('utf8')
    .replace(/\0/g, '')
    .trim();

  if (message === 'stream: OK') {
    return Verdict.Clean;
  }

  if (message.endsWith(' FOUND')) {
    return Verdict.Malicious;
  }

  return Verdict.ScanError;
}

function scanBufferOnce(buffer, { host, port, timeout }) {
  return new Promise((resolve, reject) => {
    const responseChunks = [];
    let socket;
    let failed = false;

    const fail = (error) => {
      if (failed) {
        return;
      }

      failed = true;
      socket.destroy();
      reject(error);
    };

    socket = net.createConnection({ host, port });
    socket.setTimeout(timeout);
    socket.on('timeout', () => {
      fail(new Error(`clamd connection timed out after ${timeout}ms`));
    });
    socket.on('error', fail);
    socket.on('data', (chunk) => {
      responseChunks.push(chunk);
    });
    socket.on('end', () => {
      socket.destroy();
      resolve(parseClamdResponse(Buffer.concat(responseChunks)));
    });
    socket.on('connect', () => {
      socket.write(CLAMD_INSTREAM);

      for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        const lengthPrefix = Buffer.allocUnsafe(4);
        lengthPrefix.writeUInt32BE(chunk.length, 0);
        socket.write(lengthPrefix);
        socket.write(chunk);
      }

      socket.write(Buffer.alloc(4));
      socket.end();
    });
  });
}

async function scanBufferViaClamd(buffer, options = {}) {
  const {
    retryDelay = 1000,
    host = '127.0.0.1',
    port = 3310,
    timeout = 15000,
    retries = 1,
  } = options;

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await scanBufferOnce(buffer, { host, port, timeout });
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

module.exports = { scanBufferViaClamd };
