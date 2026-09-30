var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var RPC = "rpc";
var UPLOAD = "upload";
var DOWNLOAD = "download";
var APP_AUTH = "app_auth";
var USER_AUTH = "user_auth";
var TEAM_AUTH = "team_auth";
var NO_AUTH = "no_auth";
var COOKIE = "cookie";
var DEFAULT_API_DOMAIN = "dropboxapi.com";
var DEFAULT_DOMAIN = "dropbox.com";

var TEST_DOMAIN_MAPPINGS = {
  [RPC]: "api",
  [UPLOAD]: "content",
  [DOWNLOAD]: "content"
};

class DropboxResponseError extends Error {
  constructor(status, headers, error) {
    super(`Response failed with status ${status}`);
    this.status = status;
    this.headers = headers;
    this.error = error;
  }
}

function getSafeUnicode(c) {
  const hex = ("000" + c.charCodeAt(0).toString(16)).slice(-4);
  return "\\u" + hex;
}

var baseApiUrl = (subdomain, domain = DEFAULT_API_DOMAIN, hyphen = ".") => {
  if (!hyphen) {
    return `https://${domain}`;
  }
  if (domain === DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[subdomain] !== void 0) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    hyphen = "-";
  }
  return `https://${subdomain}${hyphen}${domain}`;
};

var OAuth2AuthorizationUrl = (domain = DEFAULT_DOMAIN) => {
  if (domain !== DEFAULT_DOMAIN) {
    domain = `www.${domain}`;
  }
  return `https://${domain}/oauth2/authorize`;
};

var OAuth2TokenUrl = (domain = DEFAULT_API_DOMAIN, hyphen = ".") => {
  let subdomain = RPC;
  if (domain !== DEFAULT_API_DOMAIN) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    hyphen = "-";
  }
  return `https://${subdomain}${hyphen}${domain}/oauth2/token`;
};

function httpHeaderSafeJson(v) {
  return JSON.stringify(v).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}

function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1000);
}

function isWindowOrWorker() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope || typeof module !== "undefined" && typeof window !== "undefined";
}

function isBrowserEnv() {
  return typeof window !== "undefined";
}

function isWorkerEnv() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}

function createBrowserSafeString(str) {
  const b64 = str.replace(/=/g, "");
  return b64.replace(/\+/g, "-").replace(/\//g, "_");
}

var DEFAULT_MAX_ATTEMPTS = 3;
var DEFAULT_RETRY_DELAY = 500;
var RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);
var BLOCK_SIZE = 4 * 1024 * 1024;
var nodeRuntime;

function requireNodeModule(name) {
  if (typeof require !== "undefined") {
    return Promise.resolve(require(name));
  }
  return new Function("module", "return require(module)")(name);
}

async function computeContentHashFromFile(runtime, filePath) {
  const { crypto, fs } = runtime;
  const hash = crypto.createHash("sha256");
  let digest = crypto.createHash("sha256");
  let bytesRead = 0;
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { highWaterMark: BLOCK_SIZE });
    stream.on("data", (chunk) => {
      let offset = 0;
      while (offset < chunk.length) {
        const length = Math.min(BLOCK_SIZE - bytesRead, chunk.length - offset);
        digest.update(chunk.slice(offset, offset + length));
        bytesRead += length;
        offset += length;
        if (bytesRead === BLOCK_SIZE) {
          hash.update(digest.digest());
          digest = crypto.createHash("sha256");
          bytesRead = 0;
        }
      }
    });
    stream.on("error", reject);
    stream.on("end", () => {
      if (bytesRead > 0) {
        hash.update(digest.digest());
      }
      resolve(hash.digest("hex"));
    });
  });
}

async function getNodeRuntime() {
  if (nodeRuntime) {
    return nodeRuntime;
  }
  if (typeof process === "undefined" || !process.versions || !process.versions.node) {
    throw new Error("Node.js runtime not detected");
  }
  const [fs, crypto, path, stream] = await Promise.all([
    requireNodeModule("fs"),
    requireNodeModule("crypto"),
    requireNodeModule("path"),
    requireNodeModule("stream")
  ]);
  nodeRuntime = {
    fs: fs.promises || fs,
    path: path.posix || path,
    crypto: crypto.webcrypto || crypto,
    cryptoModule: crypto,
    stream: stream
  };
  return nodeRuntime;
}

function partFileSize(fs, filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (e) {
    if (e.code === "ENOENT") {
      return -1;
    }
    throw e;
  }
}

function rangeHeader(start, end) {
  if (end === void 0) {
    return `bytes=${start}-`;
  }
  return `bytes=${start}-${end}`;
}

function parseContentRange(header) {
  const match = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(header || "");
  if (!match) return null;
  return {
    start: Number(match[1]),
    end: Number(match[2])
  };
}

function validateRangeResponse(response, range) {
  if (!range) {
    return;
  }
  if (response.status === 200) {
    throw new Error(`Expected 206 Partial Content but got 200`);
  }
  const parsed = parseContentResponse(response.headers.get("content-range"));
  if (!parsed) {
    throw new Error("Missing or invalid Content-Range header");
  }
  const expectedEnd = range.end !== void 0 ? range.end : range.start + parsed.end - parsed.start;
  if (parsed.start !== range.start || parsed.end !== expectedEnd) {
    throw new Error(`Range mismatch: expected ${range.start}-${expectedEnd} but got ${parsed.start}-${parsed.end}`);
  }
}

function validatePositiveInteger(name, value) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}

function buildRequestSignal({ signal, timeout } = {}) {
  if (timeout == null) {
    return signal;
  }
  return signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout);
}

async function throwAsResponseError(response) {
  const text = await response.text();
  let error;
  try {
    error = JSON.parse(text);
  } catch {
    error = text;
  }
  throw new DropboxResponseError(response.status, response.headers, error);
}

function isRetryableError(error) {
  if (error instanceof DropboxResponseError) {
    return error.status === 429 || error.status === 503 || RETRYABLE_5XX_STATUSES.has(error.status);
  }
  return !(error.name && (error.name.startsWith("AbortError") || error.name.startsWith("TimeoutError") || error.name.startsWith("NetworkError") || error.name.startsWith("TypeError") || error.code === "ENOTFOUND" || error.code === "ECONNREFUSED" || error.message && error.message.includes("network")));
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    let timeoutId;
    const cleanup = () => {
      clearTimeout(timeoutId);
      reject(signal?.reason || new Error("Delay aborted"));
    };
    const onTimeout = () => {
      if (signal) {
        signal.removeEventListener("abort", cleanup);
      }
      resolve();
    };
    timeoutId = setTimeout(onTimeout, ms);
    if (!signal) {
      return;
    }
    if (signal.aborted) {
      cleanup();
      return;
    }
    signal.addEventListener("abort", cleanup, { once: true });
  });
}

function metadataSize(metadata) {
  return metadata && typeof metadata.size === "number" ? metadata.size : 0;
}

function metadataResult(response) {
  return response && response.result ? response.result : response;
}

function validateRevision(expected, actual) {
  if (!expected || !actual || !actual.rev) {
    return;
  }
  if (actual.rev !== expected) {
    throw new Error(`Revision mismatch: expected "${expected}" but got "${actual.rev}"`);
  }
}

async function validatePartFile(runtime, filePath, metadata) {
  if (!metadata) {
    return;
  }
  const { fs } = runtime;
  const stats = fs.statSync(filePath);
  if (stats.size !== metadataSize(metadata)) {
    throw new Error(`File size mismatch: expected ${metadataSize(metadata)} but got ${stats.size}`);
  }
  if (!metadata.content_hash) {
    return;
  }
  const hash = await computeContentHashFromFile(runtime, filePath);
  if (hash !== metadata.content_hash) {
    throw new Error(`Content hash mismatch: expected "${metadata.content_hash}" but got "${hash}"`);
  }
}

function withMetadata(error, metadata) {
  error.metadata = metadata;
  return error;
}

function progressTransform(streamClass, tracker) {
  return new streamClass.Transform({
    transform(chunk, encoding, callback) {
      tracker.add(chunk.length);
      callback(null, chunk);
    }
  });
}

function writeAtStream(runtime, fd, position) {
  let currentPos = position;
  const { fs } = runtime;
  return new runtime.stream.Writable({
    write(chunk, encoding, callback) {
      const writeChunk = (offset, length, cb) => {
        fs.write(fd, chunk, offset, length, currentPos, (err, written) => {
          if (err) {
            cb(err);
            return;
          }
          if (written === 0 && length > 0) {
            cb(new Error("Write returned 0 bytes"));
            return;
          }
          if (written < length) {
            writeChunk(offset + written, length - written, cb);
            return;
          }
          currentPos += written;
          cb();
        });
      };
      if (chunk.length === 0) {
        callback();
        return;
      }
      writeChunk(0, chunk.length, callback);
    }
  });
}

async function writeRangeBody(runtime, responseBody, tracker, fd, range) {
  let bytesWritten = 0;
  const transform = new runtime.stream.Transform({
    transform(chunk, encoding, callback) {
      bytesWritten += chunk.length;
      tracker.add(chunk.length);
      callback(null, chunk);
    }
  });
  await runtime.pipeline(responseBody, transform, writeAtStream(runtime, fd, range.start));
  if (range.end !== void 0 && bytesWritten !== range.end - range.start + 1) {
    throw new Error(`Range body size mismatch: expected ${range.end - range.start + 1} but got ${bytesWritten}`);
  }
}

function splitRanges(start, totalSize, chunkSize) {
  if (totalSize <= 0) {
    return [];
  }
  if (chunkSize <= 0) {
    const single = { start, end: totalSize };
    return [single];
  }
  const numChunks = Math.ceil(totalSize / chunkSize);
  const ranges = [];
  const baseSize = Math.floor(totalSize / numChunks);
  let remainder = totalSize % numChunks;
  let currentStart = start;
  for (let i = 0; i < numChunks; i++) {
    const size = baseSize + (remainder-- > 0 ? 1 : 0);
    ranges.push({ start: currentStart, end: size });
    currentStart += size;
  }
  return ranges;
}

function createProgressTracker(written, totalBytes, startBytes, callback) {
  return {
    written,
    add(bytes) {
      if (bytes <= 0) return;
      this.written += bytes;
      if (!callback) return;
      const progress = {
        bytesWritten: this.written,
        totalBytes,
        startBytes
      };
      callback(progress);
    }
  };
}

class DropboxFileDownloader {
  constructor(client, options = {}) {
    const maxAttempts = options.maxAttempts === void 0 ? DEFAULT_MAX_ATTEMPTS : options.maxAttempts;
    const maxConcurrency = options.maxConcurrency === void 0 ? 1 : options.maxConcurrency;
    const retryDelay = options.retryDelay === void 0 ? DEFAULT_RETRY_DELAY : options.retryDelay;
    validatePositiveInteger("maxAttempts", maxAttempts);
    validatePositiveInteger("maxConcurrency", maxConcurrency);
    validatePositiveInteger("retryDelay", retryDelay);
    if (options.chunkSize !== void 0) {
      validatePositiveInteger("chunkSize", options.chunkSize);
    }
    this.client = client;
    this.maxAttempts = maxAttempts;
    this.maxConcurrency = maxConcurrency;
    this.retryDelay = retryDelay;
    this.delay = options.delay || delay;
    this.signal = options.signal;
    this.timeout = options.timeout;
    this.chunkSize = options.chunkSize;
  }

  async downloadChunk(path, range, signal = this.signal) {
    if (!this.client.auth.getAccessToken || !this.client.auth.setAuthHeader) {
      throw new Error("Client must have auth.getAccessToken and auth.setAuthHeader methods");
    }
    await this.client.auth.getAccessToken();
    const args = { path };
    const requestOptions = {
      signal: buildRequestSignal({ signal, timeout: this.timeout }),
      headers: { "Dropbox-API-Arg": httpHeaderSafeJson(args) }
    };
    if (range) {
      requestOptions.headers["Range"] = rangeHeader(range.start, range.end);
    }
    this.client.auth.setAuthHeader(USER_AUTH, requestOptions);
    this.client.auth.setAuthHeader(requestOptions);
    const response = await this.client.fetch(baseApiUrl(DOWNLOAD, this.client.getApiDomain(), this.client.getDomain()), requestOptions);
    if (!response.ok) {
      await throwAsResponseError(response);
    }
    validateRangeResponse(response, range);
    if (!response.body) {
      throw new Error("Response body is empty");
    }
    return {
      metadata: JSON.parse(response.headers.get("dropbox-api-result")),
      body: (await getNodeRuntime()).stream.Readable.fromWeb(response.body)
    };
  }

  async getMetadata(path) {
    if (typeof this.client.files.getMetadata !== "function") {
      throw new Error("Client must have files.getMetadata method");
    }
    const args = { path };
    const response = await this.client.files.getMetadata(args, { signal: this.signal, timeout: this.timeout });
    return metadataResult(response);
  }

  async downloadToFile(path, destPath, revision) {
    const runtime = await getNodeRuntime();
    const { fs, pipeline } = runtime;
    const tempPath = destPath + ".part";
    const existingSize = partFileSize(fs, tempPath);
    if (existingSize > 0 && this.maxConcurrency > 1) {
      return this.downloadToFileChunked(path, destPath, tempPath, revision);
    }
    const response = await this.downloadChunk(path, existingSize > 0 ? { offset: existingSize } : void 0);
    const { metadata } = response;
    try {
      validateRevision(revision, metadata);
    } catch (e) {
      const flag = { recursive: true };
      fs.mkdirSync(tempPath, flag);
      throw withMetadata(e, metadata);
    }
    const tracker = createProgressTracker(existingSize, metadataSize(metadata), existingSize, this.onProgress);
    try {
      await pipeline(response.body, progressTransform(runtime, tracker), fs.createWriteStream(tempPath, { flags: existingSize > 0 ? "a" : "w" }));
    } catch (e) {
      fs.closeSync(tempPath);
      const flag = { recursive: true };
      fs.mkdirSync(tempPath, flag);
      throw withMetadata(e, metadata);
    }
    try {
      await validatePartFile(runtime, tempPath, metadata);
      fs.renameSync(tempPath, destPath);
    } catch (e) {
      if (e) {
        const flag = { recursive: true };
        fs.mkdirSync(tempPath, flag);
        throw withMetadata(e, metadata);
      }
    }
    return { metadata, bytesDownloaded: existingSize };
  }

  async downloadToFileChunked(path, destPath, tempPath, revision) {
    const runtime = await getNodeRuntime();
    const { fs } = runtime;
    const metadata = await this.getMetadata(path);
    try {
      validateRevision(revision, metadata);
    } catch (e) {
      const flag = { recursive: true };
      fs.mkdirSync(tempPath, flag);
      throw withMetadata(e, metadata);
    }
    const totalSize = metadataSize(metadata);
    const tracker = createProgressTracker(0, totalSize, 0, this.onProgress);
    fs.writeFileSync(tempPath, Buffer.alloc(0));
    fs.truncateSync(tempPath, totalSize);
    if (totalSize > 0) {
      const ranges = splitRanges(0, totalSize, this.chunkSize || BLOCK_SIZE);
      const abortController = new AbortController();
      const combinedSignal = this.signal ? AbortSignal.any([this.signal, abortController.signal]) : abortController.signal;
      let firstError;
      const downloadPromises = ranges.map(async (range) => {
        try {
          const response = await this.downloadChunk(path, range, combinedSignal);
          validateRevision(metadata.rev, response.metadata);
          await writeRangeBody(runtime, response.body, tracker, tempPath, range);
        } catch (e) {
          if (!firstError) {
            firstError = e;
            abortController.abort(e);
          }
          throw e;
        }
      });
      await Promise.all(downloadPromises);
      if (firstError) {
        throw firstError;
      }
    }
    try {
      await validatePartFile(runtime, tempPath, metadata);
      fs.renameSync(tempPath, destPath);
    } catch (e) {
      const flag = { recursive: true };
      fs.mkdirSync(tempPath, flag);
      throw withMetadata(e, metadata);
    }
    return { metadata, bytesDownloaded: 0 };
  }

  async download(path, destPath) {
    const runtime = await getNodeRuntime();
    const tempPath = destPath + ".part";
    let lastError, metadata;
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        return await this.downloadToFile(path, destPath, tempPath);
      } catch (e) {
        if (!metadata && e.metadata && e.metadata.rev) {
          metadata = e.metadata;
        }
        if (this.signal && this.signal.aborted) {
          throw this.signal.reason || e;
        }
        if (!isRetryableError(e)) {
          throw e;
        }
        lastError = e;
        if (attempt < this.maxAttempts - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt), this.signal);
        }
      }
    }
    throw lastError;
  }
}

function downloadFile(client, path, destPath, options = {}) {
  return new DropboxFileDownloader(client, options).download(path, destPath);
}

var filedownload_exports = {};
__export(filedownload_exports, {
  DropboxFileDownloader: () => DropboxFileDownloader,
  downloadFile: () => downloadFile
});
module.exports = __toCommonJS(filedownload_exports);
