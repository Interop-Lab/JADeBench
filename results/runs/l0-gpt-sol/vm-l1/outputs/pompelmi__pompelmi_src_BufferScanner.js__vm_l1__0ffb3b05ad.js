'use strict';

const net = require('net');

const Verdict = Object.freeze({
  CLEAN: 'clean',
  MALICIOUS: 'malicious',
  UNKNOWN: 'unknown'
});

const CLAMD_INSTREAM = Buffer.from('zINSTREAM\0');
const CHUNK_SIZE = 64 * 1024;

function parseClamdResponse(response) {
  const text = Buffer.isBuffer(response)
    ? response.toString('utf8')
    : String(response);

  if (/(?:^|:\s).*?\sFOUND(?:\0|\r?\n|$)/.test(text)) {
    return Verdict.MALICIOUS;
  }

  if (/(?:^|:\s)OK(?:\0|\r?\n|$)/.test(text)) {
    return Verdict.CLEAN;
  }

  return Verdict.UNKNOWN;
}

function scanBufferViaClamd(buffer) {
  return new Promise((resolve, reject) => {
    const input = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const socket = net.createConnection({
      host: '127.0.0.1',
      port: 3310
    });

    const responseChunks = [];
    let settled = false;

    const fail = error => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(parseClamdResponse(Buffer.concat(responseChunks)));
    };

    socket.once('error', fail);
    socket.on('data', chunk => {
      responseChunks.push(Buffer.from(chunk));
    });
    socket.once('end', finish);
    socket.once('close', hadError => {
      if (!hadError) finish();
    });

    socket.once('connect', () => {
      socket.write(CLAMD_INSTREAM);

      for (let offset = 0; offset < input.length; offset += CHUNK_SIZE) {
        const chunk = input.subarray(
          offset,
          Math.min(offset + CHUNK_SIZE, input.length)
        );
        const length = Buffer.allocUnsafe(4);
        length.writeUInt32BE(chunk.length, 0);
        socket.write(length);
        socket.write(chunk);
      }

      const terminator = Buffer.alloc(4);
      socket.end(terminator);
    });
  });
}

module.exports = {
  scanBufferViaClamd
};
