var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x29b7e5, _0x45c74c) => {
  for (var _0x31031e in _0x45c74c) {
    __defProp(_0x29b7e5, _0x31031e, {
      get: _0x45c74c[_0x31031e],
      enumerable: true
    });
  }
};
var __copyProps = (_0x103007, _0x21160a, _0x5d8093, _0x25110f) => {
  if (_0x21160a && typeof _0x21160a === "object" || typeof _0x21160a === "function") {
    for (let _0x15c7d2 of __getOwnPropNames(_0x21160a)) {
      if (!__hasOwnProp.call(_0x103007, _0x15c7d2) && _0x15c7d2 !== _0x5d8093) {
        __defProp(_0x103007, _0x15c7d2, {
          get: () => _0x21160a[_0x15c7d2],
          enumerable: !(_0x25110f = __getOwnPropDesc(_0x21160a, _0x15c7d2)) || _0x25110f.enumerable
        });
      }
    }
  }
  return _0x103007;
};
var _0x14fe54 = {
  value: true
};
var __toCommonJS = _0x26d2ec => __copyProps(__defProp({}, "__esModule", _0x14fe54), _0x26d2ec);
var cache_reducer_exports = {};
var _0x5128b4 = {
  default: () => cache_reducer_default
};
__export(cache_reducer_exports, _0x5128b4);
module.exports = __toCommonJS(cache_reducer_exports);
var SUCCESS_SUFFIX = "_SUCCESS";
var ERROR_SUFFIX = "_ERROR";
var ABORT_SUFFIX = "_ABORT";
var CLEAR_REQUESTS_CACHE = "CLEAR_REQUESTS_CACHE";
var RESET_REQUESTS = "RESET_REQUESTS";
var ABORT_REQUESTS = "ABORT_REQUESTS";
var SET_DOWNLOAD_PROGRESS = "SET_DOWNLOAD_PROGRESS";
var SET_UPLOAD_PROGRESS = "SET_UPLOAD_PROGRESS";
var ADD_WATCHER = "ADD_WATCHER";
var REMOVE_WATCHER = "REMOVE_WATCHER";
var JOIN_REQUEST = "JOIN_REQUEST";
var STOP_POLLING = "STOP_POLLING";
var WEBSOCKET_OPENED = "WEBSOCKET_OPENED";
var WEBSOCKET_CLOSED = "WEBSOCKET_CLOSED";
var GET_WEBSOCKET = "GET_WEBSOCKET";
var OPEN_WEBSOCKET = "OPEN_WEBSOCKET";
var CLOSE_WEBSOCKET = "CLOSE_WEBSOCKET";
var STOP_SUBSCRIPTIONS = "STOP_SUBSCRIPTIONS";
var getActionWithSuffix = _0x100f41 => _0x30ad11 => _0x30ad11 + _0x100f41;
var success = getActionWithSuffix(SUCCESS_SUFFIX);
var error = getActionWithSuffix(ERROR_SUFFIX);
var abort = getActionWithSuffix(ABORT_SUFFIX);
var isFSA = _0x2d8df3 => !!_0x2d8df3.payload;
var createSuccessAction = (_0x1b9c09, _0x41d06c) => ({
  type: success(_0x1b9c09.type),
  ...(isFSA(_0x1b9c09) ? {
    payload: _0x41d06c
  } : {
    response: _0x41d06c
  }),
  meta: {
    ..._0x1b9c09.meta,
    requestAction: _0x1b9c09
  }
});
var createErrorAction = (_0x15a436, _0x43df00) => ({
  type: error(_0x15a436.type),
  ...(isFSA(_0x15a436) ? {
    payload: _0x43df00,
    error: true
  } : {
    error: _0x43df00
  }),
  meta: {
    ..._0x15a436.meta,
    requestAction: _0x15a436
  }
});
var createAbortAction = _0x272518 => ({
  type: abort(_0x272518.type),
  meta: {
    ..._0x272518.meta,
    requestAction: _0x272518
  }
});
var getActionPayload = _0x47ad86 => _0x47ad86.payload === undefined ? _0x47ad86 : _0x47ad86.payload;
var getResponseFromSuccessAction = _0x3a68c3 => _0x3a68c3.payload ? _0x3a68c3.payload : _0x3a68c3.response;
var isRequestAction = _0x2fb6af => {
  const _0x1f0a8d = getActionPayload(_0x2fb6af);
  return !!_0x1f0a8d?.request && (!!Array.isArray(_0x1f0a8d.request) || !!_0x1f0a8d.request.url || !!_0x1f0a8d.request.query || !!_0x1f0a8d.request.promise || !!_0x1f0a8d.request.response || !!_0x1f0a8d.request.error) && !_0x1f0a8d.response && !(_0x1f0a8d instanceof Error);
};
var isResponseAction = _0x46d82b => !!_0x46d82b.meta?.requestAction;
var getRequestActionFromResponse = _0x3ac675 => _0x3ac675.meta.requestAction;
var isSuccessAction = _0x3ab490 => isResponseAction(_0x3ab490) && _0x3ab490.type.endsWith(SUCCESS_SUFFIX);
var isErrorAction = _0x2d210e => isResponseAction(_0x2d210e) && _0x2d210e.type.endsWith(ERROR_SUFFIX);
var isAbortAction = _0x1252bf => isResponseAction(_0x1252bf) && _0x1252bf.type.endsWith(ABORT_SUFFIX);
var isRequestQuery = _0x2eb84c => !_0x2eb84c.query && (!_0x2eb84c.method || _0x2eb84c.method.toLowerCase() === "get") || _0x2eb84c.query && !_0x2eb84c.query.trim().startsWith("mutation");
var isRequestActionQuery = _0x38a0b7 => {
  const {
    request: _0x5588dd
  } = getActionPayload(_0x38a0b7);
  if (_0x38a0b7.meta?.asMutation !== undefined) {
    return !_0x38a0b7.meta.asMutation;
  }
  return !!(Array.isArray(_0x5588dd) ? _0x5588dd.every(isRequestQuery) : isRequestQuery(_0x5588dd));
};
var clearRequestsCache = (_0x1862a6 = null) => ({
  type: CLEAR_REQUESTS_CACHE,
  requests: _0x1862a6
});
var resetRequests = (_0x1918a9 = null, _0x1bb050 = true, _0x20144e = true) => ({
  type: RESET_REQUESTS,
  requests: _0x1918a9,
  abortPending: _0x1bb050,
  resetCached: _0x20144e
});
var abortRequests = (_0x37afb1 = null) => ({
  type: ABORT_REQUESTS,
  requests: _0x37afb1
});
var stopPolling = (_0x584cf9 = null) => ({
  type: STOP_POLLING,
  requests: _0x584cf9
});
var setDownloadProgress = (_0x26531d, _0x5ef210) => ({
  type: SET_DOWNLOAD_PROGRESS,
  requestType: _0x26531d,
  progress: _0x5ef210
});
var setUploadProgress = (_0xbbe0ed, _0x25579b) => ({
  type: SET_UPLOAD_PROGRESS,
  requestType: _0xbbe0ed,
  progress: _0x25579b
});
var addWatcher = _0x5d4c2e => ({
  type: ADD_WATCHER,
  requestType: _0x5d4c2e
});
var removeWatcher = _0x36380e => ({
  type: REMOVE_WATCHER,
  requestType: _0x36380e
});
var joinRequest = (_0x596e06, _0x9e0f5b = false) => ({
  type: JOIN_REQUEST,
  requestType: _0x596e06,
  rehydrate: _0x9e0f5b
});
var websocketOpened = () => ({
  type: WEBSOCKET_OPENED
});
var websocketClosed = _0x117477 => ({
  type: WEBSOCKET_CLOSED,
  code: _0x117477
});
var getWebsocket = () => ({
  type: GET_WEBSOCKET
});
var openWebsocket = (_0x13408e = null) => ({
  type: OPEN_WEBSOCKET,
  props: _0x13408e
});
var closeWebsocket = (_0x7197b5 = 1000) => ({
  type: CLOSE_WEBSOCKET,
  code: _0x7197b5
});
var stopSubscriptions = (_0x3766e0 = null) => ({
  type: STOP_SUBSCRIPTIONS,
  subscriptions: _0x3766e0
});
var getNewCacheTimeout = _0x1694f0 => _0x1694f0 === true ? null : _0x1694f0 * 1000 + Date.now();
var getRequestKey = _0x543463 => _0x543463.type + (_0x543463.meta.requestKey || "");
var getRequestTypeString = _0x207985 => typeof _0x207985 === "function" ? _0x207985.toString() : _0x207985;
var getRequestKeys = _0x37f337 => _0x37f337.map(_0x371944 => typeof _0x371944 === "object" ? getRequestTypeString(_0x371944.requestType) + _0x371944.requestKey : getRequestTypeString(_0x371944));
var cache_reducer_default = (_0x427bf0, _0x5a0c1b) => {
  if (_0x5a0c1b.type === CLEAR_REQUESTS_CACHE) {
    if (!_0x5a0c1b.requests) {
      return {};
    }
    _0x427bf0 = {
      ..._0x427bf0
    };
    getRequestKeys(_0x5a0c1b.requests).forEach(_0x498d20 => {
      delete _0x427bf0[_0x498d20];
    });
    return _0x427bf0;
  }
  if (isSuccessAction(_0x5a0c1b) && _0x5a0c1b.meta.cache && !_0x5a0c1b.meta.cacheResponse && !_0x5a0c1b.meta.ssrResponse) {
    const _0x4b5a19 = getRequestActionFromResponse(_0x5a0c1b);
    return {
      ..._0x427bf0,
      [getRequestKey(_0x4b5a19)]: {
        timeout: getNewCacheTimeout(_0x5a0c1b.meta.cache),
        cacheKey: _0x5a0c1b.meta.cacheKey
      }
    };
  }
  return _0x427bf0;
};