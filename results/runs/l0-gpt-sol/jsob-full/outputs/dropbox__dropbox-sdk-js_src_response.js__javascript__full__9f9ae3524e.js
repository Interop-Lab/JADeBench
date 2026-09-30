class DropboxResponseError extends Error {
  constructor(status, headers, error) {
    super(`Dropbox response error: ${status}`);
    this.name = 'DropboxResponseError';
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
  return (
    (typeof WorkerGlobalScope !== 'undefined' &&
      self instanceof WorkerGlobalScope) ||
    typeof module === 'undefined' ||
    typeof window !== 'undefined'
  );
}

function parseDownloadResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  const body = isWindowOrWorker()
    ? response.blob()
    : response.arrayBuffer().then((buffer) => Buffer.from(buffer));

  return body.then((data) => {
    const result = JSON.parse(response.headers.get('Dropbox-API-Result'));
    if (isWindowOrWorker()) {
      result.fileBlob = data;
    } else {
      result.fileBinary = data;
    }
    return new DropboxResponse(response.status, response.headers, result);
  });
}

module.exports = {
  DropboxResponse,
  parseDownloadResponse,
  parseResponse,
};
