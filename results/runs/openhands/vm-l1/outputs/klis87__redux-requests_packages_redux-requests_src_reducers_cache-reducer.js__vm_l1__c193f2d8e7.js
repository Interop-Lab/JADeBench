'use strict';

const SUCCESS_SUFFIX = '_SUCCESS';
const ERROR_SUFFIX = '_ERROR';
const ABORT_SUFFIX = '_ABORT';

const CLEAR_REQUESTS_CACHE = 'CLEAR_REQUESTS_CACHE';
const RESET_REQUESTS = 'RESET_REQUESTS';
const ABORT_REQUESTS = 'ABORT_REQUESTS';
const SET_DOWNLOAD_PROGRESS = 'SET_DOWNLOAD_PROGRESS';
const SET_UPLOAD_PROGRESS = 'SET_UPLOAD_PROGRESS';
const ADD_WATCHER = 'ADD_WATCHER';
const REMOVE_WATCHER = 'REMOVE_WATCHER';
const JOIN_REQUEST = 'JOIN_REQUEST';
const STOP_POLLING = 'STOP_POLLING';
const WEBSOCKET_OPENED = 'WEBSOCKET_OPENED';
const WEBSOCKET_CLOSED = 'WEBSOCKET_CLOSED';
const GET_WEBSOCKET = 'GET_WEBSOCKET';
const OPEN_WEBSOCKET = 'OPEN_WEBSOCKET';
const CLOSE_WEBSOCKET = 'CLOSE_WEBSOCKET';
const STOP_SUBSCRIPTIONS = 'STOP_SUBSCRIPTIONS';

const getActionWithSuffix = suffix => type => `${type}${suffix}`;
const success = getActionWithSuffix(SUCCESS_SUFFIX);
const error = getActionWithSuffix(ERROR_SUFFIX);
const abort = getActionWithSuffix(ABORT_SUFFIX);

const isFSA = action => action.payload;

const createSuccessAction = (requestAction, response) => ({
  type: success(requestAction.type),
  ...(isFSA(requestAction)
    ? { payload: { ...requestAction.payload, response } }
    : { response }),
  meta: { requestAction },
});

const createErrorAction = (requestAction, errorValue) => ({
  type: error(requestAction.type),
  ...(isFSA(requestAction)
    ? { payload: { ...requestAction.payload, error: errorValue }, error: true }
    : { error: errorValue }),
  meta: { requestAction },
});

const createAbortAction = requestAction => ({
  type: abort(requestAction.type),
  meta: { requestAction },
});

const getActionPayload = action =>
  action.payload === undefined ? action : action.payload;

const getResponseFromSuccessAction = action =>
  action.payload ? action.payload.response : action.response;

const isRequestAction = action => {
  const request = getActionPayload(action).request;
  if (!request) return false;

  const isValidRequest = item =>
    !!item &&
    (!!item.url || !!item.query || !!item.promise || !!item.response || item.error instanceof Error);

  return Array.isArray(request)
    ? request.every(isValidRequest)
    : isValidRequest(request);
};

const isResponseAction = action => !!action.meta && !!action.meta.requestAction;
const getRequestActionFromResponse = action => action.meta.requestAction;

const isSuccessAction = action =>
  isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);
const isErrorAction = action =>
  isResponseAction(action) && action.type.endsWith(ERROR_SUFFIX);
const isAbortAction = action =>
  isResponseAction(action) && action.type.endsWith(ABORT_SUFFIX);

const isRequestQuery = request => request.query
  ? !request.query.trim().startsWith('mutation')
  : request.method?.toLowerCase() === 'get';

const isRequestActionQuery = action => {
  const payload = getActionPayload(action);
  const request = payload.request;

  if (action.meta?.asMutation != null) return !action.meta.asMutation;
  return Array.isArray(request)
    ? request.every(isRequestQuery)
    : isRequestQuery(request);
};

const clearRequestsCache = (requests = []) => ({
  type: CLEAR_REQUESTS_CACHE,
  requests,
});

const resetRequests = (
  requests = [],
  abortPending = true,
  resetCached = true,
) => ({
  type: RESET_REQUESTS,
  requests,
  abortPending,
  resetCached,
});

const abortRequests = (requests = []) => ({ type: ABORT_REQUESTS, requests });
const stopPolling = (requests = []) => ({ type: STOP_POLLING, requests });

const setDownloadProgress = (requestType, progress) => ({
  type: SET_DOWNLOAD_PROGRESS,
  requestType,
  progress,
});
const setUploadProgress = (requestType, progress) => ({
  type: SET_UPLOAD_PROGRESS,
  requestType,
  progress,
});
const addWatcher = requestType => ({ type: ADD_WATCHER, requestType });
const removeWatcher = requestType => ({ type: REMOVE_WATCHER, requestType });
const joinRequest = (requestType, rehydrate = false) => ({
  type: JOIN_REQUEST,
  requestType,
  rehydrate,
});

const websocketOpened = () => ({ type: WEBSOCKET_OPENED });
const websocketClosed = code => ({ type: WEBSOCKET_CLOSED, code });
const getWebsocket = () => ({ type: GET_WEBSOCKET });
const openWebsocket = (props = {}) => ({ type: OPEN_WEBSOCKET, props });
const closeWebsocket = (code = 1000) => ({ type: CLOSE_WEBSOCKET, code });
const stopSubscriptions = (subscriptions = []) => ({
  type: STOP_SUBSCRIPTIONS,
  subscriptions,
});

const getNewCacheTimeout = cache =>
  cache === true ? Date.now() + 1000 : cache;

const getRequestKey = action =>
  action.type + (action.meta?.requestKey || '');

const getRequestTypeString = requestType =>
  typeof requestType === 'function' ? requestType.toString() : requestType;

const getRequestKeys = requests => requests.map(getRequestKey);

function cacheReducer(state = {}, action) {
  if (action.type === CLEAR_REQUESTS_CACHE && action.requests) {
    const nextState = { ...state };
    getRequestKeys(action.requests).forEach(requestKey => {
      delete nextState[requestKey];
    });
    return nextState;
  }

  if (isSuccessAction(action) && action.meta.cache) {
    const { cache, cacheResponse, ssrResponse } = action.meta;
    if (cacheResponse || ssrResponse) {
      const requestAction = getRequestActionFromResponse(action);
      const requestKey = getRequestKey(requestAction);
      return {
        ...state,
        [requestKey]: {
          timeout: getNewCacheTimeout(cache),
          cacheKey: action.meta.cacheKey,
        },
      };
    }
  }

  return state;
}

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: () => cacheReducer,
});
