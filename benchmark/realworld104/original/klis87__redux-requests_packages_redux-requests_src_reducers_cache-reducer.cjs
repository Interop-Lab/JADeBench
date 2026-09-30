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

// ../work/klis87__redux-requests/packages/redux-requests/src/reducers/cache-reducer.js
var cache_reducer_exports = {};
__export(cache_reducer_exports, {
  default: () => cache_reducer_default
});
module.exports = __toCommonJS(cache_reducer_exports);

// ../work/klis87__redux-requests/packages/redux-requests/src/constants.js
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

// ../work/klis87__redux-requests/packages/redux-requests/src/actions.js
var getActionWithSuffix = (suffix) => (actionType) => actionType + suffix;
var success = getActionWithSuffix(SUCCESS_SUFFIX);
var error = getActionWithSuffix(ERROR_SUFFIX);
var abort = getActionWithSuffix(ABORT_SUFFIX);
var isFSA = (action) => !!action.payload;
var createSuccessAction = (action, response) => ({
  type: success(action.type),
  ...isFSA(action) ? { payload: response } : { response },
  meta: {
    ...action.meta,
    requestAction: action
  }
});
var createErrorAction = (action, errorData) => ({
  type: error(action.type),
  ...isFSA(action) ? {
    payload: errorData,
    error: true
  } : {
    error: errorData
  },
  meta: {
    ...action.meta,
    requestAction: action
  }
});
var createAbortAction = (action) => ({
  type: abort(action.type),
  meta: {
    ...action.meta,
    requestAction: action
  }
});
var getActionPayload = (action) => action.payload === void 0 ? action : action.payload;
var getResponseFromSuccessAction = (action) => action.payload ? action.payload : action.response;
var isRequestAction = (action) => {
  const actionPayload = getActionPayload(action);
  return !!actionPayload?.request && !!(Array.isArray(actionPayload.request) || actionPayload.request.url || actionPayload.request.query || actionPayload.request.promise || actionPayload.request.response || actionPayload.request.error) && !actionPayload.response && !(actionPayload instanceof Error);
};
var isResponseAction = (action) => !!action.meta?.requestAction;
var getRequestActionFromResponse = (action) => action.meta.requestAction;
var isSuccessAction = (action) => isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);
var isErrorAction = (action) => isResponseAction(action) && action.type.endsWith(ERROR_SUFFIX);
var isAbortAction = (action) => isResponseAction(action) && action.type.endsWith(ABORT_SUFFIX);
var isRequestQuery = (request) => !request.query && (!request.method || request.method.toLowerCase() === "get") || request.query && !request.query.trim().startsWith("mutation");
var isRequestActionQuery = (action) => {
  const { request } = getActionPayload(action);
  if (action.meta?.asMutation !== void 0) {
    return !action.meta.asMutation;
  }
  return !!(Array.isArray(request) ? request.every(isRequestQuery) : isRequestQuery(request));
};
var clearRequestsCache = (requests = null) => ({
  type: CLEAR_REQUESTS_CACHE,
  requests
});
var resetRequests = (requests = null, abortPending = true, resetCached = true) => ({
  type: RESET_REQUESTS,
  requests,
  abortPending,
  resetCached
});
var abortRequests = (requests = null) => ({
  type: ABORT_REQUESTS,
  requests
});
var stopPolling = (requests = null) => ({
  type: STOP_POLLING,
  requests
});
var setDownloadProgress = (requestType, progress) => ({
  type: SET_DOWNLOAD_PROGRESS,
  requestType,
  progress
});
var setUploadProgress = (requestType, progress) => ({
  type: SET_UPLOAD_PROGRESS,
  requestType,
  progress
});
var addWatcher = (requestType) => ({
  type: ADD_WATCHER,
  requestType
});
var removeWatcher = (requestType) => ({
  type: REMOVE_WATCHER,
  requestType
});
var joinRequest = (requestType, rehydrate = false) => ({
  type: JOIN_REQUEST,
  requestType,
  rehydrate
});
var websocketOpened = () => ({ type: WEBSOCKET_OPENED });
var websocketClosed = (code) => ({ type: WEBSOCKET_CLOSED, code });
var getWebsocket = () => ({ type: GET_WEBSOCKET });
var openWebsocket = (props = null) => ({
  type: OPEN_WEBSOCKET,
  props
});
var closeWebsocket = (code = 1e3) => ({
  type: CLOSE_WEBSOCKET,
  code
});
var stopSubscriptions = (subscriptions = null) => ({
  type: STOP_SUBSCRIPTIONS,
  subscriptions
});

// ../work/klis87__redux-requests/packages/redux-requests/src/reducers/cache-reducer.js
var getNewCacheTimeout = (cache) => cache === true ? null : cache * 1e3 + Date.now();
var getRequestKey = (action) => action.type + (action.meta.requestKey || "");
var getRequestTypeString = (requestType) => typeof requestType === "function" ? requestType.toString() : requestType;
var getRequestKeys = (requests) => requests.map(
  (v) => typeof v === "object" ? getRequestTypeString(v.requestType) + v.requestKey : getRequestTypeString(v)
);
var cache_reducer_default = (state, action) => {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (!action.requests) {
      return {};
    }
    state = { ...state };
    getRequestKeys(action.requests).forEach((requestKey) => {
      delete state[requestKey];
    });
    return state;
  }
  if (isSuccessAction(action) && action.meta.cache && !action.meta.cacheResponse && !action.meta.ssrResponse) {
    const requestAction = getRequestActionFromResponse(action);
    return {
      ...state,
      [getRequestKey(requestAction)]: {
        timeout: getNewCacheTimeout(action.meta.cache),
        cacheKey: action.meta.cacheKey
      }
    };
  }
  return state;
};
