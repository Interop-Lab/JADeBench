"use strict";
var RPC = "rpc";
var UPLOAD = "upload";
var DOWNLOAD = "download";
var APP_AUTH = "app";
var USER_AUTH = "user";
var TEAM_AUTH = "team";
var NO_AUTH = "noauth";
var COOKIE = "cookie";
var DEFAULT_API_DOMAIN = "api.dropboxapi.com";
var DEFAULT_DOMAIN = "dropbox.com";
var TEST_DOMAIN_MAPPINGS = { "api": "api-test", "notify": "bolt", "content": "api-content" };

class DropboxResponseError extends Error {
  constructor(status, text, json) {
    super("Response failed with a " + "" + status + " code");
    this.status = status;
    this.text = text;
    this.json = json;
  }
}

function getSafeUnicode(c) {
  let u = c.charCodeAt(0);
  if (u >= 0xD800 && u <= 0xDBFF) {
    let u2 = c.charCodeAt(1);
    u = 0x10000 + ((u & 0x3FF) << 10) + (u2 & 0x3FF);
  }
  return u;
}

var baseApiUrl = (host, domain, domainType) => {
  if (domainType === "api") {
    return "https://" + (host || DEFAULT_API_DOMAIN);
  }
  if (domainType === "content") {
    return "https://" + (host || "api-content.dropbox.com");
  }
  if (domainType === "notify") {
    return "https://" + (host || "api-notify.dropbox.com");
  }
  return "https://" + (host || DEFAULT_DOMAIN);
};

var OAuth2AuthorizationUrl = (host) => {
  return "https://" + (host || "www.dropbox.com") + "/oauth2/authorize";
};

var OAuth2TokenUrl = (host, domain) => {
  return "https://" + (host || DEFAULT_API_DOMAIN) + "/oauth2/token";
};

function httpHeaderSafeJson(obj) {
  return JSON.stringify(obj).replace(/[\u0000-\u001F\u007F-\u009F]/g, function (c) {
    return "\\u" + ("000" + getSafeUnicode(c).toString(16)).slice(-4);
  });
}

function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1000);
}

function isWindowOrWorker() {
  return typeof self !== "undefined" && typeof window === "undefined";
}

function isBrowserEnv() {
  return typeof window !== "undefined";
}

function isWorkerEnv() {
  return typeof self !== "undefined" && typeof window === "undefined" && typeof importScripts === "function";
}

function createBrowserSafeString(str) {
  return str.replace(/[^\x20-\x7E]/g, function (c) {
    return "\\u" + ("000" + getSafeUnicode(c).toString(16)).slice(-4);
  });
}

var DEFAULT_MAX_ATTEMPTS = 3;
var DEFAULT_RETRY_DELAY = 500;
var RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);
var BLOCK_SIZE = 4 * 1024 * 1024;
var nodeRuntime;

function requireNodeModule(name) {
  if (typeof require !== "undefined") {
    return require(name);
  }
  throw new Error("require is not available");
}

function computeContentHashFromFile(filePath, contentHasher) {
  if (typeof process === "undefined" || !process.versions || !process.versions.node) {
    throw new Error("Node.js environment required");
  }
  const fs = requireNodeModule("fs");
  const crypto = requireNodeModule("crypto");
  const hash = crypto.createHash("sha256");
  const fd = fs.openSync(filePath, "r");
  const buffer = Buffer.alloc(1024 * 1024);
  let bytesRead;
  while ((bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null)) > 0) {
    hash.update(buffer.slice(0, bytesRead));
  }
  fs.closeSync(fd);
  return hash.digest("hex");
}

function getNodeRuntime() {
  if (!nodeRuntime) {
    if (typeof process !== "undefined" && process.versions && process.versions.node) {
      nodeRuntime = {
        fs: requireNodeModule("fs"),
        crypto: requireNodeModule("crypto"),
        stream: requireNodeModule("stream"),
        Buffer: Buffer
      };
    }
  }
  return nodeRuntime;
}

function partFileSize(offset, fileSize) {
  return Math.min(BLOCK_SIZE, fileSize - offset);
}

function rangeHeader(offset, length) {
  return "bytes=" + offset + "-" + (offset + length - 1);
}

function parseContentRange(contentRange) {
  if (!contentRange) return null;
  const match = contentRange.match(/bytes (\d+)-(\d+)\/(\d+)/);
  if (!match) return null;
  return {
    start: parseInt(match[1], 10),
    end: parseInt(match[2], 10),
    total: parseInt(match[3], 10)
  };
}

function validateRangeResponse(response, expectedRange) {
  const contentRange = response.headers.get("Content-Range");
  const parsed = parseContentRange(contentRange);
  if (!parsed) {
    throw new DropboxResponseError(response.status, "Missing or invalid Content-Range header", null);
  }
  if (expectedRange && (parsed.start !== expectedRange.start || parsed.end !== expectedRange.end)) {
    throw new DropboxResponseError(response.status, "Unexpected range in response", null);
  }
  return parsed;
}

function validatePositiveInteger(value, name) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new TypeError(name + " must be a positive integer");
  }
  return value;
}

function buildRequestSignal() {
  if (typeof AbortController !== "undefined") {
    const controller = new AbortController();
    return { signal: controller.signal, controller: controller };
  }
  return { signal: undefined, controller: undefined };
}

function throwAsResponseError(response) {
  return response.text().then(function (text) {
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {}
    throw new DropboxResponseError(response.status, text, json);
  });
}

function isRetryableError(error) {
  if (error instanceof DropboxResponseError) {
    return RETRYABLE_5XX_STATUSES.has(error.status);
  }
  return false;
}

function delay(ms, signal) {
  return new Promise(function (resolve, reject) {
    let timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener("abort", function () {
        clearTimeout(timer);
        reject(new Error("Aborted"));
      });
    }
  });
}

function metadataSize(metadata) {
  if (metadata && metadata.size !== undefined) {
    return metadata.size;
  }
  throw new Error("Metadata does not contain size");
}

function metadataResult(metadata) {
  if (metadata && metadata.result) {
    return metadata.result;
  }
  return metadata;
}

function validateRevision(revision, expectedRevision) {
  if (expectedRevision && revision !== expectedRevision) {
    throw new Error("Revision mismatch: expected " + expectedRevision + ", got " + revision);
  }
  return revision;
}

function validatePartFile(partFile, offset, expectedSize) {
  if (!partFile) {
    throw new Error("Part file is required");
  }
  if (expectedSize !== undefined && partFile.size !== expectedSize) {
    throw new Error("Part file size mismatch: expected " + expectedSize + ", got " + partFile.size);
  }
  return partFile;
}

function withMetadata(response, metadata) {
  if (response && response.headers) {
    const metadataHeader = response.headers.get("Dropbox-API-Result");
    if (metadataHeader) {
      try {
        metadata = JSON.parse(metadataHeader);
      } catch (e) {}
    }
  }
  return { response: response, metadata: metadata };
}

function progressTransform(transform, callback) {
  return function (data) {
    if (callback && typeof callback === "function") {
      callback(transform(data));
    }
    return data;
  };
}

function writeAtStream(stream, offset, data) {
  if (stream && typeof stream.write === "function") {
    if (typeof stream.writeAt === "function") {
      stream.writeAt(offset, data);
    } else {
      stream.write(data);
    }
  }
  return data;
}

function writeRangeBody(body, start, end, total, stream) {
  if (body && typeof body.getReader === "function") {
    const reader = body.getReader();
    let offset = start;
    function pump() {
      return reader.read().then(function (result) {
        if (result.done) return;
        writeAtStream(stream, offset, result.value);
        offset += result.value.length || result.value.byteLength || 0;
        return pump();
      });
    }
    return pump();
  }
  return Promise.resolve();
}

function splitRanges(fileSize, chunkSize, maxRanges) {
  const ranges = [];
  let offset = 0;
  let count = 0;
  while (offset < fileSize && (maxRanges === undefined || count < maxRanges)) {
    const length = Math.min(chunkSize || BLOCK_SIZE, fileSize - offset);
    ranges.push({ start: offset, end: offset + length - 1, length: length });
    offset += length;
    count++;
  }
  return ranges;
}

function createProgressTracker(total, onProgress, onPartComplete, onComplete) {
  let loaded = 0;
  return {
    update: function (chunkSize) {
      loaded += chunkSize;
      if (onProgress) onProgress(loaded, total);
    },
    partComplete: function (part) {
      if (onPartComplete) onPartComplete(part);
    },
    complete: function (result) {
      if (onComplete) onComplete(result);
    },
    get loaded() { return loaded; },
    get total() { return total; }
  };
}

class DropboxFileDownloader {
  constructor(dbx) {
    this.dbx = dbx;
    this.maxAttempts = DEFAULT_MAX_ATTEMPTS;
    this.retryDelay = DEFAULT_RETRY_DELAY;
  }

  async downloadFile(path, destination, options) {
    options = options || {};
    const metadata = await this.fetchMetadata(path);
    const fileSize = metadataSize(metadata);
    const tracker = createProgressTracker(
      fileSize,
      options.onProgress,
      options.onPartComplete,
      options.onComplete
    );
    if (fileSize <= BLOCK_SIZE) {
      const result = await this.downloadFileAttempt(path, 0, fileSize, options);
      tracker.update(fileSize);
      tracker.complete(result);
      return result;
    }
    const result = await this.downloadFileParallel(path, fileSize, destination, options);
    tracker.complete(result);
    return result;
  }

  async fetchMetadata(path) {
    const response = await this.dbx.filesGetMetadata({ path: path });
    return metadataResult(response);
  }

  async downloadFileAttempt(path, offset, length, options) {
    const { signal, controller } = buildRequestSignal();
    const headers = {};
    headers["Range"] = rangeHeader(offset, length);
    const response = await fetch(baseApiUrl(null, null, "content") + "/2/files/download", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ path: path }),
      signal: signal
    });
    if (!response.ok) {
      await throwAsResponseError(response);
    }
    validateRangeResponse(response, { start: offset, end: offset + length - 1 });
    return response;
  }

  async downloadFileParallel(path, fileSize, destination, options) {
    const ranges = splitRanges(fileSize, BLOCK_SIZE);
    const results = [];
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      let attempt = 0;
      let success = false;
      let result;
      while (attempt < this.maxAttempts && !success) {
        try {
          result = await this.downloadFileAttempt(path, range.start, range.length, options);
          success = true;
        } catch (error) {
          attempt++;
          if (isRetryableError(error) && attempt < this.maxAttempts) {
            await delay(this.retryDelay);
          } else {
            throw error;
          }
        }
      }
      results.push(result);
    }
    return results;
  }

  async downloadFile(path, destination, options) {
    return this.downloadFile(path, destination, options);
  }
}

function downloadFile(dbx, path, destination) {
  const downloader = new DropboxFileDownloader(dbx);
  return downloader.downloadFile(path, destination);
}

var filedownload_exports = {};
filedownload_exports.DropboxFileDownloader = DropboxFileDownloader;
filedownload_exports.downloadFile = downloadFile;
module.exports = filedownload_exports;
