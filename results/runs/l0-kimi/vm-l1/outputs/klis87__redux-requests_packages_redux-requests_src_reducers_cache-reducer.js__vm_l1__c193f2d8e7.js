var SUCCESS_SUFFIX = '_SUCCESS';
var ERROR_SUFFIX = '_ERROR';
var ABORT_SUFFIX = '_ABORT';
var CLEAR_REQUESTS_CACHE = 'CLEAR_REQUESTS_CACHE';
var RESET_REQUESTS = 'RESET_REQUESTS';
var ABORT_REQUESTS = 'ABORT_REQUESTS';
var SET_DOWNLOAD_PROGRESS = 'SET_DOWNLOAD_PROGRESS';
var SET_UPLOAD_PROGRESS = 'SET_UPLOAD_PROGRESS';
var ADD_WATCHER = 'ADD_WATCHER';
var REMOVE_WATCHER = 'REMOVE_WATCHER';
var JOIN_REQUEST = 'JOIN_REQUEST';
var STOP_POLLING = 'STOP_POLLING';
var WEBSOCKET_OPENED = 'WEBSOCKET_OPENED';
var WEBSOCKET_CLOSED = 'WEBSOCKET_CLOSED';
var GET_WEBSOCKET = 'GET_WEBSOCKET';
var OPEN_WEBSOCKET = 'OPEN_WEBSOCKET';
var CLOSE_WEBSOCKET = 'CLOSE_WEBSOCKET';
var STOP_SUBSCRIPTIONS = 'STOP_SUBSCRIPTIONS';

function getActionWithSuffix(suffix) {
  return action => action + suffix;
}

var success = getActionWithSuffix(SUCCESS_SUFFIX);
var error = getActionWithSuffix(ERROR_SUFFIX);
var abort = getActionWithSuffix(ABORT_SUFFIX);

function isFSA(action) {
  return typeof action === 'object' && action !== null && typeof action.type === 'string';
}

function createSuccessAction(action, response) {
  return {
    type: success(action.type),
    payload: response,
    meta: action.meta
  };
}

function createErrorAction(action, errorData) {
  return {
    type: error(action.type),
    payload: errorData,
    error: true,
    meta: action.meta
  };
}

function createAbortAction(action) {
  return {
    type: abort(action.type),
    meta: action.meta
  };
}

function getActionPayload(action) {
  return action && action.payload;
}

function getResponseFromSuccessAction(action) {
  return action && action.payload;
}

function isRequestAction(action) {
  return action && action.meta && action.meta.requestKey !== undefined;
}

function isResponseAction(action) {
  return action && (isSuccessAction(action) || isErrorAction(action) || isAbortAction(action));
}

function getRequestActionFromResponse(action) {
  if (!isResponseAction(action)) return null;
  var type = action.type;
  if (type.endsWith(SUCCESS_SUFFIX)) {
    return type.slice(0, -SUCCESS_SUFFIX.length);
  }
  if (type.endsWith(ERROR_SUFFIX)) {
    return type.slice(0, -ERROR_SUFFIX.length);
  }
  if (type.endsWith(ABORT_SUFFIX)) {
    return type.slice(0, -ABORT_SUFFIX.length);
  }
  return null;
}

function isSuccessAction(action) {
  return action && action.type && action.type.endsWith(SUCCESS_SUFFIX);
}

function isErrorAction(action) {
  return action && action.type && action.type.endsWith(ERROR_SUFFIX);
}

function isAbortAction(action) {
  return action && action.type && action.type.endsWith(ABORT_SUFFIX);
}

function isRequestQuery(action) {
  return action && action.meta && action.meta.requestType === 'query';
}

function isRequestActionQuery(action) {
  return isRequestAction(action) && isRequestQuery(action);
}

function clearRequestsCache(requestKeys) {
  return {
    type: CLEAR_REQUESTS_CACHE,
    payload: requestKeys
  };
}

function resetRequests(requestKeys, resetCache, resetCacheKeys) {
  return {
    type: RESET_REQUESTS,
    payload: {
      requestKeys,
      resetCache,
      resetCacheKeys
    }
  };
}

function abortRequests(requestKeys) {
  return {
    type: ABORT_REQUESTS,
    payload: requestKeys
  };
}

function stopPolling(requestKeys) {
  return {
    type: STOP_POLLING,
    payload: requestKeys
  };
}

function setDownloadProgress(requestKey, progress) {
  return {
    type: SET_DOWNLOAD_PROGRESS,
    payload: { requestKey, progress }
  };
}

function setUploadProgress(requestKey, progress) {
  return {
    type: SET_UPLOAD_PROGRESS,
    payload: { requestKey, progress }
  };
}

function addWatcher(watcher) {
  return {
    type: ADD_WATCHER,
    payload: watcher
  };
}

function removeWatcher(watcher) {
  return {
    type: REMOVE_WATCHER,
    payload: watcher
  };
}

function joinRequest(requestKey, joinedRequestKey) {
  return {
    type: JOIN_REQUEST,
    payload: { requestKey, joinedRequestKey }
  };
}

function websocketOpened() {
  return {
    type: WEBSOCKET_OPENED
  };
}

function websocketClosed(code) {
  return {
    type: WEBSOCKET_CLOSED,
    payload: code
  };
}

function getWebsocket() {
  return {
    type: GET_WEBSOCKET
  };
}

function openWebsocket(url) {
  return {
    type: OPEN_WEBSOCKET,
    payload: url
  };
}

function closeWebsocket(code) {
  return {
    type: CLOSE_WEBSOCKET,
    payload: code
  };
}

function stopSubscriptions(subscriptions) {
  return {
    type: STOP_SUBSCRIPTIONS,
    payload: subscriptions
  };
}

function getNewCacheTimeout(cacheTimeout) {
  return cacheTimeout;
}

function getRequestKey(requestType) {
  return requestType;
}

function getRequestTypeString(requestType) {
  return requestType;
}

function getRequestKeys(requestTypes) {
  return requestTypes;
}

function cacheReducer(state, action) {
  if (state === undefined) state = {};
  
  switch (action.type) {
    case CLEAR_REQUESTS_CACHE:
      var newState = { ...state };
      if (action.payload) {
        action.payload.forEach(key => {
          delete newState[key];
        });
      } else {
        newState = {};
      }
      return newState;
      
    case RESET_REQUESTS:
      var newState = { ...state };
      if (action.payload && action.payload.requestKeys) {
        action.payload.requestKeys.forEach(key => {
          delete newState[key];
        });
      }
      return newState;
      
    default:
      return state;
  }
}

module.exports = {
  SUCCESS_SUFFIX,
  ERROR_SUFFIX,
  ABORT_SUFFIX,
  CLEAR_REQUESTS_CACHE,
  RESET_REQUESTS,
  ABORT_REQUESTS,
  SET_DOWNLOAD_PROGRESS,
  SET_UPLOAD_PROGRESS,
  ADD_WATCHER,
  REMOVE_WATCHER,
  JOIN_REQUEST,
  STOP_POLLING,
  WEBSOCKET_OPENED,
  WEBSOCKET_CLOSED,
  GET_WEBSOCKET,
  OPEN_WEBSOCKET,
  CLOSE_WEBSOCKET,
  STOP_SUBSCRIPTIONS,
  getActionWithSuffix,
  success,
  error,
  abort,
  isFSA,
  createSuccessAction,
  createErrorAction,
  createAbortAction,
  getActionPayload,
  getResponseFromSuccessAction,
  isRequestAction,
  isResponseAction,
  getRequestActionFromResponse,
  isSuccessAction,
  isErrorAction,
  isAbortAction,
  isRequestQuery,
  isRequestActionQuery,
  clearRequestsCache,
  resetRequests,
  abortRequests,
  stopPolling,
  setDownloadProgress,
  setUploadProgress,
  addWatcher,
  removeWatcher,
  joinRequest,
  websocketOpened,
  websocketClosed,
  getWebsocket,
  openWebsocket,
  closeWebsocket,
  stopSubscriptions,
  getNewCacheTimeout,
  getRequestKey,
  getRequestTypeString,
  getRequestKeys,
  default: cacheReducer
};
