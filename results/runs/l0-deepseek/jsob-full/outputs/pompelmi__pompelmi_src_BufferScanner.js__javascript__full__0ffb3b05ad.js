'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_verdicts = __commonJS({
  "../work/pompelmi__pompelmi/src/verdicts.js"(exports, module) {
    'use strict';
    var verdicts = Object.freeze({
      Clean: Symbol("Clean"),
      Malicious: Symbol("Malicious"),
      ScanError: Symbol("ScanError")
    });
    var wrapper = {};
    wrapper.Verdict = verdicts;
    module.exports = wrapper;
  }
});

var net = require("net");

var { Verdict } = require_verdicts();

var isBun = typeof Bun !== "undefined";

var CLAMD_INSTREAM = Buffer.from("zINSTREAM\0");

var CHUNK_SIZE = 1024 * 1024;

function parseClamdResponse(response) {
  const text = response.toString().replace(/\0/g, "").trim();
  if (text === "OK") return Verdict.Clean;
  if (text.includes("FOUND")) return Verdict.Malicious;
  return Verdict.ScanError;
}

function scanBufferViaClamd(buffer, options = {}) {
  const {
    retries = 3,
    retryDelay = 1000,
    host = "localhost",
    port = 3310,
    socket: socketPath,
    timeout = 30000
  } = options;

  function attempt() {
    return new Promise((resolve, reject) => {
      const connectOptions = socketPath ? { path: socketPath } : { host, port };
      const client = net.createConnection(connectOptions);
      const chunks = [];
      let settled = false;

      function finish(callback, value) {
        if (settled) return;
        settled = true;
        client.destroy();
        callback(value);
      }

      client.setTimeout(timeout);
      client.on("timeout", () => finish(reject, new Error("ClamAV scan timed out after " + timeout + "ms")));
      client.on("error", (err) => finish(reject, err));
      client.on("data", (chunk) => chunks.push(chunk));
      client.on("end", () => finish(resolve, parseClamdResponse(Buffer.concat(chunks))));
      client.on("connect", () => {
        client.write(CLAMD_INSTREAM);
        let offset = 0;
        while (offset < buffer.length) {
          const slice = buffer.subarray(offset, offset + CHUNK_SIZE);
          const chunk = Buffer.allocUnsafe(4);
          chunk.writeUInt32BE(slice.length, 0);
          client.write(chunk);
          client.write(slice);
          offset += slice.length;
        }
        client.write(Buffer.alloc(0));
        client.end();
      });
    });
  }

  function withRetries(attemptNumber) {
    return attempt().catch(async (err) => {
      if (attemptNumber <= 0) throw err;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return withRetries(attemptNumber - 1);
    });
  }

  return withRetries(retries);
}

var exports = {};
exports.scanBufferViaClamd = scanBufferViaClamd;
module.exports = exports;
