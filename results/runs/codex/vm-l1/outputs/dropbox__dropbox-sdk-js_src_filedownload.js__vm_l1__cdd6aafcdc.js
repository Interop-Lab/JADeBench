'use strict';

const DEFAULT_API_DOMAIN = 'dropboxapi.com';
const DEFAULT_DOMAIN = 'dropbox.com';
const TEST_DOMAIN_MAPPINGS = {
  api: 'api',
  notify: 'bolt',
  content: 'api-content',
};
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

function getSafeUnicode(character) {
  return `\\u${`000${character.charCodeAt(0).toString(16)}`.slice(-4)}`;
}

function baseApiUrl(subdomain, domain = DEFAULT_API_DOMAIN, domainDelimiter = '.') {
  if (TEST_DOMAIN_MAPPINGS[subdomain] && domain !== DEFAULT_API_DOMAIN) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    domainDelimiter = '-';
  }
  return `https://${subdomain}${domainDelimiter}${domain}/2/`;
}

function OAuth2AuthorizationUrl(domain = DEFAULT_DOMAIN) {
  return `https://meta-${domain}/oauth2/authorize`;
}

function OAuth2TokenUrl(domain = DEFAULT_API_DOMAIN, domainDelimiter = '.') {
  let subdomain = 'api';
  if (domain !== DEFAULT_API_DOMAIN) {
    subdomain = TEST_DOMAIN_MAPPINGS.api;
    domainDelimiter = '-';
  }
  return `https://${subdomain}${domainDelimiter}${domain}/oauth2/token`;
}

function httpHeaderSafeJson(value) {
  return JSON.stringify(value).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}

function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1000);
}

function isWindowOrWorker() {
  return (
    typeof WorkerGlobalScope !== 'undefined' ||
    typeof self !== 'undefined' ||
    typeof window !== 'undefined'
  );
}

function isBrowserEnv() {
  return typeof window !== 'undefined';
}

function isWorkerEnv() {
  return typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined';
}

function createBrowserSafeString(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function requireNodeModule(moduleName) {
  if (typeof require === 'function') {
    return Promise.resolve(require(moduleName));
  }
  return Function('moduleName', 'return import(moduleName)')(moduleName);
}

async function computeContentHashFromFile(filePath, runtime) {
  const { crypto, fs } = runtime;
  const contentHash = crypto.createHash('sha256');
  const fileHandle = await fs.promises.open(filePath, 'r');
  const buffer = Buffer.alloc(BLOCK_SIZE);

  try {
    while (true) {
      const { bytesRead } = await fileHandle.read(buffer, 0, BLOCK_SIZE, null);
      if (bytesRead === 0) break;
      const blockHash = crypto
        .createHash('sha256')
        .update(buffer.subarray(0, bytesRead))
        .digest();
      contentHash.update(blockHash);
    }
  } finally {
    await fileHandle.close();
  }

  return contentHash.digest('hex');
}

let nodeRuntime;

async function getNodeRuntime() {
  if (nodeRuntime) return nodeRuntime;
  if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
    throw new Error(
      'downloadFile is only supported in Node.js. In browsers, use filesDownload() and read result.fileBlob.',
    );
  }

  const [fsModule, streamModule, streamPromisesModule, cryptoModule] = await Promise.all([
    requireNodeModule('fs'),
    requireNodeModule('stream'),
    requireNodeModule('stream/promises'),
    requireNodeModule('crypto'),
  ]);
  const fs = fsModule.default || fsModule;
  const stream = streamModule.default || streamModule;
  const streamPromises = streamPromisesModule.default || streamPromisesModule;
  const crypto = cryptoModule.default || cryptoModule;
  nodeRuntime = {
    fs,
    crypto,
    Readable: stream.Readable,
    Transform: stream.Transform,
    Writable: stream.Writable,
    pipeline: streamPromises.pipeline,
  };
  return nodeRuntime;
}

function partFileSize(fs, filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    if (error.code === 'ENOENT') return 0;
    throw error;
  }
}

function rangeHeader(offset, length) {
  return `bytes=${offset}-${length === undefined ? '' : offset + length - 1}`;
}

function parseContentRange(value) {
  const match = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(value || '');
  if (!match) return undefined;
  return { start: Number(match[1]), end: Number(match[2]) };
}

function validateRangeResponse(response, range) {
  if (response.status !== 206) {
    throw new Error(`range request returned HTTP ${response.status}, expected 206`);
  }
  const contentRange = parseContentRange(response.headers.get('content-range'));
  if (!contentRange) {
    throw new Error('range request response missing valid Content-Range');
  }
  const expectedEnd = range.length === undefined ? contentRange.end : range.offset + range.length - 1;
  if (contentRange.start !== range.offset || contentRange.end !== expectedEnd) {
    throw new Error(
      `range request returned Content-Range bytes ${contentRange.start}-${contentRange.end}, expected ${range.offset}-${expectedEnd}`,
    );
  }
}

function validatePositiveInteger(value, name) {
  if (!Number.isInteger(value) || value < 1) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}

function buildRequestSignal(signal, timeout) {
  const signals = [];
  if (signal) signals.push(signal);
  if (timeout) signals.push(AbortSignal.timeout(timeout));
  if (signals.length === 0) return undefined;
  if (signals.length === 1) return signals[0];
  return AbortSignal.any(signals);
}

async function throwAsResponseError(response) {
  const text = await response.text();
  const error = text ? JSON.parse(text) : undefined;
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
  if (!(error instanceof Error)) return false;
  if (error.message.startsWith('downloadFile requires a Dropbox client instance')) return false;
  if (error.message.startsWith('downloadFile is only supported')) return false;
  return true;
}

function delay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    const finish = () => {
      if (signal) signal.removeEventListener('abort', abort);
      resolve();
    };
    const timer = setTimeout(finish, milliseconds);
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason || new Error('download aborted'));
    };
    if (!signal) return;
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

function metadataSize(metadata) {
  return metadata && typeof metadata.size === 'number' ? metadata.size : 0;
}

function metadataResult(response) {
  return response.result;
}

function validateRevision(metadata, expectedRevision) {
  if (expectedRevision && metadata.rev !== expectedRevision) {
    throw new Error(
      `remote file changed during retry: got rev "${metadata.rev}", expected "${expectedRevision}"`,
    );
  }
}

async function validatePartFile(filePath, metadata, runtime) {
  const actualSize = runtime.fs.statSync(filePath).size;
  const expectedSize = metadataSize(metadata);
  if (actualSize !== expectedSize) {
    throw new Error(`incomplete download: got ${actualSize} bytes, expected ${expectedSize}`);
  }
  if (metadata.content_hash) {
    const actualHash = await computeContentHashFromFile(filePath, runtime);
    if (actualHash !== metadata.content_hash) {
      throw new Error(
        `content hash mismatch: got "${actualHash}", expected "${metadata.content_hash}"`,
      );
    }
  }
}

function withMetadata(result, metadata) {
  result.metadata = metadata;
  return result;
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
      let chunkOffset = 0;
      const writeRemaining = () => {
        runtime.fs.write(
          fileDescriptor,
          chunk,
          chunkOffset,
          chunk.length - chunkOffset,
          position,
          (error, bytesWritten) => {
            if (error) return callback(error);
            if (bytesWritten === 0) return callback(new Error('fs.write wrote 0 bytes'));
            chunkOffset += bytesWritten;
            position += bytesWritten;
            if (chunkOffset < chunk.length) return writeRemaining();
            return callback();
          },
        );
      };
      writeRemaining();
    },
  });
}

async function writeRangeBody(body, range, fileDescriptor, runtime, tracker) {
  let received = 0;
  const counter = new runtime.Transform({
    transform(chunk, encoding, callback) {
      received += chunk.length;
      tracker.add(chunk.length);
      callback(null, chunk);
    },
  });
  await runtime.pipeline(body, counter, writeAtStream(runtime, fileDescriptor, range.offset));
  if (received !== range.length) {
    throw new Error(
      `range request body length mismatch: received ${received} bytes, expected ${range.length}`,
    );
  }
}

function splitRanges(offset, length, count) {
  const ranges = [];
  const rangeLength = Math.floor(length / count);
  let currentOffset = offset;
  for (let index = 0; index < count; index += 1) {
    const currentLength = index === count - 1 ? offset + length - currentOffset : rangeLength;
    if (currentLength > 0) ranges.push({ offset: currentOffset, length: currentLength });
    currentOffset += currentLength;
  }
  return ranges;
}

function createProgressTracker(progress, resumedFrom, totalBytes) {
  let written = 0;
  return {
    add(bytesWritten) {
      written += bytesWritten;
      if (!progress) return;
      progress({ written, bytesWritten, totalBytes, resumedFrom });
    },
  };
}

class DropboxFileDownloader {
  constructor(client, options = {}) {
    this.maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    this.parallelDownloads = options.parallelDownloads ?? 1;
    this.retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY;
    validatePositiveInteger(this.maxAttempts, 'maxAttempts');
    validatePositiveInteger(this.parallelDownloads, 'parallelDownloads');
    validatePositiveInteger(this.retryDelay, 'retryDelay');
    this.client = client;
    this.timeout = options.timeout;
    this.delay = options.delay || delay;
    this.progress = options.progress;
    this.signal = options.signal;
  }

  async rawDownload(path, range) {
    const client = this.client;
    if (!client || !client.auth || typeof client.fetch !== 'function') {
      throw new Error('downloadFile requires a Dropbox client instance');
    }
    await client.auth.checkAndRefreshAccessToken();
    const headers = {};
    headers['Dropbox-API-Arg'] = httpHeaderSafeJson({ path });
    if (range) headers.Range = rangeHeader(range.offset, range.length);
    client.auth.setAuthHeaders(headers, 'USER_AUTH');
    client.auth.setCommonHeaders(headers);
    const response = await client.fetch(
      `${baseApiUrl('content', client.domain, client.domainDelimiter)}files/download`,
      {
        method: 'POST',
        headers,
        signal: buildRequestSignal(this.signal, this.timeout),
      },
    );
    if (!response.ok) await throwAsResponseError(response);
    if (range) validateRangeResponse(response, range);
    if (!response.body) throw new Error('download response body is nil');
    const metadata = JSON.parse(response.headers.get('dropbox-api-result'));
    const runtime = await getNodeRuntime();
    return withMetadata(runtime.Readable.fromWeb(response.body), metadata);
  }

  async fetchMetadata(path) {
    if (!this.client || typeof this.client.filesGetMetadata !== 'function') {
      throw new Error('downloadFile requires a Dropbox client instance');
    }
    const response = await this.client.filesGetMetadata({ path }, {
      signal: buildRequestSignal(this.signal, this.timeout),
    });
    return metadataResult(response);
  }

  async downloadFileAttempt(path, destination, expectedMetadata) {
    const runtime = await getNodeRuntime();
    const partPath = `${destination}.part`;
    const resumedFrom = partFileSize(runtime.fs, partPath);
    if (this.parallelDownloads > 1) {
      return this.downloadFileParallel(path, destination, expectedMetadata, resumedFrom);
    }

    const body = await this.rawDownload(path, resumedFrom ? { offset: resumedFrom } : undefined);
    const metadata = body.metadata;
    validateRevision(metadata, expectedMetadata && expectedMetadata.rev);
    const tracker = createProgressTracker(
      this.progress,
      resumedFrom,
      metadataSize(metadata),
    );
    const streams = [body];
    if (this.progress) streams.push(progressTransform(runtime, tracker));
    streams.push(runtime.fs.createWriteStream(partPath, { flags: resumedFrom ? 'a' : 'w' }));
    await runtime.pipeline(...streams);
    await validatePartFile(partPath, metadata, runtime);
    runtime.fs.renameSync(partPath, destination);
    return { ...metadata, resumedFrom };
  }

  async downloadFileParallel(path, destination, expectedMetadata, resumedFrom) {
    const runtime = await getNodeRuntime();
    const metadata = expectedMetadata || await this.fetchMetadata(path);
    validateRevision(metadata, expectedMetadata && expectedMetadata.rev);
    const size = metadataSize(metadata);
    const partPath = `${destination}.part`;
    if (resumedFrom > size) runtime.fs.rmSync(partPath, { force: true });
    runtime.fs.writeFileSync(partPath, Buffer.alloc(0), { flag: resumedFrom ? 'a' : 'w' });
    runtime.fs.truncateSync(partPath, size);
    const offset = Math.min(resumedFrom, size);
    const tracker = createProgressTracker(this.progress, offset, size);
    const ranges = splitRanges(offset, size - offset, this.parallelDownloads);
    const controller = new AbortController();
    const signal = this.signal
      ? AbortSignal.any([this.signal, controller.signal])
      : controller.signal;
    const descriptor = runtime.fs.openSync(partPath, 'r+');

    try {
      const results = await Promise.allSettled(ranges.map(async (range) => {
        const originalSignal = this.signal;
        this.signal = signal;
        try {
          const body = await this.rawDownload(path, range);
          validateRevision(body.metadata, metadata.rev);
          await writeRangeBody(body, range, descriptor, runtime, tracker);
        } catch (error) {
          controller.abort(error);
          throw error;
        } finally {
          this.signal = originalSignal;
        }
      }));
      const failure = results.find((result) => result.status === 'rejected');
      if (failure) throw failure.reason;
    } finally {
      runtime.fs.closeSync(descriptor);
    }

    await validatePartFile(partPath, metadata, runtime);
    runtime.fs.renameSync(partPath, destination);
    return { ...metadata, resumedFrom: offset };
  }

  async downloadFile(path, destination) {
    const runtime = await getNodeRuntime();
    const partPath = `${destination}.part`;
    let metadata;
    let lastError;

    for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
      try {
        const result = await this.downloadFileAttempt(path, destination, metadata);
        return result;
      } catch (error) {
        lastError = error;
        if (error && error.metadata) metadata = error.metadata;
        if (this.signal && this.signal.aborted) throw this.signal.reason;
        if (attempt + 1 >= this.maxAttempts || !isRetryableError(error)) break;
        await this.delay(this.retryDelay, this.signal);
      }
    }

    try {
      runtime.fs.rmSync(partPath, { force: true });
    } catch (cleanupError) {
      if (lastError && typeof lastError === 'object') lastError.cleanupError = cleanupError;
    }
    throw lastError;
  }
}

function downloadFile(client, path, destination) {
  return new DropboxFileDownloader(client).downloadFile(path, destination);
}

module.exports = { DropboxFileDownloader, downloadFile };
