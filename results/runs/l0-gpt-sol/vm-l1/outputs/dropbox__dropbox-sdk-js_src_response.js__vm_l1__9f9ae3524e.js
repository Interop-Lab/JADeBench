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

function throwAsError(response) {
  return response.text().then((text) => {
    let error;
    try {
      error = JSON.parse(text);
    } catch {
      error = text;
    }

    throw new DropboxResponseError(
      response.status,
      response.headers,
      error
    );
  });
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

    return new DropboxResponse(
      response.status,
      response.headers,
      result
    );
  });
}

function isWindowOrWorker() {
  return (
    (typeof WorkerGlobalScope !== "undefined" &&
      self instanceof WorkerGlobalScope) ||
    typeof window !== "undefined"
  );
}

function parseDownloadResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  const result = JSON.parse(response.headers.get("dropbox-api-result"));

  if (isWindowOrWorker()) {
    return response.blob().then((data) => {
      result.fileBlob = data;
      return new DropboxResponse(
        response.status,
        response.headers,
        result
      );
    });
  }

  return response.buffer().then((data) => {
    result.fileBinary = data;
    return new DropboxResponse(
      response.status,
      response.headers,
      result
    );
  });
}

const exportsObject = {};
Object.defineProperty(exportsObject, "__esModule", { value: true });
Object.defineProperties(exportsObject, {
  DropboxResponse: {
    enumerable: true,
    get: () => DropboxResponse
  },
  parseDownloadResponse: {
    enumerable: true,
    get: () => parseDownloadResponse
  },
  parseResponse: {
    enumerable: true,
    get: () => parseResponse
  }
});

module.exports = exportsObject;
