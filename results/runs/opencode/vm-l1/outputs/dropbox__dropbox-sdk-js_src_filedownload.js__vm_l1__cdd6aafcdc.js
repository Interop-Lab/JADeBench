"use strict";

const DEFAULT_API_DOMAIN = "dropboxapi.com";
const DEFAULT_DOMAIN = "dropbox.com";
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 500;
const BLOCK_SIZE = 4 * 1024 * 1024;
const RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);

class DropboxResponseError extends Error {
  constructor(status, body, headers) {
    super(`Response failed with a ${status} code`);
    this.name = "DropboxResponseError";
    this.status = status;
    this.error = body;
    this.headers = headers;
  }
}

function safeJson(text) {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function headerJson(response, name) {
  return safeJson(response.headers.get(name));
}

function validatePositiveInteger(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
  return value;
}

function rangeHeader(start, end) {
  return `bytes=${start}-${end}`;
}

function parseContentRange(value) {
  const match = /^bytes\s+(\d+)-(\d+)\/(\d+|\*)$/i.exec(value || "");
  if (!match) return null;
  return {
    start: Number(match[1]),
    end: Number(match[2]),
    size: match[3] === "*" ? undefined : Number(match[3]),
  };
}

function splitRanges(size, partSize, firstOffset = 0) {
  validatePositiveInteger(size, "size");
  validatePositiveInteger(partSize, "partSize");
  const ranges = [];
  for (let start = firstOffset; start < size; start += partSize) {
    ranges.push({ start, end: Math.min(size - 1, start + partSize - 1) });
  }
  return ranges;
}

function delay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

function isRetryableError(error) {
  return (
    error?.name === "FetchError" ||
    error?.code === "ECONNRESET" ||
    error?.code === "ETIMEDOUT" ||
    error?.status === 429 ||
    RETRYABLE_5XX_STATUSES.has(error?.status)
  );
}

function buildRequestSignal(...signals) {
  const active = signals.filter(Boolean);
  if (!active.length) return undefined;
  if (active.length === 1) return active[0];
  if (typeof AbortSignal.any === "function") return AbortSignal.any(active);

  const controller = new AbortController();
  for (const signal of active) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      once: true,
    });
  }
  return controller.signal;
}

async function throwAsResponseError(response) {
  let body;
  try {
    body = safeJson(await response.text());
  } catch {
    body = undefined;
  }
  throw new DropboxResponseError(response.status, body, response.headers);
}

function metadataSize(metadata) {
  return Number(metadata?.size ?? metadata?.file?.size);
}

function metadataResult(response) {
  return (
    response?.result ??
    response?.metadata ??
    headerJson(response, "dropbox-api-result")
  );
}

function validateRevision(actual, expected) {
  if (expected && actual?.rev && actual.rev !== expected) {
    throw new Error(`File revision changed from ${expected} to ${actual.rev}`);
  }
  return actual;
}

function validateRangeResponse(response, expectedRange) {
  if (response.status !== 206) {
    throw new DropboxResponseError(response.status, undefined, response.headers);
  }
  const actual = parseContentRange(response.headers.get("content-range"));
  if (!actual || actual.start !== expectedRange.start || actual.end !== expectedRange.end) {
    throw new Error("Dropbox returned an unexpected byte range");
  }
  return actual;
}

function partFileSize(size, partSize) {
  return Math.min(size, partSize || BLOCK_SIZE);
}

function createProgressTracker(total, callback) {
  let transferred = 0;
  return (increment) => {
    transferred += increment;
    callback?.({ transferred, total, progress: total ? transferred / total : 1 });
  };
}

async function responseBytes(response, onChunk) {
  if (!response.body?.getReader) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    onChunk?.(bytes.byteLength);
    return bytes;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
    length += value.byteLength;
    onChunk?.(value.byteLength);
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

async function writeAtStream(destination, bytes, position = 0) {
  if (!destination) return;
  if (typeof destination.write === "function" && destination.write.length >= 4) {
    await destination.write(bytes, 0, bytes.byteLength, position);
    return;
  }
  if (typeof destination.write === "function") {
    await new Promise((resolve, reject) => {
      destination.write(Buffer.from(bytes), (error) => (error ? reject(error) : resolve()));
    });
  }
}

async function writePart(destination, bytes, position) {
  if (!destination) return;
  if (typeof destination === "string") {
    const { open } = require("node:fs/promises");
    const file = await open(destination, "r+").catch(() => open(destination, "w+"));
    try {
      await file.write(bytes, 0, bytes.byteLength, position);
    } finally {
      await file.close();
    }
    return;
  }
  if (typeof destination.write === "function" && destination.fd != null) {
    const { write } = require("node:fs");
    await new Promise((resolve, reject) =>
      write(destination.fd, bytes, 0, bytes.byteLength, position, (error) =>
        error ? reject(error) : resolve(),
      ),
    );
    return;
  }
  await writeAtStream(destination, bytes, position);
}

class DropboxFileDownloader {
  constructor(options = {}) {
    this.options = options;
    this.fetch = options.fetch || globalThis.fetch;
    if (typeof this.fetch !== "function") {
      throw new TypeError("A fetch implementation is required");
    }
    this.accessToken = options.accessToken || options.token;
    this.apiDomain = options.apiDomain || DEFAULT_API_DOMAIN;
    this.maxAttempts = options.maxAttempts || DEFAULT_MAX_ATTEMPTS;
    this.retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY;
  }

  endpoint(path) {
    const protocol = this.options.protocol || "https";
    return `${protocol}://content.${this.apiDomain}/2/files/${path}`;
  }

  headers(argument, extra = {}) {
    const headers = {
      "dropbox-api-arg": JSON.stringify(argument),
      ...extra,
      ...this.options.headers,
    };
    if (this.accessToken) headers.authorization = `Bearer ${this.accessToken}`;
    return headers;
  }

  async request(path, argument, init = {}) {
    let lastError;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const response = await this.fetch(this.endpoint(path), {
          method: "POST",
          ...init,
          headers: this.headers(argument, init.headers),
        });
        if (!response.ok && response.status !== 206) await throwAsResponseError(response);
        return response;
      } catch (error) {
        lastError = error;
        if (attempt === this.maxAttempts || !isRetryableError(error)) throw error;
        const retryAfter = Number(error?.headers?.get?.("retry-after"));
        await delay(
          Number.isFinite(retryAfter) ? retryAfter * 1000 : this.retryDelay * 2 ** (attempt - 1),
          init.signal,
        );
      }
    }
    throw lastError;
  }

  async rawDownload(path, options = {}) {
    return this.request("download", { path, rev: options.rev }, {
      signal: buildRequestSignal(this.options.signal, options.signal),
      headers: options.range ? { range: rangeHeader(options.range.start, options.range.end) } : {},
    });
  }

  async fetchMetadata(path) {
    const response = await this.rawDownload(path, { range: { start: 0, end: 0 } });
    const metadata = metadataResult(response);
    await response.body?.cancel?.();
    return metadata;
  }

  async downloadFileAttempt(path, destination, options = {}) {
    const response = await this.rawDownload(path, options);
    const metadata = metadataResult(response);
    const bytes = await responseBytes(response, options.onChunk);
    await writePart(destination, bytes, options.range?.start || 0);
    return { metadata, bytes };
  }

  async downloadFileParallel(path, destination, metadata, options = {}) {
    const size = metadataSize(metadata);
    validatePositiveInteger(size, "metadata.size");
    const partSize = partFileSize(size, options.partSize);
    const ranges = splitRanges(size, partSize);
    const concurrency = Math.min(options.concurrency || 4, ranges.length);
    const track = createProgressTracker(size, options.onProgress);
    const parts = new Array(ranges.length);
    let next = 0;

    const worker = async () => {
      while (next < ranges.length) {
        const index = next++;
        const range = ranges[index];
        const response = await this.rawDownload(path, { ...options, rev: metadata.rev, range });
        validateRangeResponse(response, range);
        validateRevision(metadataResult(response), metadata.rev);
        const bytes = await responseBytes(response, track);
        if (bytes.byteLength !== range.end - range.start + 1) {
          throw new Error("Downloaded part has an unexpected size");
        }
        await writePart(destination, bytes, range.start);
        parts[index] = bytes;
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));

    if (destination) return metadata;
    const result = new Uint8Array(size);
    for (let index = 0; index < ranges.length; index++) result.set(parts[index], ranges[index].start);
    return { metadata, bytes: result };
  }

  async downloadFile(path, options = {}) {
    const destination = options.destination || options.output;
    const metadata = options.metadata || (await this.fetchMetadata(path));
    const size = metadataSize(metadata);
    if (options.parallel === false || !size || size <= (options.partSize || BLOCK_SIZE)) {
      const track = createProgressTracker(size, options.onProgress);
      const result = await this.downloadFileAttempt(path, destination, {
        ...options,
        rev: metadata.rev,
        onChunk: track,
      });
      return destination ? result.metadata : result;
    }
    return this.downloadFileParallel(path, destination, metadata, options);
  }
}

async function downloadFile(clientOptions, path, options = {}) {
  if (clientOptions instanceof DropboxFileDownloader) {
    return clientOptions.downloadFile(path, options);
  }
  return new DropboxFileDownloader(clientOptions).downloadFile(path, options);
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperties(exports, {
  DropboxFileDownloader: { enumerable: true, get: () => DropboxFileDownloader },
  downloadFile: { enumerable: true, get: () => downloadFile },
});
