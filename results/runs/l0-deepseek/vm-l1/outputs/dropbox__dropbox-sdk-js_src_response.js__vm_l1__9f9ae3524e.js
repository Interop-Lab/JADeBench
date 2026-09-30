const DropboxResponseError = class extends Error {
  constructor(status, statusText, headers) {
    super(`Response failed with a ${status} code`);
    this.status = status;
    this.statusText = statusText;
    this.headers = headers;
  }
};

class DropboxResponse {
  constructor(status, headers, result) {
    this.status = status;
    this.headers = headers;
    this.result = result;
  }
}

function getSafeUnicode(c) {
  const charCode = c.charCodeAt(0);
  if (charCode > 0x7f && charCode <= 0xffff) {
    return String.fromCharCode(charCode);
  }
  return c;
}

function httpHeaderSafeJson(args) {
  return JSON.stringify(args).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}

function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1000);
}

function isWindowOrWorker() {
  return typeof window !== 'undefined' && typeof window.WorkerGlobalScope !== 'undefined';
}

function isBrowserEnv() {
  return typeof window !== 'undefined';
}

function isWorkerEnv() {
  return typeof WorkerGlobalScope !== 'undefined' && typeof importScripts === 'function';
}

function createBrowserSafeString(str) {
  return str.replace(/[^\w\s\-]/gi, '');
}

function throwAsError(response) {
  if (response.status >= 400) {
    throw new DropboxResponseError(response.status, response.statusText, response.headers);
  }
  return response;
}

function parseResponse(response) {
  if (response.status >= 400) {
    throw new DropboxResponseError(response.status, response.statusText, response.headers);
  }
  return response.result;
}

function parseDownloadResponse(response) {
  if (response.status >= 400) {
    throw new DropboxResponseError(response.status, response.statusText, response.headers);
  }
  return response.result;
}

const RPC = 'rpc';
const UPLOAD = 'upload';
const DOWNLOAD = 'download';
const APP_AUTH = 'app';
const USER_AUTH = 'user';
const TEAM_AUTH = 'team';
const NO_AUTH = 'noauth';
const COOKIE = 'cookie';

const DEFAULT_API_DOMAIN = 'dropboxapi.com';
const DEFAULT_DOMAIN = 'dropbox.com';
const TEST_DOMAIN_MAPPINGS = {
  api: 'api',
  notify: 'bolt',
  content: 'api-content'
};

function baseApiUrl(subdomain, domain, version) {
  if (domain === DEFAULT_DOMAIN) {
    return `https://${subdomain}.${domain}/${version}/`;
  }
  return `https://${domain}/${version}/`;
}

function OAuth2AuthorizationUrl(domain) {
  return `https://${domain}/oauth2/authorize`;
}

function OAuth2TokenUrl(domain, subdomain) {
  return `https://${subdomain}.${domain}/oauth2/token`;
}

module.exports = {
  DropboxResponse,
  parseDownloadResponse,
  parseResponse
};
