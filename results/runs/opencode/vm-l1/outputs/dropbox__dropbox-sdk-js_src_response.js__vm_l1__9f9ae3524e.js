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
  return response.text().then((body) => {
    throw new DropboxResponseError(
      response.status,
      response.headers,
      JSON.parse(body),
    );
  });
}

function parseResponse(response) {
  if (!response.ok) return throwAsError(response);

  return response.text().then(
    (body) => new DropboxResponse(
      response.status,
      response.headers,
      JSON.parse(body),
    ),
  );
}

function isBrowserEnvironment() {
  return typeof window !== "undefined";
}

function parseDownloadResponse(response) {
  if (!response.ok) return throwAsError(response);

  const result = JSON.parse(response.headers.get("dropbox-api-result"));
  if (isBrowserEnvironment()) {
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

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperties(module.exports, {
  DropboxResponse: { enumerable: true, get: () => DropboxResponse },
  parseDownloadResponse: { enumerable: true, get: () => parseDownloadResponse },
  parseResponse: { enumerable: true, get: () => parseResponse },
});
