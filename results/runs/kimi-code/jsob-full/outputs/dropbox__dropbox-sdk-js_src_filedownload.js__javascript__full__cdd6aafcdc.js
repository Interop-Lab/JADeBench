const USER_AUTH = "user";
const DEFAULT_API_DOMAIN = "dropboxapi.com";
const TEST_DOMAIN_MAPPINGS = {
  content: "api-content",
};

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 500;
const RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);
const BLOCK_SIZE = 4 * 1024 * 1024;

let nodeRuntime;

class DropboxResponseError extends Error {
  constructor(status, headers, error) {
    super(`Response failed with a ${status} code`);
    this.name = "DropboxResponseError";
    this.status = status;
    this.headers = headers;
    this.error = error;
  }
}

function getSafeUnicode(character) {
  return `\\u${(`000${character.charCodeAt(0).toString(16)}`).slice(-4)}`;
}

function baseApiUrl(subdomain, domain = DEFAULT_API_DOMAIN, delimiter = ".") {
  if (!delimiter) return `https://${domain}/2/`;
  if (domain !== DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[subdomain] !== undefined) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    delimiter = "-";
  }
  return `https://${subdomain}${delimiter}${domain}/2/`;
}

function httpHeaderSafeJson(value) {
  return JSON.stringify(value).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}

function requireNodeModule(moduleName) {
  return typeof require === "function"
    ? Promise.resolve(require(moduleName))
    : Function("moduleName", "return import(moduleName)")(moduleName);
}

async function getNodeRuntime() {
  if (nodeRuntime) return nodeRuntime;
  if (typeof process === "undefined" || !process.versions || !process.versions.node) {
    throw new Error(
      "downloadFile is only supported in Node.js. In browsers, use filesDownload() and read result.fileBlob.",
    );
  }

  const [fsModule, streamModule, streamPromisesModule, cryptoModule] = await Promise.all([
    requireNodeModule("fs"),
    requireNodeModule("stream"),
    requireNodeModule("stream/promises"),
    requireNodeModule("crypto"),
  ]);
  nodeRuntime = {
    fs: fsModule.default || fsModule,
    crypto: cryptoModule.default || cryptoModule,
    Readable: streamModule.Readable,
    Transform: streamModule.Transform,
    Writable: streamModule.Writable,
    pipeline: streamPromisesModule.pipeline,
  };
  return nodeRuntime;
}

async function computeContentHashFromFile(runtime, filePath) {
  const overallHash = runtime.crypto.createHash("sha256");
  let blockHash = runtime.crypto.createHash("sha256");
  let bytesInBlock = 0;

  return new Promise((resolve, reject) => {
    runtime.fs
      .createReadStream(filePath, { highWaterMark: BLOCK_SIZE })
      .on("data", (chunk) => {
        let offset = 0;
        while (offset < chunk.length) {
          const length = Math.min(BLOCK_SIZE - bytesInBlock, chunk.length - offset);
          blockHash.update(chunk.subarray(offset, offset + length));
          bytesInBlock += length;
          offset += length;
          if (bytesInBlock === BLOCK_SIZE) {
            overallHash.update(blockHash.digest());
            blockHash = runtime.crypto.createHash("sha256");
            bytesInBlock = 0;
          }
        }
      })
      .on("error", reject)
      .on("end", () => {
        if (bytesInBlock > 0) overallHash.update(blockHash.digest());
        resolve(overallHash.digest("hex"));
      });
  });
}

function partFileSize(fs, filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    if (error.code === "ENOENT") return 0;
    throw error;
  }
}

function rangeHeader(offset, length) {
  if (length === undefined) return `bytes=${offset}-`;
  return `bytes=${offset}-${offset + length - 1}`;
}

function parseContentRange(header) {
  const match = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(header || "");
  return match ? { start: Number(match[1]), end: Number(match[2]) } : null;
}

function validateRangeResponse(response, range) {
  if (!range) return;
  if (response.status !== 206) {
    throw new Error(`range request returned HTTP ${response.status}, expected 206`);
  }
  const contentRange = parseContentRange(response.headers.get("content-range"));
  if (!contentRange) throw new Error("range request response missing valid Content-Range");
  const expectedEnd = range.length === undefined ? contentRange.end : range.offset + range.length - 1;
  if (contentRange.start !== range.offset || contentRange.end !== expectedEnd) {
    throw new Error(
      `range request returned Content-Range bytes ${contentRange.start}-${contentRange.end}, expected ${range.offset}-${expectedEnd}`,
    );
  }
}

function validatePositiveInteger(name, value) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}

function buildRequestSignal({ signal, timeout } = {}) {
  if (timeout == null) return signal;
  return signal
    ? AbortSignal.any([signal, AbortSignal.timeout(timeout)])
    : AbortSignal.timeout(timeout);
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
    return error.status === 408 || error.status === 429 || RETRYABLE_5XX_STATUSES.has(error.status);
  }
  return !(
    error.message &&
    (error.message.startsWith("remote file changed") ||
      error.message.startsWith("range request") ||
      error.message.startsWith("incomplete download") ||
      error.message.startsWith("content hash mismatch") ||
      error.message === "download response body is nil" ||
      error.message === "downloadFile requires a Dropbox client instance" ||
      error.message.startsWith("downloadFile is only supported"))
  );
}

function delay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    let timer;
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason || new Error("download aborted"));
    };
    timer = setTimeout(() => {
      if (signal) signal.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);
    if (!signal) return;
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

function validateRevision(expectedRevision, metadata) {
  if (expectedRevision && metadata && metadata.rev && metadata.rev !== expectedRevision) {
    throw new Error(
      `remote file changed during retry: got rev "${metadata.rev}", expected "${expectedRevision}"`,
    );
  }
}

async function validatePartFile(runtime, partPath, metadata) {
  if (!metadata) return;
  const actualSize = runtime.fs.statSync(partPath).size;
  if (actualSize !== metadata.size) {
    throw new Error(`incomplete download: got ${actualSize} bytes, expected ${metadata.size}`);
  }
  if (!metadata.content_hash) return;
  const actualHash = await computeContentHashFromFile(runtime, partPath);
  if (actualHash !== metadata.content_hash) {
    throw new Error(
      `content hash mismatch: got "${actualHash}", expected "${metadata.content_hash}"`,
    );
  }
}

function withMetadata(error, metadata) {
  error.metadata = metadata;
  return error;
}

function progressTransform(runtime, progress) {
  return new runtime.Transform({
    transform(chunk, encoding, callback) {
      progress.add(chunk.length);
      callback(null, chunk);
    },
  });
}

function writeAtStream(runtime, fileDescriptor, initialPosition) {
  let position = initialPosition;
  const { fs } = runtime;
  return new runtime.Writable({
    write(chunk, encoding, callback) {
      const writeRemaining = (offset, length, writePosition) => {
        fs.write(fileDescriptor, chunk, offset, length, writePosition, (error, written) => {
          if (error) {
            callback(error);
            return;
          }
          if (written === 0 && length > 0) {
            callback(new Error("fs.write wrote 0 bytes"));
            return;
          }
          if (written < length) {
            writeRemaining(offset + written, length - written, writePosition + written);
            return;
          }
          position = writePosition + written;
          callback();
        });
      };
      if (chunk.length === 0) {
        callback();
        return;
      }
      writeRemaining(0, chunk.length, position);
    },
  });
}

async function writeRangeBody(runtime, body, progress, fileDescriptor, range) {
  let received = 0;
  const counter = new runtime.Transform({
    transform(chunk, encoding, callback) {
      received += chunk.length;
      progress.add(chunk.length);
      callback(null, chunk);
    },
  });
  await runtime.pipeline(body, counter, writeAtStream(runtime, fileDescriptor, range.offset));
  if (range.length !== undefined && received !== range.length) {
    throw new Error(
      `range request body length mismatch: received ${received} bytes, expected ${range.length}`,
    );
  }
}

function splitRanges(offset, length, parallelDownloads) {
  if (length <= 0) return [];
  if (parallelDownloads <= 1) return [{ offset, length }];
  const count = Math.min(parallelDownloads, length);
  const ranges = [];
  const baseLength = Math.floor(length / count);
  let remainder = length % count;
  let nextOffset = offset;
  for (let index = 0; index < count; index += 1) {
    const rangeLength = baseLength + (remainder > 0 ? 1 : 0);
    ranges.push({ offset: nextOffset, length: rangeLength });
    nextOffset += rangeLength;
    remainder -= 1;
  }
  return ranges;
}

function createProgressTracker(written, totalBytes, resumedFrom, callback) {
  return {
    written,
    add(bytes) {
      if (bytes <= 0) return;
      this.written += bytes;
      if (callback) callback({ bytesWritten: this.written, totalBytes, resumedFrom });
    },
  };
}

class DropboxFileDownloader {
  constructor(client, options = {}) {
    const maxAttempts = options.maxAttempts === undefined ? DEFAULT_MAX_ATTEMPTS : options.maxAttempts;
    const parallelDownloads = options.parallelDownloads === undefined ? 1 : options.parallelDownloads;
    const retryDelay = options.retryDelay === undefined ? DEFAULT_RETRY_DELAY : options.retryDelay;
    validatePositiveInteger("maxAttempts", maxAttempts);
    validatePositiveInteger("parallelDownloads", parallelDownloads);
    validatePositiveInteger("retryDelay", retryDelay);
    if (options.timeout !== undefined) validatePositiveInteger("timeout", options.timeout);

    this.client = client;
    this.maxAttempts = maxAttempts;
    this.parallelDownloads = parallelDownloads;
    this.retryDelay = retryDelay;
    this.delay = options.delay || delay;
    this.progress = options.progress;
    this.signal = options.signal;
    this.timeout = options.timeout;
  }

  async rawDownload(path, range, signal = this.signal) {
    if (!this.client.auth || !this.client.fetch) {
      throw new Error("downloadFile requires a Dropbox client instance");
    }
    await this.client.auth.checkAndRefreshAccessToken();
    const request = {
      method: "POST",
      headers: { "Dropbox-API-Arg": httpHeaderSafeJson({ path }) },
      signal: buildRequestSignal({ signal, timeout: this.timeout }),
    };
    if (range) request.headers.Range = rangeHeader(range.offset, range.length);
    this.client.setAuthHeaders(USER_AUTH, request);
    this.client.setCommonHeaders(request);

    const response = await this.client.fetch(
      `${baseApiUrl("content", this.client.domain, this.client.domainDelimiter)}files/download`,
      request,
    );
    if (!response.ok) await throwAsResponseError(response);
    validateRangeResponse(response, range);
    if (!response.body) throw new Error("download response body is nil");
    return {
      metadata: JSON.parse(response.headers.get("dropbox-api-result")),
      body: (await getNodeRuntime()).Readable.fromWeb(response.body),
    };
  }

  async fetchMetadata(path) {
    if (typeof this.client.filesGetMetadata !== "function") {
      throw new Error("downloadFile requires a Dropbox client instance");
    }
    return metadataResult(
      await this.client.filesGetMetadata(
        { path },
        { signal: this.signal, timeout: this.timeout },
      ),
    );
  }

  async downloadFileAttempt(path, destination, expectedRevision) {
    const runtime = await getNodeRuntime();
    const { fs, pipeline } = runtime;
    const partPath = `${destination}.part`;
    const resumedFrom = partFileSize(fs, partPath);
    if (resumedFrom === 0 && this.parallelDownloads > 1) {
      return this.downloadFileParallel(path, destination, partPath, expectedRevision);
    }

    const download = await this.rawDownload(
      path,
      resumedFrom > 0 ? { offset: resumedFrom } : undefined,
    );
    const { metadata } = download;
    try {
      validateRevision(expectedRevision, metadata);
    } catch (error) {
      fs.rmSync(partPath, { force: true });
      throw withMetadata(error, metadata);
    }

    const progress = createProgressTracker(
      resumedFrom,
      metadataSize(metadata),
      resumedFrom,
      this.progress,
    );
    try {
      await pipeline(
        download.body,
        progressTransform(runtime, progress),
        fs.createWriteStream(partPath, { flags: resumedFrom > 0 ? "a" : "w" }),
      );
    } catch (error) {
      throw withMetadata(error, metadata);
    }

    try {
      await validatePartFile(runtime, partPath, metadata);
      fs.renameSync(partPath, destination);
    } catch (error) {
      fs.rmSync(partPath, { force: true });
      throw withMetadata(error, metadata);
    }
    return { metadata, resumedFrom };
  }

  async downloadFileParallel(path, destination, partPath, expectedRevision) {
    const runtime = await getNodeRuntime();
    const { fs } = runtime;
    const metadata = await this.fetchMetadata(path);
    try {
      validateRevision(expectedRevision, metadata);
    } catch (error) {
      fs.rmSync(partPath, { force: true });
      throw withMetadata(error, metadata);
    }

    const totalBytes = metadataSize(metadata);
    const progress = createProgressTracker(0, totalBytes, 0, this.progress);
    fs.writeFileSync(partPath, Buffer.alloc(0));
    fs.truncateSync(partPath, totalBytes);

    if (totalBytes > 0) {
      const fileDescriptor = fs.openSync(partPath, "r+");
      try {
        const ranges = splitRanges(0, totalBytes, this.parallelDownloads);
        const controller = new AbortController();
        const signal = this.signal
          ? AbortSignal.any([this.signal, controller.signal])
          : controller.signal;
        let firstError;
        const downloads = ranges.map(async (range) => {
          try {
            const download = await this.rawDownload(path, range, signal);
            validateRevision(metadata.rev, download.metadata);
            await writeRangeBody(runtime, download.body, progress, fileDescriptor, range);
          } catch (error) {
            if (!firstError) {
              firstError = error;
              controller.abort(error);
            }
            throw error;
          }
        });
        await Promise.allSettled(downloads);
        if (firstError) throw firstError;
      } catch (error) {
        fs.closeSync(fileDescriptor);
        fs.rmSync(partPath, { force: true });
        throw withMetadata(error, metadata);
      }
      fs.closeSync(fileDescriptor);
    }

    try {
      await validatePartFile(runtime, partPath, metadata);
      fs.renameSync(partPath, destination);
    } catch (error) {
      fs.rmSync(partPath, { force: true });
      throw withMetadata(error, metadata);
    }
    return { metadata, resumedFrom: 0 };
  }

  async downloadFile(path, destination) {
    const runtime = await getNodeRuntime();
    const partPath = `${destination}.part`;
    let lastError;
    let expectedRevision = "";
    try {
      for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
        try {
          return await this.downloadFileAttempt(path, destination, expectedRevision);
        } catch (error) {
          if (!expectedRevision && error.metadata && error.metadata.rev) {
            expectedRevision = error.metadata.rev;
          }
          if (this.signal && this.signal.aborted) throw this.signal.reason || error;
          if (!isRetryableError(error)) throw error;
          lastError = error;
          if (attempt < this.maxAttempts - 1) {
            await this.delay(this.retryDelay * 2 ** attempt, this.signal);
          }
        }
      }
      throw lastError;
    } catch (error) {
      try {
        runtime.fs.rmSync(partPath, { force: true });
      } catch (cleanupError) {
        if (error && typeof error === "object") error.cleanupError = cleanupError;
      }
      throw error;
    }
  }
}

function downloadFile(client, path, destination, options = {}) {
  return new DropboxFileDownloader(client, options).downloadFile(path, destination);
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "DropboxFileDownloader", {
  enumerable: true,
  get: () => DropboxFileDownloader,
});
Object.defineProperty(exports, "downloadFile", {
  enumerable: true,
  get: () => downloadFile,
});
