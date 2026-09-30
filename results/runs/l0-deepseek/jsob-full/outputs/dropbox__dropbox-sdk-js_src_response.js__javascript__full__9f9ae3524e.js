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
  'api': 'api',
  'content': 'content',
  'www': 'www.dropbox.com'
};

function getSafeUnicode(character) {
  const unicodeValue = ('000' + character.charCodeAt(0).toString(16)).slice(-4);
  return '\\u' + unicodeValue;
}

function baseApiUrl(subdomain, domain = DEFAULT_API_DOMOMAIN, delimiter = '.') {
  if (!delimiter) {
    return 'https://' + domain + '/2';
  }
  if (domain === DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[subdomain] !== undefined) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    delimiter = '-';
  }
  return 'https://' + subdomain + delimiter + domain + '/2';
}

function OAuth2AuthorizationUrl(domain = DEFAULT_DOMAIN) {
  if (domain !== DEFAULT_DOMAIN) {
    domain = 'https://' + domain;
  }
  return domain + '/oauth2/authorize';
}

function OAuth2TokenUrl(domain = DEFAULT_API_DOMAIN, delimiter = '.') {
  let subdomain = 'api';
  if (domain !== DEFAULT_API_DOMAIN) {
    subdomain = TEST_DOMAIN_MAPPINGS[subdomain];
    delimiter = '-';
  }
  return 'https://' + subdomain + delimiter + domain + '/oauth2/token';
}

function httpHeaderSafeJson(value) {
  return JSON.stringify(value).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}

function getTokenExpiresAtDate(expiresIn) {
  return new Date(Date.now() + expiresIn * 1000);
}

function isWindowOrWorker() {
  return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ||
    (typeof module !== 'undefined' || typeof window !== 'undefined');
}

function isBrowserEnv() {
  return typeof window !== 'undefined';
}

function isWorkerEnv() {
  return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
}

function createBrowserSafeString(value) {
  return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

class DropboxResponseError extends Error {
  constructor(status, headers, body) {
    super('Response failed with status ' + status);
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
}

class DropboxResponse {
  constructor(status, headers, body) {
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
}

function throwAsError(response) {
  return response.text().then(text => {
    let body;
    try {
      body = JSON.parse(text);
    } catch (error) {
      body = text;
    }
    throw new DropboxResponseError(response.status, response.headers, body);
  });
}

function parseResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }
  return response.text().then(text => {
    let body;
    try {
      body = JSON.parse(text);
    } catch (error) {
      body = text;
    }
    return new DropboxResponse(response.status, response.headers, body);
  });
}

function parseDownloadResponse(response) {
  if (!response.ok) {
    return throwAsError(response);
  }
  const result = isWindowOrWorker ? response.blob() : response.buffer().then(buffer => Buffer.from(buffer));
  return result.then(data => {
    const metadata = JSON.parse(response.headers.get('dropbox-api-result'));
    if (isWindowOrWorker) {
      metadata.fileBlob = data;
    } else {
      metadata.fileBinary = data;
    }
    return new DropboxResponse(response.status, response.headers, metadata);
  });
}

module.exports = {
  DropboxResponse,
  parseDownloadResponse,
  parseResponse
};
