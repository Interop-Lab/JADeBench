'use strict';

const net = require('net');
const { Verdict } = require('../work/pompelmi__pompelmi/src/verdicts.js');

const isBun = typeof Bun !== 'undefined';
const CLAMD_INSTREAM = Buffer.from('zINSTREAM\0');
const CHUNK_SIZE = 64 * 1024;

function parseClamdResponse(response) {
  const lines = response.toString().trim().split('\n');
  const results = [];

  for (const line of lines) {
    if (!line) continue;
    const parts = line.split(': ');
    if (parts.length < 2) continue;

    const path = parts[0];
    const rest = parts.slice(1).join(': ');
    const match = rest.match(/^(.+?) (FOUND|ERROR)$/);

    if (match) {
      results.push({
        path,
        verdict: match[1],
        status: match[2]
      });
    }
  }

  return results;
}

function scanBufferViaClamd(buffer, options = {}) {
  const {
    host = 'localhost',
    port = 3310,
    timeout = 5000,
    chunkSize = CHUNK_SIZE
  } = options;

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });

    let response = Buffer.alloc(0);
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      socket.destroy();
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('ClamAV scan timed out'));
    }, timeout);

    socket.on('connect', () => {
      socket.write(CLAMD_INSTREAM);
      socket.write(buffer);
      socket.end();
    });

    socket.on('data', (chunk) => {
      response = Buffer.concat([response, chunk]);
    });

    socket.on('end', () => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        resolve(parseClamdResponse(response));
      } catch (err) {
        reject(err);
      }
    });

    socket.on('error', (err) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    });
  });
}

module.exports = {
  scanBufferViaClamd
};
