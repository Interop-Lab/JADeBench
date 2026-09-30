"use strict";

const SUCCESS_SUFFIX = "_SUCCESS";
const CLEAR_REQUESTS_CACHE = "CLEAR_REQUESTS_CACHE";

const isResponseAction = action => !!action.meta?.requestAction;

const isSuccessAction = action =>
  isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);

const getRequestActionFromResponse = action => action.meta.requestAction;

const getNewCacheTimeout = cache =>
  cache === true ? null : cache * 1000 + Date.now();

const getRequestKey = requestAction =>
  requestAction.type + (requestAction.meta.requestKey || "");

const getRequestTypeString = requestType =>
  typeof requestType === "function" ? requestType.toString() : requestType;

const getRequestKeys = requests =>
  requests.map(request =>
    typeof request === "object"
      ? getRequestTypeString(request.requestType) + request.requestKey
      : getRequestTypeString(request)
  );

const cacheReducer = (state, action) => {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (!action.requests) {
      return {};
    }

    state = { ...state };

    getRequestKeys(action.requests).forEach(requestKey => {
      delete state[requestKey];
    });

    return state;
  }

  if (
    isSuccessAction(action) &&
    action.meta.cache &&
    !action.meta.ssrResponse &&
    !action.meta.cacheResponse
  ) {
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

const cacheReducerExports = {};

Object.defineProperty(cacheReducerExports, "__esModule", {
  value: true
});

Object.defineProperty(cacheReducerExports, "default", {
  enumerable: true,
  get: () => cacheReducer
});

module.exports = cacheReducerExports;
