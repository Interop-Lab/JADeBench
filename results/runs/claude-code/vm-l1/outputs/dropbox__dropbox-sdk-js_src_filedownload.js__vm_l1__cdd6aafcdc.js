'use strict';

const RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);

class DropboxResponseError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'DropboxResponseError';
    this.status = status;
    this.response = response;
  }
}

function baseApiUrl(subdomain, domain = 'dropboxapi.com', path = '') {
  return `https://${subdomain}.${domain}/2/${path}`;
}

function httpHeaderSafeJson(value) {
  return encodeURIComponent(JSON.stringify(value)).replace(
    /%([0-9A-F]{2})/g,
    (_, byte) => String.fromCharCode(Number.parseInt(byte, 16)),
  );
}

function requireNodeModule(name) {
  if (typeof require !== 'function') throw new Error(`Node.js module ${name} is unavailable`);
  return require(name);
}

function rangeHeader(start, end) {
  return `bytes=${start}-${end}`;
}

function parseContentRange(header) {
  const match = /^bytes (\d+)-(\d+)\/(\d+|\*)$/i.exec(header || '');
  if (!match) return null;
  return {
    start: Number(match[1]),
    end: Number(match[2]),
    size: match[3] === '*' ? undefined : Number(match[3]),
  };
}

function validateRangeResponse(response, expected) {
  if (response.status !== 206) {
    throw new DropboxResponseError(
      `Response failed with a ${response.status} code`,
      response.status,
      response,
    );
  }
  const actual = parseContentRange(response.headers.get('content-range'));
  if (!actual || actual.start !== expected.start || actual.end !== expected.end) {
    throw new DropboxResponseError(
      'Response returned an unexpected content range',
      response.status,
      response,
    );
  }
  return actual;
}

function validatePositiveInteger(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
  return value;
}

async function throwAsResponseError(response) {
  let message = `Response failed with a ${response.status} code`;
  try {
    const body = await response.json();
    message = body.error_summary || body.error || message;
  } catch {}
  throw new DropboxResponseError(message, response.status, response);
}

function isRetryableError(error) {
  return error && (
    error.name === 'AbortError' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT' ||
    RETRYABLE_5XX_STATUSES.has(error.status)
  );
}

function delay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason || new Error('Aborted'));
    };
    if (signal) {
      if (signal.aborted) abort();
      else signal.addEventListener('abort', abort, { once: true });
    }
  });
}

function metadataSize(metadata) {
  const size = Number(metadata && metadata.size);
  if (!Number.isSafeInteger(size) || size < 0) {
    throw new TypeError('Metadata has an invalid size');
  }
  return size;
}

function validateRevision(metadata, expectedRevision) {
  if (expectedRevision && metadata.rev !== expectedRevision) {
    throw new Error(`Downloaded revision ${metadata.rev} does not match ${expectedRevision}`);
  }
  return metadata;
}

function splitRanges(size, partSize) {
  validatePositiveInteger(partSize, 'partSize');
  const ranges = [];
  for (let start = 0; start < size; start += partSize) {
    ranges.push({ start, end: Math.min(start + partSize, size) - 1 });
  }
  return ranges;
}

function createProgressTracker(total, onProgress) {
  let transferred = 0;
  return increment => {
    transferred += increment;
    if (onProgress) onProgress({ transferred, total });
  };
}

function writeAtStream(fileHandle, position, onProgress) {
  const { Writable } = requireNodeModule('stream');
  let offset = position;
  return new Writable({
    write(chunk, encoding, callback) {
      fileHandle.write(chunk, 0, chunk.length, offset).then(({ bytesWritten }) => {
        offset += bytesWritten;
        if (onProgress) onProgress(bytesWritten);
        callback();
      }, callback);
    },
  });
}

async function writeRangeBody(body, fileHandle, range, onProgress, signal) {
  if (!body) throw new Error('Download response has no body');
  if (signal && signal.aborted) throw signal.reason || new Error('Aborted');
  const { Readable } = requireNodeModule('stream');
  const source = typeof body.pipe === 'function' ? body : Readable.fromWeb(body);
  const destination = writeAtStream(fileHandle, range.start, onProgress);
  await new Promise((resolve, reject) => {
    source.once('error', reject);
    destination.once('error', reject);
    destination.once('finish', resolve);
    source.pipe(destination);
  });
}

class DropboxFileDownloader {
  constructor(options = {}) {
    this.fetch = options.fetch || globalThis.fetch;
    this.accessToken = options.accessToken;
    this.domain = options.domain || 'dropboxapi.com';
    this.retries = options.retries == null ? 3 : options.retries;
    this.retryDelay = options.retryDelay == null ? 500 : options.retryDelay;
    this.partSize = options.partSize || 8 * 1024 * 1024;
    this.concurrency = options.concurrency || 4;
    if (typeof this.fetch !== 'function') throw new TypeError('A fetch implementation is required');
  }

  async rawDownload(path, options = {}) {
    const argument = { path };
    if (options.rev) argument.rev = options.rev;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Dropbox-API-Arg': httpHeaderSafeJson(argument),
    };
    if (options.range) headers.Range = rangeHeader(options.range.start, options.range.end);
    const response = await this.fetch(
      baseApiUrl('content', this.domain, 'files/download'),
      { method: 'POST', headers, signal: options.signal },
    );
    if (!response.ok) await throwAsResponseError(response);
    return response;
  }

  async fetchMetadata(path) {
    const response = await this.fetch(
      baseApiUrl('api', this.domain, 'files/get_metadata'),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      },
    );
    if (!response.ok) await throwAsResponseError(response);
    return response.json();
  }

  async downloadFileAttempt(path, destination, options = {}) {
    const metadata = validateRevision(await this.fetchMetadata(path), options.rev);
    const size = metadataSize(metadata);
    if (options.parallel !== false && size > this.partSize) {
      return this.downloadFileParallel(path, destination, metadata, options);
    }

    const response = await this.rawDownload(path, options);
    const file = await requireNodeModule('fs').promises.open(destination, 'w');
    try {
      await writeRangeBody(
        response.body,
        file,
        { start: 0, end: size - 1 },
        createProgressTracker(size, options.onProgress),
        options.signal,
      );
    } finally {
      await file.close();
    }
    return { path: destination, metadata };
  }

  async downloadFileParallel(path, destination, metadata, options = {}) {
    const size = metadataSize(metadata);
    const ranges = splitRanges(size, options.partSize || this.partSize);
    const progress = createProgressTracker(size, options.onProgress);
    const file = await requireNodeModule('fs').promises.open(destination, 'w');
    await file.truncate(size);
    let nextRange = 0;

    const worker = async () => {
      while (nextRange < ranges.length) {
        const range = ranges[nextRange++];
        const response = await this.rawDownload(path, {
          ...options,
          range,
          rev: metadata.rev,
        });
        validateRangeResponse(response, range);
        await writeRangeBody(response.body, file, range, progress, options.signal);
      }
    };

    try {
      const workerCount = Math.min(
        options.concurrency || this.concurrency,
        ranges.length,
      );
      await Promise.all(Array.from({ length: workerCount }, worker));
    } finally {
      await file.close();
    }
    return { path: destination, metadata };
  }

  async downloadFile(path, destination, options = {}) {
    let attempt = 0;
    for (;;) {
      try {
        return await this.downloadFileAttempt(path, destination, options);
      } catch (error) {
        if (attempt++ >= this.retries || !isRetryableError(error)) throw error;
        await delay(this.retryDelay * 2 ** (attempt - 1), options.signal);
      }
    }
  }
}

function downloadFile(path, destination, options = {}) {
  const downloader = options.downloader || new DropboxFileDownloader(options);
  return downloader.downloadFile(path, destination, options);
}

module.exports = { DropboxFileDownloader, downloadFile };
