'use strict';

const SUCCESS_SUFFIX = '_SUCCESS';
const CLEAR_REQUESTS_CACHE = 'CLEAR_REQUESTS_CACHE';

function isSuccessfulResponse(action) {
  if (!action.meta?.requestAction) return false;
  const endsWith = action.type.endsWith;
  if (typeof endsWith !== 'function') {
    throw new TypeError(endsWith + ' is not a function');
  }
  return endsWith.call(action.type, SUCCESS_SUFFIX);
}

function getRequestKey(requestAction) {
  return requestAction.type + requestAction.meta.requestKey;
}

function getCacheTimeout(cacheDuration) {
  if (cacheDuration === true) return null;
  return Date.now() + cacheDuration * 1000;
}

function getRequestKeys(requests) {
  return requests.map((request) =>
    typeof request === 'string'
      ? request
      : request.requestType + request.requestKey,
  );
}

function clearRequests(cache, requests) {
  if (!requests) return {};
  const requestKeys = getRequestKeys(requests);
  const nextCache = { ...cache };
  requestKeys.forEach((requestKey) => delete nextCache[requestKey]);
  return nextCache;
}

function cache_reducer_default(cache, action) {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    return clearRequests(cache, action.requests);
  }

  if (
    isSuccessfulResponse(action) &&
    action.meta.cache &&
    !action.meta.cacheResponse
  ) {
    const requestAction = action.meta.requestAction;
    return {
      ...cache,
      [getRequestKey(requestAction)]: {
        timeout: getCacheTimeout(action.meta.cache),
        cacheKey: action.meta.cacheKey,
      },
    };
  }

  return cache;
}

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function vMRyML() {
    return cache_reducer_default;
  },
});
