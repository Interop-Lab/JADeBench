"use strict";

const DEFAULT_API_DOMAIN = "dropboxapi.com";
const USER_AUTH = "user";
const TEST_DOMAIN_MAPPINGS = {
  api: "api",
  notify: "bolt",
  content: "api-content",
};

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 500;
const RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);
const CONTENT_HASH_BLOCK_SIZE = 4 * 1024 * 1024;

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

function escapeUnicode(character) {
  return `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`;
}

function httpHeaderSafeJson(value) {
  return JSON.stringify(value).replace(/[\u007f-\uffff]/g, escapeUnicode);
}

function baseApiUrl(type, domain = DEFAULT_API_DOMAIN, delimiter = ".") {
  if (!delimiter) return `https://${domain}/2/`;

  if (domain !== DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[type] !== undefined) {
    type = TEST_DOMAIN_MAPPINGS[type];
    delimiter = "-";
  }
  return `https://${type}${delimiter}${domain}/2/`;
}

function requireNodeModule(moduleName) {
  if (typeof require === "function") return Promise.resolve(require(moduleName));
  return Function("moduleName", "return import(moduleName)")(moduleName);
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

  const fs = fsModule.default || fsModule;
  const crypto = cryptoModule.default || cryptoModule;
  nodeRuntime = {
    fs,
    crypto,
    Readable: streamModule.Readable,
    Transform: streamModule.Transform,
    Writable: streamModule.Writable,
    pipeline: streamPromisesModule.pipeline,
  };
  return nodeRuntime;
}

async function computeContentHashFromFile(runtime, filename) {
  const overallHash = runtime.crypto.createHash("sha256");
  let blockHash = runtime.crypto.createHash("sha256");
  let bytesInBlock = 0;

  return new Promise((resolve, reject) => {
    runtime.fs
      .createReadStream(filename, { highWaterMark: CONTENT_HASH_BLOCK_SIZE })
      .on("data", chunk => {
        let position = 0;
        while (position < chunk.length) {
          const length = Math.min(
            CONTENT_HASH_BLOCK_SIZE - bytesInBlock,
            chunk.length - position,
          );
          blockHash.update(chunk.subarray(position, position + length));
          bytesInBlock += length;
          position += length;

          if (bytesInBlock === CONTENT_HASH_BLOCK_SIZE) {
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

function partFileSize(fs, filename) {
  try {
    return fs.statSync(filename).size;
  } catch (error) {
    if (error.code === "ENOENT") return 0;
    throw error;
  }
}

function rangeHeader(offset, length) {
  if (length === undefined) return `bytes=${offset}-`;
  return `bytes=${offset}-${offset + length - 1}`;
}

function parseContentRange(value) {
  const match = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(value || "");
  return match ? { start: Number(match[1]), end: Number(match[2]) } : null;
}

function validateRangeResponse(response, range) {
  if (!range) return;
  if (response.status !== 206) {
    throw new Error(`range request returned HTTP ${response.status}, expected 206`);
  }

  const contentRange = parseContentRange(response.headers.get("content-range"));
  if (!contentRange) {
    throw new Error("range request response missing valid Content-Range");
  }

  const expectedEnd = range.length === undefined
    ? contentRange.end
    : range.offset + range.length - 1;
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
  const timeoutSignal = AbortSignal.timeout(timeout);
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
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
    return error.status === 408
      || error.status === 429
      || RETRYABLE_5XX_STATUSES.has(error.status);
  }

  const message = error.message || "";
  return !(
    message.startsWith("remote file changed")
    || message.startsWith("range request")
    || message.startsWith("incomplete download")
    || message.startsWith("content hash mismatch")
    || message === "download response body is nil"
    || message === "downloadFile requires a Dropbox client instance"
    || message.startsWith("downloadFile is only supported")
  );
}

function delay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    let timer;
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason || new Error("download aborted"));
    };
    const finish = () => {
      if (signal) signal.removeEventListener("abort", abort);
      resolve();
    };

    timer = setTimeout(finish, milliseconds);
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
  if (!expectedRevision || !metadata || !metadata.rev) return;
  if (metadata.rev !== expectedRevision) {
    throw new Error(
      `remote file changed during retry: got rev "${metadata.rev}", expected "${expectedRevision}"`,
    );
  }
}

async function validatePartFile(runtime, filename, metadata) {
  if (!metadata) return;
  const stat = runtime.fs.statSync(filename);
  if (stat.size !== metadata.size) {
    throw new Error(`incomplete download: got ${stat.size} bytes, expected ${metadata.size}`);
  }
  if (!metadata.content_hash) return;

  const hash = await computeContentHashFromFile(runtime, filename);
  if (hash !== metadata.content_hash) {
    throw new Error(`content hash mismatch: got "${hash}", expected "${metadata.content_hash}"`);
  }
}

function withMetadata(error, metadata) {
  error.metadata = metadata;
  return error;
}

function createProgressTracker(written, totalBytes, resumedFrom, progress) {
  return {
    written,
    add(bytes) {
      if (bytes <= 0) return;
      this.written += bytes;
      if (progress) {
        progress({ bytesWritten: this.written, totalBytes, resumedFrom });
      }
    },
  };
}

function progressTransform(runtime, tracker) {
  return new runtime.Transform({
    transform(chunk, _encoding, callback) {
      tracker.add(chunk.length);
      callback(null, chunk);
    },
  });
}

function writeAtStream(runtime, fileDescriptor, initialPosition) {
  let position = initialPosition;
  const { fs } = runtime;

  return new runtime.Writable({
    write(chunk, _encoding, callback) {
      if (chunk.length === 0) {
        callback();
        return;
      }

      const writeRemaining = (offset, length, filePosition) => {
        fs.write(fileDescriptor, chunk, offset, length, filePosition, (error, written) => {
          if (error) {
            callback(error);
            return;
          }
          if (written === 0 && length > 0) {
            callback(new Error("fs.write wrote 0 bytes"));
            return;
          }
          if (written < length) {
            writeRemaining(offset + written, length - written, filePosition + written);
            return;
          }
          position = filePosition + written;
          callback();
        });
      };

      writeRemaining(0, chunk.length, position);
    },
  });
}

async function writeRangeBody(runtime, body, tracker, fileDescriptor, range) {
  let received = 0;
  const counter = new runtime.Transform({
    transform(chunk, _encoding, callback) {
      received += chunk.length;
      tracker.add(chunk.length);
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

function splitRanges(offset, length, count) {
  if (length <= 0) return [];
  if (count <= 1) return [{ offset, length }];

  const rangeCount = Math.min(count, length);
  const baseLength = Math.floor(length / rangeCount);
  let remainder = length % rangeCount;
  let position = offset;
  const ranges = [];

  for (let index = 0; index < rangeCount; index += 1) {
    const rangeLength = baseLength + (remainder > 0 ? 1 : 0);
    ranges.push({ offset: position, length: rangeLength });
    position += rangeLength;
    remainder -= 1;
  }
  return ranges;
}

class DropboxFileDownloader {
  constructor(client, options = {}) {
    const maxAttempts = options.maxAttempts === undefined
      ? DEFAULT_MAX_ATTEMPTS
      : options.maxAttempts;
    const parallelDownloads = options.parallelDownloads === undefined
      ? 1
      : options.parallelDownloads;
    const retryDelay = options.retryDelay === undefined
      ? DEFAULT_RETRY_DELAY
      : options.retryDelay;

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
    const response = await this.client.filesGetMetadata(
      { path },
      { signal: this.signal, timeout: this.timeout },
    );
    return metadataResult(response);
  }

  async downloadFileAttempt(path, destination, expectedRevision) {
    const runtime = await getNodeRuntime();
    const { fs, pipeline } = runtime;
    const partFile = `${destination}.part`;
    const resumedFrom = partFileSize(fs, partFile);

    if (resumedFrom === 0 && this.parallelDownloads > 1) {
      return this.downloadFileParallel(path, destination, partFile, expectedRevision);
    }

    const download = await this.rawDownload(
      path,
      resumedFrom > 0 ? { offset: resumedFrom } : undefined,
    );
    const { metadata } = download;
    try {
      validateRevision(expectedRevision, metadata);
    } catch (error) {
      fs.rmSync(partFile, { force: true });
      throw withMetadata(error, metadata);
    }

    const tracker = createProgressTracker(
      resumedFrom,
      metadataSize(metadata),
      resumedFrom,
      this.progress,
    );
    try {
      await pipeline(
        download.body,
        progressTransform(runtime, tracker),
        fs.createWriteStream(partFile, { flags: resumedFrom > 0 ? "a" : "w" }),
      );
    } catch (error) {
      throw withMetadata(error, metadata);
    }

    try {
      await validatePartFile(runtime, partFile, metadata);
      fs.renameSync(partFile, destination);
    } catch (error) {
      fs.rmSync(partFile, { force: true });
      throw withMetadata(error, metadata);
    }
    return { metadata, resumedFrom };
  }

  async downloadFileParallel(path, destination, partFile, expectedRevision) {
    const runtime = await getNodeRuntime();
    const { fs } = runtime;
    const metadata = await this.fetchMetadata(path);
    try {
      validateRevision(expectedRevision, metadata);
    } catch (error) {
      fs.rmSync(partFile, { force: true });
      throw withMetadata(error, metadata);
    }

    const size = metadataSize(metadata);
    const tracker = createProgressTracker(0, size, 0, this.progress);
    fs.writeFileSync(partFile, Buffer.alloc(0));
    fs.truncateSync(partFile, size);

    if (size > 0) {
      const fileDescriptor = fs.openSync(partFile, "r+");
      try {
        const ranges = splitRanges(0, size, this.parallelDownloads);
        const controller = new AbortController();
        const signal = this.signal
          ? AbortSignal.any([this.signal, controller.signal])
          : controller.signal;
        let firstError;

        const downloads = ranges.map(async range => {
          try {
            const download = await this.rawDownload(path, range, signal);
            validateRevision(metadata.rev, download.metadata);
            await writeRangeBody(runtime, download.body, tracker, fileDescriptor, range);
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
        fs.rmSync(partFile, { force: true });
        throw withMetadata(error, metadata);
      }
      fs.closeSync(fileDescriptor);
    }

    try {
      await validatePartFile(runtime, partFile, metadata);
      fs.renameSync(partFile, destination);
    } catch (error) {
      fs.rmSync(partFile, { force: true });
      throw withMetadata(error, metadata);
    }
    return { metadata, resumedFrom: 0 };
  }

  async downloadFile(path, destination) {
    const runtime = await getNodeRuntime();
    const partFile = `${destination}.part`;
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
        runtime.fs.rmSync(partFile, { force: true });
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
