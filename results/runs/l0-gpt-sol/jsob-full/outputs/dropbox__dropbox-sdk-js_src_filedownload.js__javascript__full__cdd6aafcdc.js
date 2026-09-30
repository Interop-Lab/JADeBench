const RPC = "rpc";
  const UPLOAD = "upload";
  const DOWNLOAD = "download";
  const APP_AUTH = "app";
  const USER_AUTH = "user";
  const TEAM_AUTH = "team";
  const NO_AUTH = "noauth";
  const COOKIE = "cookie";

  const DEFAULT_API_DOMAIN = "https://api.dropboxapi.com";
  const DEFAULT_DOMAIN = "https://www.dropbox.com";
  const TEST_DOMAIN_MAPPINGS = {
    "api.dropboxapi.com": "api",
    "content.dropboxapi.com": "content",
    "www.dropbox.com": "www",
  };

  class DropboxResponseError extends Error {
    constructor(method, status, response) {
      super(`Dropbox API error: ${method} (${status})`);
      this.name = "DropboxResponseError";
      this.method = method;
      this.status = status;
      this.response = response;
    }
  }

  function getSafeUnicode(value) {
    const codePoint = value.charCodeAt(0).toString(16).padStart(4, "0");
    return `\\u${codePoint}`;
  }

  function baseApiUrl(domain, apiDomain = DEFAULT_API_DOMAIN, separator = ".") {
    if (!separator) return `https://${apiDomain}/2`;
    if (apiDomain === DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[domain] !== undefined) {
      domain = TEST_DOMAIN_MAPPINGS[domain];
      separator = "-";
    }
    return `https://${domain}${separator}${apiDomain}/2`;
  }

  function OAuth2AuthorizationUrl(domain = DEFAULT_DOMAIN) {
    if (domain === DEFAULT_DOMAIN) domain = `www.${domain}`;
    return `https://${domain}/oauth2/authorize`;
  }

  function OAuth2TokenUrl(apiDomain = DEFAULT_API_DOMAIN, separator = ".") {
    let domain = "api";
    if (apiDomain !== DEFAULT_API_DOMAIN) {
      domain = TEST_DOMAIN_MAPPINGS[domain];
      separator = "-";
    }
    return `https://${domain}${separator}${apiDomain}/oauth2/token`;
  }

  function httpHeaderSafeJson(value) {
    return JSON.stringify(value).replace(/[\u007f-\uffff]/g, getSafeUnicode);
  }

  function getTokenExpiresAtDate(expiresIn) {
    return new Date(Date.now() + expiresIn * 1000);
  }

  function isWindowOrWorker() {
    return (
      (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) ||
      typeof module !== "undefined" ||
      typeof window !== "undefined"
    );
  }

  function isBrowserEnv() {
    return typeof window !== "undefined";
  }

  function isWorkerEnv() {
    return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
  }

  function createBrowserSafeString(value) {
    return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  const DEFAULT_MAX_ATTEMPTS = 10;
  const DEFAULT_RETRY_DELAY = 1000;
  const RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);
  const BLOCK_SIZE = 4 * 1024 * 1024;

  let nodeRuntime;

  async function requireNodeModule(name) {
    if (typeof require === "function") return Promise.resolve(require(name));
    return Function("name", "return import(name)")(name);
  }

  async function getNodeRuntime() {
    if (nodeRuntime) return nodeRuntime;
    if (
      typeof process === "undefined" ||
      !process.versions ||
      !process.versions.node
    ) {
      throw new Error("This operation is only available in Node.js");
    }

    const [fsModule, streamModule, cryptoModule, utilModule] = await Promise.all([
      requireNodeModule("fs"),
      requireNodeModule("stream"),
      requireNodeModule("crypto"),
      requireNodeModule("util"),
    ]);

    nodeRuntime = {
      fs: fsModule.fs || fsModule,
      pipeline: utilModule.promisify(streamModule.pipeline),
      stream: streamModule,
      crypto: cryptoModule,
    };
    return nodeRuntime;
  }

  async function computeContentHashFromFile(runtime, filename) {
    const { crypto, fs } = runtime;
    const contentHash = crypto.createHash("sha256");
    let blockHash = crypto.createHash("sha256");
    let blockBytes = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filename, { highWaterMark: BLOCK_SIZE })
        .on("data", (chunk) => {
          let offset = 0;
          while (offset < chunk.length) {
            const length = Math.min(BLOCK_SIZE - blockBytes, chunk.length - offset);
            blockHash.update(chunk.subarray(offset, offset + length));
            blockBytes += length;
            offset += length;

            if (blockBytes === BLOCK_SIZE) {
              contentHash.update(blockHash.digest());
              blockHash = crypto.createHash("sha256");
              blockBytes = 0;
            }
          }
        })
        .on("error", reject)
        .on("end", () => {
          if (blockBytes > 0) contentHash.update(blockHash.digest());
          resolve(contentHash.digest("hex"));
        });
    });
  }

  function getNodeRuntimeCached() {
    return getNodeRuntime();
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
    if (!match) return null;
    return { start: Number(match[1]), end: Number(match[2]) };
  }

  function validateRangeResponse(response, range) {
    if (!range) return;
    if (response.status !== 206) {
      throw new Error(`Expected a partial content response, received ${response.status}`);
    }

    const actual = parseContentRange(response.headers.get("content-range"));
    if (!actual) throw new Error("Invalid Content-Range response header");

    const expectedEnd =
      range.length === undefined ? actual.end : range.offset + range.length - 1;
    if (actual.start !== range.offset || actual.end !== expectedEnd) {
      throw new Error(
        `Invalid Content-Range: ${actual.start}-${actual.end}; expected ${range.offset}-${expectedEnd}`,
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
    let body;
    const text = await response.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    throw new DropboxResponseError(response.url, response.status, body);
  }

  function isRetryableError(error) {
    if (error instanceof DropboxResponseError) {
      return error.status === 429 || error.status === 503 ||
        RETRYABLE_5XX_STATUSES.has(error.status);
    }
    return !!(
      error &&
      error.name &&
      ["AbortError", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"].some((code) =>
        error.name.includes(code),
      )
    );
  }

  function delay(milliseconds, signal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, milliseconds);
      if (!signal) return;
      if (signal.aborted) {
        clearTimeout(timer);
        reject(signal.reason || new Error("Aborted"));
        return;
      }
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(signal.reason || new Error("Aborted"));
        },
        { once: true },
      );
    });
  }

  function metadataSize(metadata) {
    return metadata && typeof metadata.size === "number" ? metadata.size : 0;
  }

  function metadataResult(result) {
    return result && result.metadata ? result.metadata : result;
  }

  function validateRevision(revision, metadata) {
    if (!revision || !metadata || !metadata.rev) return;
    if (metadata.rev !== revision) {
      throw new Error(`File revision changed from "${revision}" to "${metadata.rev}"`);
    }
  }

  async function validatePartFile(runtime, filename, metadata) {
    if (!metadata) return;

    const stat = runtime.fs.statSync(filename);
    if (stat.size !== metadata.size) {
      throw new Error(`Part file size ${stat.size} does not match expected size ${metadata.size}`);
    }

    if (!metadata.content_hash) return;
    const hash = await computeContentHashFromFile(runtime, filename);
    if (hash !== metadata.content_hash) {
      throw new Error(`Part file content hash ${hash} does not match expected hash "${metadata.content_hash}"`);
    }
  }

  function withMetadata(error, metadata) {
    error.metadata = metadata;
    return error;
  }

  function progressTransform(runtime, tracker) {
    return new runtime.stream.Transform({
      transform(chunk, encoding, callback) {
        tracker.add(chunk.length);
        callback(null, chunk);
      },
    });
  }

  function writeAtStream(runtime, fileHandle, offset, length, progress) {
    const { fs } = runtime;
    return new runtime.stream.Writable({
      write(chunk, encoding, callback) {
        fs.write(fileHandle, chunk, 0, chunk.length, offset, (error, bytesWritten) => {
          if (error) {
            callback(error);
            return;
          }
          if (bytesWritten !== chunk.length) {
            callback(new Error("Unable to write complete response chunk"));
            return;
          }
          offset += bytesWritten;
          progress.add(bytesWritten);
          callback();
        });
      },
    });
  }

  async function writeRangeBody(runtime, response, tracker, fileHandle, range) {
    let written = 0;
    const transform = new runtime.stream.Transform({
      transform(chunk, encoding, callback) {
        written += chunk.length;
        tracker.add(chunk.length);
        callback(null, chunk);
      },
    });
    await runtime.pipeline(
      response.body,
      transform,
      writeAtStream(runtime, fileHandle, range.offset, range.length, { add() {} }),
    );
    if (range.length !== undefined && written !== range.length) {
      throw new Error(`Downloaded ${written} bytes, expected ${range.length}`);
    }
  }

  function splitRanges(offset, size, concurrency) {
    if (size <= 0) return [];
    if (concurrency <= 0) return [{ offset, length: size }];

    const chunkSize = Math.ceil(size / concurrency);
    const ranges = [];
    let current = offset;
    let remaining = size;

    while (remaining > 0) {
      const length = Math.min(chunkSize, remaining);
      ranges.push({ offset: current, length });
      current += length;
      remaining -= length;
    }
    return ranges;
  }

  function createProgressTracker(written, total, offset, callback) {
    return {
      written,
      add(amount) {
        if (amount <= 0) return;
        this.written += amount;
        if (callback) callback({ written: this.written, total, offset });
      },
    };
  }

  class DropboxFileDownloader {
    constructor(client, options = {}) {
      const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
      const maxRetries = options.maxRetries ?? 0;
      const retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY;

      validatePositiveInteger("maxAttempts", maxAttempts);
      validatePositiveInteger("maxRetries", maxRetries);
      validatePositiveInteger("retryDelay", retryDelay);
      if (options.concurrency !== undefined) {
        validatePositiveInteger("concurrency", options.concurrency);
      }

      this.client = client;
      this.maxAttempts = maxAttempts;
      this.maxRetries = maxRetries;
      this.retryDelay = retryDelay;
      this.delay = options.delay || delay;
      this.signal = options.signal;
      this.timeout = options.timeout;
      this.onProgress = options.onProgress;
    }

    async downloadMetadata(path, signal = this.signal) {
      const response = await this.client.fetch(
        USER_AUTH,
        `${baseApiUrl(this.client.domain, this.client.apiDomain)}/files/get_metadata`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: httpHeaderSafeJson({ path }),
          signal: buildRequestSignal({ signal, timeout: this.timeout }),
        },
      );
      if (!response.ok) await throwAsResponseError(response);
      return metadataResult(await response.json());
    }

    async downloadRange(path, range, signal = this.signal) {
      const args = { path };
      const request = {
        method: "POST",
        headers: { "Dropbox-API-Arg": httpHeaderSafeJson(args) },
        signal: buildRequestSignal({ signal, timeout: this.timeout }),
      };

      if (range) {
        request.headers.Range = rangeHeader(range.offset, range.length);
      }

      const url =
        `${baseApiUrl(this.client.domain, this.client.contentDomain)}/files/download`;
      const response = await this.client.fetch(USER_AUTH, url, request);
      if (!response.ok) await throwAsResponseError(response);
      validateRangeResponse(response, range);

      return {
        metadata: JSON.parse(response.headers.get("dropbox-api-result")),
        body: (await getNodeRuntime()).stream.Readable.fromWeb(response.body),
      };
    }

    async getMetadata(path) {
      return this.downloadMetadata(path);
    }

    async downloadToFile(path, filename, destination, metadata) {
      const runtime = await getNodeRuntime();
      const { fs, pipeline } = runtime;
      const partFile = `${destination}.part`;
      let offset = partFileSize(fs, partFile);

      if (offset > 0 && this.maxRetries > 0) {
        return this.downloadToFile(path, filename, destination, metadata);
      }

      const result = await this.downloadRange(path, offset ? { offset } : undefined);
      metadata = result.metadata;
      const tracker = createProgressTracker(offset, metadataSize(metadata), offset, this.onProgress);

      try {
        const handle = await fs.promises.open(partFile, offset ? "a" : "w");
        try {
          await pipeline(
            result.body,
            progressTransform(runtime, tracker),
            fs.createWriteStream(partFile, { flags: offset ? "a" : "w" }),
          );
        } finally {
          await handle.close();
        }
        await validatePartFile(runtime, partFile, metadata);
        await fs.promises.rename(partFile, destination);
      } catch (error) {
        try {
          await fs.promises.unlink(destination);
        } catch {}
        throw withMetadata(error, metadata);
      }

      return { metadata, bytesWritten: metadataSize(metadata) };
    }

    async downloadFile(path, filename, destination, revision) {
      const runtime = await getNodeRuntime();
      const partFile = `${destination}.part`;
      let lastError;

      try {
        for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
          try {
            return await this.downloadToFile(path, filename, destination, revision);
          } catch (error) {
            if (!isRetryableError(error)) throw error;
            lastError = error;
            if (attempt + 1 < this.maxAttempts) {
              await this.delay(this.retryDelay * (attempt + 1), this.signal);
            }
          }
        }
        throw lastError;
      } catch (error) {
        try {
          await runtime.fs.promises.unlink(partFile);
        } catch (unlinkError) {
          if (error && typeof error === "object") error.cleanupError = unlinkError;
        }
        throw error;
      }
    }

    async download(path, revision, destination, options = {}) {
      const runtime = await getNodeRuntime();
      const metadata = await this.downloadMetadata(path);
      validateRevision(revision, metadata);

      const size = metadataSize(metadata);
      await runtime.fs.promises.writeFile(destination, Buffer.alloc(size));
      const fileHandle = await runtime.fs.promises.open(destination, "r+");

      try {
        const ranges = splitRanges(0, size, options.concurrency || 1);
        const tracker = createProgressTracker(0, size, 0, this.onProgress);
        const controller = new AbortController();
        const signal = this.signal
          ? AbortSignal.any([this.signal, controller.signal])
          : controller.signal;
        let firstError;

        await Promise.all(
          ranges.map(async (range) => {
            try {
              const result = await this.downloadRange(path, range, signal);
              validateRevision(metadata.rev, result.metadata);
              await writeRangeBody(runtime, result.body, tracker, fileHandle, range);
            } catch (error) {
              if (!firstError) {
                firstError = error;
                controller.abort(error);
              }
              throw error;
            }
          }),
        );

        if (firstError) throw firstError;
      } catch (error) {
        await runtime.fs.promises.unlink(destination);
        throw withMetadata(error, metadata);
      } finally {
        await fileHandle.close();
      }

      await validatePartFile(runtime, destination, metadata);
      return { metadata, bytesWritten: size };
    }
  }

  function downloadFile(client, path, destination, options = {}) {
    const downloader = new DropboxFileDownloader(client, options);
    return downloader.download(path, options.revision, destination, options);
  }

  module.exports = { DropboxFileDownloader, downloadFile };
})();
