"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/pompelmi__pompelmi/src/verdicts.js
var require_verdicts = __commonJS({
  "../work/pompelmi__pompelmi/src/verdicts.js"(exports2, module2) {
    "use strict";
    var Verdict2 = Object.freeze({
      Clean: Symbol("Clean"),
      Malicious: Symbol("Malicious"),
      ScanError: Symbol("ScanError")
    });
    module2.exports = { Verdict: Verdict2 };
  }
});

// ../work/pompelmi__pompelmi/src/BufferScanner.js
var net = require("net");
var { Verdict } = require_verdicts();
var isBun = typeof Bun !== "undefined";
var CLAMD_INSTREAM = Buffer.from("zINSTREAM\0");
var CHUNK_SIZE = 64 * 1024;
function parseClamdResponse(raw) {
  const text = raw.toString("utf8").replace(/\0/g, "").trim();
  if (text === "stream: OK") return Verdict.Clean;
  if (text.endsWith(" FOUND")) return Verdict.Malicious;
  return Verdict.ScanError;
}
function scanBufferViaClamd(buffer, options = {}) {
  const { retries = 0, retryDelay = 1e3, host = "127.0.0.1", port = 3310, socket: socketPath, timeout = 15e3 } = options;
  function attempt() {
    return new Promise((resolve, reject) => {
      const connOpts = socketPath ? { path: socketPath } : { host, port };
      const conn = net.createConnection(connOpts);
      const chunks = [];
      let settled = false;
      function settle(fn, value) {
        if (settled) return;
        settled = true;
        conn.destroy();
        fn(value);
      }
      conn.setTimeout(timeout);
      conn.on(
        "timeout",
        () => settle(reject, new Error(`clamd connection timed out after ${timeout}ms`))
      );
      conn.on("error", (err) => settle(reject, err));
      conn.on("data", (chunk) => chunks.push(chunk));
      conn.on("end", () => settle(resolve, parseClamdResponse(Buffer.concat(chunks))));
      conn.on("connect", () => {
        conn.write(CLAMD_INSTREAM);
        let offset = 0;
        while (offset < buffer.length) {
          const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
          const header = Buffer.allocUnsafe(4);
          header.writeUInt32BE(chunk.length, 0);
          conn.write(header);
          conn.write(chunk);
          offset += chunk.length;
        }
        conn.write(Buffer.alloc(4));
        conn.end();
      });
    });
  }
  function run(left) {
    return attempt().catch(async (err) => {
      if (left <= 0) throw err;
      await new Promise((r) => setTimeout(r, retryDelay));
      return run(left - 1);
    });
  }
  return run(retries);
}
module.exports = { scanBufferViaClamd };
