'use strict';

class DropboxResponseError extends Error {
  constructor(status, headers, error) {
    super(`Response failed with a ${status} code`);
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
    let error;

    try {
      error = JSON.parse(body);
    } catch {
      error = body;
    }

    throw new DropboxResponseError(response.status, response.headers, error);
  });
}

function parseResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  return response.text().then((body) => {
    let result;

    try {
      result = JSON.parse(body);
    } catch {
      result = body;
    }

    return new DropboxResponse(response.status, response.headers, result);
  });
}

function isWindowOrWorker() {
  return (
    typeof window !== 'undefined' ||
    typeof WorkerGlobalScope !== 'undefined'
  );
}

function parseDownloadResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  const result = JSON.parse(response.headers.get('dropbox-api-result'));

  if (isWindowOrWorker()) {
    return response.blob().then((data) => {
      result.fileBlob = data;
      return new DropboxResponse(response.status, response.headers, result);
    });
  }

  return response.buffer().then((data) => {
    result.fileBinary = data;
    return new DropboxResponse(response.status, response.headers, result);
  });
}

module.exports = {
  DropboxResponse,
  parseDownloadResponse,
  parseResponse,
};
