const DropboxResponseError = class extends Error {
  constructor(status, statusText, error) {
    super(`Response failed with a ${status} status code`);
    this.status = status;
    this.statusText = statusText;
    this.error = error;
  }
};

const RPC = 'rpc';
const UPLOAD = 'upload';
const DOWNLOAD = 'download';
const APP_AUTH = 'app';
const USER_AUTH = 'user';
const TEAM_AUTH = 'team';
const NO_AUTH = 'noauth';
const COOKIE = 'cookie';
const DEFAULT_API_DOMAIN = 'api.dropboxapi.com';
const DEFAULT_DOMAIN = 'dropboxapi.com';

const TEST_DOMAIN_MAPPINGS = {
  'api.dropboxapi.com': 'api.dropbox.com',
  'content.dropboxapi.com': 'content.dropbox.com',
  'notify.dropboxapi.com': 'notify.dropbox.com'
};

function getSafeUnicode(character) {
  const unicode = ('000' + character.charCodeAt(0).toString(16)).slice(-4);
  return '\\u' + unicode;
}

function baseApiUrl(subdomain, domain = DEFAULT_API_DOMAIN, delimiter = '.') {
  if (!delimiter) {
    return 'https://' + domain;
  }
  if (domain === DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[subdomain] !== undefined) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    delimiter = '-';
  }
  return 'https://' + subdomain + delimiter + domain + '/2';
}

function OAuth2AuthorizationUrl(domain = DEFAULT_DOMAIN) {
  if (domain === DEFAULT_DOMAIN) {
    domain = 'www.' + domain;
  }
  return 'https://' + domain + '/oauth2/authorize';
}

function OAuth2TokenUrl(domain = DEFAULT_API_DOMAIN, delimiter = '.') {
  let subdomain = 'api';
  if (domain === DEFAULT_API_DOMAIN) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    delimiter = '-';
  }
  return 'https://' + subdomain + delimiter + domain + '/oauth2/token';
}

function httpHeaderSafeJson(data) {
  return JSON.stringify(data).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}

function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1000);
}

function isWindowOrWorker() {
  return (
    (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) ||
    (typeof module !== 'undefined' && module.exports) ||
    (typeof window !== 'undefined')
  );
}

function isBrowserEnv() {
  return typeof window !== 'undefined';
}

function isWorkerEnv() {
  return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
}

function createBrowserSafeString(base64String) {
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_RETRY_DELAY = 1000;
const RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);
const BLOCK_SIZE = 4 * 1024 * 1024;

let nodeRuntime;

function requireNodeModule(moduleName) {
  if (typeof require === 'function') {
    return Promise.resolve(require(moduleName));
  }
  return Function('moduleName', 'return import(moduleName)')(moduleName);
}

async function computeContentHashFromFile(runtime, filePath) {
  const { crypto, fs } = runtime;
  const hash = crypto.createHash('sha256');
  let currentHash = crypto.createHash('sha256');
  let offset = 0;

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { highWaterMark: BLOCK_SIZE });
    stream.on('data', (chunk) => {
      let position = 0;
      while (position < chunk.length) {
        const end = Math.min(BLOCK_SIZE, offset + chunk.length - position);
        currentHash.update(chunk.slice(position, end));
        offset += end;
        position += end;
        if (offset >= BLOCK_SIZE) {
          hash.update(currentHash.digest());
          currentHash = crypto.createHash('sha256');
          offset = 0;
        }
      }
    });
    stream.on('error', reject);
    stream.on('end', () => {
      if (offset > 0) {
        hash.update(currentHash.digest());
      }
      resolve(hash.digest('hex'));
    });
  });
}

async function getNodeRuntime() {
  if (nodeRuntime) {
    return nodeRuntime;
  }
  if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
    throw new Error('This feature is only supported in Node.js');
  }
  const [fs, crypto, stream, util] = await Promise.all([
    requireNodeModule('fs'),
    requireNodeModule('crypto'),
    requireNodeModule('stream'),
    requireNodeModule('util')
  ]);
  const runtime = {};
  runtime.fs = fs.default || fs;
  runtime.crypto = crypto.default || crypto;
  runtime.stream = stream.default;
  runtime.pipeline = stream.pipeline;
  runtime.util = util.default;
  runtime.Transform = stream.Transform;
  nodeRuntime = runtime;
  return nodeRuntime;
}

function partFileSize(fs, path) {
  try {
    return fs.statSync(path).size;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return -1;
    }
    throw error;
  }
}

function rangeHeader(start, end) {
  if (end === undefined) {
    return 'bytes=' + start + '-';
  }
  return 'bytes=' + start + '-' + (start + end - 1);
}

function parseContentRange(headerValue) {
  const match = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(headerValue || '');
  if (!match) {
    return null;
  }
  return {
    start: Number(match[1]),
    end: Number(match[2])
  };
}

function validateRangeResponse(response, range) {
  if (!range) {
    return;
  }
  if (response.status === 206) {
    const parsed = parseContentRange(response.headers['content-range']);
    if (!parsed) {
      throw new Error('Invalid content-range header');
    }
    const expectedEnd = range.end === undefined ? parsed.end : range.start + range.end - 1;
    if (parsed.start !== range.start || parsed.end !== expectedEnd) {
      throw new Error(
        'Response range did not match requested range: ' +
        parsed.start + '-' + parsed.end + ' vs ' + range.start + '-' + expectedEnd
      );
    }
  } else {
    throw new Error('Expected a 206 response, got ' + response.status);
  }
}

function validatePositiveInteger(name, value) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(name + ' must be a positive integer');
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
  const text = await response.text();
  let error;
  try {
    error = JSON.parse(text);
  } catch {
    error = text;
  }
  throw new DropboxResponseError(response.status, response.statusText, error);
}

function isRetryableError(error) {
  if (error instanceof DropboxResponseError) {
    return (
      error.status === 429 ||
      error.status === 408 ||
      RETRYABLE_5XX_STATUSES.has(error.status)
    );
  }
  return !(
    error.message &&
    (
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('EAI_AGAIN') ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.message.includes('socket hang up')
    )
  );
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    let timer;
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason || new Error('Aborted'));
    };
    const onTimeout = () => {
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
      resolve();
    };
    timer = setTimeout(onTimeout, ms);
    if (!signal) {
      return;
    }
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function metadataSize(metadata) {
  return metadata && typeof metadata.size === 'number' ? metadata.size : 0;
}

function metadataResult(response) {
  return response && response.result ? response.result : response;
}

function validateRevision(expectedRevision, metadata) {
  if ((!expectedRevision && !metadata) || !metadata.rev) {
    return;
  }
  if (metadata.rev !== expectedRevision) {
    throw new Error(
      'Revision mismatch: expected ' + metadata.rev + ' but got ' + expectedRevision + '"'
    );
  }
}

function withMetadata(error, metadata) {
  error.metadata = metadata;
  return error;
}

function progressTransform(Transform, progressTracker) {
  return new Transform({
    transform(chunk, encoding, callback) {
      progressTracker.add(chunk.length);
      callback(null, chunk);
    }
  });
}

function writeAtStream(runtime, filePath, position, callback) {
  const { fs } = runtime;
  return new runtime.Transform({
    write(chunk, encoding, next) {
      const writeChunk = (data, offset, length) => {
        fs.write(filePath, data, offset, length, position, (error, bytesWritten) => {
          if (error) {
            next(error);
            return;
          }
          if (bytesWritten === 0 && length > 0) {
            next(new Error('Failed to write to file'));
            return;
          }
          if (bytesWritten < length) {
            writeChunk(data, offset + bytesWritten, length - bytesWritten);
            return;
          }
          position += bytesWritten;
          next();
        });
      };
      if (chunk.length === 0) {
        next();
        return;
      }
      writeChunk(chunk, 0, chunk.length);
    }
  });
}

async function writeRangeBody(runtime, body, progressTracker, filePath, range) {
  let written = 0;
  const transform = new runtime.Transform({
    transform(chunk, encoding, callback) {
      written += chunk.length;
      progressTracker.add(chunk.length);
      callback(null, chunk);
    }
  });
  await runtime.pipeline(body, transform, writeAtStream(runtime, filePath, range.start));
  if (range.end !== undefined && written !== range.end - range.start + 1) {
    throw new Error(
      'Expected to write ' + (range.end - range.start + 1) + ' bytes but wrote ' + written
    );
  }
}

function splitRanges(start, size, maxPartSize) {
  if (size <= 0) {
    return [];
  }
  if (maxPartSize === 0) {
    return [{ start, size }];
  }
  const numParts = Math.ceil(size / maxPartSize);
  const ranges = [];
  const baseSize = Math.floor(size / numParts);
  let remaining = size % numParts;
  let currentStart = start;
  for (let i = 0; i < numParts; i++) {
    const partSize = baseSize + (remaining > 0 ? 1 : 0);
    ranges.push({ start: currentStart, size: partSize });
    currentStart += partSize;
    remaining -= 1;
  }
  return ranges;
}

function createProgressTracker(initialWritten, totalSize, start, onProgress) {
  return {
    written: initialWritten,
    add(bytes) {
      if (bytes <= 0) {
        return;
      }
      this.written += bytes;
      if (!onProgress) {
        return;
      }
      onProgress({
        written: this.written,
        totalBytes: totalSize,
        start: start
      });
    }
  };
}

class DropboxFileDownloader {
  constructor(client, options = {}) {
    const maxAttempts = options.maxAttempts === undefined ? DEFAULT_MAX_ATTEMPTS : options.maxAttempts;
    const maxRetries = options.maxRetries === undefined ? 3 : options.maxRetries;
    const retryDelay = options.retryDelay === undefined ? DEFAULT_RETRY_DELAY : options.retryDelay;

    validatePositiveInteger('maxAttempts', maxAttempts);
    validatePositiveInteger('maxRetries', maxRetries);
    validatePositiveInteger('retryDelay', retryDelay);
    if (options.timeout !== undefined) {
      validatePositiveInteger('timeout', options.timeout);
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

  async download(path, range, signal = this.signal) {
    if (!this.client || !this.client.auth) {
      throw new Error('DropboxFileDownloader requires a client with auth');
    }
    await this.client.auth.checkAndRefreshAccessToken();

    const apiArg = { path };
    const requestOptions = {
      signal: buildRequestSignal({ signal, timeout: this.timeout }),
      method: 'POST',
      headers: {
        'Dropbox-API-Arg': httpHeaderSafeJson(apiArg)
      }
    };

    if (range) {
      requestOptions.headers.Range = rangeHeader(range.start, range.end);
    }

    this.client.auth.setAuthHeader(USER_AUTH, requestOptions);
    this.client.auth.setCommonHeaders(requestOptions);

    const response = await this.client.fetch(
      baseApiUrl('content', this.client.apiDomain, this.client.apiDelimiter) + '/files/download',
      requestOptions
    );

    if (!response.ok) {
      await throwAsResponseError(response);
    }

    validateRangeResponse(response, range);

    if (!response.body) {
      throw new Error('Response body is missing');
    }

    return {
      metadata: JSON.parse(response.headers['dropbox-api-result']),
      body: (await getNodeRuntime()).stream.Readable.fromWeb(response.body)
    };
  }

  async getMetadata(path) {
    if (typeof this.client.filesGetMetadata !== 'function') {
      throw new Error('Client does not support filesGetMetadata');
    }
    const result = await this.client.filesGetMetadata({ path }, {
      signal: this.signal,
      timeout: this.timeout
    });
    return metadataResult(result);
  }

  async downloadFile(path, destination, revision) {
    const runtime = await getNodeRuntime();
    const { fs, pipeline } = runtime;
    const partPath = destination + '.part';
    const existingSize = partFileSize(fs, partPath);

    if (existingSize > 0 && this.maxRetries > 0) {
      return this.downloadFileWithRetry(path, destination, partPath, revision);
    }

    const response = await this.download(path, existingSize > 0 ? { offset: existingSize } : undefined);
    const { metadata } = response;

    try {
      validateRevision(revision, metadata);
    } catch (error) {
      fs.unlinkSync(partPath);
      throw withMetadata(error, metadata);
    }

    const progressTracker = createProgressTracker(
      existingSize,
      metadataSize(metadata),
      existingSize,
      this.onProgress
    );

    try {
      await pipeline(
        response.body,
        progressTransform(runtime, progressTracker),
        fs.createWriteStream(partPath, { flags: existingSize > 0 ? 'a' : 'w' })
      );
    } catch (error) {
      throw withMetadata(error, metadata);
    }

    try {
      await validatePartFile(runtime, partPath, metadata);
      fs.renameSync(partPath, destination);
    } catch (error) {
      fs.unlinkSync(partPath);
      throw withMetadata(error, metadata);
    }

    return { metadata, size: existingSize };
  }

  async downloadFileWithRetry(path, destination, partPath, revision) {
    const runtime = await getNodeRuntime();
    const { fs } = runtime;
    const metadata = await this.getMetadata(path);

    try {
      validateRevision(revision, metadata);
    } catch (error) {
      fs.unlinkSync(partPath);
      throw withMetadata(error, metadata);
    }

    const totalSize = metadataSize(metadata);
    const progressTracker = createProgressTracker(0, totalSize, 0, this.onProgress);

    fs.writeFileSync(partPath, Buffer.alloc(0));
    fs.truncateSync(partPath, totalSize);

    if (totalSize > 0) {
      const fileHandle = fs.openSync(partPath, 'r+');
      try {
        const ranges = splitRanges(0, totalSize, this.maxRetries);
        const controller = new AbortController();
        const signal = this.signal
          ? AbortSignal.any([this.signal, controller.signal])
          : controller.signal;
        let firstError;

        const tasks = ranges.map(async (range) => {
          try {
            const response = await this.download(path, range, signal);
            validateRevision(metadata.rev, response.metadata);
            await writeRangeBody(runtime, response.body, progressTracker, fileHandle, range);
          } catch (error) {
            if (!firstError) {
              firstError = error;
              controller.abort(error);
            }
            throw error;
          }
        });

        await Promise.allSettled(tasks);
        if (firstError) {
          throw firstError;
        }
      } catch (error) {
        fs.closeSync(fileHandle);
        fs.unlinkSync(partPath);
        throw withMetadata(error, metadata);
      }
      fs.closeSync(fileHandle);
    }

    try {
      await validatePartFile(runtime, partPath, metadata);
      fs.renameSync(partPath, destination);
    } catch (error) {
      fs.unlinkSync(partPath);
      throw withMetadata(error, metadata);
    }

    return { metadata, size: 0 };
  }

  async downloadFileWithRetryLoop(path, destination) {
    const runtime = await getNodeRuntime();
    const partPath = destination + '.part';
    let lastError;
    let resumeOffset = '';

    try {
      for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
        try {
          return await this.downloadFile(path, destination, resumeOffset);
        } catch (error) {
          if (!resumeOffset && error.metadata && error.metadata.rev) {
            resumeOffset = error.metadata.rev;
          }
          if (this.signal && this.signal.aborted) {
            throw this.signal.reason || error;
          }
          if (!isRetryableError(error)) {
            throw error;
          }
          lastError = error;
          if (attempt < this.maxAttempts - 1) {
            await this.delay(this.retryDelay * Math.pow(2, attempt), this.signal);
          }
        }
      }
      throw lastError;
    } catch (error) {
      try {
        fs.unlinkSync(partPath);
      } catch (unlinkError) {
        if (error && typeof error === 'object') {
          error.unlinkError = unlinkError;
        }
      }
      throw error;
    }
  }
}

async function validatePartFile(runtime, filePath, metadata) {
  if (!metadata) {
    return;
  }
  const { fs } = runtime;
  const stats = fs.statSync(filePath);
  if (stats.size !== metadata.size) {
    throw new Error(
      'Part file size does not match metadata size: ' + stats.size + ' vs ' + metadata.size
    );
  }
  if (!metadata.content_hash) {
    return;
  }
  const hash = await computeContentHashFromFile(runtime, filePath);
  if (hash !== metadata.content_hash) {
    throw new Error(
      'Content hash mismatch: expected ' + hash + ' but got ' + metadata.content_hash + '"'
    );
  }
}

function downloadFile(client, path, destination, options = {}) {
  return new DropboxFileDownloader(client, options).downloadFileWithRetryLoop(path, destination);
}

module.exports = {
  DropboxFileDownloader,
  downloadFile
};
