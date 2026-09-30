"use strict";

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var cache_reducer_exports = {};
__export(cache_reducer_exports, {
  default: () => cacheReducer
});
module.exports = __toCommonJS(cache_reducer_exports);

var SUCCESS_SUFFIX = "_SUCCESS";
var CLEAR_REQUESTS_CACHE = "CLEAR_REQUESTS_CACHE";

var getActionPayload = (action) => action.payload === void 0 ? action : action.payload;
var isResponseAction = (action) => !!action.meta?.requestAction;
var getRequestActionFromResponse = (action) => action.meta.requestAction;
var isSuccessAction = (action) => isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);

var getNewCacheTimeout = (cache) => cache === true ? null : cache * 1e3 + Date.now();
var getRequestKey = (requestAction) => requestAction.type + (requestAction.meta.requestKey || "");
var getRequestTypeString = (requestType) => typeof requestType === "function" ? requestType.toString() : requestType;
var getRequestKeys = (requests) => requests.map((request) =>
  typeof request === "object"
    ? getRequestTypeString(request.requestType) + request.requestKey
    : getRequestTypeString(request)
);

function cacheReducer(state = {}, action) {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (!action.requests) return {};

    const nextState = { ...state };
    getRequestKeys(action.requests).forEach((requestKey) => {
      delete nextState[requestKey];
    });
    return nextState;
  }

  if (isSuccessAction(action) &&
      action.meta.requestAction.meta.cache &&
      !action.meta.requestAction.meta.cacheResponse &&
      !action.meta.requestAction.meta.ssr) {
    const requestAction = getRequestActionFromResponse(action);
    return {
      ...state,
      [getRequestKey(requestAction)]: {
        timeout: getNewCacheTimeout(requestAction.meta.cache),
        cacheKey: requestAction.meta.cacheKey
      }
    };
  }

  return state;
}
