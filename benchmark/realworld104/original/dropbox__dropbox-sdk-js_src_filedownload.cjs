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

// ../work/dropbox__dropbox-sdk-js/src/filedownload.js
var filedownload_exports = {};
__export(filedownload_exports, {
  DropboxFileDownloader: () => DropboxFileDownloader,
  downloadFile: () => downloadFile
});
module.exports = __toCommonJS(filedownload_exports);

// ../work/dropbox__dropbox-sdk-js/src/constants.js
var RPC = "rpc";
var UPLOAD = "upload";
var DOWNLOAD = "download";
var APP_AUTH = "app";
var USER_AUTH = "user";
var TEAM_AUTH = "team";
var NO_AUTH = "noauth";
var COOKIE = "cookie";
var DEFAULT_API_DOMAIN = "dropboxapi.com";
var DEFAULT_DOMAIN = "dropbox.com";
var TEST_DOMAIN_MAPPINGS = {
  api: "api",
  notify: "bolt",
  content: "api-content"
};

// ../work/dropbox__dropbox-sdk-js/src/error.js
var DropboxResponseError = class extends Error {
  constructor(status, headers, error) {
    super(`Response failed with a ${status} code`);
    this.name = "DropboxResponseError";
    this.status = status;
    this.headers = headers;
    this.error = error;
  }
};

// ../work/dropbox__dropbox-sdk-js/src/utils.js
function getSafeUnicode(c) {
  const unicode = `000${c.charCodeAt(0).toString(16)}`.slice(-4);
  return `\\u${unicode}`;
}
var baseApiUrl = (subdomain, domain = DEFAULT_API_DOMAIN, domainDelimiter = ".") => {
  if (!domainDelimiter) {
    return `https://${domain}/2/`;
  }
  if (domain !== DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[subdomain] !== void 0) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    domainDelimiter = "-";
  }
  return `https://${subdomain}${domainDelimiter}${domain}/2/`;
};
var OAuth2AuthorizationUrl = (domain = DEFAULT_DOMAIN) => {
  if (domain !== DEFAULT_DOMAIN) {
    domain = `meta-${domain}`;
  }
  return `https://${domain}/oauth2/authorize`;
};
var OAuth2TokenUrl = (domain = DEFAULT_API_DOMAIN, domainDelimiter = ".") => {
  let subdomain = "api";
  if (domain !== DEFAULT_API_DOMAIN) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    domainDelimiter = "-";
  }
  return `https://${subdomain}${domainDelimiter}${domain}/oauth2/token`;
};
function httpHeaderSafeJson(args) {
  return JSON.stringify(args).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}
function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1e3);
}
function isWindowOrWorker() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope || (typeof module === "undefined" || typeof window !== "undefined");
}
function isBrowserEnv() {
  return typeof window !== "undefined";
}
function isWorkerEnv() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}
function createBrowserSafeString(toBeConverted) {
  const convertedString = toBeConverted.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return convertedString;
}

// ../work/dropbox__dropbox-sdk-js/src/filedownload.js
var DEFAULT_MAX_ATTEMPTS = 3;
var DEFAULT_RETRY_DELAY = 500;
var RETRYABLE_5XX_STATUSES = /* @__PURE__ */ new Set([500, 502, 503, 504]);
var BLOCK_SIZE = 4 * 1024 * 1024;
var nodeRuntime;
function requireNodeModule(moduleName) {
  if (typeof require === "function") {
    return Promise.resolve(require(moduleName));
  }
  return Function("moduleName", "return import(moduleName)")(moduleName);
}
async function computeContentHashFromFile(runtime, filePath) {
  const { crypto, fs } = runtime;
  const overallHasher = crypto.createHash("sha256");
  let blockHasher = crypto.createHash("sha256");
  let blockBytes = 0;
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath, { highWaterMark: BLOCK_SIZE }).on("data", (chunk) => {
      let offset = 0;
      while (offset < chunk.length) {
        const length = Math.min(BLOCK_SIZE - blockBytes, chunk.length - offset);
        blockHasher.update(chunk.subarray(offset, offset + length));
        blockBytes += length;
        offset += length;
        if (blockBytes === BLOCK_SIZE) {
          overallHasher.update(blockHasher.digest());
          blockHasher = crypto.createHash("sha256");
          blockBytes = 0;
        }
      }
    }).on("error", reject).on("end", () => {
      if (blockBytes > 0) {
        overallHasher.update(blockHasher.digest());
      }
      resolve(overallHasher.digest("hex"));
    });
  });
}
async function getNodeRuntime() {
  if (nodeRuntime) {
    return nodeRuntime;
  }
  if (typeof process === "undefined" || !process.versions || !process.versions.node) {
    throw new Error(
      "downloadFile is only supported in Node.js. In browsers, use filesDownload() and read result.fileBlob."
    );
  }
  const [
    fsModule,
    streamModule,
    streamPromisesModule,
    cryptoModule
  ] = await Promise.all([
    requireNodeModule("fs"),
    requireNodeModule("stream"),
    requireNodeModule("stream/promises"),
    requireNodeModule("crypto")
  ]);
  nodeRuntime = {
    fs: fsModule.default || fsModule,
    crypto: cryptoModule.default || cryptoModule,
    Readable: streamModule.Readable,
    Transform: streamModule.Transform,
    Writable: streamModule.Writable,
    pipeline: streamPromisesModule.pipeline
  };
  return nodeRuntime;
}
function partFileSize(fs, partPath) {
  try {
    return fs.statSync(partPath).size;
  } catch (error) {
    if (error.code === "ENOENT") {
      return 0;
    }
    throw error;
  }
}
function rangeHeader(offset, length) {
  if (length === void 0) {
    return `bytes=${offset}-`;
  }
  return `bytes=${offset}-${offset + length - 1}`;
}
function parseContentRange(header) {
  const match = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(header || "");
  if (!match) {
    return null;
  }
  return {
    start: Number(match[1]),
    end: Number(match[2])
  };
}
function validateRangeResponse(res, range) {
  if (!range) {
    return;
  }
  if (res.status !== 206) {
    throw new Error(`range request returned HTTP ${res.status}, expected 206`);
  }
  const contentRange = parseContentRange(res.headers.get("content-range"));
  if (!contentRange) {
    throw new Error("range request response missing valid Content-Range");
  }
  const expectedEnd = range.length === void 0 ? contentRange.end : range.offset + range.length - 1;
  if (contentRange.start !== range.offset || contentRange.end !== expectedEnd) {
    throw new Error(
      `range request returned Content-Range bytes ${contentRange.start}-${contentRange.end}, expected ${range.offset}-${expectedEnd}`
    );
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
async function throwAsResponseError(res) {
  const data = await res.text();
  let errorObject;
  try {
    errorObject = JSON.parse(data);
  } catch {
    errorObject = data;
  }
  throw new DropboxResponseError(res.status, res.headers, errorObject);
}
function isRetryableError(error) {
  if (error instanceof DropboxResponseError) {
    return error.status === 408 || error.status === 429 || RETRYABLE_5XX_STATUSES.has(error.status);
  }
  return !(error.message && (error.message.startsWith("remote file changed") || error.message.startsWith("range request") || error.message.startsWith("incomplete download") || error.message.startsWith("content hash mismatch") || error.message === "download response body is nil" || error.message === "downloadFile requires a Dropbox client instance" || error.message.startsWith("downloadFile is only supported")));
}
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    let timeout;
    const abort = () => {
      clearTimeout(timeout);
      reject(signal.reason || new Error("download aborted"));
    };
    const done = () => {
      if (signal) {
        signal.removeEventListener("abort", abort);
      }
      resolve();
    };
    timeout = setTimeout(done, ms);
    if (!signal) {
      return;
    }
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
  });
}
function metadataSize(metadata) {
  return metadata && typeof metadata.size === "number" ? metadata.size : 0;
}
function metadataResult(response) {
  return response && response.result ? response.result : response;
}
function validateRevision(expectedRev, metadata) {
  if (!expectedRev || !metadata || !metadata.rev) {
    return;
  }
  if (metadata.rev !== expectedRev) {
    throw new Error(
      `remote file changed during retry: got rev "${metadata.rev}", expected "${expectedRev}"`
    );
  }
}
async function validatePartFile(runtime, partPath, metadata) {
  if (!metadata) {
    return;
  }
  const { fs } = runtime;
  const stat = fs.statSync(partPath);
  if (stat.size !== metadata.size) {
    throw new Error(
      `incomplete download: got ${stat.size} bytes, expected ${metadata.size}`
    );
  }
  if (!metadata.content_hash) {
    return;
  }
  const hash = await computeContentHashFromFile(runtime, partPath);
  if (hash !== metadata.content_hash) {
    throw new Error(
      `content hash mismatch: got "${hash}", expected "${metadata.content_hash}"`
    );
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
function writeAtStream(runtime, fd, offset) {
  let position = offset;
  const { fs } = runtime;
  return new runtime.Writable({
    write(chunk, encoding, callback) {
      const writeRemaining = (chunkOffset, remaining, targetPosition) => {
        fs.write(
          fd,
          chunk,
          chunkOffset,
          remaining,
          targetPosition,
          (error, bytesWritten) => {
            if (error) {
              callback(error);
              return;
            }
            if (bytesWritten === 0 && remaining > 0) {
              callback(new Error("fs.write wrote 0 bytes"));
              return;
            }
            if (bytesWritten < remaining) {
              writeRemaining(
                chunkOffset + bytesWritten,
                remaining - bytesWritten,
                targetPosition + bytesWritten
              );
              return;
            }
            position = targetPosition + bytesWritten;
            callback();
          }
        );
      };
      if (chunk.length === 0) {
        callback();
        return;
      }
      writeRemaining(0, chunk.length, position);
    }
  });
}
async function writeRangeBody(runtime, body, tracker, fd, range) {
  let received = 0;
  const counter = new runtime.Transform({
    transform(chunk, encoding, callback) {
      received += chunk.length;
      tracker.add(chunk.length);
      callback(null, chunk);
    }
  });
  await runtime.pipeline(
    body,
    counter,
    writeAtStream(runtime, fd, range.offset)
  );
  if (range.length !== void 0 && received !== range.length) {
    throw new Error(
      `range request body length mismatch: received ${received} bytes, expected ${range.length}`
    );
  }
}
function splitRanges(offset, length, parts) {
  if (length <= 0) {
    return [];
  }
  if (parts <= 1) {
    return [{ offset, length }];
  }
  const actualParts = Math.min(parts, length);
  const ranges = [];
  const partSize = Math.floor(length / actualParts);
  let remainder = length % actualParts;
  let position = offset;
  for (let i = 0; i < actualParts; i += 1) {
    const size = partSize + (remainder > 0 ? 1 : 0);
    ranges.push({ offset: position, length: size });
    position += size;
    remainder -= 1;
  }
  return ranges;
}
function createProgressTracker(written, total, resumedFrom, progress) {
  return {
    written,
    add(bytes) {
      if (bytes <= 0) {
        return;
      }
      this.written += bytes;
      if (!progress) {
        return;
      }
      progress({
        bytesWritten: this.written,
        totalBytes: total,
        resumedFrom
      });
    }
  };
}
var DropboxFileDownloader = class {
  constructor(client, options = {}) {
    const maxAttempts = options.maxAttempts === void 0 ? DEFAULT_MAX_ATTEMPTS : options.maxAttempts;
    const parallelDownloads = options.parallelDownloads === void 0 ? 1 : options.parallelDownloads;
    const retryDelay = options.retryDelay === void 0 ? DEFAULT_RETRY_DELAY : options.retryDelay;
    validatePositiveInteger("maxAttempts", maxAttempts);
    validatePositiveInteger("parallelDownloads", parallelDownloads);
    validatePositiveInteger("retryDelay", retryDelay);
    if (options.timeout !== void 0) {
      validatePositiveInteger("timeout", options.timeout);
    }
    this.client = client;
    this.maxAttempts = maxAttempts;
    this.parallelDownloads = parallelDownloads;
    this.retryDelay = retryDelay;
    this.delay = options.delay || delay;
    this.progress = options.progress;
    this.signal = options.signal;
    this.timeout = options.timeout;
  }
  async rawDownload(remotePath, range, signal = this.signal) {
    if (!this.client.auth || !this.client.fetch) {
      throw new Error("downloadFile requires a Dropbox client instance");
    }
    await this.client.auth.checkAndRefreshAccessToken();
    const fetchOptions = {
      method: "POST",
      headers: {
        "Dropbox-API-Arg": httpHeaderSafeJson({ path: remotePath })
      },
      signal: buildRequestSignal({
        signal,
        timeout: this.timeout
      })
    };
    if (range) {
      fetchOptions.headers.Range = rangeHeader(range.offset, range.length);
    }
    this.client.setAuthHeaders(USER_AUTH, fetchOptions);
    this.client.setCommonHeaders(fetchOptions);
    const res = await this.client.fetch(
      `${baseApiUrl(
        "content",
        this.client.domain,
        this.client.domainDelimiter
      )}files/download`,
      fetchOptions
    );
    if (!res.ok) {
      await throwAsResponseError(res);
    }
    validateRangeResponse(res, range);
    if (!res.body) {
      throw new Error("download response body is nil");
    }
    return {
      metadata: JSON.parse(res.headers.get("dropbox-api-result")),
      body: (await getNodeRuntime()).Readable.fromWeb(res.body)
    };
  }
  async fetchMetadata(remotePath) {
    if (typeof this.client.filesGetMetadata !== "function") {
      throw new Error("downloadFile requires a Dropbox client instance");
    }
    const response = await this.client.filesGetMetadata(
      { path: remotePath },
      {
        signal: this.signal,
        timeout: this.timeout
      }
    );
    return metadataResult(response);
  }
  async downloadFileAttempt(remotePath, localPath, expectedRev) {
    const runtime = await getNodeRuntime();
    const { fs, pipeline } = runtime;
    const partPath = `${localPath}.part`;
    const offset = partFileSize(fs, partPath);
    if (offset === 0 && this.parallelDownloads > 1) {
      return this.downloadFileParallel(remotePath, localPath, partPath, expectedRev);
    }
    const response = await this.rawDownload(
      remotePath,
      offset > 0 ? { offset } : void 0
    );
    const { metadata } = response;
    try {
      validateRevision(expectedRev, metadata);
    } catch (error) {
      fs.rmSync(partPath, { force: true });
      throw withMetadata(error, metadata);
    }
    const tracker = createProgressTracker(
      offset,
      metadataSize(metadata),
      offset,
      this.progress
    );
    try {
      await pipeline(
        response.body,
        progressTransform(runtime, tracker),
        fs.createWriteStream(partPath, { flags: offset > 0 ? "a" : "w" })
      );
    } catch (error) {
      throw withMetadata(error, metadata);
    }
    try {
      await validatePartFile(runtime, partPath, metadata);
      fs.renameSync(partPath, localPath);
    } catch (error) {
      fs.rmSync(partPath, { force: true });
      throw withMetadata(error, metadata);
    }
    return {
      metadata,
      resumedFrom: offset
    };
  }
  async downloadFileParallel(remotePath, localPath, partPath, expectedRev) {
    const runtime = await getNodeRuntime();
    const { fs } = runtime;
    const metadata = await this.fetchMetadata(remotePath);
    try {
      validateRevision(expectedRev, metadata);
    } catch (error) {
      fs.rmSync(partPath, { force: true });
      throw withMetadata(error, metadata);
    }
    const total = metadataSize(metadata);
    const tracker = createProgressTracker(0, total, 0, this.progress);
    fs.writeFileSync(partPath, Buffer.alloc(0));
    fs.truncateSync(partPath, total);
    if (total > 0) {
      const fd = fs.openSync(partPath, "r+");
      try {
        const ranges = splitRanges(
          0,
          total,
          this.parallelDownloads
        );
        const controller = new AbortController();
        const signal = this.signal ? AbortSignal.any([
          this.signal,
          controller.signal
        ]) : controller.signal;
        let firstError;
        const workers = ranges.map(async (range) => {
          try {
            const result = await this.rawDownload(
              remotePath,
              range,
              signal
            );
            validateRevision(metadata.rev, result.metadata);
            await writeRangeBody(
              runtime,
              result.body,
              tracker,
              fd,
              range
            );
          } catch (error) {
            if (!firstError) {
              firstError = error;
              controller.abort(error);
            }
            throw error;
          }
        });
        await Promise.allSettled(workers);
        if (firstError) {
          throw firstError;
        }
      } catch (error) {
        fs.closeSync(fd);
        fs.rmSync(partPath, { force: true });
        throw withMetadata(error, metadata);
      }
      fs.closeSync(fd);
    }
    try {
      await validatePartFile(runtime, partPath, metadata);
      fs.renameSync(partPath, localPath);
    } catch (error) {
      fs.rmSync(partPath, { force: true });
      throw withMetadata(error, metadata);
    }
    return {
      metadata,
      resumedFrom: 0
    };
  }
  async downloadFile(remotePath, localPath) {
    const runtime = await getNodeRuntime();
    const partPath = `${localPath}.part`;
    let lastError;
    let expectedRev = "";
    try {
      for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
        try {
          return await this.downloadFileAttempt(
            remotePath,
            localPath,
            expectedRev
          );
        } catch (error) {
          if (!expectedRev && error.metadata && error.metadata.rev) {
            expectedRev = error.metadata.rev;
          }
          if (this.signal && this.signal.aborted) {
            throw this.signal.reason || error;
          }
          if (!isRetryableError(error)) {
            throw error;
          }
          lastError = error;
          if (attempt < this.maxAttempts - 1) {
            await this.delay(
              this.retryDelay * 2 ** attempt,
              this.signal
            );
          }
        }
      }
      throw lastError;
    } catch (error) {
      try {
        runtime.fs.rmSync(partPath, { force: true });
      } catch (cleanupError) {
        if (error && typeof error === "object") {
          error.cleanupError = cleanupError;
        }
      }
      throw error;
    }
  }
};
function downloadFile(client, remotePath, localPath, options = {}) {
  return new DropboxFileDownloader(client, options).downloadFile(remotePath, localPath);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DropboxFileDownloader,
  downloadFile
});
