'use strict';

const net = require('net');

const Verdict = Object.freeze({
  Clean: Symbol('Clean'),
  Malicious: Symbol('Malicious'),
  ScanError: Symbol('ScanError'),
});

const CLAMD_INSTREAM = Buffer.from('zINSTREAM\0');
const CHUNK_SIZE = 64 * 1024;
const CLAMD_ADDRESS = { host: '127.0.0.1', port: 3310 };
const SCAN_TIMEOUT_MS = 15_000;

/** Convert clamd's NUL-terminated INSTREAM response into a verdict. */
function parseClamdResponse(response) {
  const message = response.endsWith('\0') ? response.slice(0, -1) : response;

  if (message.endsWith(' OK')) return Verdict.Clean;
  if (message.endsWith(' FOUND')) return Verdict.Malicious;
  return Verdict.ScanError;
}

/**
 * Send a buffer to the ClamAV daemon using its INSTREAM protocol.
 *
 * The daemon is expected on the standard local clamd endpoint,
 * 127.0.0.1:3310.
 */
function scanBufferViaClamd(buffer) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(CLAMD_ADDRESS);
    const responseChunks = [];

    socket.setTimeout(SCAN_TIMEOUT_MS);
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`clamd connection timed out after ${SCAN_TIMEOUT_MS}ms`));
    });
    socket.on('error', reject);
    socket.on('data', (chunk) => responseChunks.push(chunk));
    socket.on('end', () => {
      resolve(parseClamdResponse(Buffer.concat(responseChunks).toString()));
    });

    socket.on('connect', () => {
      socket.write(CLAMD_INSTREAM);

      for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        const length = Buffer.allocUnsafe(4);
        length.writeUInt32BE(chunk.length, 0);
        socket.write(length);
        socket.write(chunk);
      }

      const endMarker = Buffer.alloc(4);
      socket.write(endMarker);
      socket.end();
    });
  });
}

module.exports = { scanBufferViaClamd };
