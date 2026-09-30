'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Readable, Transform, Writable } = require('stream');
const { pipeline } = require('stream/promises');

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 500;
const RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);
const BLOCK_SIZE = 4 * 1024 * 1024;

class DropboxResponseError extends Error {
  constructor(status, headers, error) {
    super(`Response failed with a ${status} code`);
    this.name = 'DropboxResponseError';
    this.status = status;
    this.headers = headers;
    this.error = error;
  }
}

function httpHeaderSafeJson(value) {
  return JSON.stringify(value).replace(/[\u007f-\uffff]/g, character => (
    `\\u${`000${character.charCodeAt(0).toString(16)}`.slice(-4)}`
  ));
}

function validatePositiveInteger(name, value) {
  if (!Number.isInteger(value) || value < 1) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}

function rangeHeader(offset, length) {
  return `bytes=${offset}-${length === undefined ? '' : offset + length - 1}`;
}

function parseContentRange(header) {
  const match = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(header || '');
  return match ? { start: Number(match[1]), end: Number(match[2]) } : null;
}

function validateRangeResponse(response, range) {
  if (response.status !== 206) {
    throw new Error(`range request returned HTTP ${response.status}, expected 206`);
  }
  const contentRange = parseContentRange(response.headers.get('content-range'));
  if (!contentRange) throw new Error('range request response missing valid Content-Range');
  const expectedEnd = range.length === undefined ? contentRange.end : range.offset + range.length - 1;
  if (contentRange.start !== range.offset || contentRange.end !== expectedEnd) {
    const expectedRange = range.length === undefined ? `${range.offset}-` : `${range.offset}-${expectedEnd}`;
    throw new Error(
      `range request returned Content-Range bytes ${contentRange.start}-${contentRange.end}, expected ${expectedRange}`,
    );
  }
}

function metadataResult(response) {
  return response.result;
}

function metadataSize(metadata) {
  return typeof metadata.size === 'number' ? metadata.size : 0;
}

function validateRevision(expectedRevision, metadata) {
  if (expectedRevision && metadata.rev !== expectedRevision) {
    throw new Error(
      `remote file changed during retry: got rev "${metadata.rev}", expected "${expectedRevision}"`,
    );
  }
}

function partFileSize(runtime, filePath) {
  try {
    return runtime.fs.statSync(filePath).size;
  } catch (error) {
    if (error.code === 'ENOENT') return 0;
    throw error;
  }
}

async function computeContentHashFromFile(runtime, filePath) {
  const overallHash = runtime.crypto.createHash('sha256');
  const input = runtime.fs.createReadStream(filePath, { highWaterMark: BLOCK_SIZE });
  for await (const block of input) {
    overallHash.update(runtime.crypto.createHash('sha256').update(block).digest());
  }
  return overallHash.digest('hex');
}

async function validatePartFile(runtime, filePath, metadata) {
  const actualSize = runtime.fs.statSync(filePath).size;
  const expectedSize = metadataSize(metadata);
  if (actualSize !== expectedSize) {
    throw new Error(`incomplete download: got ${actualSize} bytes, expected ${expectedSize}`);
  }
  if (metadata.content_hash) {
    const actualHash = await computeContentHashFromFile(runtime, filePath);
    if (actualHash !== metadata.content_hash) {
      throw new Error(`content hash mismatch: got "${actualHash}", expected "${metadata.content_hash}"`);
    }
  }
}

function withMetadata(value, metadata) {
  if ((typeof value === 'object' || typeof value === 'function') && value !== null) {
    value.metadata = metadata;
  }
  return value;
}

function buildRequestSignal(options) {
  if (options.signal && options.timeout) {
    return AbortSignal.any([options.signal, AbortSignal.timeout(options.timeout)]);
  }
  if (options.timeout) return AbortSignal.timeout(options.timeout);
  return options.signal;
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
  const message = error && error.message;
  if (typeof message !== 'string') return true;
  return ![
    'remote file changed',
    'range request',
    'incomplete download',
    'content hash mismatch',
    'download response body is nil',
    'downloadFile requires a Dropbox client instance',
    'downloadFile is only supported',
  ].some(prefix => message.startsWith(prefix));
}

function delay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

function progressTransform(runtime, tracker) {
  return new runtime.Transform({
    transform(chunk, encoding, callback) {
      tracker.add(chunk.length);
      callback(null, chunk);
    },
  });
}

function writeAtStream(runtime, fileDescriptor, offset) {
  let position = offset;
  return new runtime.Writable({
    write(chunk, encoding, callback) {
      runtime.fs.write(fileDescriptor, chunk, 0, chunk.length, position, error => {
        if (!error) position += chunk.length;
        callback(error);
      });
    },
  });
}

async function writeRangeBody(runtime, response, fileDescriptor, range, tracker) {
  let received = 0;
  const counter = new runtime.Transform({
    transform(chunk, encoding, callback) {
      received += chunk.length;
      tracker.add(chunk.length);
      callback(null, chunk);
    },
  });
  await runtime.pipeline(
    response.body,
    counter,
    writeAtStream(runtime, fileDescriptor, range.offset),
  );
  if (received !== range.length) {
    throw new Error(`range request body length mismatch: received ${received} bytes, expected ${range.length}`);
  }
}

function splitRanges(offset, length, count) {
  const rangeCount = Math.min(length, count);
  if (!rangeCount) return [];
  const baseLength = Math.floor(length / rangeCount);
  const remainder = length % rangeCount;
  let cursor = offset;
  const ranges = [];
  for (let index = 0; index < rangeCount; index += 1) {
    const rangeLength = baseLength + (index < remainder ? 1 : 0);
    ranges.push({ offset: cursor, length: rangeLength });
    cursor += rangeLength;
  }
  return ranges;
}

function createProgressTracker(resumedFrom, totalBytes, written, progress) {
  const tracker = {
    written,
    add(bytes) {
      tracker.written += bytes;
      progress?.({ bytesWritten: tracker.written, totalBytes, resumedFrom });
    },
  };
  return tracker;
}

async function getNodeRuntime() {
  return { fs, crypto, Readable, Transform, Writable, pipeline, Buffer };
}

function baseApiUrl(subdomain, domain = 'dropboxapi.com', delimiter = '.') {
  return `https://${subdomain}${delimiter}${domain}/2/`;
}

class DropboxFileDownloader {
  constructor(client, options = {}) {
    this.client = client;
    this.maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    this.parallelDownloads = options.parallelDownloads ?? 1;
    this.retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY;
    this.delay = options.delay ?? delay;
    this.progress = options.progress;
    this.signal = options.signal;
    this.timeout = options.timeout;
    validatePositiveInteger('maxAttempts', this.maxAttempts);
    validatePositiveInteger('parallelDownloads', this.parallelDownloads);
    validatePositiveInteger('retryDelay', this.retryDelay);
    if (this.timeout !== undefined) validatePositiveInteger('timeout', this.timeout);
  }

  async rawDownload(filePath, range = {}, signal = this.signal) {
    const client = this.client;
    if (!client?.auth || typeof client.fetch !== 'function') {
      throw new Error('downloadFile requires a Dropbox client instance');
    }
    const options = {
      method: 'POST',
      headers: { 'Dropbox-API-Arg': httpHeaderSafeJson({ path: { path: filePath } }) },
      signal: buildRequestSignal({ signal, timeout: this.timeout }),
    };
    if (range.offset !== undefined) options.headers.Range = rangeHeader(range.offset, range.length);
    await client.auth.checkAndRefreshAccessToken();
    client.setAuthHeaders('user', options);
    client.setCommonHeaders(options);
    const url = `${baseApiUrl('content', client.domain, client.domainDelimiter)}files/download`;
    const response = await client.fetch(url, options);
    if (!response.ok) await throwAsResponseError(response);
    if (range.offset !== undefined) validateRangeResponse(response, range);
    if (!response.body) throw new Error('download response body is nil');
    return {
      metadata: JSON.parse(response.headers.get('dropbox-api-result')),
      body: (await getNodeRuntime()).Readable.fromWeb(response.body),
    };
  }

  async fetchMetadata(filePath) {
    if (typeof this.client?.filesGetMetadata !== 'function') {
      throw new Error('downloadFile requires a Dropbox client instance');
    }
    return metadataResult(await this.client.filesGetMetadata(
      { path: filePath },
      { signal: this.signal, timeout: this.timeout },
    ));
  }

  async downloadFileAttempt(filePath, destination, revision = '') {
    const runtime = await getNodeRuntime();
    const partPath = `${destination}.part`;
    const resumedFrom = partFileSize(runtime, partPath);
    let metadata;
    try {
      if (this.parallelDownloads > 1 && resumedFrom === 0) {
        return await this.downloadFileParallel(filePath, partPath, resumedFrom, revision);
      }
      const response = await this.rawDownload(filePath, { offset: resumedFrom });
      metadata = response.metadata;
      validateRevision(revision, metadata);
      const totalBytes = metadataSize(metadata);
      const tracker = createProgressTracker(resumedFrom, totalBytes, resumedFrom, this.progress);
      await runtime.pipeline(
        response.body,
        progressTransform(runtime, tracker),
        runtime.fs.createWriteStream(partPath, { flags: 'a' }),
      );
      await validatePartFile(runtime, partPath, metadata);
      runtime.fs.renameSync(partPath, destination);
      return { metadata, resumedFrom };
    } catch (error) {
      if (!isRetryableError(error)) runtime.fs.rmSync(partPath, { force: true });
      throw withMetadata(error, metadata);
    }
  }

  async downloadFileParallel(filePath, partPath, resumedFrom, revision = '') {
    const runtime = await getNodeRuntime();
    const metadata = await this.fetchMetadata(filePath);
    validateRevision(revision, metadata);
    const totalBytes = metadataSize(metadata);
    const tracker = createProgressTracker(resumedFrom, totalBytes, resumedFrom, this.progress);
    runtime.fs.writeFileSync(partPath, runtime.Buffer.alloc(totalBytes));
    runtime.fs.truncateSync(partPath, totalBytes);
    const descriptor = runtime.fs.openSync(partPath, 'r+');
    const ranges = splitRanges(resumedFrom, totalBytes - resumedFrom, this.parallelDownloads);
    const controller = new AbortController();
    const signal = this.signal ? AbortSignal.any([this.signal, controller.signal]) : controller.signal;
    try {
      const results = await Promise.allSettled(ranges.map(async range => {
        const response = await this.rawDownload(filePath, range, signal);
        validateRevision(metadata.rev, response.metadata);
        await writeRangeBody(runtime, response, descriptor, range, tracker);
      }));
      const failure = results.find(result => result.status === 'rejected');
      if (failure) {
        controller.abort(failure.reason);
        throw failure.reason;
      }
    } finally {
      runtime.fs.closeSync(descriptor);
    }
    await validatePartFile(runtime, partPath, metadata);
    runtime.fs.renameSync(partPath, partPath.slice(0, -5));
    return { metadata, resumedFrom };
  }

  async downloadFile(filePath, destination) {
    const runtime = await getNodeRuntime();
    const partPath = `${destination}.part`;
    let revision = '';
    for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
      try {
        const result = await this.downloadFileAttempt(filePath, destination, revision);
        return result;
      } catch (error) {
        if (error?.metadata?.rev) revision = error.metadata.rev;
        if (this.signal?.aborted) throw this.signal.reason;
        if (attempt + 1 >= this.maxAttempts || !isRetryableError(error)) {
          try {
            runtime.fs.rmSync(partPath, { force: true });
          } catch (cleanupError) {
            if (error && typeof error === 'object') error.cleanupError = cleanupError;
          }
          throw error;
        }
        await this.delay(this.retryDelay * (attempt + 1), this.signal);
      }
    }
  }
}

function downloadFile(client, filePath, destination, options) {
  return new DropboxFileDownloader(client, options).downloadFile(filePath, destination);
}

module.exports = { DropboxFileDownloader, downloadFile };
