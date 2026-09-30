var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var cache_reducer_exports = {};
__export(cache_reducer_exports, {
  default: () => cache_reducer_default
});
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

var getActionWithSuffix = (suffix) => (actionType) => actionType + suffix;
var success = getActionWithSuffix(SUCCESS_SUFFIX);
var error = getActionWithSuffix(ERROR_SUFFIX);
var abort = getActionWithSuffix(ABORT_SUFFIX);

var isFSA = (action) => !!action.error;

var createSuccessAction = (requestAction, response) => ({
  type: success(requestAction.type),
  ...(isFSA(requestAction) ? { payload: response } : { response }),
  meta: { ...requestAction.meta, requestAction }
});

var createErrorAction = (requestAction, errorData) => ({
  type: error(requestAction.type),
  ...(isFSA(requestAction) ? { payload: errorData, error: true } : { error: errorData }),
  meta: { ...requestAction.meta, requestAction }
});

var createAbortAction = (requestAction) => ({
  type: abort(requestAction.type),
  meta: { ...requestAction.meta, requestAction }
});

var getActionPayload = (action) => action.payload === void 0 ? action : action.payload;

var getResponseFromSuccessAction = (action) => action.payload ? action.payload : action.response;

var isRequestAction = (action) => {
  const payload = getActionPayload(action);
  return !!payload?.request && !!(Array.isArray(payload.request) || payload.request.url || payload.request.query || payload.request.mutation || payload.request.subscription) && !payload.response && !(payload instanceof Error);
};

var isResponseAction = (action) => !!action.meta?.requestAction;

var getRequestActionFromResponse = (action) => action.meta.requestAction;

var isSuccessAction = (action) => isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);

var isErrorAction = (action) => isResponseAction(action) && action.type.endsWith(ERROR_SUFFIX);

var isAbortAction = (action) => isResponseAction(action) && action.type.endsWith(ABORT_SUFFIX);

var isRequestQuery = (request) => !request.method && (!request.headers || request.headers.get("Content-Type")?.toLowerCase() === "application/json") || request.method && !request.method.toLowerCase().startsWith("post");

var isRequestActionQuery = (action) => {
  const { request } = getActionPayload(action);
  if (action.meta?.ssrResponse !== void 0) return !action.meta.ssrResponse;
  return !!(Array.isArray(request) ? request.some(isRequestQuery) : isRequestQuery(request));
};

var clearRequestsCache = (requests = null) => ({ type: CLEAR_REQUESTS_CACHE, requests });

var resetRequests = (requests = null, abortPending = true, resetCached = true) => ({
  type: RESET_REQUESTS,
  requests,
  abortPending,
  resetCached
});

var abortRequests = (requests = null) => ({ type: ABORT_REQUESTS, requests });

var stopPolling = (requests = null) => ({ type: STOP_POLLING, requests });

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

var addWatcher = (requestType) => ({ type: ADD_WATCHER, requestType });

var removeWatcher = (requestType) => ({ type: REMOVE_WATCHER, requestType });

var joinRequest = (requestType, rehydrate = false) => ({
  type: JOIN_REQUEST,
  requestType,
  rehydrate
});

var websocketOpened = () => ({ type: WEBSOCKET_OPENED });

var websocketClosed = (code) => ({ type: WEBSOCKET_CLOSED, code });

var getWebsocket = () => ({ type: GET_WEBSOCKET });

var openWebsocket = (props = null) => ({ type: OPEN_WEBSOCKET, props });

var closeWebsocket = (code = 1000) => ({ type: CLOSE_WEBSOCKET, code });

var stopSubscriptions = (subscriptions = null) => ({ type: STOP_SUBSCRIPTIONS, subscriptions });

var getNewCacheTimeout = (cache) => cache === true ? null : cache * 1000 + Date.now();

var getRequestKey = (request) => request.type + (request.requestKey || "");

var getRequestTypeString = (requestType) => typeof requestType === "function" ? requestType.toString() : requestType;

var getRequestKeys = (requests) => requests.map((request) => typeof request === "object" ? getRequestTypeString(request.type) + request.requestKey : getRequestTypeString(request));

var cache_reducer_default = (state, action) => {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (!action.requests) {
      return {};
    }
    state = { ...state };
    getRequestKeys(action.requests).forEach((key) => {
      delete state[key];
    });
    return state;
  }
  if (isSuccessAction(action) && action.meta.cache && !action.meta.ssrResponse && !action.meta.poll) {
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
