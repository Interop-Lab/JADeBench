"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 500;
const RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);

function sleep(milliseconds, signal) {
  if (!milliseconds) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      reject(signal.reason || new Error("The operation was aborted"));
      return;
    }

    const timer = setTimeout(resolve, milliseconds);

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(signal.reason || new Error("The operation was aborted"));
        },
        { once: true }
      );
    }
  });
}

function errorStatus(error) {
  return (
    error &&
    (error.status ||
      error.statusCode ||
      (error.response && error.response.status) ||
      (error.error && error.error.status))
  );
}

function isRetryableError(error) {
  const status = errorStatus(error);
  return (
    RETRYABLE_5XX_STATUSES.has(status) ||
    (error &&
      (error.code === "ECONNRESET" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ETIMEDOUT" ||
        error.code === "EPIPE"))
  );
}

function requestArgument(path, options) {
  const argument = Object.assign({}, options && options.request);

  if (path !== undefined) argument.path = path;
  if (options && options.rev !== undefined) argument.rev = options.rev;

  return argument;
}

function responseResult(response) {
  return response && Object.prototype.hasOwnProperty.call(response, "result")
    ? response.result
    : response;
}

function responseBody(response) {
  const result = responseResult(response);

  if (result && result.fileBinary !== undefined) return result.fileBinary;
  if (result && result.fileBlob !== undefined) return result.fileBlob;
  if (response && response.body !== undefined) return response.body;
  if (response && response.data !== undefined) return response.data;

  return result;
}

function responseMetadata(response) {
  const result = responseResult(response);

  if (!result || typeof result !== "object") return undefined;
  if (result.metadata !== undefined) return result.metadata;

  if (result.fileBinary !== undefined || result.fileBlob !== undefined) {
    const metadata = {};
    for (const key of Object.keys(result)) {
      if (key !== "fileBinary" && key !== "fileBlob") {
        metadata[key] = result[key];
      }
    }
    return metadata;
  }

  return result;
}

async function writeBody(destination, body) {
  if (destination == null) return body;

  if (typeof destination === "string") {
    const fs = require("fs");
    const data =
      body instanceof ArrayBuffer
        ? Buffer.from(body)
        : ArrayBuffer.isView(body)
          ? Buffer.from(body.buffer, body.byteOffset, body.byteLength)
          : body;

    await fs.promises.writeFile(destination, data);
    return destination;
  }

  if (destination && typeof destination.writeFile === "function") {
    await destination.writeFile(body);
    return destination;
  }

  if (destination && typeof destination.write === "function") {
    await new Promise((resolve, reject) => {
      let settled = false;

      const done = error => {
        if (settled) return;
        settled = true;
        if (error) reject(error);
        else resolve();
      };

      try {
        const accepted = destination.write(body, done);
        if (accepted !== false && destination.write.length < 2) done();
        else if (accepted === false && typeof destination.once === "function") {
          destination.once("drain", () => done());
        }
      } catch (error) {
        done(error);
      }
    });

    return destination;
  }

  throw new TypeError("Invalid download destination");
}

class DropboxFileDownloader {
  constructor(client) {
    if (!client) {
      throw new TypeError("A Dropbox client is required");
    }

    this.client = client;
  }

  async rawDownload(path, options = {}) {
    if (typeof this.client.filesDownload === "function") {
      return this.client.filesDownload(requestArgument(path, options));
    }

    if (typeof this.client.download === "function") {
      return this.client.download(path, options);
    }

    if (typeof this.client.rawDownload === "function") {
      return this.client.rawDownload(path, options);
    }

    throw new TypeError("The Dropbox client does not provide a download method");
  }

  async fetchMetadata(path) {
    if (typeof this.client.filesGetMetadata === "function") {
      return this.client.filesGetMetadata({ path });
    }

    if (typeof this.client.getMetadata === "function") {
      return this.client.getMetadata(path);
    }

    return undefined;
  }

  async downloadFileAttempt(path, destination, options = {}) {
    const response = await this.rawDownload(path, options);
    const body = responseBody(response);

    if (destination != null) {
      await writeBody(destination, body);
    }

    if (typeof options.onProgress === "function") {
      let size;

      if (body != null) {
        if (typeof body.size === "number") size = body.size;
        else if (typeof body.byteLength === "number") size = body.byteLength;
        else if (typeof body.length === "number") size = body.length;
      }

      if (size !== undefined) {
        options.onProgress(size, size);
      }
    }

    return destination == null ? response : responseMetadata(response);
  }

  async downloadFileParallel(path, destination, metadata, options = {}) {
    return this.downloadFileAttempt(path, destination, options);
  }

  async downloadFile(path, options = {}) {
    const destination =
      options.destination !== undefined
        ? options.destination
        : options.output !== undefined
          ? options.output
          : options.file;

    const maxAttempts =
      options.maxAttempts === undefined
        ? DEFAULT_MAX_ATTEMPTS
        : options.maxAttempts;

    const retryDelay =
      options.retryDelay === undefined
        ? DEFAULT_RETRY_DELAY
        : options.retryDelay;

    if (!Number.isInteger(maxAttempts) || maxAttempts <= 0) {
      throw new TypeError("maxAttempts must be a positive integer");
    }

    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (options.signal && options.signal.aborted) {
        throw options.signal.reason || new Error("The operation was aborted");
      }

      try {
        return await this.downloadFileAttempt(path, destination, options);
      } catch (error) {
        lastError = error;

        if (attempt + 1 >= maxAttempts || !isRetryableError(error)) {
          throw error;
        }

        const delay =
          typeof retryDelay === "function"
            ? retryDelay(attempt + 1, error)
            : retryDelay * Math.pow(2, attempt);

        await sleep(delay, options.signal);
      }
    }

    throw lastError;
  }
}

async function downloadFile(client, path, options) {
  return new DropboxFileDownloader(client).downloadFile(path, options);
}

Object.defineProperty(exports, "DropboxFileDownloader", {
  enumerable: true,
  get: () => DropboxFileDownloader
});

Object.defineProperty(exports, "downloadFile", {
  enumerable: true,
  get: () => downloadFile
});
