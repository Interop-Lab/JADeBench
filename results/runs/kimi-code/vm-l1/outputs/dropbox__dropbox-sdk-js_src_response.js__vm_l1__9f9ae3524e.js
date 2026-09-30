"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "DropboxResponse", {
  enumerable: true,
  get: () => DropboxResponse,
});
Object.defineProperty(exports, "parseDownloadResponse", {
  enumerable: true,
  get: () => parseDownloadResponse,
});
Object.defineProperty(exports, "parseResponse", {
  enumerable: true,
  get: () => parseResponse,
});

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

function throwAsError(response) {
  return response.text().then((text) => {
    let error;

    try {
      error = JSON.parse(text);
    } catch {
      error = text;
    }

    throw new DropboxResponseError(response.status, response.headers, error);
  });
}

function parseResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  return response.text().then(
    (text) => new DropboxResponse(response.status, response.headers, JSON.parse(text)),
  );
}

function isWindowOrWorker() {
  return (
    typeof window !== "undefined" ||
    (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope)
  );
}

function parseDownloadResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  const result = JSON.parse(response.headers.get("dropbox-api-result"));

  if (isWindowOrWorker()) {
    return response.blob().then((fileBlob) => {
      result.fileBlob = fileBlob;
      return new DropboxResponse(response.status, response.headers, result);
    });
  }

  return response.buffer().then((fileBinary) => {
    result.fileBinary = fileBinary;
    return new DropboxResponse(response.status, response.headers, result);
  });
}
