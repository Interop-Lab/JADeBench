'use strict';

const net = require('net');

const Verdict = Object.freeze({
  Clean: 'Clean',
  Malicious: 'Malicious',
  ScanError: 'ScanError',
});

const CLAMD_INSTREAM = Buffer.from('zINSTREAM\0');
const CHUNK_SIZE = 64 * 1024;

function parseClamdResponse(response) {
  const message = response
    .toString('utf8')
    .replace(/\0/g, '')
    .trim();

  if (message === 'stream: OK') return Verdict.Clean;
  if (message.endsWith(' FOUND')) return Verdict.Malicious;
  return Verdict.ScanError;
}

function scanOnce(buffer, { host, port, socket, timeout }) {
  return new Promise((resolve, reject) => {
    const responseChunks = [];
    let settled = false;
    const client = net.createConnection(socket ? { path: socket } : { host, port });

    function finish(error, verdict) {
      if (settled) return;
      settled = true;
      client.destroy();
      if (error) reject(error);
      else resolve(verdict);
    }

    client.setTimeout(timeout);
    client.on('timeout', () => {
      finish(new Error('clamd connection timed out after ' + timeout + 'ms'));
    });
    client.on('error', error => finish(error));
    client.on('data', chunk => responseChunks.push(chunk));
    client.on('end', () => {
      finish(null, parseClamdResponse(Buffer.concat(responseChunks)));
    });
    client.on('connect', () => {
      client.write(CLAMD_INSTREAM);
      for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        const length = Buffer.allocUnsafe(4);
        length.writeUInt32BE(chunk.length);
        client.write(length);
        client.write(chunk);
      }
      client.end(Buffer.alloc(4));
    });
  });
}

async function scanBufferViaClamd(
  buffer,
  {
    retryDelay = 1000,
    host = '127.0.0.1',
    port = 3310,
    socket,
    timeout = 15000,
    retries = 1,
  } = {},
) {
  for (let attempt = 0; ; attempt += 1) {
    if (attempt > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    try {
      return await scanOnce(buffer, { host, port, socket, timeout });
    } catch (error) {
      if (attempt >= retries) throw error;
    }
  }
}

module.exports = { scanBufferViaClamd };
