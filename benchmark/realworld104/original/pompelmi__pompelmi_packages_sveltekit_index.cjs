"use strict";

// ../work/pompelmi__pompelmi/packages/sveltekit/index.js
var { scanBuffer, Verdict } = require("pompelmi");
var NodeFile = globalThis.File ?? require("node:buffer").File;
var SCAN_KEYS = ["host", "port", "socket", "timeout", "retries", "retryDelay"];
function buildScanOptions(options) {
  const out = {};
  for (const k of SCAN_KEYS) {
    if (options[k] !== void 0) out[k] = options[k];
  }
  return out;
}
async function toBuffer(file) {
  if (Buffer.isBuffer(file)) return file;
  if (file instanceof Uint8Array) return Buffer.from(file);
  if (file && typeof file.arrayBuffer === "function") {
    return Buffer.from(await file.arrayBuffer());
  }
  return null;
}
async function scanUpload(file, options) {
  if (!file) return Verdict.Clean;
  const scanOptions = buildScanOptions(options || {});
  const buffer = await toBuffer(file);
  if (!buffer || buffer.length === 0) return Verdict.Clean;
  const result = await scanBuffer(buffer, scanOptions);
  if (result === Verdict.Malicious) {
    const filename = file && typeof file.name === "string" ? file.name : "upload";
    const onInfected = options && options.onInfected;
    if (typeof onInfected === "function") {
      return onInfected({ filename });
    }
    throw new Response(
      JSON.stringify({ error: "Malware detected", filename }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }
  return result;
}
async function scanFormData(formData, options) {
  if (!formData || typeof formData.entries !== "function") return;
  for (const [, value] of formData.entries()) {
    if (value instanceof NodeFile || value && typeof value.arrayBuffer === "function") {
      await scanUpload(value, options);
    }
  }
}
module.exports = { scanUpload, scanFormData, Verdict };
