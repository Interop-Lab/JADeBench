const responseExports = {};

Object.defineProperty(responseExports, "__esModule", { value: true });
Object.defineProperties(responseExports, {
  DropboxResponse: {
    get: () => DropboxResponse,
    enumerable: true,
  },
  parseDownloadResponse: {
    get: () => parseDownloadResponse,
    enumerable: true,
  },
  parseResponse: {
    get: () => parseResponse,
    enumerable: true,
  },
});

module.exports = responseExports;

function isWindowOrWorker() {
  return (
    (typeof WorkerGlobalScope !== "undefined" &&
      self instanceof WorkerGlobalScope) ||
    typeof module === "undefined" ||
    typeof window !== "undefined"
  );
}

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

function parseDownloadResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  const filePromise = isWindowOrWorker()
    ? response.blob()
    : response.arrayBuffer().then((data) => Buffer.from(data));

  return filePromise.then((file) => {
    const result = JSON.parse(response.headers.get("dropbox-api-result"));

    if (isWindowOrWorker()) {
      result.fileBlob = file;
    } else {
      result.fileBinary = file;
    }

    return new DropboxResponse(response.status, response.headers, result);
  });
}
