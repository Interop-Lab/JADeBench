"use strict";

class DropboxResponseError extends Error {
  constructor(status, headers, error) {
    super(`Response failed with a ${status} code`);
    this.name = "DropboxResponseError";
    this.status = status;
    this.headers = headers;
    this.error = error;
  }
}

class DropboxResponse {
  constructor(status, headers, result) {
    this.status = status;
    this.headers = headers;
    this.result = result;
  }
}

async function throwAsError(response) {
  const text = await response.text();
  let error;

  try {
    error = JSON.parse(text);
  } catch {
    error = text;
  }

  throw new DropboxResponseError(response.status, response.headers, error);
}

function parseResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  return response.text().then((text) => {
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = text;
    }

    return new DropboxResponse(response.status, response.headers, result);
  });
}

function isWindowOrWorker() {
  const isWorker =
    typeof WorkerGlobalScope !== "undefined" &&
    self instanceof WorkerGlobalScope;
  const isBrowser =
    typeof module === "undefined" || typeof window !== "undefined";

  return isWorker || isBrowser;
}

function parseDownloadResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  const body = isWindowOrWorker()
    ? response.blob()
    : response.arrayBuffer().then((buffer) => Buffer.from(buffer));

  return body.then((file) => {
    const result = JSON.parse(response.headers.get("dropbox-api-result"));

    if (isWindowOrWorker()) {
      result.fileBlob = file;
    } else {
      result.fileBinary = file;
    }

    return new DropboxResponse(response.status, response.headers, result);
  });
}

const exported = {};
Object.defineProperties(exported, {
  __esModule: { value: true },
  DropboxResponse: { enumerable: true, get: () => DropboxResponse },
  parseDownloadResponse: { enumerable: true, get: () => parseDownloadResponse },
  parseResponse: { enumerable: true, get: () => parseResponse },
});
module.exports = exported;
