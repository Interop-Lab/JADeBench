var __defProp = Object.defineProperty, __getOwnPropDesc = Object.getOwnPropertyDescriptor, __getOwnPropNames = Object.getOwnPropertyNames, __hasOwnProp = Object.prototype.hasOwnProperty, __export = (_0x13e6f2, _0x286257) => {
    for (var _0x17a4ed in _0x286257) __defProp(_0x13e6f2, _0x17a4ed, { get: _0x286257[_0x17a4ed], enumerable: true });
}, __copyProps = (_0x2c44d4, _0x32c451, _0x185850, _0x568959) => {
    if (_0x32c451 && (typeof _0x32c451 === "object" || typeof _0x32c451 === "function")) {
        for (let _0x5b5d20 of __getOwnPropNames(_0x32c451))
            if (!__hasOwnProp.call(_0x2c44d4, _0x5b5d20) && _0x5b5d20 !== _0x185850)
                __defProp(_0x2c44d4, _0x5b5d20, { get: () => _0x32c451[_0x5b5d20], enumerable: !(_0x568959 = __getOwnPropDesc(_0x32c451, _0x5b5d20)) || _0x568959.enumerable });
    }
    return _0x2c44d4;
}, __toCommonJS = _0x3ac3a8 => __copyProps(__defProp({}, "value", { value: true }), _0x3ac3a8);
var response_exports = {}, _0x1f6a39 = {};
_0x1f6a39.DropboxResponse = () => DropboxResponse;
_0x1f6a39.parseDownloadResponse = () => parseDownloadResponse;
_0x1f6a39.parseResponse = () => parseResponse;
__export(response_exports, _0x1f6a39);
module.exports = __toCommonJS(response_exports);
var RPC = "rpc", UPLOAD = "upload", DOWNLOAD = "download", APP_AUTH = "app", USER_AUTH = "user", TEAM_AUTH = "team", NO_AUTH = "noauth", COOKIE = "cookie", DEFAULT_API_DOMAIN = "dropboxapi.com", DEFAULT_DOMAIN = "dropbox.com", TEST_DOMAIN_MAPPINGS = { rpc: "api", upload: "content", download: "content.dropboxapi.com" };
function getSafeUnicode(_0x151061) {
    const _0x254234 = ("0000" + _0x151061.charCodeAt(0).toString(16)).slice(-4);
    return "\\u" + _0x254234;
}
var baseApiUrl = (_0x1d9403, _0x19a9a9 = DEFAULT_API_DOMAIN, _0x2a6860 = ".") => {
    if (!_0x2a6860) return "https://" + _0x19a9a9 + "/2";
    if (_0x19a9a9 === DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[_0x1d9403] !== void 0) {
        _0x1d9403 = TEST_DOMAIN_MAPPINGS[_0x1d9403];
        _0x2a6860 = "-";
    }
    return "https://" + _0x1d9403 + _0x2a6860 + _0x19a9a9 + "/2";
}, OAuth2AuthorizationUrl = (_0x47eba1 = DEFAULT_DOMAIN) => {
    if (_0x47eba1 !== DEFAULT_DOMAIN) _0x47eba1 = "www." + _0x47eba1;
    return "https://" + _0x47eba1 + "/oauth2/authorize";
}, OAuth2TokenUrl = (_0x551707 = DEFAULT_API_DOMAIN, _0x96555b = ".") => {
    let _0x30fd3d = "api";
    if (_0x551707 === DEFAULT_API_DOMAIN) _0x30fd3d = TEST_DOMAIN_MAPPINGS[_0x30fd3d], _0x96555b = "-";
    return "https://" + _0x30fd3d + _0x96555b + _0x551707 + "/oauth2/token";
};
function httpHeaderSafeJson(_0x1b6b3a) {
    return JSON.stringify(_0x1b6b3a).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}
function getTokenExpiresAtDate(_0x90161c) {
    return new Date(Date.now() + _0x90161c * 1000);
}
function isWindowOrWorker() {
    return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope || typeof module !== "undefined" || typeof window !== "undefined";
}
function isBrowserEnv() {
    return typeof window !== "undefined";
}
function isWorkerEnv() {
    return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}
function createBrowserSafeString(_0x1677eb) {
    const _0x55a81e = _0x1677eb.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    return _0x55a81e;
}
var DropboxResponseError = class extends Error {
    constructor(_0xf03daf, _0x508f4b, _0x28f116) {
        super("Response failed with status " + _0xf03daf + " " + _0x508f4b);
        this.name = "DropboxResponseError";
        this.status = _0xf03daf;
        this.error = _0x28f116;
        this.headers = _0x508f4b;
    }
}, DropboxResponse = class {
    constructor(_0x4f128b, _0x1d4f2e, _0x243fe3) {
        this.status = _0x4f128b;
        this.headers = _0x1d4f2e;
        this.result = _0x243fe3;
    }
};
function throwAsError(_0x3d1ef2) {
    return _0x3d1ef2.text().then(_0x20072a => {
        let _0x97c429;
        try {
            _0x97c429 = JSON.parse(_0x20072a);
        } catch (_0x2f8e1e) {
            _0x97c429 = _0x20072a;
        }
        throw new DropboxResponseError(_0x3d1ef2.status, _0x3d1ef2.headers, _0x97c429);
    });
}
function parseResponse(_0x4bf5bc) {
    if (!_0x4bf5bc.ok) return throwAsError(_0x4bf5bc);
    return _0x4bf5bc.json().then(_0x56ec33 => {
        let _0x468529;
        try {
            _0x468529 = JSON.parse(_0x56ec33);
        } catch (_0x547e8a) {
            _0x468529 = _0x56ec33;
        }
        return new DropboxResponse(_0x4bf5bc.status, _0x4bf5bc.headers, _0x468529);
    });
}
function parseDownloadResponse(_0xf74ae5) {
    if (!_0xf74ae5.ok) return throwAsError(_0xf74ae5);
    const _0x263225 = isWindowOrWorker() ? _0xf74ae5.blob() : _0xf74ae5.buffer().then(_0x2dcce6 => Buffer.from(_0x2dcce6));
    return _0x263225.then(_0x148429 => {
        const _0x32f892 = JSON.parse(_0xf74ae5.headers.get("dropbox-api-result"));
        if (isWindowOrWorker()) _0x32f892.fileBlob = _0x148429;
        else _0x32f892.fileBinary = _0x148429;
        return new DropboxResponse(_0xf74ae5.status, _0xf74ae5.headers, _0x32f892);
    });
}
var _0x5b2e61 = {};
_0x5b2e61.DropboxResponse = DropboxResponse;
_0x5b2e61.parseDownloadResponse = parseDownloadResponse;
_0x5b2e61.parseResponse = parseResponse;
module.exports = _0x5b2e61;
