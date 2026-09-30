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
  return `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`;
}

function baseApiUrl(routeType, apiDomain = DEFAULT_API_DOMAIN, delimiter = ".") {
  if (!delimiter) {
    return `https://${apiDomain}/2/`;
  }

  if (apiDomain !== DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[routeType] !== undefined) {
    routeType = TEST_DOMAIN_MAPPINGS[routeType];
    delimiter = "-";
  }

  return `https://${routeType}${delimiter}${apiDomain}/2/`;
}

function httpHeaderSafeJson(value) {
  return JSON.stringify(value).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}

function requireNodeModule(moduleName) {
  if (typeof require === "function") {
    return Promise.resolve(require(moduleName));
  }
  return Function("moduleName", "return import(moduleName)")(moduleName);
}

async function computeContentHashFromFile(runtime, filePath) {
  const { crypto, fs } = runtime;
  const contentHash = crypto.createHash("sha256");
  let blockHash = crypto.createHash("sha256");
  let bytesInBlock = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath, { highWaterMark: BLOCK_SIZE })
      .on("data", (chunk) => {
        let offset = 0;
        while (offset < chunk.length) {
          const length = Math.min(BLOCK_SIZE - bytesInBlock, chunk.length - offset);
          blockHash.update(chunk.subarray(offset, offset + length));
          bytesInBlock += length;
          offset += length;

          if (bytesInBlock === BLOCK_SIZE) {
            contentHash.update(blockHash.digest());
            blockHash = crypto.createHash("sha256");
            bytesInBlock = 0;
          }
        }
      })
      .on("error", reject)
      .on("end", () => {
        if (bytesInBlock > 0) {
          contentHash.update(blockHash.digest());
        }
        resolve(contentHash.digest("hex"));
      });
  });
}

async function getNodeRuntime() {
  if (nodeRuntime) {
    return nodeRuntime;
  }

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
  if (length === undefined) {
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
    end: Number(match[2]),
  };
}

function validateRangeResponse(response, range) {
  if (!range) {
    return;
  }
  if (response.status !== 206) {
    throw new Error(`range request returned HTTP ${response.status}, expected 206`);
  }

  const contentRange = parseContentRange(response.headers.get("content-range"));
  if (!contentRange) {
    throw new Error("range request response missing valid Content-Range");
  }

  const expectedEnd =
    range.length === undefined ? contentRange.end : range.offset + range.length - 1;
  if (contentRange.start !== range.offset || contentRange.end !== expectedEnd) {
    throw new Error(
      `range request returned Content-Range bytes ${contentRange.start}-${contentRange.end}, ` +
        `expected ${range.offset}-${expectedEnd}`,
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
  return signal
    ? AbortSignal.any([signal, AbortSignal.timeout(timeout)])
    : AbortSignal.timeout(timeout);
}

async function throwAsResponseError(response) {
  const responseText = await response.text();
  let error;
  try {
    error = JSON.parse(responseText);
  } catch {
    error = responseText;
  }
  throw new DropboxResponseError(response.status, response.headers, error);
}

function isRetryableError(error) {
  if (error instanceof DropboxResponseError) {
    return (
      error.status === 408 ||
      error.status === 429 ||
      RETRYABLE_5XX_STATUSES.has(error.status)
    );
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
    let timeout;
    const onAbort = () => {
      clearTimeout(timeout);
      reject(signal.reason || new Error("download aborted"));
    };
    const onTimeout = () => {
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
      resolve();
    };

    timeout = setTimeout(onTimeout, milliseconds);
    if (!signal) {
      return;
    }
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function metadataSize(metadata) {
  return metadata && typeof metadata.size === "number" ? metadata.size : 0;
}

function metadataResult(response) {
  return response && response.result ? response.result : response;
}

function validateRevision(expectedRevision, metadata) {
  if (!expectedRevision || !metadata || !metadata.rev) {
    return;
  }
  if (metadata.rev !== expectedRevision) {
    throw new Error(
      `remote file changed during retry: got rev "${metadata.rev}", expected "${expectedRevision}"`,
    );
  }
}

async function validatePartFile(runtime, partPath, metadata) {
  if (!metadata) {
    return;
  }

  const fileSize = runtime.fs.statSync(partPath).size;
  if (fileSize !== metadata.size) {
    throw new Error(`incomplete download: got ${fileSize} bytes, expected ${metadata.size}`);
  }
  if (!metadata.content_hash) {
    return;
  }

  const contentHash = await computeContentHashFromFile(runtime, partPath);
  if (contentHash !== metadata.content_hash) {
    throw new Error(
      `content hash mismatch: got "${contentHash}", expected "${metadata.content_hash}"`,
    );
  }
}

function withMetadata(error, metadata) {
  error.metadata = metadata;
  return error;
}

function progressTransform(runtime, progressTracker) {
  return new runtime.Transform({
    transform(chunk, encoding, callback) {
      progressTracker.add(chunk.length);
      callback(null, chunk);
    },
  });
}

function writeAtStream(runtime, fileDescriptor, initialPosition) {
  let position = initialPosition;
  const { fs } = runtime;

  return new runtime.Writable({
    write(chunk, encoding, callback) {
      if (chunk.length === 0) {
        callback();
        return;
      }

      const writeRemaining = (offset, length, writePosition) => {
        fs.write(
          fileDescriptor,
          chunk,
          offset,
          length,
          writePosition,
          (error, bytesWritten) => {
            if (error) {
              callback(error);
              return;
            }
            if (bytesWritten === 0 && length > 0) {
              callback(new Error("fs.write wrote 0 bytes"));
              return;
            }
            if (bytesWritten < length) {
              writeRemaining(
                offset + bytesWritten,
                length - bytesWritten,
                writePosition + bytesWritten,
              );
              return;
            }
            position = writePosition + bytesWritten;
            callback();
          },
        );
      };

      writeRemaining(0, chunk.length, position);
    },
  });
}

async function writeRangeBody(runtime, body, progressTracker, fileDescriptor, range) {
  let bytesReceived = 0;
  const countBytes = new runtime.Transform({
    transform(chunk, encoding, callback) {
      bytesReceived += chunk.length;
      progressTracker.add(chunk.length);
      callback(null, chunk);
    },
  });

  await runtime.pipeline(
    body,
    countBytes,
    writeAtStream(runtime, fileDescriptor, range.offset),
  );

  if (range.length !== undefined && bytesReceived !== range.length) {
    throw new Error(
      `range request body length mismatch: received ${bytesReceived} bytes, expected ${range.length}`,
    );
  }
}

function splitRanges(offset, totalLength, parallelDownloads) {
  if (totalLength <= 0) {
    return [];
  }
  if (parallelDownloads <= 1) {
    return [{ offset, length: totalLength }];
  }

  const rangeCount = Math.min(parallelDownloads, totalLength);
  const ranges = [];
  const baseLength = Math.floor(totalLength / rangeCount);
  let rangesWithExtraByte = totalLength % rangeCount;
  let nextOffset = offset;

  for (let index = 0; index < rangeCount; index += 1) {
    const length = baseLength + (rangesWithExtraByte > 0 ? 1 : 0);
    ranges.push({ offset: nextOffset, length });
    nextOffset += length;
    rangesWithExtraByte -= 1;
  }

  return ranges;
}

function createProgressTracker(initialWritten, totalBytes, resumedFrom, onProgress) {
  return {
    written: initialWritten,
    add(bytes) {
      if (bytes <= 0) {
        return;
      }
      this.written += bytes;
      if (onProgress) {
        onProgress({
          bytesWritten: this.written,
          totalBytes,
          resumedFrom,
        });
      }
    },
  };
}

class DropboxFileDownloader {
  constructor(client, options = {}) {
    const maxAttempts =
      options.maxAttempts === undefined ? DEFAULT_MAX_ATTEMPTS : options.maxAttempts;
    const parallelDownloads =
      options.parallelDownloads === undefined ? 1 : options.parallelDownloads;
    const retryDelay =
      options.retryDelay === undefined ? DEFAULT_RETRY_DELAY : options.retryDelay;

    validatePositiveInteger("maxAttempts", maxAttempts);
    validatePositiveInteger("parallelDownloads", parallelDownloads);
    validatePositiveInteger("retryDelay", retryDelay);
    if (options.timeout !== undefined) {
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

  async rawDownload(path, range, signal = this.signal) {
    if (!this.client.auth || !this.client.fetch) {
      throw new Error("downloadFile requires a Dropbox client instance");
    }

    await this.client.auth.checkAndRefreshAccessToken();
    const request = {
      method: "POST",
      headers: {
        "Dropbox-API-Arg": httpHeaderSafeJson({ path }),
      },
      signal: buildRequestSignal({ signal, timeout: this.timeout }),
    };
    if (range) {
      request.headers.Range = rangeHeader(range.offset, range.length);
    }

    this.client.setAuthHeaders(USER_AUTH, request);
    this.client.setCommonHeaders(request);

    const response = await this.client.fetch(
      `${baseApiUrl("content", this.client.domain, this.client.domainDelimiter)}files/download`,
      request,
    );
    if (!response.ok) {
      await throwAsResponseError(response);
    }
    validateRangeResponse(response, range);
    if (!response.body) {
      throw new Error("download response body is nil");
    }

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
    const partPath = `${destination}.part`;
    const resumeOffset = partFileSize(fs, partPath);

    if (resumeOffset === 0 && this.parallelDownloads > 1) {
      return this.downloadFileParallel(path, destination, partPath, expectedRevision);
    }

    const download = await this.rawDownload(
      path,
      resumeOffset > 0 ? { offset: resumeOffset } : undefined,
    );
    const { metadata } = download;

    try {
      validateRevision(expectedRevision, metadata);
    } catch (error) {
      fs.rmSync(partPath, { force: true });
      throw withMetadata(error, metadata);
    }

    const progressTracker = createProgressTracker(
      resumeOffset,
      metadataSize(metadata),
      resumeOffset,
      this.progress,
    );

    try {
      await pipeline(
        download.body,
        progressTransform(runtime, progressTracker),
        fs.createWriteStream(partPath, { flags: resumeOffset > 0 ? "a" : "w" }),
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

    return { metadata, resumedFrom: resumeOffset };
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
    const progressTracker = createProgressTracker(0, totalBytes, 0, this.progress);
    fs.writeFileSync(partPath, Buffer.alloc(0));
    fs.truncateSync(partPath, totalBytes);

    if (totalBytes > 0) {
      const fileDescriptor = fs.openSync(partPath, "r+");
      try {
        const ranges = splitRanges(0, totalBytes, this.parallelDownloads);
        const abortController = new AbortController();
        const signal = this.signal
          ? AbortSignal.any([this.signal, abortController.signal])
          : abortController.signal;
        let firstError;

        const rangeTasks = ranges.map(async (range) => {
          try {
            const download = await this.rawDownload(path, range, signal);
            validateRevision(metadata.rev, download.metadata);
            await writeRangeBody(
              runtime,
              download.body,
              progressTracker,
              fileDescriptor,
              range,
            );
          } catch (error) {
            if (!firstError) {
              firstError = error;
              abortController.abort(error);
            }
            throw error;
          }
        });

        await Promise.allSettled(rangeTasks);
        if (firstError) {
          throw firstError;
        }
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
          if (this.signal && this.signal.aborted) {
            throw this.signal.reason || error;
          }
          if (!isRetryableError(error)) {
            throw error;
          }

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
        if (error && typeof error === "object") {
          error.cleanupError = cleanupError;
        }
      }
      throw error;
    }
  }
}

function downloadFile(client, path, destination, options = {}) {
  return new DropboxFileDownloader(client, options).downloadFile(path, destination);
}

const exportsObject = {};
Object.defineProperty(exportsObject, "__esModule", { value: true });
Object.defineProperties(exportsObject, {
  DropboxFileDownloader: {
    enumerable: true,
    get: () => DropboxFileDownloader,
  },
  downloadFile: {
    enumerable: true,
    get: () => downloadFile,
  },
});
module.exports = exportsObject;
