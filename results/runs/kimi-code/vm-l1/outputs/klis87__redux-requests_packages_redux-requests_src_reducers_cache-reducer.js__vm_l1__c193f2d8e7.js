"use strict";

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

const getActionWithSuffix = suffix => type => `${type}${suffix}`;
const success = getActionWithSuffix(SUCCESS_SUFFIX);
const error = getActionWithSuffix(ERROR_SUFFIX);
const abort = getActionWithSuffix(ABORT_SUFFIX);

const isFSA = action => typeof action.payload === "object" && action.payload !== null;
const getActionPayload = action => isFSA(action) ? action.payload : action;
const getResponseFromSuccessAction = action => {
  const payload = getActionPayload(action);
  if (!payload || typeof payload !== "object") return undefined;
  return isFSA(action) ? payload : payload.response;
};
const isRequestAction = action => Boolean(getActionPayload(action).request?.url);
const isResponseAction = action => Boolean(action.meta?.requestAction);
const getRequestActionFromResponse = action => action.meta.requestAction;
const isSuccessAction = action => isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);
const isErrorAction = action => isResponseAction(action) && action.type.endsWith(ERROR_SUFFIX);
const isAbortAction = action => isResponseAction(action) && action.type.endsWith(ABORT_SUFFIX);
const isRequestQuery = request => !request.query;
const isRequestActionQuery = action => isRequestQuery(getActionPayload(action).request);

const createSuccessAction = (requestAction, response) => {
  const action = { type: success(requestAction.type) };
  if (response !== undefined) action[isFSA(requestAction) ? "payload" : "response"] = response;
  action.meta = { ...requestAction.meta, requestAction };
  return action;
};
const createErrorAction = (requestAction, actionError) => {
  const action = { type: error(requestAction.type) };
  if (actionError !== undefined) action.error = actionError;
  action.meta = { ...requestAction.meta, requestAction };
  return action;
};
const createAbortAction = requestAction => ({
  type: abort(requestAction.type),
  meta: { ...requestAction.meta, requestAction }
});

const clearRequestsCache = (requests = null) => ({ type: CLEAR_REQUESTS_CACHE, requests });
const resetRequests = (requests = null, abortPending = true, resetCached = true) => ({
  type: RESET_REQUESTS,
  requests,
  abortPending,
  resetCached
});
const abortRequests = (requests = null) => ({ type: ABORT_REQUESTS, requests });
const stopPolling = (requests = null) => ({ type: STOP_POLLING, requests });
const setDownloadProgress = (requestType, progress) => ({ type: SET_DOWNLOAD_PROGRESS, requestType, progress });
const setUploadProgress = (requestType, progress) => ({ type: SET_UPLOAD_PROGRESS, requestType, progress });
const addWatcher = requestType => ({ type: ADD_WATCHER, ...(requestType !== undefined && { requestType }) });
const removeWatcher = requestType => ({ type: REMOVE_WATCHER, ...(requestType !== undefined && { requestType }) });
const joinRequest = (requestType, rehydrate = false) => ({
  type: JOIN_REQUEST,
  ...(requestType !== undefined && { requestType }),
  rehydrate
});
const websocketOpened = () => ({ type: WEBSOCKET_OPENED });
const websocketClosed = code => ({ type: WEBSOCKET_CLOSED, ...(code !== undefined && { code }) });
const getWebsocket = () => ({ type: GET_WEBSOCKET });
const openWebsocket = (props = null) => ({ type: OPEN_WEBSOCKET, props });
const closeWebsocket = (code = 1000) => ({ type: CLOSE_WEBSOCKET, code });
const stopSubscriptions = (subscriptions = null) => ({ type: STOP_SUBSCRIPTIONS, subscriptions });

const getNewCacheTimeout = cache => cache === true || cache === undefined ? null : Date.now() + cache * 1000;
const getRequestTypeString = requestType => typeof requestType === "function" ? requestType.toString() : requestType;
const getRequestKey = action => `${getRequestTypeString(action.type)}${action.meta.requestKey || ""}`;
const getRequestKeys = requestTypes => requestTypes.map(getRequestTypeString);

const cacheReducer = (state, action) => {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (action.requests == null) return {};
    const nextState = { ...state };
    for (const requestKey of getRequestKeys(action.requests)) delete nextState[requestKey];
    return nextState;
  }

  if (isSuccessAction(action) && action.meta.cache) {
    const requestKey = getRequestKey(getRequestActionFromResponse(action));
    return {
      ...state,
      [requestKey]: { timeout: getNewCacheTimeout(action.meta.cache) }
    };
  }

  return state;
};

Object.assign(globalThis, {
  SUCCESS_SUFFIX, ERROR_SUFFIX, ABORT_SUFFIX, CLEAR_REQUESTS_CACHE, RESET_REQUESTS,
  ABORT_REQUESTS, SET_DOWNLOAD_PROGRESS, SET_UPLOAD_PROGRESS, ADD_WATCHER,
  REMOVE_WATCHER, JOIN_REQUEST, STOP_POLLING, WEBSOCKET_OPENED, WEBSOCKET_CLOSED,
  GET_WEBSOCKET, OPEN_WEBSOCKET, CLOSE_WEBSOCKET, STOP_SUBSCRIPTIONS,
  getActionWithSuffix, success, error, abort, isFSA, createSuccessAction,
  createErrorAction, createAbortAction, getActionPayload, getResponseFromSuccessAction,
  isRequestAction, isResponseAction, getRequestActionFromResponse, isSuccessAction,
  isErrorAction, isAbortAction, isRequestQuery, isRequestActionQuery,
  clearRequestsCache, resetRequests, abortRequests, stopPolling, setDownloadProgress,
  setUploadProgress, addWatcher, removeWatcher, joinRequest, websocketOpened,
  websocketClosed, getWebsocket, openWebsocket, closeWebsocket, stopSubscriptions,
  getNewCacheTimeout, getRequestKey, getRequestTypeString, getRequestKeys,
  cache_reducer_default: cacheReducer
});

module.exports = { default: cacheReducer };
