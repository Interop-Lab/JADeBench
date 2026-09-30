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

function isWindowOrWorker() {
  const isWorker =
    typeof WorkerGlobalScope !== "undefined" &&
    self instanceof WorkerGlobalScope;
  const isWindow =
    typeof module === "undefined" || typeof window !== "undefined";

  return isWorker || isWindow;
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

function parseDownloadResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  const data = isWindowOrWorker()
    ? response.blob()
    : response.arrayBuffer().then((buffer) => Buffer.from(buffer));

  return data.then((fileData) => {
    const result = JSON.parse(response.headers.get("dropbox-api-result"));

    if (isWindowOrWorker()) {
      result.fileBlob = fileData;
    } else {
      result.fileBinary = fileData;
    }

    return new DropboxResponse(response.status, response.headers, result);
  });
}
