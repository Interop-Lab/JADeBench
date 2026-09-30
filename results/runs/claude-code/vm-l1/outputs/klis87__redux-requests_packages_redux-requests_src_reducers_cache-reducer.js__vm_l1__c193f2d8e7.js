"use strict";

const SUCCESS_SUFFIX = "_SUCCESS";
const CLEAR_REQUESTS_CACHE = "CLEAR_REQUESTS_CACHE";

function getRequestKey(action) {
  return `${action.type}${action.meta.requestKey || ""}`;
}

function getRequestKeys(requests) {
  return requests.map((request) =>
    typeof request === "string" ? request : request.keyFor(request)
  );
}

function cache_reducer_default(state, action) {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (action.requests == null) return {};

    const nextState = { ...state };
    for (const requestKey of getRequestKeys(action.requests)) {
      delete nextState[requestKey];
    }
    return nextState;
  }

  const requestAction = action.meta && action.meta.requestAction;
  if (
    requestAction &&
    action.type.endsWith(SUCCESS_SUFFIX) &&
    requestAction.meta &&
    requestAction.meta.cache
  ) {
    const cache = requestAction.meta.cache;
    return {
      ...state,
      [getRequestKey(requestAction)]: {
        timeout: cache === true ? Infinity : Date.now() + cache * 1000,
      },
    };
  }

  return state;
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => cache_reducer_default,
});
