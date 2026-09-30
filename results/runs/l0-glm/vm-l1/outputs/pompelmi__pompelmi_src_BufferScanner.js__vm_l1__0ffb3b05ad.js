'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb) => cb();
var require_verdicts = __commonJS({ '../work/pompelmi__pompelmi/src/verdicts.js'(_exports, module) {
  'use strict';
  class Verdict {
    constructor(status, reason) {
      this.status = status;
      this.reason = reason;
    }
    static fromClamdResponse(response) {
      const text = response.toString('utf8').trim();
      if (text === 'stream: OK') {
        return new Verdict('clean', null);
      }
      const match = text.match(/^stream: (.+) FOUND$/);
      if (match) {
        return new Verdict('infected', match[1]);
      }
      return new Verdict('error', text);
    }
  }
  module.exports = { Verdict };
}});
var { Verdict } = require_verdicts();
var net = require('net');
var isBun = typeof Bun !== 'undefined';
var CLAMD_INSTREAM = Buffer.from('zINSTREAM\0');
var CHUNK_SIZE = 0x40 * 0x400;

function parseClamdResponse(response) {
  return Verdict.fromClamdResponse(response);
}

function scanBufferViaClamd(buffer) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const chunks = [];
    socket.connect(3310, '127.0.0.1', () => {
      socket.write(CLAMD_INSTREAM);
      let offset = 0;
      while (offset < buffer.length) {
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        const header = Buffer.alloc(4);
        header.writeUInt32BE(chunk.length, 0);
        socket.write(Buffer.concat([header, chunk]));
        offset += CHUNK_SIZE;
      }
      const zero = Buffer.alloc(4);
      socket.write(zero);
    });
    socket.on('data', (data) => {
      chunks.push(data);
    });
    socket.on('end', () => {
      const response = Buffer.concat(chunks);
      try {
        const verdict = parseClamdResponse(response);
        resolve(verdict);
      } catch (err) {
        reject(err);
      }
    });
    socket.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { scanBufferViaClamd };
