"use strict";

const SUCCESS_SUFFIX = "_SUCCESS";
const CLEAR_REQUESTS_CACHE = "CLEAR_REQUESTS_CACHE";
const RESET_REQUESTS = "RESET_REQUESTS";

function getRequestActionFromResponse(action) {
  return action && action.meta && action.meta.requestAction;
}

function getRequestKey(requestAction) {
  return requestAction && requestAction.meta
    ? requestAction.meta.requestKey
    : undefined;
}

function getRequestTypeString(requestAction) {
  const requestKey = getRequestKey(requestAction);
  return requestKey !== undefined && requestKey !== null
    ? `${requestAction.type}${requestKey}`
    : requestAction.type;
}

function getRequestKeys(requestAction) {
  const requestKey = getRequestKey(requestAction);
  return Array.isArray(requestKey) ? requestKey : [requestKey];
}

function getNewCacheTimeout(requestAction) {
  const cache = requestAction.meta.cache;
  return cache === true ? Number.MAX_VALUE : Date.now() + cache;
}

function clearCacheEntries(state, requestTypes) {
  if (requestTypes == null) {
    return {};
  }

  const types = Array.isArray(requestTypes) ? requestTypes : [requestTypes];
  const nextState = { ...state };

  for (const requestType of types) {
    const key =
      requestType && typeof requestType === "object"
        ? getRequestTypeString(requestType)
        : requestType;
    delete nextState[key];
  }

  return nextState;
}

function cacheReducer(state = {}, action) {
  if (!action || typeof action.type !== "string") {
    return state;
  }

  if (
    action.type === CLEAR_REQUESTS_CACHE ||
    action.type === RESET_REQUESTS
  ) {
    return clearCacheEntries(state, action.requestTypes);
  }

  if (!action.type.endsWith(SUCCESS_SUFFIX)) {
    return state;
  }

  const requestAction = getRequestActionFromResponse(action);
  if (
    !requestAction ||
    !requestAction.meta ||
    !requestAction.meta.cache
  ) {
    return state;
  }

  const nextState = { ...state };
  const requestKeys = getRequestKeys(requestAction);
  const timeout = getNewCacheTimeout(requestAction);

  for (const requestKey of requestKeys) {
    const keyedRequestAction =
      requestKey === getRequestKey(requestAction)
        ? requestAction
        : {
            ...requestAction,
            meta: {
              ...requestAction.meta,
              requestKey,
            },
          };

    nextState[getRequestTypeString(keyedRequestAction)] = timeout;
  }

  return nextState;
}

Object.defineProperty(exports, "__esModule", {
  value: true,
});

Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function () {
    return cacheReducer;
  },
});
