var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/dropbox__dropbox-sdk-js/src/response.js
var response_exports = {};
__export(response_exports, {
  DropboxResponse: () => DropboxResponse,
  parseDownloadResponse: () => parseDownloadResponse,
  parseResponse: () => parseResponse
});
module.exports = __toCommonJS(response_exports);

// ../work/dropbox__dropbox-sdk-js/src/constants.js
var RPC = "rpc";
var UPLOAD = "upload";
var DOWNLOAD = "download";
var APP_AUTH = "app";
var USER_AUTH = "user";
var TEAM_AUTH = "team";
var NO_AUTH = "noauth";
var COOKIE = "cookie";
var DEFAULT_API_DOMAIN = "dropboxapi.com";
var DEFAULT_DOMAIN = "dropbox.com";
var TEST_DOMAIN_MAPPINGS = {
  api: "api",
  notify: "bolt",
  content: "api-content"
};

// ../work/dropbox__dropbox-sdk-js/src/utils.js
function getSafeUnicode(c) {
  const unicode = `000${c.charCodeAt(0).toString(16)}`.slice(-4);
  return `\\u${unicode}`;
}
var baseApiUrl = (subdomain, domain = DEFAULT_API_DOMAIN, domainDelimiter = ".") => {
  if (!domainDelimiter) {
    return `https://${domain}/2/`;
  }
  if (domain !== DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[subdomain] !== void 0) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    domainDelimiter = "-";
  }
  return `https://${subdomain}${domainDelimiter}${domain}/2/`;
};
var OAuth2AuthorizationUrl = (domain = DEFAULT_DOMAIN) => {
  if (domain !== DEFAULT_DOMAIN) {
    domain = `meta-${domain}`;
  }
  return `https://${domain}/oauth2/authorize`;
};
var OAuth2TokenUrl = (domain = DEFAULT_API_DOMAIN, domainDelimiter = ".") => {
  let subdomain = "api";
  if (domain !== DEFAULT_API_DOMAIN) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    domainDelimiter = "-";
  }
  return `https://${subdomain}${domainDelimiter}${domain}/oauth2/token`;
};
function httpHeaderSafeJson(args) {
  return JSON.stringify(args).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}
function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1e3);
}
function isWindowOrWorker() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope || (typeof module === "undefined" || typeof window !== "undefined");
}
function isBrowserEnv() {
  return typeof window !== "undefined";
}
function isWorkerEnv() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}
function createBrowserSafeString(toBeConverted) {
  const convertedString = toBeConverted.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return convertedString;
}

// ../work/dropbox__dropbox-sdk-js/src/error.js
var DropboxResponseError = class extends Error {
  constructor(status, headers, error) {
    super(`Response failed with a ${status} code`);
    this.name = "DropboxResponseError";
    this.status = status;
    this.headers = headers;
    this.error = error;
  }
};

// ../work/dropbox__dropbox-sdk-js/src/response.js
var DropboxResponse = class {
  constructor(status, headers, result) {
    this.status = status;
    this.headers = headers;
    this.result = result;
  }
};
function throwAsError(res) {
  return res.text().then((data) => {
    let errorObject;
    try {
      errorObject = JSON.parse(data);
    } catch (error) {
      errorObject = data;
    }
    throw new DropboxResponseError(res.status, res.headers, errorObject);
  });
}
function parseResponse(res) {
  if (!res.ok) {
    return throwAsError(res);
  }
  return res.text().then((data) => {
    let responseObject;
    try {
      responseObject = JSON.parse(data);
    } catch (error) {
      responseObject = data;
    }
    return new DropboxResponse(res.status, res.headers, responseObject);
  });
}
function parseDownloadResponse(res) {
  if (!res.ok) {
    return throwAsError(res);
  }
  const dataPromise = isWindowOrWorker() ? res.blob() : res.arrayBuffer().then((data) => Buffer.from(data));
  return dataPromise.then((data) => {
    const result = JSON.parse(res.headers.get("dropbox-api-result"));
    if (isWindowOrWorker()) {
      result.fileBlob = data;
    } else {
      result.fileBinary = data;
    }
    return new DropboxResponse(res.status, res.headers, result);
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DropboxResponse,
  parseDownloadResponse,
  parseResponse
});
