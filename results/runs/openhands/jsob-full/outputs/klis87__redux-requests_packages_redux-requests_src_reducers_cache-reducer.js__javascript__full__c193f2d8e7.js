"use strict";

const SUCCESS_SUFFIX = "_SUCCESS";
const CLEAR_REQUESTS_CACHE = "CLEAR_REQUESTS_CACHE";

function isResponseAction(action) {
  return Boolean(action.meta?.requestAction);
}

function isSuccessAction(action) {
  return isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);
}

function getRequestActionFromResponse(action) {
  return action.meta.requestAction;
}

function getRequestTypeString(requestType) {
  return typeof requestType === "function" ? requestType.toString() : requestType;
}

function getRequestKeys(requests) {
  return requests.map((request) => {
    if (typeof request === "object") {
      return getRequestTypeString(request.requestType) + request.requestKey;
    }
    return getRequestTypeString(request);
  });
}

function getRequestKey(requestAction) {
  return requestAction.type + (requestAction.meta.requestKey || "");
}

function getNewCacheTimeout(cache) {
  return cache === true ? null : cache * 1000 + Date.now();
}

function cacheReducer(state, action) {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (!action.requests) return {};

    const nextState = { ...state };
    getRequestKeys(action.requests).forEach((requestKey) => {
      delete nextState[requestKey];
    });
    return nextState;
  }

  if (
    isSuccessAction(action) &&
    action.meta.cache &&
    !action.meta.cacheResponse &&
    !action.meta.ssrResponse
  ) {
    const requestAction = getRequestActionFromResponse(action);
    return {
      ...state,
      [getRequestKey(requestAction)]: {
        timeout: getNewCacheTimeout(action.meta.cache),
        cacheKey: action.meta.cacheKey,
      },
    };
  }

  return state;
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => cacheReducer,
});
