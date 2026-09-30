const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var cache_reducer_exports = {};
__export(cache_reducer_exports, {
  default: () => cache_reducer_default
});
module.exports = __toCommonJS(cache_reducer_exports);

const SUCCESS_SUFFIX = "_SUCCESS";
const ERROR_SUFFIX = "_ERROR";
const ABORT_SUFFIX = "_ABORT";
const CLEAR_REQUESTS_CACHE = "CLEAR_REQUESTS_CACHE";
const RESET_REQUESTS = "RESET_REQUESTS";
const ABORT_REQUESTS = "ABORT_REQUESTS";
const SET_DOWNLOAD_PROGRESS = "SET_DOWNLOAD_PROGRESS";
const SET_UPLOAD_PROGRESS = "SET_UPLOAD_PROGRESS";
const ADD_WATCHER = "ADD_WATCHER";
const REMOVE_WATCHER = "REMOVE_WATCHER";
const JOIN_REQUEST = "JOIN_REQUEST";
const STOP_POLLING = "STOP_POLLING";
const WEBSOCKET_OPENED = "WEBSOCKET_OPENED";
const WEBSOCKET_CLOSED = "WEBSOCKET_CLOSED";
const GET_WEBSOCKET = "GET_WEBSOCKET";
const OPEN_WEBSOCKET = "OPEN_WEBSOCKET";
const CLOSE_WEBSOCKET = "CLOSE_WEBSOCKET";
const STOP_SUBSCRIPTIONS = "STOP_SUBSCRIPTIONS";

const getActionWithSuffix = (suffix) => (action) => action + suffix;
const success = getActionWithSuffix(SUCCESS_SUFFIX);
const error = getActionWithSuffix(ERROR_SUFFIX);
const abort = getActionWithSuffix(ABORT_SUFFIX);

const isFSA = (action) => !!action.type;

const createSuccessAction = (requestAction, response) => ({
  type: success(requestAction.type),
  ...(isFSA(requestAction) ? { payload: response } : { response }),
  meta: { ...requestAction.meta, requestAction }
});

const createErrorAction = (requestAction, error) => ({
  type: error(requestAction.type),
  ...(isFSA(requestAction) ? { payload: error, error: true } : { error }),
  meta: { ...requestAction.meta, requestAction }
});

const createAbortAction = (requestAction) => ({
  type: abort(requestAction.type),
  meta: { ...requestAction.meta, requestAction }
});

const getActionPayload = (action) => action.payload === undefined ? action : action.payload;

const getResponseFromSuccessAction = (action) => action.payload ? action.payload : action.response;

const isRequestAction = (action) => {
  const payload = getActionPayload(action);
  return !!payload?.request &&
    !!(Array.isArray(payload.request) ||
      payload.request.url ||
      payload.request.endpoint ||
      payload.request.method ||
      payload.request.query ||
      payload.request.params) &&
    !payload.response &&
    !(payload instanceof Error);
};

const isResponseAction = (action) => !!action.meta?.requestAction;

const getRequestActionFromResponse = (action) => action.meta.requestAction;

const isSuccessAction = (action) => isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);

const isErrorAction = (action) => isResponseAction(action) && action.type.endsWith(ERROR_SUFFIX);

const isAbortAction = (action) => isResponseAction(action) && action.type.endsWith(ABORT_SUFFIX);

const isRequestQuery = (request) =>
  !request.url &&
  (!request.method || request.method.toLowerCase() === "get") ||
  request.url && !request.url.toLowerCase().startsWith("http");

const isRequestActionQuery = (action) => {
  const { request } = getActionPayload(action);
  if (action.meta?.requestAction !== undefined) {
    return !action.meta.requestAction;
  }
  return !!(Array.isArray(request) ? request.every(isRequestQuery) : isRequestQuery(request));
};

const clearRequestsCache = (requests = null) => ({
  type: CLEAR_REQUESTS_CACHE,
  requests
});

const resetRequests = (requests = null, abortPending = true, resetCached = true) => ({
  type: RESET_REQUESTS,
  requests,
  abortPending,
  resetCached
});

const abortRequests = (requests = null) => ({
  type: ABORT_REQUESTS,
  requests
});

const stopPolling = (requests = null) => ({
  type: STOP_POLLING,
  requests
});

const setDownloadProgress = (requestType, progress) => ({
  type: SET_DOWNLOAD_PROGRESS,
  requestType,
  progress
});

const setUploadProgress = (requestType, progress) => ({
  type: SET_UPLOAD_PROGRESS,
  requestType,
  progress
});

const addWatcher = (requestType) => ({
  type: ADD_WATCHER,
  requestType
});

const removeWatcher = (requestType) => ({
  type: REMOVE_WATCHER,
  requestType
});

const joinRequest = (requestType, rehydrate = false) => ({
  type: JOIN_REQUEST,
  requestType,
  rehydrate
});

const websocketOpened = () => ({
  type: WEBSOCKET_OPENED
});

const websocketClosed = (code) => ({
  type: WEBSOCKET_CLOSED,
  code
});

const getWebsocket = () => ({
  type: GET_WEBSOCKET
});

const openWebsocket = (props = null) => ({
  type: OPEN_WEBSOCKET,
  props
});

const closeWebsocket = (code = 1000) => ({
  type: CLOSE_WEBSOCKET,
  code
});

const stopSubscriptions = (subscriptions = null) => ({
  type: STOP_SUBSCRIPTIONS,
  subscriptions
});

const getNewCacheTimeout = (cacheTimeout) =>
  cacheTimeout === true ? null : cacheTimeout * 1000 + Date.now();

const getRequestKey = (requestAction) =>
  requestAction.type + (requestAction.meta?.cacheKey || "");

const getRequestTypeString = (requestType) =>
  typeof requestType === "string" ? requestType.toUpperCase() : requestType;

const getRequestKeys = (requests) =>
  requests.map((request) =>
    typeof request === "string"
      ? getRequestTypeString(request.type) + request.cacheKey
      : getRequestTypeString(request)
  );

const cache_reducer_default = (state, action) => {
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

  if (isSuccessAction(action) && action.meta.requestAction && !action.meta.requestAction.cache && !action.meta.requestAction.noCache) {
    const requestAction = getRequestActionFromResponse(action);
    return {
      ...state,
      [getRequestKey(requestAction)]: {
        timeout: getNewCacheTimeout(action.meta.cacheTimeout),
        cacheKey: action.meta.cacheKey
      }
    };
  }

  return state;
};
