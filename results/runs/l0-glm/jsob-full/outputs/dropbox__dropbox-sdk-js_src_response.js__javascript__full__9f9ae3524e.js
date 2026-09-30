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
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var response_exports = {};
__export(response_exports, {
  DropboxResponse: () => DropboxResponse,
  parseDownloadResponse: () => parseDownloadResponse,
  parseResponse: () => parseResponse
});
module.exports = __toCommonJS(response_exports);

var RPC = "rpc";
var UPLOAD = "upload";
var DOWNLOAD = "download";
var APP_AUTH = "app";
var USER_AUTH = "user";
var TEAM_AUTH = "team";
var NO_AUTH = "noauth";
var COOKIE = "cookie";
var DEFAULT_API_DOMAIN = "dropboxapi.com";
var DEFAULT_DOMAIN = "www.dropbox.com";

var TEST_DOMAIN_MAPPINGS = {
  api: "api",
  content: "content",
  notify: "notify"
};

function getSafeUnicode(code) {
  const unicode = ("0000" + code.charCodeAt(0).toString(16)).slice(-4);
  return "\\u" + unicode;
}

var baseApiUrl = (host = DEFAULT_API_DOMAIN, domain = ".", subdomain = "api") => {
  if (!subdomain) {
    return "https://" + domain + ".dropboxapi.com";
  }
  if (domain !== DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[subdomain] !== void 0) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    domain = "-";
  }
  return "https://" + subdomain + domain + host;
};

var OAuth2AuthorizationUrl = (domain = DEFAULT_DOMAIN) => {
  if (domain !== DEFAULT_DOMAIN) {
    domain = "www-" + domain;
  }
  return "https://" + domain + "/oauth2/authorize";
};

var OAuth2TokenUrl = (host = DEFAULT_API_DOMAIN, domain = ".") => {
  let subdomain = "api";
  if (host !== DEFAULT_API_DOMAIN) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    domain = "-";
  }
  return "https://" + subdomain + domain + host + "/oauth2/token";
};

function httpHeaderSafeJson(args) {
  return JSON.stringify(args).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}

function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1000);
}

function isWindowOrWorker() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope ||
    typeof module !== "undefined" || typeof window !== "undefined";
}

function isBrowserEnv() {
  return typeof window !== "undefined";
}

function isWorkerEnv() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}

function createBrowserSafeString(str) {
  const result = str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return result;
}

var DropboxResponseError = class extends Error {
  constructor(status, headers, text) {
    super("Dropbox API Error " + status + " - " + text);
    this.status = status;
    this.headers = headers;
    this.error = text;
  }
};

var DropboxResponse = class {
  constructor(status, headers, result) {
    this.status = status;
    this.headers = headers;
    this.result = result;
  }
};

function throwAsError(res) {
  return res.text().then(text => {
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      result = text;
    }
    throw new DropboxResponseError(res.status, res.headers, result);
  });
}

function parseResponse(res) {
  if (!res.ok) {
    return throwAsError(res);
  }
  return res.text().then(data => {
    let result;
    try {
      result = JSON.parse(data);
    } catch (e) {
      result = data;
    }
    return new DropboxResponse(res.status, res.headers, result);
  });
}

function parseDownloadResponse(res) {
  if (!res.ok) {
    return throwAsError(res);
  }
  const downloadStream = isWindowOrWorker() ? res.blob() : res.buffer().then(buffer => Buffer.concat(buffer));
  return downloadStream.then(data => {
    const result = JSON.parse(res.headers.get("dropbox-api-result"));
    if (isWindowOrWorker()) {
      result.fileBlob = data;
    } else {
      result.fileBinary = data;
    }
    return new DropboxResponse(res.status, res.headers, result);
  });
}
