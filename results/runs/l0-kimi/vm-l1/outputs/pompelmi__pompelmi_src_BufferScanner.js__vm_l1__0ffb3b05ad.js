'use strict';

const net = require('net');
const { Verdict } = require('../work/pompelmi__pompelmi/src/verdicts.js');

const isBun = typeof Bun !== 'undefined';
const CLAMD_INSTREAM = Buffer.from('zINSTREAM\0');
const CHUNK_SIZE = 64 * 1024;

function parseClamdResponse(response) {
    const trimmed = response.trim();
    if (trimmed.endsWith('OK')) {
        return { verdict: Verdict.CLEAN };
    }
    const match = trimmed.match(/: (.+) FOUND$/);
    if (match) {
        return { verdict: Verdict.MALICIOUS, signature: match[1] };
    }
    return { verdict: Verdict.ERROR, error: trimmed };
}

async function scanBufferViaClamd(buffer) {
    return new Promise((resolve, reject) => {
        const client = net.createConnection({ port: 3310 }, () => {
            client.write(CLAMD_INSTREAM);
            
            let offset = 0;
            while (offset < buffer.length) {
                const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
                const sizeBuffer = Buffer.allocUnsafe(4);
                sizeBuffer.writeUInt32BE(chunk.length, 0);
                client.write(sizeBuffer);
                client.write(chunk);
                offset += CHUNK_SIZE;
            }
            
            const endBuffer = Buffer.allocUnsafe(4);
            endBuffer.writeUInt32BE(0, 0);
            client.write(endBuffer);
        });

        let response = '';
        client.on('data', (data) => {
            response += data.toString();
        });

        client.on('end', () => {
            resolve(parseClamdResponse(response));
        });

        client.on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = {
    scanBufferViaClamd,
    parseClamdResponse
};
