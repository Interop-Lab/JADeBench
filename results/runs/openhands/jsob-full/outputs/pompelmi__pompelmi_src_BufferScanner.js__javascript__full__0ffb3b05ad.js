"use strict";

const net = require("net");

const Verdict = Object.freeze({
  Clean: Symbol("Clean"),
  Malicious: Symbol("Malicious"),
  ScanError: Symbol("ScanError"),
});

const CLAMD_INSTREAM = Buffer.from("zINSTREAM\0");
const CHUNK_SIZE = 64 * 1024;

function parseClamdResponse(response) {
  const message = response.toString("utf8").replace(/\0/g, "").trim();

  if (message === "stream: OK") {
    return Verdict.Clean;
  }
  if (message.includes(" FOUND")) {
    return Verdict.Malicious;
  }
  return Verdict.ScanError;
}

function scanBufferViaClamd(buffer, options = {}) {
  const {
    retries = 0,
    retryDelay = 1000,
    host = "127.0.0.1",
    port = 3310,
    socket,
    timeout = 15000,
  } = options;

  function scanOnce() {
    return new Promise((resolve, reject) => {
      const connectionOptions = socket ? { path: socket } : { host, port };
      const client = net.createConnection(connectionOptions);
      const responseChunks = [];
      let settled = false;

      function finish(callback, value) {
        if (settled) {
          return;
        }

        settled = true;
        client.destroy();
        callback(value);
      }

      client.setTimeout(timeout);
      client.on("timeout", () => {
        finish(
          reject,
          new Error(`clamd connection timed out after ${timeout}ms`),
        );
      });
      client.on("error", (error) => finish(reject, error));
      client.on("data", (chunk) => responseChunks.push(chunk));
      client.on("end", () => {
        finish(
          resolve,
          parseClamdResponse(Buffer.concat(responseChunks)),
        );
      });
      client.on("connect", () => {
        client.write(CLAMD_INSTREAM);

        let offset = 0;
        while (offset < buffer.length) {
          const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
          const length = Buffer.allocUnsafe(4);
          length.writeUInt32BE(chunk.length, 0);
          client.write(length);
          client.write(chunk);
          offset += chunk.length;
        }

        client.write(Buffer.alloc(4));
        client.end();
      });
    });
  }

  function attempt(remainingRetries) {
    return scanOnce().catch(async (error) => {
      if (remainingRetries <= 0) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return attempt(remainingRetries - 1);
    });
  }

  return attempt(retries);
}

module.exports = { scanBufferViaClamd };
