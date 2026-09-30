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
var DEFAULT_DOMAIN = "dropbox.com";
var TEST_DOMAIN_MAPPINGS = {
  api: "api-content",
  notify: "api-notify",
  content: "api-content"
};

function getSafeUnicode(data) {
  return data.replace(/[^\x20-\x7E]/g, (c) => {
    return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

function baseApiUrl(domain, host, subdomain) {
  if (host === void 0) {
    host = DEFAULT_DOMAIN;
  }
  if (subdomain === void 0) {
    subdomain = "";
  }
  if (domain === void 0) {
    domain = DEFAULT_API_DOMAIN;
  }
  if (subdomain) {
    subdomain = subdomain + ".";
  }
  return "https://" + subdomain + domain;
}

function OAuth2AuthorizationUrl(domain) {
  if (domain === void 0) {
    domain = DEFAULT_DOMAIN;
  }
  return baseApiUrl(void 0, domain) + "/oauth2/authorize";
}

function OAuth2TokenUrl(domain, subdomain) {
  if (domain === void 0) {
    domain = DEFAULT_API_DOMAIN;
  }
  if (subdomain === void 0) {
    subdomain = "";
  }
  return baseApiUrl(domain, void 0, subdomain) + "/oauth2/token";
}

function httpHeaderSafeJson(data) {
  return getSafeUnicode(JSON.stringify(data));
}

function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1000);
}

function isWindowOrWorker() {
  return typeof window !== "undefined" || typeof WorkerGlobalScope !== "undefined";
}

function isBrowserEnv() {
  return typeof window !== "undefined";
}

function isWorkerEnv() {
  return typeof WorkerGlobalScope !== "undefined";
}

function createBrowserSafeString(data) {
  if (typeof data === "string") {
    return data;
  }
  return httpHeaderSafeJson(data);
}

class DropboxResponseError extends Error {
  constructor(status, headers, error) {
    super("Response failed with a " + status + " code");
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

function throwAsError(res) {
  if (!res.ok) {
    throw new DropboxResponseError(res.status, res.headers, res.result);
  }
  return res;
}

function parseResponse(res) {
  if (!res.ok) {
    return res.text().then((txt) => {
      let result;
      try {
        result = JSON.parse(txt);
      } catch (e) {
        result = txt;
      }
      throw new DropboxResponseError(res.status, res.headers, result);
    });
  }
  return res.json().then((result) => {
    return new DropboxResponse(res.status, res.headers, result);
  });
}

function parseDownloadResponse(res) {
  if (!res.ok) {
    return res.text().then((txt) => {
      let result;
      try {
        result = JSON.parse(txt);
      } catch (e) {
        result = txt;
      }
      throw new DropboxResponseError(res.status, res.headers, result);
    });
  }
  return res.blob().then((result) => {
    return new DropboxResponse(res.status, res.headers, result);
  });
}

0 && (module.exports = {
  DropboxResponse,
  parseDownloadResponse,
  parseResponse
});
