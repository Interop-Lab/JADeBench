"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

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
  return response.text().then((responseText) => {
    let error;
    try {
      error = JSON.parse(responseText);
    } catch {
      error = responseText;
    }

    throw new DropboxResponseError(response.status, response.headers, error);
  });
}

function parseResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  return response.text().then((responseText) => {
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }

    return new DropboxResponse(response.status, response.headers, result);
  });
}

function isWindowOrWorker() {
  const isWorker =
    typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
  const isWindow = typeof module === "undefined" || typeof window !== "undefined";
  return isWorker || isWindow;
}

function parseDownloadResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  const download = isWindowOrWorker()
    ? response.blob()
    : response.arrayBuffer().then((data) => Buffer.from(data));

  return download.then((data) => {
    const result = JSON.parse(response.headers.get("dropbox-api-result"));

    if (isWindowOrWorker()) {
      result.fileBlob = data;
    } else {
      result.fileBinary = data;
    }

    return new DropboxResponse(response.status, response.headers, result);
  });
}

Object.defineProperties(exports, {
  DropboxResponse: { enumerable: true, get: () => DropboxResponse },
  parseDownloadResponse: { enumerable: true, get: () => parseDownloadResponse },
  parseResponse: { enumerable: true, get: () => parseResponse },
});
