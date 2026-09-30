"use strict";

// Cache reducer. This CommonJS export shape matches the generated module in
// the input: a non-enumerable __esModule marker and an enumerable default.
const SUCCESS_SUFFIX = "_SUCCESS";
const CLEAR_REQUESTS_CACHE = "CLEAR_REQUESTS_CACHE";

const getRequestTypeString = requestType =>
  typeof requestType === "function" ? requestType.toString() : requestType;

const getRequestKeys = requests => requests.map(request =>
  typeof request === "object"
    ? getRequestTypeString(request.requestType) + request.cacheKey
    : getRequestTypeString(request)
);

const getNewCacheTimeout = cacheTimeout =>
  cacheTimeout === true ? null : cacheTimeout * 1000 + Date.now();

const getRequestKey = requestAction =>
  requestAction.type + (requestAction.meta.cacheKey || "");

const isSuccessAction = action =>
  Boolean(action.meta && action.meta.requestAction) &&
  action.type.endsWith(SUCCESS_SUFFIX);

function cacheReducer(state, action) {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (!action.requests) return {};

    state = { ...state };
    getRequestKeys(action.requests).forEach(requestKey => {
      delete state[requestKey];
    });
    return state;
  }

  if (
    isSuccessAction(action) &&
    action.meta.cache &&
    !action.meta.cacheResponse &&
    !action.meta.requestAction.meta.cacheResponse
  ) {
    const requestAction = action.meta.requestAction;
    return {
      ...state,
      [getRequestKey(requestAction)]: {
        timeout: getNewCacheTimeout(action.meta.cache.cacheTimeout),
        cacheKey: action.meta.cache.cacheKey,
      },
    };
  }

  return state;
}

const exported = {};
Object.defineProperty(exported, "__esModule", { value: true });
Object.defineProperty(exported, "default", {
  enumerable: true,
  get: () => cacheReducer,
});
module.exports = exported;
