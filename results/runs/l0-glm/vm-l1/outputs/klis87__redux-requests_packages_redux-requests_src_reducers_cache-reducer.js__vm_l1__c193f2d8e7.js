var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, source) => {
  for (var key in source)
    if (__hasOwnProp.call(source, key) && !__hasOwnProp.call(target, key))
      __defProp(target, key, { get: () => source[key], enumerable: true, configurable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function")
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
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

var getActionWithSuffix = (suffix) => (action) => ({
  ...action,
  type: `${action.type}${suffix}`
});

var success = getActionWithSuffix(SUCCESS_SUFFIX);
var error = getActionWithSuffix(ERROR_SUFFIX);
var abort = getActionWithSuffix(ABORT_SUFFIX);

var isFSA = (action) => typeof action === "object" && action !== null && typeof action.type === "string";

var createSuccessAction = (action, response) => ({
  ...action,
  type: `${action.type}${SUCCESS_SUFFIX}`,
  response
});

var createErrorAction = (action, error) => ({
  ...action,
  type: `${action.type}${ERROR_SUFFIX}`,
  error
});

var createAbortAction = (action) => ({
  ...action,
  type: `${action.type}${ABORT_SUFFIX}`
});

var getActionPayload = (action) => action.payload;

var getResponseFromSuccessAction = (action) => action.response;

var isRequestAction = (action) => isFSA(action) && !action.type.endsWith(SUCCESS_SUFFIX) && !action.type.endsWith(ERROR_SUFFIX) && !action.type.endsWith(ABORT_SUFFIX);

var isResponseAction = (action) => isFSA(action) && (action.type.endsWith(SUCCESS_SUFFIX) || action.type.endsWith(ERROR_SUFFIX) || action.type.endsWith(ABORT_SUFFIX));

var getRequestActionFromResponse = (action) => ({
  ...action,
  type: action.type.replace(/(_SUCCESS|_ERROR|_ABORT)$/, "")
});

var isSuccessAction = (action) => isFSA(action) && action.type.endsWith(SUCCESS_SUFFIX);

var isErrorAction = (action) => isFSA(action) && action.type.endsWith(ERROR_SUFFIX);

var isAbortAction = (action) => isFSA(action) && action.type.endsWith(ABORT_SUFFIX);

var isRequestQuery = (action) => isRequestAction(action) && action.request && action.request.isQuery !== false;

var isRequestActionQuery = (action) => isRequestAction(action) && isRequestQuery(action);

var clearRequestsCache = (state) => ({
  ...state,
  requests: {}
});

var resetRequests = (state, action) => ({
  ...state,
  requests: {}
});

var abortRequests = (state) => ({
  ...state,
  requests: {}
});

var stopPolling = (state) => state;

var setDownloadProgress = (state, action) => ({
  ...state,
  downloadProgress: action.progress
});

var setUploadProgress = (state, action) => ({
  ...state,
  uploadProgress: action.progress
});

var addWatcher = (state, action) => ({
  ...state,
  watchers: [...(state.watchers || []), action.watcher]
});

var removeWatcher = (state, action) => ({
  ...state,
  watchers: (state.watchers || []).filter(w => w !== action.watcher)
});

var joinRequest = (state, action) => state;

var websocketOpened = (state) => ({
  ...state,
  websocket: { ...state.websocket, isOpen: true }
});

var websocketClosed = (state, action) => ({
  ...state,
  websocket: { isOpen: false, code: action.code }
});

var getWebsocket = (state) => state.websocket;

var openWebsocket = (state, action) => ({
  ...state,
  websocket: { isOpen: true, url: action.url }
});

var closeWebsocket = (state, action) => ({
  ...state,
  websocket: { isOpen: false }
});

var stopSubscriptions = (state) => ({
  ...state,
  subscriptions: {}
});

var getNewCacheTimeout = (action) => action.cacheTimeout || 0;

var getRequestKey = (action) => action.type;

var getRequestTypeString = (action) => action.type;

var getRequestKeys = (action) => Object.keys(action.request || {});

var cache_reducer_default = (state = { requests: {} }, action) => {
  switch (action.type) {
    case CLEAR_REQUESTS_CACHE:
      return clearRequestsCache(state);
    case RESET_REQUESTS:
      return resetRequests(state, action);
    case ABORT_REQUESTS:
      return abortRequests(state);
    case STOP_POLLING:
      return stopPolling(state);
    case SET_DOWNLOAD_PROGRESS:
      return setDownloadProgress(state, action);
    case SET_UPLOAD_PROGRESS:
      return setUploadProgress(state, action);
    case ADD_WATCHER:
      return addWatcher(state, action);
    case REMOVE_WATCHER:
      return removeWatcher(state, action);
    case JOIN_REQUEST:
      return joinRequest(state, action);
    case WEBSOCKET_OPENED:
      return websocketOpened(state);
    case WEBSOCKET_CLOSED:
      return websocketClosed(state, action);
    case GET_WEBSOCKET:
      return getWebsocket(state);
    case OPEN_WEBSOCKET:
      return openWebsocket(state, action);
    case CLOSE_WEBSOCKET:
      return closeWebsocket(state, action);
    case STOP_SUBSCRIPTIONS:
      return stopSubscriptions(state);
    default:
      return state;
  }
};
