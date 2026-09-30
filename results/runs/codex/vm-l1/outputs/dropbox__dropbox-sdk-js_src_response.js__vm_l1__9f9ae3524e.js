var defineProperty = Object.defineProperty;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var hasOwnProperty = Object.prototype.hasOwnProperty;

var exportProperties = (target, properties) => {
  for (const name in properties) {
    defineProperty(target, name, {
      get: properties[name],
      enumerable: true,
    });
  }
};

var copyProperties = (target, source, excludedProperty, descriptor) => {
  if (
    source &&
    (typeof source === "object" || typeof source === "function")
  ) {
    for (const name of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, name) && name !== excludedProperty) {
        defineProperty(target, name, {
          get: () => source[name],
          enumerable:
            !(descriptor = getOwnPropertyDescriptor(source, name)) ||
            descriptor.enumerable,
        });
      }
    }
  }

  return target;
};

var toCommonJS = (moduleExports) =>
  copyProperties(
    defineProperty({}, "__esModule", { value: true }),
    moduleExports,
  );

var responseExports = {};
exportProperties(responseExports, {
  DropboxResponse: () => DropboxResponse,
  parseDownloadResponse: () => parseDownloadResponse,
  parseResponse: () => parseResponse,
});

module.exports = toCommonJS(responseExports);

function isWindowOrWorker() {
  return (
    (typeof WorkerGlobalScope !== "undefined" &&
      self instanceof WorkerGlobalScope) ||
    (typeof module === "undefined" && typeof window !== "undefined")
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
  return response.text().then((body) => {
    let error;

    try {
      error = JSON.parse(body);
    } catch {
      error = body;
    }

    throw new DropboxResponseError(
      response.status,
      response.headers,
      error,
    );
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

function parseDownloadResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }

  let bodyPromise;
  if (isWindowOrWorker()) {
    bodyPromise = response.blob();
  } else {
    bodyPromise = response.arrayBuffer().then((body) => Buffer.from(body));
  }

  return bodyPromise.then((body) => {
    const result = JSON.parse(response.headers.get("dropbox-api-result"));

    if (isWindowOrWorker()) {
      result.fileBlob = body;
    } else {
      result.fileBinary = body;
    }

    return new DropboxResponse(response.status, response.headers, result);
  });
}
