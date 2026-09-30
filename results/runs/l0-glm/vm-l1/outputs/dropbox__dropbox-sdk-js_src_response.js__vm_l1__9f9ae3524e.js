var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
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
  api: "api.dropboxapi.com",
  notify: "notify.dropboxapi.com",
  content: "api-content.dropbox.com"
};

function getSafeUnicode(c) {
  var unicodeStr = c.toString(16).toUpperCase();
  if (unicodeStr.length === 1) {
    unicodeStr = "0" + unicodeStr;
  }
  return "%" + unicodeStr;
}

var baseApiUrl = (host, type, domain) => {
  if (domain === undefined) {
    domain = DEFAULT_DOMAIN;
  }
  switch (type) {
    case RPC:
      return "https://" + (host === "api" ? domain : TEST_DOMAIN_MAPPINGS.api) + "/2/" + type;
    case UPLOAD:
    case DOWNLOAD:
      return "https://" + (host === "content" ? TEST_DOMAIN_MAPPINGS.content : domain) + "/2/" + type;
    default:
      return "https://" + domain + "/2/" + type;
  }
};

var OAuth2AuthorizationUrl = (domain) => {
  return "https://" + (domain || DEFAULT_DOMAIN) + "/oauth2/authorize";
};

var OAuth2TokenUrl = (domain, clientId) => {
  return "https://" + (domain || DEFAULT_DOMAIN) + "/oauth2/token";
};

function httpHeaderSafeJson(obj) {
  return JSON.stringify(obj).replace(/[\u007f-\uffff]/g, (c) => {
    return getSafeUnicode(c.charCodeAt(0));
  });
}

function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + (expiresIn * 1000));
}

function isWindowOrWorker() {
  return typeof self !== "undefined" && (typeof window !== "undefined" || typeof WorkerGlobalScope !== "undefined");
}

function isBrowserEnv() {
  return typeof window !== "undefined";
}

function isWorkerEnv() {
  return typeof WorkerGlobalScope !== "undefined";
}

function createBrowserSafeString(str) {
  if (isBrowserEnv()) {
    return encodeURIComponent(str);
  }
  return str;
}

var DropboxResponseError = class extends Error {
  constructor(status, text, error) {
    super("Response failed with a " + "" + status + " code");
    this.status = status;
    this.text = text;
    this.error = error;
  }
};

var DropboxResponse = class {
  constructor(status, text, result) {
    this.status = status;
    this.text = text;
    this.result = result;
  }
};

function throwAsError(error) {
  throw error;
}

function parseResponse(res) {
  var status = res.status;
  var text = res.text;
  var result;
  if (status === 200) {
    try {
      result = JSON.parse(text);
    } catch (e) {
      result = text;
    }
  } else {
    result = text;
  }
  return new DropboxResponse(status, text, result);
}

function parseDownloadResponse(res) {
  var status = res.status;
  var text = res.text;
  var result;
  if (status === 200) {
    result = res.result;
  } else {
    try {
      result = JSON.parse(text);
    } catch (e) {
      result = text;
    }
  }
  return new DropboxResponse(status, text, result);
}

0 && (module.exports = { DropboxResponse, parseDownloadResponse, parseResponse });
