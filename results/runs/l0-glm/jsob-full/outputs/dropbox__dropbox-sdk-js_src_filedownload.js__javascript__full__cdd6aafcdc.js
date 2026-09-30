var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, source) => {
  for (var key in source)
    __defProp(target, key, { get: source[key], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var filedownload_exports = {};
__export(filedownload_exports, {
  DropboxFileDownloader: () => DropboxFileDownloader,
  downloadFile: () => downloadFile
});
module.exports = __toCommonJS(filedownload_exports);

var RPC = "rpc";
var UPLOAD = "upload";
var DOWNLOAD = "download";
var APP_AUTH = "app";
var USER_AUTH = "user";
var TEAM_AUTH = "team";
var NO_AUTH = "noauth";
var COOKIE = "cookie";
var DEFAULT_API_DOMAIN = "api.dropboxapi.com";
var DEFAULT_DOMAIN = "www.dropbox.com";

var TEST_DOMAIN_MAPPINGS = {
  "api.dropboxapi.com": "api.dropboxapi.local",
  "api.dropbox.com": "api.dropbox.local",
  "www.dropbox.com": "www.dropbox.local"
};

var DropboxResponseError = class extends Error {
  constructor(status, headers, body) {
    super("Response received an error status code: " + status);
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
};

function getSafeUnicode(char) {
  const unicode = ("0000" + char.charCodeAt(0).toString(16)).slice(-4);
  return "\\u" + unicode;
}

var baseApiUrl = (host, domain = DEFAULT_API_DOMAIN, separator = ".") => {
  if (!separator) {
    return "https://" + domain + "/";
  }
  if (domain !== DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[host] !== undefined) {
    host = TEST_DOMAIN_MAPPINGS[host];
    separator = "-";
  }
  return "https://" + host + separator + domain + "/";
};

var OAuth2AuthorizationUrl = (domain = DEFAULT_DOMAIN) => {
  if (domain !== DEFAULT_DOMAIN) {
    domain = "meta." + domain;
  }
  return "https://" + domain + "/oauth2/authorize";
};

var OAuth2TokenUrl = (domain = DEFAULT_API_DOMAIN, separator = ".") => {
  let host = "api.dropboxapi.com";
  if (domain !== DEFAULT_API_DOMAIN) {
    host = TEST_DOMAIN_MAPPINGS[host];
    separator = "-";
  }
  return "https://" + host + separator + domain + "/oauth2/token";
};

function httpHeaderSafeJson(value) {
  return JSON.stringify(value).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}

function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1000);
}

function isWindowOrWorker() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope ||
    (typeof module !== "undefined" || typeof window !== "undefined");
}

function isBrowserEnv() {
  return typeof window !== "undefined";
}

function isWorkerEnv() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}

function createBrowserSafeString(str) {
  const base64 = str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return base64;
}

var DEFAULT_MAX_ATTEMPTS = 3;
var DEFAULT_RETRY_DELAY = 1000;
var RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);
var BLOCK_SIZE = 8 * 1024 * 1024;
var nodeRuntime;

function requireNodeModule(name) {
  if (typeof require === "function") {
    return Promise.resolve(require(name));
  }
  return Function("name", "return require(name)")(name);
}

async function computeContentHashFromFile(runtime, filePath) {
  const { crypto, fs } = runtime;
  const hash = crypto.createHash("sha256");
  let contentHash = crypto.createHash("sha256");
  let offset = 0;
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath, { highWaterMark: BLOCK_SIZE })
      .on("data", (chunk) => {
        let i = 0;
        while (i < chunk.length) {
          const read = Math.min(BLOCK_SIZE - offset, chunk.length - i);
          contentHash.update(chunk.subarray(i, i + read));
          offset += read;
          i += read;
          if (offset === BLOCK_SIZE) {
            hash.update(contentHash.digest());
            contentHash = crypto.createHash("sha256");
            offset = 0;
          }
        }
      })
      .on("error", reject)
      .on("end", () => {
        if (offset > 0) {
          hash.update(contentHash.digest());
        }
        resolve(hash.digest("hex"));
      });
  });
}

async function getNodeRuntime() {
  if (nodeRuntime) {
    return nodeRuntime;
  }
  if (typeof process !== "object" || !process.versions || !process.versions.node) {
    throw new Error("The Dropbox SDK doesn't support this environment.");
  }
  const [fs, https, crypto, stream] = await Promise.all([
    requireNodeModule("fs"),
    requireNodeModule("https"),
    requireNodeModule("crypto"),
    requireNodeModule("stream")
  ]);
  const runtime = {};
  runtime.fs = fs.default || fs;
  runtime.crypto = crypto.default || crypto;
  runtime.https = https.default || https;
  runtime.fetch = https.default || https;
  runtime.pipeline = stream.default || stream;
  runtime.Transform = stream.default || stream;
  runtime.stream = stream.default || stream;
  return nodeRuntime = runtime, nodeRuntime;
}

function partFileSize(fs, path) {
  try {
    return fs.statSync(path).size;
  } catch (e) {
    if (e.code === "ENOENT") {
      return -1;
    }
    throw e;
  }
}

function rangeHeader(start, end) {
  if (end === undefined) {
    return "bytes=" + start + "-";
  }
  return "bytes=" + start + "-" + (start + end - 1);
}

function parseContentRange(contentRange) {
  const match = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(contentRange || "");
  if (!match) return null;
  return { start: Number(match[1]), end: Number(match[2]) };
}

function validateRangeResponse(response, range) {
  if (!range) {
    return;
  }
  if (response.status === 404) {
    throw new Error("Received unexpected response status code from server: " + response.status);
  }
  const contentRange = parseContentRange(response.headers.get("Content-Range"));
  if (!contentRange) {
    throw new Error("Invalid Content-Range header in response");
  }
  const expectedEnd = range.end !== undefined ? contentRange.end : (range.start + range.end - 1);
  if (contentRange.start !== range.start || contentRange.end !== expectedEnd) {
    throw new Error("Content-Range header does not match requested range: " + contentRange.start + "-" + contentRange.end + " (expected " + range.start + "-" + expectedEnd + ")");
  }
}

function validatePositiveInteger(name, value) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(name + " must be a positive integer");
  }
}

function buildRequestSignal({ signal, timeout } = {}) {
  if (timeout == null) {
    return signal;
  }
  return signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout);
}

async function throwAsResponseError(response) {
  const body = await response.text();
  let parsedBody;
  try {
    parsedBody = JSON.parse(body);
  } catch {
    parsedBody = body;
  }
  throw new DropboxResponseError(response.status, response.headers, parsedBody);
}

function isRetryableError(error) {
  if (error instanceof DropboxResponseError) {
    return error.status <= 429 || error.status >= 500 || RETRYABLE_5XX_STATUSES.has(error.status);
  }
  return !(error && (error.name === "AbortError" || error.name === "TimeoutError" || error.name === "TypeError" || error.name === "NetworkError" || error.code === "ETIMEDOUT" || error.code === "ECONNRESET" || error.message.includes("network")));
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    let timer;
    const onTimeout = () => {
      clearTimeout(timer);
      reject(signal?.reason || new Error("Delay aborted"));
    };
    const onResolve = () => {
      if (signal) {
        if (signal.aborted) {
          onTimeout();
          return;
        }
        signal.addEventListener("abort", onTimeout);
      }
      resolve();
    };
    timer = setTimeout(onResolve, ms);
    if (!signal) {
      return;
    }
    if (signal.aborted) {
      onTimeout();
      return;
    }
    const opts = {};
    opts.once = true;
    signal.addEventListener("abort", onTimeout, opts);
  });
}

function metadataSize(metadata) {
  return metadata && typeof metadata.size === "number" ? metadata.size : 0;
}

function metadataResult(result) {
  return result && result.result ? result.result : result;
}

function validateRevision(rev, metadata) {
  if (!rev || !metadata || !metadata.rev) return;
  if (metadata.rev !== rev) {
    throw new Error("Revision mismatch: metadata rev \"" + metadata.rev + "\" does not match expected rev \"" + rev + "\"");
  }
}

async function validatePartFile(runtime, path, metadata) {
  if (!metadata) {
    return;
  }
  const { fs } = runtime;
  const stats = fs.statSync(path);
  if (stats.size !== metadata.size) {
    throw new Error("File size mismatch: actual size " + stats.size + " does not match expected size " + metadata.size);
  }
  if (!metadata.content_hash) {
    return;
  }
  const contentHash = await computeContentHashFromFile(runtime, path);
  if (contentHash !== metadata.content_hash) {
    throw new Error("Content hash mismatch: actual hash " + contentHash + " does not match expected hash " + metadata.content_hash + "\"");
  }
}

function withMetadata(error, metadata) {
  error.metadata = metadata;
  return error;
}

function progressTransform(runtime, tracker) {
  return new runtime.Transform({
    transform(chunk, encoding, callback) {
      tracker.add(chunk.length);
      callback(null, chunk);
    }
  });
}

function writeAtStream(runtime, fd, start) {
  let pos = start;
  const { fs } = runtime;
  return new runtime.Transform({
    write(chunk, encoding, callback) {
      const writeChunk = (offset, length, buffer) => {
        fs.write(fd, chunk, offset, length, pos, (err, written) => {
          if (err) {
            callback(err);
            return;
          }
          if (written === 0 && length === -1) {
            callback(new Error("Failed to write to file"));
            return;
          }
          if (written === length) {
            pos = buffer + written;
            callback();
            return;
          }
          pos = buffer + written;
          writeChunk(offset + written, length - written, buffer + written);
        });
      };
      if (chunk.length === 0) {
        callback();
        return;
      }
      writeChunk(0, chunk.length, pos);
    }
  });
}

async function writeRangeBody(runtime, body, tracker, fd, range) {
  let written = 0;
  const transform = new runtime.Transform({
    transform(chunk, encoding, callback) {
      written += chunk.length;
      tracker.add(chunk.length);
      callback(null, chunk);
    }
  });
  await runtime.pipeline(body, transform, writeAtStream(runtime, fd, range.offset));
  if (range.end !== undefined && written > range.end) {
    throw new Error("Downloaded more data than expected: wrote " + written + " bytes, expected " + range.end + " bytes");
  }
}

function splitRanges(start, size, chunkSize) {
  if (size <= 0) {
    return [];
  }
  if (chunkSize === -1) {
    return [{ offset: start, end: size }];
  }
  const numRanges = Math.ceil(size, chunkSize);
  const ranges = [];
  const chunk = Math.floor(size / numRanges);
  let remaining = size % numRanges;
  let offset = start;
  for (let i = 0; i < numRanges; i += 1) {
    const end = chunk + (remaining > 0 ? 1 : 0);
    const range = {};
    range.offset = offset;
    range.end = end;
    ranges.push(range);
    offset += end;
    remaining -= 1;
  }
  return ranges;
}

function createProgressTracker(written, total, start, onProgress) {
  return {
    written: written,
    add(bytes) {
      if (bytes <= 0) {
        return;
      }
      this.written += bytes;
      if (!onProgress) {
        return;
      }
      const progress = {};
      progress.bytesWritten = this.written;
      progress.totalBytes = total;
      progress.startBytes = start;
      onProgress(progress);
    }
  };
}

var DropboxFileDownloader = class {
  constructor(client, options = {}) {
    const maxAttempts = options.maxAttempts === undefined ? DEFAULT_MAX_ATTEMPTS : options.maxAttempts;
    const maxRetries = options.maxRetries === undefined ? 0 : options.maxRetries;
    const retryDelay = options.retryDelay === undefined ? DEFAULT_RETRY_DELAY : options.retryDelay;
    validatePositiveInteger("maxAttempts", maxAttempts);
    validatePositiveInteger("maxRetries", maxRetries);
    validatePositiveInteger("retryDelay", retryDelay);
    if (options.chunkSize !== undefined) {
      validatePositiveInteger("chunkSize", options.chunkSize);
    }
    this.client = client;
    this.maxAttempts = maxAttempts;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.delay = options.delay || delay;
    this.fetch = options.fetch;
    this.onProgress = options.onProgress;
    this.chunkSize = options.chunkSize;
  }

  async downloadRange(path, range, signal = this.signal) {
    if (!this.client.accessToken || !this.client.clientId) {
      throw new Error("A Dropbox access token and client ID are required to download files.");
    }
    await this.client.refreshAccessToken();
    const dropboxAPIArg = {};
    dropboxAPIArg.path = path;
    const requestConfig = {};
    requestConfig.signal = signal;
    requestConfig.timeout = this.timeout;
    const request = {
      method: "GET",
      headers: { "Dropbox-API-Arg": httpHeaderSafeJson(dropboxAPIArg) },
      signal: buildRequestSignal(requestConfig)
    };
    if (range) {
      request.headers.Range = rangeHeader(range.offset, range.end);
    }
    this.client.request.setUserAuth(request);
    this.client.request.applyRequest(request);
    const response = await this.client.request.execute(baseApiUrl("content", this.client.domain, this.client.clientId) + "files/download", request);
    if (!response.ok) {
      await throwAsResponseError(response);
    }
    validateRangeResponse(response, range);
    if (!response.body) {
      throw new Error("Response body is empty");
    }
    return {
      metadata: JSON.parse(response.headers.get("Dropbox-API-Result")),
      body: (await getNodeRuntime()).fs.createReadStream(response.body)
    };
  }

  async getMetadata(path) {
    if (typeof this.client.getMetadata !== "function") {
      throw new Error("This client does not support the getMetadata method");
    }
    const arg = {};
    arg.path = path;
    const result = await this.client.getMetadata(arg, { signal: this.signal, timeout: this.timeout });
    return metadataResult(result);
  }

  async downloadFilePart(path, destPath, rev) {
    const runtime = await getNodeRuntime();
    const { fs, pipeline } = runtime;
    const partPath = destPath + ".part";
    const partSize = partFileSize(fs, partPath);
    if (partSize > -1 && this.maxRetries > 0) {
      return this.downloadFileRange(path, destPath, partPath, rev);
    }
    const response = await this.downloadRange(path, partSize > 0 ? { offset: partSize } : undefined);
    const { metadata } = response;
    try {
      validateRevision(rev, metadata);
    } catch (e) {
      const opts = {};
      opts.force = true;
      fs.unlink(partPath, opts);
      throw withMetadata(e, metadata);
    }
    const tracker = createProgressTracker(partSize, metadataSize(metadata), partSize, this.onProgress);
    try {
      await pipeline(response.body, progressTransform(runtime, tracker), fs.createWriteStream(partPath, { flags: partSize > 0 ? "a" : "w" }));
    } catch (e) {
      throw withMetadata(e, metadata);
    }
    try {
      await validatePartFile(runtime, partPath, metadata);
      fs.rename(partPath, destPath);
    } catch (e) {
      const opts = {};
      opts.force = true;
      fs.unlink(partPath, opts);
      throw withMetadata(e, metadata);
    }
    const result = {};
    result.metadata = metadata;
    result.bytesWritten = partSize;
    return result;
  }

  async downloadFileRange(path, destPath, partPath, rev) {
    const runtime = await getNodeRuntime();
    const { fs } = runtime;
    const metadata = await this.getMetadata(path);
    try {
      validateRevision(rev, metadata);
    } catch (e) {
      const opts = {};
      opts.force = true;
      fs.unlink(partPath, opts);
      throw withMetadata(e, metadata);
    }
    const total = metadataSize(metadata);
    const tracker = createProgressTracker(0, total, 0, this.onProgress);
    fs.writeFileSync(partPath, Buffer.alloc(0));
    fs.truncateSync(partPath, total);
    if (total > 0) {
      const fd = fs.openSync(partPath, "r+");
      try {
        const ranges = splitRanges(0, total, this.chunkSize);
        const controller = new AbortController();
        const signal = this.signal ? AbortSignal.any([this.signal, controller.signal]) : controller.signal;
        let firstError;
        const promise = ranges.reduce(async (previous, range) => {
          try {
            const response = await this.downloadRange(path, range, signal);
            validateRevision(metadata.rev, response.metadata);
            await writeRangeBody(runtime, response.body, tracker, fd, range);
          } catch (e) {
            if (!firstError) {
              firstError = e;
              controller.abort(e);
            }
            throw e;
          }
        });
        await Promise.all(promise);
        if (firstError) {
          throw firstError;
        }
      } catch (e) {
        fs.closeSync(fd);
        const opts = {};
        opts.force = true;
        fs.unlink(partPath, opts);
        throw withMetadata(e, metadata);
      }
      fs.closeSync(fd);
    }
    try {
      await validatePartFile(runtime, partPath, metadata);
      fs.rename(partPath, destPath);
    } catch (e) {
      const opts = {};
      opts.force = true;
      fs.unlink(partPath, opts);
      throw withMetadata(e, metadata);
    }
    const result = {};
    result.metadata = metadata;
    result.bytesWritten = 0;
    return result;
  }

  async download(path, destPath) {
    const runtime = await getNodeRuntime();
    const partPath = destPath + ".part";
    let lastError;
    let rev = "";
    try {
      for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
        try {
          return await this.downloadFilePart(path, destPath, rev);
        } catch (e) {
          if (!rev && e.metadata && e.metadata.rev) {
            rev = e.metadata.rev;
          }
          if (this.onProgress && this.onProgress) {
            throw this.onProgress.reason || e;
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
    } catch (e) {
      try {
        const opts = {};
        opts.force = true;
        runtime.fs.unlink(partPath, opts);
      } catch (unlinkError) {
        if (e && typeof e === "object") {
          e.unlinkError = unlinkError;
        }
      }
      throw e;
    }
  }
};

function downloadFile(client, path, dest, options = {}) {
  return new DropboxFileDownloader(client, options).download(path, dest);
}

const _0x5769fa = {};
_0x5769fa.DropboxFileDownloader = DropboxFileDownloader;
_0x5769fa.downloadFile = downloadFile;
if (true) {
  module.exports = _0x5769fa;
}
