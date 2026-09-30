var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x3ca556, _0x540193) => {
  for (var _0x47519a in _0x540193) {
    __defProp(_0x3ca556, _0x47519a, {
      get: _0x540193[_0x47519a],
      enumerable: true
    });
  }
};
var __copyProps = (_0x4e5227, _0x281959, _0x49c61b, _0x125981) => {
  if (_0x281959 && typeof _0x281959 === "object" || typeof _0x281959 === "function") {
    for (let _0x442657 of __getOwnPropNames(_0x281959)) {
      if (!__hasOwnProp.call(_0x4e5227, _0x442657) && _0x442657 !== _0x49c61b) {
        __defProp(_0x4e5227, _0x442657, {
          get: () => _0x281959[_0x442657],
          enumerable: !(_0x125981 = __getOwnPropDesc(_0x281959, _0x442657)) || _0x125981.enumerable
        });
      }
    }
  }
  return _0x4e5227;
};
const _0x60f432 = {
  value: true
};
var __toCommonJS = _0x699bc3 => __copyProps(__defProp({}, "__esModule", _0x60f432), _0x699bc3);
var filedownload_exports = {};
const _0x5a1646 = {
  DropboxFileDownloader: () => DropboxFileDownloader,
  downloadFile: () => downloadFile
};
__export(filedownload_exports, _0x5a1646);
module.exports = __toCommonJS(filedownload_exports);
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
var DropboxResponseError = class extends Error {
  constructor(_0x414383, _0x593ba, _0x420444) {
    super("Response failed with a " + _0x414383 + " code");
    this.name = "DropboxResponseError";
    this.status = _0x414383;
    this.headers = _0x593ba;
    this.error = _0x420444;
  }
};
function getSafeUnicode(_0x31d6b2) {
  const _0x6b13a2 = ("000" + _0x31d6b2.charCodeAt(0).toString(16)).slice(-4);
  return "\\u" + _0x6b13a2;
}
var baseApiUrl = (_0x36ee89, _0x55fe2a = DEFAULT_API_DOMAIN, _0x117d06 = ".") => {
  if (!_0x117d06) {
    return "https://" + _0x55fe2a + "/2/";
  }
  if (_0x55fe2a !== DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[_0x36ee89] !== undefined) {
    _0x36ee89 = TEST_DOMAIN_MAPPINGS[_0x36ee89];
    _0x117d06 = "-";
  }
  return "https://" + _0x36ee89 + _0x117d06 + _0x55fe2a + "/2/";
};
var OAuth2AuthorizationUrl = (_0x3f8634 = DEFAULT_DOMAIN) => {
  if (_0x3f8634 !== DEFAULT_DOMAIN) {
    _0x3f8634 = "meta-" + _0x3f8634;
  }
  return "https://" + _0x3f8634 + "/oauth2/authorize";
};
var OAuth2TokenUrl = (_0x573d6b = DEFAULT_API_DOMAIN, _0x219a4e = ".") => {
  let _0x3f36db = "api";
  if (_0x573d6b !== DEFAULT_API_DOMAIN) {
    _0x3f36db = TEST_DOMAIN_MAPPINGS[_0x3f36db];
    _0x219a4e = "-";
  }
  return "https://" + _0x3f36db + _0x219a4e + _0x573d6b + "/oauth2/token";
};
function httpHeaderSafeJson(_0x3699af) {
  return JSON.stringify(_0x3699af).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}
function getTokenExpiresAtDate(_0x402ab4) {
  return new Date(Date.now() + _0x402ab4 * 1000);
}
function isWindowOrWorker() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope || typeof module === "undefined" || typeof window !== "undefined";
}
function isBrowserEnv() {
  return typeof window !== "undefined";
}
function isWorkerEnv() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}
function createBrowserSafeString(_0x5d2c8f) {
  const _0x23b70f = _0x5d2c8f.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return _0x23b70f;
}
var DEFAULT_MAX_ATTEMPTS = 3;
var DEFAULT_RETRY_DELAY = 500;
var RETRYABLE_5XX_STATUSES = new Set([500, 502, 503, 504]);
var BLOCK_SIZE = 4194304;
var nodeRuntime;
function requireNodeModule(_0x2d0ec5) {
  if (typeof require === "function") {
    return Promise.resolve(require(_0x2d0ec5));
  }
  return Function("moduleName", "return import(moduleName)")(_0x2d0ec5);
}
async function computeContentHashFromFile(_0x31d051, _0x4cf05e) {
  const {
    crypto: _0x16a413,
    fs: _0x3735d0
  } = _0x31d051;
  const _0x49866a = _0x16a413.createHash("sha256");
  let _0x3db9a8 = _0x16a413.createHash("sha256");
  let _0x314f37 = 0;
  return new Promise((_0x17764b, _0x3838bd) => {
    const _0x4f538c = {
      highWaterMark: BLOCK_SIZE
    };
    _0x3735d0.createReadStream(_0x4cf05e, _0x4f538c).on("data", _0x40d50f => {
      let _0x1326b9 = 0;
      while (_0x1326b9 < _0x40d50f.length) {
        const _0x26931b = Math.min(BLOCK_SIZE - _0x314f37, _0x40d50f.length - _0x1326b9);
        _0x3db9a8.update(_0x40d50f.subarray(_0x1326b9, _0x1326b9 + _0x26931b));
        _0x314f37 += _0x26931b;
        _0x1326b9 += _0x26931b;
        if (_0x314f37 === BLOCK_SIZE) {
          _0x49866a.update(_0x3db9a8.digest());
          _0x3db9a8 = _0x16a413.createHash("sha256");
          _0x314f37 = 0;
        }
      }
    }).on("error", _0x3838bd).on("end", () => {
      if (_0x314f37 > 0) {
        _0x49866a.update(_0x3db9a8.digest());
      }
      _0x17764b(_0x49866a.digest("hex"));
    });
  });
}
async function getNodeRuntime() {
  if (nodeRuntime) {
    return nodeRuntime;
  }
  if (typeof process === "undefined" || !process.versions || !process.versions.node) {
    throw new Error("downloadFile is only supported in Node.js. In browsers, use filesDownload() and read result.fileBlob.");
  }
  const [_0x148a54, _0x2a9f5f, _0x4deed3, _0x2fd3d5] = await Promise.all([requireNodeModule("fs"), requireNodeModule("stream"), requireNodeModule("stream/promises"), requireNodeModule("crypto")]);
  const _0x48cef0 = {
    fs: _0x148a54.default || _0x148a54,
    crypto: _0x2fd3d5.default || _0x2fd3d5,
    Readable: _0x2a9f5f.Readable,
    Transform: _0x2a9f5f.Transform,
    Writable: _0x2a9f5f.Writable,
    pipeline: _0x4deed3.pipeline
  };
  nodeRuntime = _0x48cef0;
  return nodeRuntime;
}
function partFileSize(_0x476b79, _0x4a8d11) {
  try {
    return _0x476b79.statSync(_0x4a8d11).size;
  } catch (_0xa25966) {
    if (_0xa25966.code === "ENOENT") {
      return 0;
    }
    throw _0xa25966;
  }
}
function rangeHeader(_0xc6d1f5, _0x24d524) {
  if (_0x24d524 === undefined) {
    return "bytes=" + _0xc6d1f5 + "-";
  }
  return "bytes=" + _0xc6d1f5 + "-" + (_0xc6d1f5 + _0x24d524 - 1);
}
function parseContentRange(_0x273c76) {
  const _0x3b9aec = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(_0x273c76 || "");
  if (!_0x3b9aec) {
    return null;
  }
  return {
    start: Number(_0x3b9aec[1]),
    end: Number(_0x3b9aec[2])
  };
}
function validateRangeResponse(_0x156994, _0x57e3a9) {
  if (!_0x57e3a9) {
    return;
  }
  if (_0x156994.status !== 206) {
    throw new Error("range request returned HTTP " + _0x156994.status + ", expected 206");
  }
  const _0x52eddb = parseContentRange(_0x156994.headers.get("content-range"));
  if (!_0x52eddb) {
    throw new Error("range request response missing valid Content-Range");
  }
  const _0x27d132 = _0x57e3a9.length === undefined ? _0x52eddb.end : _0x57e3a9.offset + _0x57e3a9.length - 1;
  if (_0x52eddb.start !== _0x57e3a9.offset || _0x52eddb.end !== _0x27d132) {
    throw new Error("range request returned Content-Range bytes " + _0x52eddb.start + "-" + _0x52eddb.end + ", expected " + _0x57e3a9.offset + "-" + _0x27d132);
  }
}
function validatePositiveInteger(_0x8d0089, _0x568cf3) {
  if (!Number.isInteger(_0x568cf3) || _0x568cf3 <= 0) {
    throw new TypeError(_0x8d0089 + " must be a positive integer");
  }
}
function buildRequestSignal({
  signal: _0x26a3ac,
  timeout: _0x2697d4
} = {}) {
  if (_0x2697d4 == null) {
    return _0x26a3ac;
  }
  if (_0x26a3ac) {
    return AbortSignal.any([_0x26a3ac, AbortSignal.timeout(_0x2697d4)]);
  } else {
    return AbortSignal.timeout(_0x2697d4);
  }
}
async function throwAsResponseError(_0x1bd279) {
  const _0x3d3a24 = await _0x1bd279.text();
  let _0x4ab30e;
  try {
    _0x4ab30e = JSON.parse(_0x3d3a24);
  } catch {
    _0x4ab30e = _0x3d3a24;
  }
  throw new DropboxResponseError(_0x1bd279.status, _0x1bd279.headers, _0x4ab30e);
}
function isRetryableError(_0x40032e) {
  if (_0x40032e instanceof DropboxResponseError) {
    return _0x40032e.status === 408 || _0x40032e.status === 429 || RETRYABLE_5XX_STATUSES.has(_0x40032e.status);
  }
  return !_0x40032e.message || !_0x40032e.message.startsWith("remote file changed") && !_0x40032e.message.startsWith("range request") && !_0x40032e.message.startsWith("incomplete download") && !_0x40032e.message.startsWith("content hash mismatch") && _0x40032e.message !== "download response body is nil" && _0x40032e.message !== "downloadFile requires a Dropbox client instance" && !_0x40032e.message.startsWith("downloadFile is only supported");
}
function delay(_0x5a417a, _0x2fb645) {
  return new Promise((_0x3ac28b, _0x5ee0a8) => {
    let _0x389430;
    const _0x133913 = () => {
      clearTimeout(_0x389430);
      _0x5ee0a8(_0x2fb645.reason || new Error("download aborted"));
    };
    const _0x5f0476 = () => {
      if (_0x2fb645) {
        _0x2fb645.removeEventListener("abort", _0x133913);
      }
      _0x3ac28b();
    };
    _0x389430 = setTimeout(_0x5f0476, _0x5a417a);
    if (!_0x2fb645) {
      return;
    }
    if (_0x2fb645.aborted) {
      _0x133913();
      return;
    }
    _0x2fb645.addEventListener("abort", _0x133913, {
      once: true
    });
  });
}
function metadataSize(_0x171b72) {
  if (_0x171b72 && typeof _0x171b72.size === "number") {
    return _0x171b72.size;
  } else {
    return 0;
  }
}
function metadataResult(_0x58b141) {
  if (_0x58b141 && _0x58b141.result) {
    return _0x58b141.result;
  } else {
    return _0x58b141;
  }
}
function validateRevision(_0x3b9219, _0xa2ab93) {
  if (!_0x3b9219 || !_0xa2ab93 || !_0xa2ab93.rev) {
    return;
  }
  if (_0xa2ab93.rev !== _0x3b9219) {
    throw new Error("remote file changed during retry: got rev \"" + _0xa2ab93.rev + "\", expected \"" + _0x3b9219 + "\"");
  }
}
async function validatePartFile(_0x4934d3, _0x21eccc, _0x10e433) {
  if (!_0x10e433) {
    return;
  }
  const {
    fs: _0x584f47
  } = _0x4934d3;
  const _0x53997c = _0x584f47.statSync(_0x21eccc);
  if (_0x53997c.size !== _0x10e433.size) {
    throw new Error("incomplete download: got " + _0x53997c.size + " bytes, expected " + _0x10e433.size);
  }
  if (!_0x10e433.content_hash) {
    return;
  }
  const _0x308533 = await computeContentHashFromFile(_0x4934d3, _0x21eccc);
  if (_0x308533 !== _0x10e433.content_hash) {
    throw new Error("content hash mismatch: got \"" + _0x308533 + "\", expected \"" + _0x10e433.content_hash + "\"");
  }
}
function withMetadata(_0x4628ef, _0x3614a6) {
  _0x4628ef.metadata = _0x3614a6;
  return _0x4628ef;
}
function progressTransform(_0x178adc, _0x291d69) {
  return new _0x178adc.Transform({
    transform(_0x1e5323, _0x198cc1, _0x3c7700) {
      _0x291d69.add(_0x1e5323.length);
      _0x3c7700(null, _0x1e5323);
    }
  });
}
function writeAtStream(_0x3d45dc, _0x4987d3, _0x239dc4) {
  let _0x1f2545 = _0x239dc4;
  const {
    fs: _0x14fa66
  } = _0x3d45dc;
  return new _0x3d45dc.Writable({
    write(_0x249da6, _0x4dc5af, _0x1349b2) {
      const _0x5260ca = (_0x2c7c82, _0x1fed53, _0x2ecc63) => {
        _0x14fa66.write(_0x4987d3, _0x249da6, _0x2c7c82, _0x1fed53, _0x2ecc63, (_0x13210b, _0x2eed3a) => {
          if (_0x13210b) {
            _0x1349b2(_0x13210b);
            return;
          }
          if (_0x2eed3a === 0 && _0x1fed53 > 0) {
            _0x1349b2(new Error("fs.write wrote 0 bytes"));
            return;
          }
          if (_0x2eed3a < _0x1fed53) {
            _0x5260ca(_0x2c7c82 + _0x2eed3a, _0x1fed53 - _0x2eed3a, _0x2ecc63 + _0x2eed3a);
            return;
          }
          _0x1f2545 = _0x2ecc63 + _0x2eed3a;
          _0x1349b2();
        });
      };
      if (_0x249da6.length === 0) {
        _0x1349b2();
        return;
      }
      _0x5260ca(0, _0x249da6.length, _0x1f2545);
    }
  });
}
async function writeRangeBody(_0x3a17ed, _0x39993a, _0x29bb28, _0x2901b9, _0x5b397e) {
  let _0x4be5b2 = 0;
  const _0x2c4465 = new _0x3a17ed.Transform({
    transform(_0x143133, _0x2938f2, _0x2192cb) {
      _0x4be5b2 += _0x143133.length;
      _0x29bb28.add(_0x143133.length);
      _0x2192cb(null, _0x143133);
    }
  });
  await _0x3a17ed.pipeline(_0x39993a, _0x2c4465, writeAtStream(_0x3a17ed, _0x2901b9, _0x5b397e.offset));
  if (_0x5b397e.length !== undefined && _0x4be5b2 !== _0x5b397e.length) {
    throw new Error("range request body length mismatch: received " + _0x4be5b2 + " bytes, expected " + _0x5b397e.length);
  }
}
function splitRanges(_0x208af8, _0x19b0d1, _0x35d0f2) {
  if (_0x19b0d1 <= 0) {
    return [];
  }
  if (_0x35d0f2 <= 1) {
    const _0x472d84 = {
      offset: _0x208af8,
      length: _0x19b0d1
    };
    return [_0x472d84];
  }
  const _0x197d1d = Math.min(_0x35d0f2, _0x19b0d1);
  const _0x4693d2 = [];
  const _0x6624d4 = Math.floor(_0x19b0d1 / _0x197d1d);
  let _0x25ded3 = _0x19b0d1 % _0x197d1d;
  let _0x2f64fd = _0x208af8;
  for (let _0x4622f4 = 0; _0x4622f4 < _0x197d1d; _0x4622f4 += 1) {
    const _0x3ec539 = _0x6624d4 + (_0x25ded3 > 0 ? 1 : 0);
    const _0xbec524 = {
      offset: _0x2f64fd,
      length: _0x3ec539
    };
    _0x4693d2.push(_0xbec524);
    _0x2f64fd += _0x3ec539;
    _0x25ded3 -= 1;
  }
  return _0x4693d2;
}
function createProgressTracker(_0x21f763, _0x4bda50, _0x297c4c, _0x17cf5b) {
  return {
    written: _0x21f763,
    add(_0x36a3aa) {
      if (_0x36a3aa <= 0) {
        return;
      }
      this.written += _0x36a3aa;
      if (!_0x17cf5b) {
        return;
      }
      const _0x2003da = {
        bytesWritten: this.written,
        totalBytes: _0x4bda50,
        resumedFrom: _0x297c4c
      };
      _0x17cf5b(_0x2003da);
    }
  };
}
var DropboxFileDownloader = class {
  constructor(_0x6b51dc, _0xf3ea21 = {}) {
    const _0x354549 = _0xf3ea21.maxAttempts === undefined ? DEFAULT_MAX_ATTEMPTS : _0xf3ea21.maxAttempts;
    const _0x1756eb = _0xf3ea21.parallelDownloads === undefined ? 1 : _0xf3ea21.parallelDownloads;
    const _0x432212 = _0xf3ea21.retryDelay === undefined ? DEFAULT_RETRY_DELAY : _0xf3ea21.retryDelay;
    validatePositiveInteger("maxAttempts", _0x354549);
    validatePositiveInteger("parallelDownloads", _0x1756eb);
    validatePositiveInteger("retryDelay", _0x432212);
    if (_0xf3ea21.timeout !== undefined) {
      validatePositiveInteger("timeout", _0xf3ea21.timeout);
    }
    this.client = _0x6b51dc;
    this.maxAttempts = _0x354549;
    this.parallelDownloads = _0x1756eb;
    this.retryDelay = _0x432212;
    this.delay = _0xf3ea21.delay || delay;
    this.progress = _0xf3ea21.progress;
    this.signal = _0xf3ea21.signal;
    this.timeout = _0xf3ea21.timeout;
  }
  async rawDownload(_0x223ad4, _0x1f1c36, _0x3cce09 = this.signal) {
    if (!this.client.auth || !this.client.fetch) {
      throw new Error("downloadFile requires a Dropbox client instance");
    }
    await this.client.auth.checkAndRefreshAccessToken();
    const _0x26abd1 = {
      path: _0x223ad4
    };
    const _0x2bd238 = {
      signal: _0x3cce09,
      timeout: this.timeout
    };
    const _0x64e9c7 = {
      method: "POST",
      headers: {
        "Dropbox-API-Arg": httpHeaderSafeJson(_0x26abd1)
      },
      signal: buildRequestSignal(_0x2bd238)
    };
    if (_0x1f1c36) {
      _0x64e9c7.headers.Range = rangeHeader(_0x1f1c36.offset, _0x1f1c36.length);
    }
    this.client.setAuthHeaders(USER_AUTH, _0x64e9c7);
    this.client.setCommonHeaders(_0x64e9c7);
    const _0x325f26 = await this.client.fetch(baseApiUrl("content", this.client.domain, this.client.domainDelimiter) + "files/download", _0x64e9c7);
    if (!_0x325f26.ok) {
      await throwAsResponseError(_0x325f26);
    }
    validateRangeResponse(_0x325f26, _0x1f1c36);
    if (!_0x325f26.body) {
      throw new Error("download response body is nil");
    }
    return {
      metadata: JSON.parse(_0x325f26.headers.get("dropbox-api-result")),
      body: (await getNodeRuntime()).Readable.fromWeb(_0x325f26.body)
    };
  }
  async fetchMetadata(_0x200f03) {
    if (typeof this.client.filesGetMetadata !== "function") {
      throw new Error("downloadFile requires a Dropbox client instance");
    }
    const _0x32009e = {
      path: _0x200f03
    };
    const _0x13fd7e = await this.client.filesGetMetadata(_0x32009e, {
      signal: this.signal,
      timeout: this.timeout
    });
    return metadataResult(_0x13fd7e);
  }
  async downloadFileAttempt(_0x30f357, _0x3bacea, _0x5aa9c5) {
    const _0x29d0e9 = await getNodeRuntime();
    const {
      fs: _0x2a1d81,
      pipeline: _0x13260d
    } = _0x29d0e9;
    const _0x1fcf0c = _0x3bacea + ".part";
    const _0x2d7151 = partFileSize(_0x2a1d81, _0x1fcf0c);
    if (_0x2d7151 === 0 && this.parallelDownloads > 1) {
      return this.downloadFileParallel(_0x30f357, _0x3bacea, _0x1fcf0c, _0x5aa9c5);
    }
    const _0xe3893d = await this.rawDownload(_0x30f357, _0x2d7151 > 0 ? {
      offset: _0x2d7151
    } : undefined);
    const {
      metadata: _0x2cb3f0
    } = _0xe3893d;
    try {
      validateRevision(_0x5aa9c5, _0x2cb3f0);
    } catch (_0xfc728a) {
      _0x2a1d81.rmSync(_0x1fcf0c, {
        force: true
      });
      throw withMetadata(_0xfc728a, _0x2cb3f0);
    }
    const _0x592ab8 = createProgressTracker(_0x2d7151, metadataSize(_0x2cb3f0), _0x2d7151, this.progress);
    try {
      await _0x13260d(_0xe3893d.body, progressTransform(_0x29d0e9, _0x592ab8), _0x2a1d81.createWriteStream(_0x1fcf0c, {
        flags: _0x2d7151 > 0 ? "a" : "w"
      }));
    } catch (_0x5adc7f) {
      throw withMetadata(_0x5adc7f, _0x2cb3f0);
    }
    try {
      await validatePartFile(_0x29d0e9, _0x1fcf0c, _0x2cb3f0);
      _0x2a1d81.renameSync(_0x1fcf0c, _0x3bacea);
    } catch (_0x9047fa) {
      _0x2a1d81.rmSync(_0x1fcf0c, {
        force: true
      });
      throw withMetadata(_0x9047fa, _0x2cb3f0);
    }
    const _0x3279c7 = {
      metadata: _0x2cb3f0,
      resumedFrom: _0x2d7151
    };
    return _0x3279c7;
  }
  async downloadFileParallel(_0x40574d, _0x4ff18b, _0x5e9904, _0x396311) {
    const _0x57cb48 = await getNodeRuntime();
    const {
      fs: _0xdb8287
    } = _0x57cb48;
    const _0x429295 = await this.fetchMetadata(_0x40574d);
    try {
      validateRevision(_0x396311, _0x429295);
    } catch (_0x5701bc) {
      _0xdb8287.rmSync(_0x5e9904, {
        force: true
      });
      throw withMetadata(_0x5701bc, _0x429295);
    }
    const _0x4d735b = metadataSize(_0x429295);
    const _0x45b492 = createProgressTracker(0, _0x4d735b, 0, this.progress);
    _0xdb8287.writeFileSync(_0x5e9904, Buffer.alloc(0));
    _0xdb8287.truncateSync(_0x5e9904, _0x4d735b);
    if (_0x4d735b > 0) {
      const _0x3c392e = _0xdb8287.openSync(_0x5e9904, "r+");
      try {
        const _0x22275d = splitRanges(0, _0x4d735b, this.parallelDownloads);
        const _0x26cd54 = new AbortController();
        const _0xac6199 = this.signal ? AbortSignal.any([this.signal, _0x26cd54.signal]) : _0x26cd54.signal;
        let _0x16427b;
        const _0x2c8100 = _0x22275d.map(async _0x3a2258 => {
          try {
            const _0x1b1660 = await this.rawDownload(_0x40574d, _0x3a2258, _0xac6199);
            validateRevision(_0x429295.rev, _0x1b1660.metadata);
            await writeRangeBody(_0x57cb48, _0x1b1660.body, _0x45b492, _0x3c392e, _0x3a2258);
          } catch (_0x5adbc3) {
            if (!_0x16427b) {
              _0x16427b = _0x5adbc3;
              _0x26cd54.abort(_0x5adbc3);
            }
            throw _0x5adbc3;
          }
        });
        await Promise.allSettled(_0x2c8100);
        if (_0x16427b) {
          throw _0x16427b;
        }
      } catch (_0x26ec0b) {
        _0xdb8287.closeSync(_0x3c392e);
        _0xdb8287.rmSync(_0x5e9904, {
          force: true
        });
        throw withMetadata(_0x26ec0b, _0x429295);
      }
      _0xdb8287.closeSync(_0x3c392e);
    }
    try {
      await validatePartFile(_0x57cb48, _0x5e9904, _0x429295);
      _0xdb8287.renameSync(_0x5e9904, _0x4ff18b);
    } catch (_0x7db28) {
      _0xdb8287.rmSync(_0x5e9904, {
        force: true
      });
      throw withMetadata(_0x7db28, _0x429295);
    }
    const _0x284fd7 = {
      metadata: _0x429295,
      resumedFrom: 0
    };
    return _0x284fd7;
  }
  async downloadFile(_0x16419f, _0x31a85a) {
    const _0x5c5dfb = await getNodeRuntime();
    const _0x46c524 = _0x31a85a + ".part";
    let _0x5ed939;
    let _0x44fa58 = "";
    try {
      for (let _0x105950 = 0; _0x105950 < this.maxAttempts; _0x105950 += 1) {
        try {
          return await this.downloadFileAttempt(_0x16419f, _0x31a85a, _0x44fa58);
        } catch (_0x2006c5) {
          if (!_0x44fa58 && _0x2006c5.metadata && _0x2006c5.metadata.rev) {
            _0x44fa58 = _0x2006c5.metadata.rev;
          }
          if (this.signal && this.signal.aborted) {
            throw this.signal.reason || _0x2006c5;
          }
          if (!isRetryableError(_0x2006c5)) {
            throw _0x2006c5;
          }
          _0x5ed939 = _0x2006c5;
          if (_0x105950 < this.maxAttempts - 1) {
            await this.delay(this.retryDelay * 2 ** _0x105950, this.signal);
          }
        }
      }
      throw _0x5ed939;
    } catch (_0x4c9711) {
      try {
        _0x5c5dfb.fs.rmSync(_0x46c524, {
          force: true
        });
      } catch (_0x57444e) {
        if (_0x4c9711 && typeof _0x4c9711 === "object") {
          _0x4c9711.cleanupError = _0x57444e;
        }
      }
      throw _0x4c9711;
    }
  }
};
function downloadFile(_0x54835e, _0xcd4f6a, _0xe3ccf0, _0x44351c = {}) {
  return new DropboxFileDownloader(_0x54835e, _0x44351c).downloadFile(_0xcd4f6a, _0xe3ccf0);
}
const _0x5769fa = {
  DropboxFileDownloader: DropboxFileDownloader,
  downloadFile: downloadFile
};
if (0) {
  module.exports = _0x5769fa;
}